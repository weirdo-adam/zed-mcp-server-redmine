#![forbid(unsafe_code)]
#![warn(clippy::all)]

use std::collections::HashMap;

use zed::settings::ContextServerSettings;
use zed_extension_api as zed;

struct RedmineExtension;

impl zed::Extension for RedmineExtension {
    fn new() -> Self {
        Self
    }

    fn context_server_command(
        &mut self,
        context_server_id: &zed::ContextServerId,
        project: &zed::Project,
    ) -> zed::Result<zed::Command> {
        if context_server_id.as_ref() != "redmine" {
            return Err(format!(
                "unknown Redmine context server `{context_server_id}`"
            ));
        }

        let context_settings =
            ContextServerSettings::for_project(context_server_id.as_ref(), project)?;
        let settings_env = context_settings
            .settings
            .as_ref()
            .map(env_from_settings)
            .unwrap_or_default();

        if let Some(command_settings) = context_settings.command {
            let mut env = command_settings
                .env
                .unwrap_or_default()
                .into_iter()
                .collect::<Vec<_>>();
            env.extend(settings_env);

            return Ok(zed::Command {
                command: command_settings
                    .path
                    .unwrap_or_else(default_node_binary_path),
                args: command_settings.arguments.unwrap_or_default(),
                env,
            });
        }

        Ok(zed::Command {
            command: default_node_binary_path(),
            args: vec!["server/index.js".to_string()],
            env: settings_env,
        })
    }

    fn context_server_configuration(
        &mut self,
        context_server_id: &zed::ContextServerId,
        _project: &zed::Project,
    ) -> zed::Result<Option<zed::ContextServerConfiguration>> {
        if context_server_id.as_ref() != "redmine" {
            return Ok(None);
        }

        Ok(Some(zed::ContextServerConfiguration {
            installation_instructions: INSTALLATION_INSTRUCTIONS.to_string(),
            settings_schema: SETTINGS_SCHEMA.to_string(),
            default_settings: DEFAULT_SETTINGS.to_string(),
        }))
    }
}

zed::register_extension!(RedmineExtension);

fn default_node_binary_path() -> String {
    zed::node_binary_path().unwrap_or_else(|_| "node".to_string())
}

fn env_from_settings(settings: &zed::serde_json::Value) -> Vec<(String, String)> {
    let mut env = HashMap::new();

    for (setting_key, env_key) in [
        ("REDMINE_BASE_URL", "REDMINE_BASE_URL"),
        ("redmine_base_url", "REDMINE_BASE_URL"),
        ("base_url", "REDMINE_BASE_URL"),
        ("REDMINE_API_KEY", "REDMINE_API_KEY"),
        ("redmine_api_key", "REDMINE_API_KEY"),
        ("api_key", "REDMINE_API_KEY"),
        ("REDMINE_SILENT_WRITES", "REDMINE_SILENT_WRITES"),
        ("redmine_silent_writes", "REDMINE_SILENT_WRITES"),
        ("silent_writes", "REDMINE_SILENT_WRITES"),
        ("write_silent", "REDMINE_SILENT_WRITES"),
        ("REDMINE_TIMEOUT_MS", "REDMINE_TIMEOUT_MS"),
        ("redmine_timeout_ms", "REDMINE_TIMEOUT_MS"),
        ("timeout_ms", "REDMINE_TIMEOUT_MS"),
    ] {
        if let Some(value) = settings.get(setting_key).and_then(setting_value_to_env) {
            env.insert(env_key.to_string(), value);
        }
    }

    env.into_iter().collect()
}

fn setting_value_to_env(value: &zed::serde_json::Value) -> Option<String> {
    match value {
        zed::serde_json::Value::String(value) if !value.is_empty() => Some(value.clone()),
        zed::serde_json::Value::Bool(value) => Some(value.to_string()),
        zed::serde_json::Value::Number(value) => Some(value.to_string()),
        _ => None,
    }
}

const INSTALLATION_INSTRUCTIONS: &str = r#"Configure the Redmine context server in Zed `settings.json`:

```json
{
  "context_servers": {
    "redmine": {
      "settings": {
        "REDMINE_BASE_URL": "https://redmine.example.com",
        "REDMINE_API_KEY": "your-api-key",
        "REDMINE_SILENT_WRITES": false
      }
    }
  }
}
```

The bundled server runs with Zed's Node.js runtime. You can also provide `command.path`, `command.arguments`, and `command.env` if you want to run a different server entrypoint."#;

const DEFAULT_SETTINGS: &str = r#"{
  "settings": {
    "REDMINE_BASE_URL": "https://redmine.example.com",
    "REDMINE_API_KEY": "",
    "REDMINE_SILENT_WRITES": false,
    "REDMINE_TIMEOUT_MS": 30000
  }
}"#;

const SETTINGS_SCHEMA: &str = r#"{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "REDMINE_BASE_URL": {
      "type": "string",
      "description": "Base URL for the Redmine instance, for example https://redmine.example.com."
    },
    "REDMINE_API_KEY": {
      "type": "string",
      "description": "Redmine REST API key."
    },
    "REDMINE_SILENT_WRITES": {
      "type": "boolean",
      "default": false,
      "description": "When true, write tools return compact success output and pass notify=false to Redmine write requests."
    },
    "REDMINE_TIMEOUT_MS": {
      "type": "integer",
      "minimum": 1000,
      "default": 30000,
      "description": "HTTP request timeout in milliseconds."
    }
  },
  "required": ["REDMINE_BASE_URL", "REDMINE_API_KEY"]
}"#;

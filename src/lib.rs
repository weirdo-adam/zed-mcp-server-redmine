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
            return Ok(zed::Command {
                command: command_settings
                    .path
                    .unwrap_or_else(default_server_binary_path),
                args: command_settings.arguments.unwrap_or_default(),
                env: merge_env(
                    command_settings
                        .env
                        .unwrap_or_default()
                        .into_iter()
                        .collect(),
                    settings_env,
                ),
            });
        }

        Ok(zed::Command {
            command: default_server_binary_path(),
            args: Vec::new(),
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

fn default_server_binary_path() -> String {
    match zed::current_platform() {
        (zed::Os::Mac, zed::Architecture::Aarch64) => {
            "/opt/homebrew/bin/redmine-mcp-server".to_string()
        }
        (zed::Os::Mac, _) => "/usr/local/bin/redmine-mcp-server".to_string(),
        _ => "redmine-mcp-server".to_string(),
    }
}

fn merge_env(
    command_env: Vec<(String, String)>,
    settings_env: Vec<(String, String)>,
) -> Vec<(String, String)> {
    let mut env = command_env.into_iter().collect::<HashMap<_, _>>();

    for (key, value) in settings_env {
        env.insert(key, value);
    }

    env.into_iter().collect()
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
        ("REDMINE_MCP_READ_ONLY", "REDMINE_MCP_READ_ONLY"),
        ("redmine_mcp_read_only", "REDMINE_MCP_READ_ONLY"),
        ("read_only", "REDMINE_MCP_READ_ONLY"),
        ("REDMINE_MCP_ENABLE_DELETES", "REDMINE_MCP_ENABLE_DELETES"),
        ("redmine_mcp_enable_deletes", "REDMINE_MCP_ENABLE_DELETES"),
        ("enable_deletes", "REDMINE_MCP_ENABLE_DELETES"),
        (
            "REDMINE_MCP_DISABLE_ATTACHMENTS",
            "REDMINE_MCP_DISABLE_ATTACHMENTS",
        ),
        (
            "redmine_mcp_disable_attachments",
            "REDMINE_MCP_DISABLE_ATTACHMENTS",
        ),
        ("disable_attachments", "REDMINE_MCP_DISABLE_ATTACHMENTS"),
        (
            "REDMINE_MCP_DISABLE_CHECKLISTS",
            "REDMINE_MCP_DISABLE_CHECKLISTS",
        ),
        (
            "redmine_mcp_disable_checklists",
            "REDMINE_MCP_DISABLE_CHECKLISTS",
        ),
        ("disable_checklists", "REDMINE_MCP_DISABLE_CHECKLISTS"),
        (
            "REDMINE_MCP_DISABLE_RELATIONS",
            "REDMINE_MCP_DISABLE_RELATIONS",
        ),
        (
            "redmine_mcp_disable_relations",
            "REDMINE_MCP_DISABLE_RELATIONS",
        ),
        ("disable_relations", "REDMINE_MCP_DISABLE_RELATIONS"),
        (
            "REDMINE_MCP_DISABLE_TIME_ENTRIES",
            "REDMINE_MCP_DISABLE_TIME_ENTRIES",
        ),
        (
            "redmine_mcp_disable_time_entries",
            "REDMINE_MCP_DISABLE_TIME_ENTRIES",
        ),
        ("disable_time_entries", "REDMINE_MCP_DISABLE_TIME_ENTRIES"),
        (
            "REDMINE_MCP_DISABLE_VERSIONS",
            "REDMINE_MCP_DISABLE_VERSIONS",
        ),
        (
            "redmine_mcp_disable_versions",
            "REDMINE_MCP_DISABLE_VERSIONS",
        ),
        ("disable_versions", "REDMINE_MCP_DISABLE_VERSIONS"),
        ("REDMINE_MCP_DISABLE_WIKI", "REDMINE_MCP_DISABLE_WIKI"),
        ("redmine_mcp_disable_wiki", "REDMINE_MCP_DISABLE_WIKI"),
        ("disable_wiki", "REDMINE_MCP_DISABLE_WIKI"),
        (
            "REDMINE_MCP_DISABLE_WATCHERS",
            "REDMINE_MCP_DISABLE_WATCHERS",
        ),
        (
            "redmine_mcp_disable_watchers",
            "REDMINE_MCP_DISABLE_WATCHERS",
        ),
        ("disable_watchers", "REDMINE_MCP_DISABLE_WATCHERS"),
        ("REDMINE_SILENT_WRITES", "REDMINE_SILENT_WRITES"),
        ("redmine_silent_writes", "REDMINE_SILENT_WRITES"),
        ("silent_writes", "REDMINE_SILENT_WRITES"),
        ("write_silent", "REDMINE_SILENT_WRITES"),
        (
            "REDMINE_MCP_ATTACHMENT_MAX_BYTES",
            "REDMINE_MCP_ATTACHMENT_MAX_BYTES",
        ),
        (
            "redmine_mcp_attachment_max_bytes",
            "REDMINE_MCP_ATTACHMENT_MAX_BYTES",
        ),
        ("attachment_max_bytes", "REDMINE_MCP_ATTACHMENT_MAX_BYTES"),
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

const INSTALLATION_INSTRUCTIONS: &str = r#"Install the standalone server before enabling this extension:

  brew install weirdo-adam/tap/redmine-mcp-server

Set `REDMINE_BASE_URL` and `REDMINE_API_KEY` below to pass them through Zed settings. Leave them empty only when the Zed process inherits those environment variables from the operating system.

Use `REDMINE_MCP_READ_ONLY=true` when the agent should inspect Redmine without making changes. Destructive delete/remove tools are disabled by default; expose them only with `REDMINE_MCP_ENABLE_DELETES=true`."#;

const DEFAULT_SETTINGS: &str = r#"{
  "REDMINE_BASE_URL": "",
  "REDMINE_API_KEY": "",
  "REDMINE_MCP_READ_ONLY": true
}"#;

const SETTINGS_SCHEMA: &str = r#"{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "REDMINE_BASE_URL": {
      "type": "string",
      "description": "Base URL for the Redmine instance. Leave blank to use the environment inherited by Zed."
    },
    "REDMINE_API_KEY": {
      "type": "string",
      "description": "Redmine REST API key. Leave blank to use the environment inherited by Zed."
    },
    "REDMINE_MCP_READ_ONLY": {
      "type": "boolean",
      "default": true,
      "description": "When true, write tools are hidden from tools/list and rejected if called directly."
    },
    "REDMINE_MCP_ENABLE_DELETES": {
      "type": "boolean",
      "default": false,
      "description": "When true, destructive delete/remove tools are exposed. These tools are disabled by default and still require REDMINE_MCP_READ_ONLY=false."
    },
    "REDMINE_MCP_DISABLE_ATTACHMENTS": {
      "type": "boolean",
      "default": false,
      "description": "Disable attachment metadata, upload, and download tools."
    },
    "REDMINE_MCP_DISABLE_CHECKLISTS": {
      "type": "boolean",
      "default": false,
      "description": "Disable checklist tools. Checklist tools require the redmine_checklists plugin when this is false."
    },
    "REDMINE_MCP_DISABLE_RELATIONS": {
      "type": "boolean",
      "default": false,
      "description": "Disable issue relation tools."
    },
    "REDMINE_MCP_DISABLE_TIME_ENTRIES": {
      "type": "boolean",
      "default": false,
      "description": "Disable time entry tools."
    },
    "REDMINE_MCP_DISABLE_VERSIONS": {
      "type": "boolean",
      "default": false,
      "description": "Disable version and milestone tools."
    },
    "REDMINE_MCP_DISABLE_WIKI": {
      "type": "boolean",
      "default": false,
      "description": "Disable wiki page tools."
    },
    "REDMINE_MCP_DISABLE_WATCHERS": {
      "type": "boolean",
      "default": false,
      "description": "Disable watcher tools."
    },
    "REDMINE_SILENT_WRITES": {
      "type": "boolean",
      "default": false,
      "description": "When true, write tools return compact success output and pass notify=false to Redmine write requests."
    },
    "REDMINE_MCP_ATTACHMENT_MAX_BYTES": {
      "type": "integer",
      "minimum": 1,
      "default": 10485760,
      "description": "Maximum attachment upload/download payload size returned through MCP."
    },
    "REDMINE_TIMEOUT_MS": {
      "type": "integer",
      "minimum": 1000,
      "default": 30000,
      "description": "HTTP request timeout in milliseconds."
    }
  }
}"#;

#[cfg(test)]
mod tests {
    use super::{env_from_settings, merge_env};
    use zed_extension_api::serde_json::json;

    #[test]
    fn maps_redmine_mcp_settings_to_environment() {
        let env = env_from_settings(&json!({
            "REDMINE_BASE_URL": "https://redmine.example.com/",
            "REDMINE_API_KEY": "secret",
            "REDMINE_MCP_READ_ONLY": true,
            "REDMINE_MCP_ENABLE_DELETES": true,
            "REDMINE_MCP_DISABLE_ATTACHMENTS": true,
            "REDMINE_MCP_DISABLE_CHECKLISTS": true,
            "REDMINE_MCP_DISABLE_RELATIONS": true,
            "REDMINE_MCP_DISABLE_TIME_ENTRIES": true,
            "REDMINE_MCP_DISABLE_VERSIONS": true,
            "REDMINE_MCP_DISABLE_WIKI": true,
            "REDMINE_MCP_DISABLE_WATCHERS": true,
            "REDMINE_MCP_ATTACHMENT_MAX_BYTES": 2048,
            "REDMINE_SILENT_WRITES": true,
            "REDMINE_TIMEOUT_MS": 15000
        }));

        assert_env(&env, "REDMINE_BASE_URL", "https://redmine.example.com/");
        assert_env(&env, "REDMINE_API_KEY", "secret");
        assert_env(&env, "REDMINE_MCP_READ_ONLY", "true");
        assert_env(&env, "REDMINE_MCP_ENABLE_DELETES", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_ATTACHMENTS", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_CHECKLISTS", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_RELATIONS", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_TIME_ENTRIES", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_VERSIONS", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_WIKI", "true");
        assert_env(&env, "REDMINE_MCP_DISABLE_WATCHERS", "true");
        assert_env(&env, "REDMINE_MCP_ATTACHMENT_MAX_BYTES", "2048");
        assert_env(&env, "REDMINE_SILENT_WRITES", "true");
        assert_env(&env, "REDMINE_TIMEOUT_MS", "15000");
    }

    #[test]
    fn does_not_map_legacy_read_only_setting() {
        let env = env_from_settings(&json!({
            "REDMINE_READ_ONLY": true
        }));

        assert!(!env.iter().any(|(key, _)| key == "REDMINE_READ_ONLY"));
        assert!(!env.iter().any(|(key, _)| key == "REDMINE_MCP_READ_ONLY"));
    }

    #[test]
    fn skips_empty_string_settings_to_allow_environment_fallback() {
        let env = env_from_settings(&json!({
            "REDMINE_BASE_URL": "",
            "REDMINE_API_KEY": "",
            "REDMINE_MCP_READ_ONLY": true
        }));

        assert!(!env.iter().any(|(key, _)| key == "REDMINE_BASE_URL"));
        assert!(!env.iter().any(|(key, _)| key == "REDMINE_API_KEY"));
        assert_env(&env, "REDMINE_MCP_READ_ONLY", "true");
    }

    #[test]
    fn settings_environment_overrides_command_environment() {
        let env = merge_env(
            vec![
                (
                    "REDMINE_BASE_URL".to_string(),
                    "https://command.example.com".to_string(),
                ),
                ("REDMINE_API_KEY".to_string(), "command-key".to_string()),
            ],
            vec![(
                "REDMINE_BASE_URL".to_string(),
                "https://settings.example.com".to_string(),
            )],
        );

        assert_env(&env, "REDMINE_BASE_URL", "https://settings.example.com");
        assert_env(&env, "REDMINE_API_KEY", "command-key");
    }

    #[test]
    fn default_settings_match_settings_schema_shape() {
        let parsed: Result<zed_extension_api::serde_json::Value, _> =
            zed_extension_api::serde_json::from_str(super::DEFAULT_SETTINGS);
        assert!(parsed.is_ok());
        let settings = parsed.unwrap_or_else(|_| json!({}));

        assert!(settings.get("settings").is_none());
        assert!(settings.get("REDMINE_BASE_URL").is_some());
        assert!(settings.get("REDMINE_API_KEY").is_some());
        assert!(settings.get("REDMINE_MCP_READ_ONLY").is_some());
        assert_eq!(
            settings
                .get("REDMINE_BASE_URL")
                .and_then(zed_extension_api::serde_json::Value::as_str),
            Some("")
        );
        assert_eq!(
            settings
                .get("REDMINE_API_KEY")
                .and_then(zed_extension_api::serde_json::Value::as_str),
            Some("")
        );
        assert_eq!(
            settings
                .get("REDMINE_MCP_READ_ONLY")
                .and_then(zed_extension_api::serde_json::Value::as_bool),
            Some(true)
        );
    }

    fn assert_env(env: &[(String, String)], key: &str, expected: &str) {
        assert_eq!(
            env.iter()
                .find(|(env_key, _)| env_key == key)
                .map(|(_, value)| value.as_str()),
            Some(expected)
        );
    }
}

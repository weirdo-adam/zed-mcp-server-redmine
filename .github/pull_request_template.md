## Summary

- Describe the change and the user-visible impact.

## Checks

- [ ] `scripts/check.sh`
- [ ] `cargo test`
- [ ] Documentation updated, if behavior or configuration changed

## Safety

- [ ] No Redmine API keys, private Redmine data, or internal URLs are included
- [ ] New write tools are blocked by `REDMINE_MCP_READ_ONLY`
- [ ] New optional tool groups have a disable flag, if applicable

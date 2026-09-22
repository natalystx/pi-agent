# pi-config

Personal configuration for the [pi](https://github.com/badlogic/pi-mono) coding agent.
This repo is the contents of `~/.pi/agent`, minus secrets, caches, and installed binaries.

## What's in here

| File / folder | Purpose |
|---|---|
| `settings.json` | Theme, default provider and model, TUI mode, and the list of installed packages |
| `provider-failover.json` | Provider failover order and auto-discovery options (`pi-multi-account`) |
| `models.json` | Custom provider and model definitions |
| `pstack/models.json` | Model definitions used by `pi-pstack` |
| `claude-bridge.json` | Settings for `pi-claude-bridge` |
| `claude-plugins-ignore.json` | Claude Code plugins to keep out of pi, even if enabled in Claude Code |
| `extensions/claude-plugins/index.ts` | Custom extension that loads Claude Code marketplace plugins into pi |

## Installed packages

Declared in `settings.json` and reinstalled automatically by pi on first run:

- `npm:pi-multi-account`
- `npm:pi-claude-marketplace`
- `npm:pi-claude-bridge`
- `npm:pi-pstack`
- `npm:pi-mcp-adapter`

## Not tracked

These are ignored via `.gitignore` and must never be committed:

- `auth.json`, `*oauth*.json` – credentials and OAuth tokens
- `models-store.json`, `provider-failover-state.json`, `*.log`, `mcp-cache.json`, `trust.json` – runtime state and caches
- `sessions/` – chat history
- `install/`, `npm/`, `bin/` – the pi binary and node_modules

## Restore on a new machine

```bash
# 1. Clone into the pi config directory before launching pi for the first time
git clone https://github.com/<you>/pi-config.git ~/.pi/agent

# 2. Install pi (see the pi docs for the current install command)

# 3. Launch pi. It reads settings.json, installs the listed packages,
#    then prompts you to log in to each provider.
pi
```

If `~/.pi/agent` already exists, clone elsewhere and copy the files over.

## Updating

```bash
cd ~/.pi/agent
git add -A
git status      # make sure only config files are staged
git commit -m "update pi config"
git push
```

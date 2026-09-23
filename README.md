# pi-agent

Personal configuration for the [pi](https://github.com/earendil-works/pi) coding agent.
This repo is the contents of `~/.pi/agent`, minus credentials, caches, and installed packages.

## Set up on a new machine

### 1. Install the prerequisites

- **Node.js 22.19 or newer.** For example, with [nvm](https://github.com/nvm-sh/nvm): `nvm install 22`.
- **pi:**

  ```bash
  npm install -g --ignore-scripts @earendil-works/pi-coding-agent
  ```

- **Claude Code, signed in.** `pi-claude-bridge` runs Claude models through your Claude Code subscription:

  ```bash
  curl -fsSL https://claude.ai/install.sh | bash
  claude   # sign in once, then exit
  ```

- **A terminal multiplexer, for subagents.** Subagents open in their own pane. Use [cmux](https://cmux.dev), [herdr](https://herdr.dev), or tmux (`brew install tmux`).

### 2. Clone this repo into the pi config directory

Do this before you start pi for the first time.

```bash
git clone https://github.com/natalystx/pi-agent.git ~/.pi/agent
```

If `~/.pi/agent` already exists, move it aside first. Then copy back any `auth.json` you want to keep.

### 3. Start pi

```bash
cd ~/some/project
pi
```

On the first start, pi installs every package listed in `settings.json`. This includes the git packages, which it clones into `git/`. pi then asks whether to trust the project folder.

### 4. Sign in to the other providers

Claude models work as soon as Claude Code is signed in. Add the other accounts inside pi:

```text
/login
```

- **Codex (ChatGPT) accounts:** choose **Use a subscription**, then a numbered slot such as `openai-codex-account-2`. `pi-multi-account` adds each slot to its rotation.
- **Meta, Cursor, and Kimi:** choose the provider and follow its prompt.

Check the rotation:

```text
/multi-account status
```

`pstack/models.json` names models by provider. A role that names a provider you did not sign in to falls back to another model. Run `/setup-pstack` to map the roles to the models you have.

### 5. Check the setup

```bash
pi --list-models claude-opus-5-5   # claude-bridge row should show 1M
```

Start pi inside cmux, herdr, or tmux. Then check that a subagent opens in a new pane:

```text
/subagent scout list the top-level folders in this repo
```

## What's in here

| File or folder | Purpose |
|---|---|
| `settings.json` | Theme, default model (Opus 5.5, high thinking), TUI mode, enabled models, and the package list |
| `models.json` | Provider and model definitions. `pi-multi-account` rewrites it on every start. Its `apiKey` values are placeholders that the local proxy replaces, not credentials. |
| `provider-failover.json` | Failover order and discovery options for `pi-multi-account` |
| `pstack/models.json` | Which model `pi-pstack` uses for each delegation role |
| `claude-bridge.json` | Settings for `pi-claude-bridge` |
| `claude-plugins-ignore.json` | Claude Code plugins to keep out of pi |
| `extensions/claude-plugins/` | Loads Claude Code marketplace skills into pi |
| `extensions/pstack-without-subagent/` | Loads `pi-pstack` without its `subagent` tool. See [Subagents](#subagents). |
| `agents/` | Links to `pi-pstack`'s `poteto-agent` and `comment-sicko`, so subagents can use them |

## Installed packages

pi installs these from `settings.json`. The order matters.

| Package | Why |
|---|---|
| `npm:pi-multi-account` | Rotates several accounts per provider and fails over between them |
| `npm:pi-claude-marketplace` | Claude Code plugin marketplace support |
| `git:github.com/elidickinson/pi-claude-bridge` | Claude models through Claude Code. Installed from GitHub main because the npm release does not yet run Opus 5.5 at 1M context. |
| `git:github.com/natalystx/pi-interactive-subagents` | Subagents in multiplexer panes, with herdr support. This is my fork. |
| `npm:pi-pstack` | pstack skills and poteto-mode. Its extension is loaded through the wrapper in `extensions/`. |
| `npm:pi-mcp-adapter` | MCP servers |
| `npm:pi-zentui`, `npm:pi-catppuccin-tui` | UI and theme |

## Subagents

`pi-interactive-subagents` and `pi-pstack` both register a tool named `subagent`. pi refuses to start when two extensions register the same tool name. To avoid this:

- `settings.json` loads `pi-pstack` with `"extensions": []`, so only its skills load directly.
- `extensions/pstack-without-subagent/` loads pstack's extension and skips its `subagent` tool. It also fixes `/poteto-mode`, which otherwise fails with `ctx.sendUserMessage is not a function`.

Subagents start with `--approve`, so they never stop at pi's project-trust question. They still stop at pstack's confirmation before `git push`, pull-request changes, deploys, and recursive `rm`.

## Not tracked

`.gitignore` keeps these out of the repo:

- `auth.json`, `*oauth*.json`: credentials and OAuth tokens
- `models-store.json`, `provider-failover-state.json`, `*.log`, `mcp-cache.json`, `trust.json`: runtime state and caches
- `sessions/`: chat history
- `install/`, `npm/`, `bin/`, `git/`: pi and its installed packages, which pi restores from `settings.json`

## Update

Update pi and the packages:

```bash
pi update --all
```

Save config changes:

```bash
cd ~/.pi/agent
git status      # check that only config files changed
git add -A
git commit -m "update pi config"
git push
```

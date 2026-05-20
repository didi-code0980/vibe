# Installation Guide — Backend Code Standards Skill

This skill follows the **Agent Skills open standard** (`agentskills.io`).
It works across all Agent Skills-compatible tools: Claude Code, Claude.ai, Cursor, VS Code (GitHub Copilot), and more.

---

## Quick Reference

| Tool | Skill directory | Scope |
|---|---|---|
| Claude Code | `~/.claude/skills/` (global) or `.claude/skills/` (project) | Personal / Project |
| Claude.ai | Upload via Settings > Features > Skills | Personal |
| Cursor | `~/.cursor/skills/` (global) or `.cursor/skills/` (project) | Personal / Project |
| VS Code + Copilot | `~/.copilot/skills/` (global) or `.github/skills/` (project) | Personal / Project |
| Any tool | `~/.agents/skills/` | Universal personal |

---

## 1. Claude Code (CLI)

Claude Code natively supports Agent Skills. Skills placed in `.claude/skills/` are auto-detected and loaded dynamically when relevant.

### Global install (available across all projects)

```bash
# Unzip the skill package
unzip backend-code-standards.zip

# Copy to personal skills directory
cp -r backend-code-standards ~/.claude/skills/
```

Verify:
```bash
ls ~/.claude/skills/backend-code-standards/
# SKILL.md  references/
```

### Project-level install (checked into repo, shared with team)

```bash
mkdir -p .claude/skills
cp -r backend-code-standards .claude/skills/
```

Commit to version control so the whole team uses the same standards:
```bash
git add .claude/skills/backend-code-standards
git commit -m "chore: add backend code standards skill"
```

### How it triggers

Claude Code reads the `description` in `SKILL.md` at session start. The skill auto-loads when you:
- Ask Claude to write a Java service, controller, or repository
- Ask Claude to review or refactor Java code
- Type `/backend-code-standards` to invoke manually

> **Note:** Skills load at session start. If you install mid-session, restart Claude Code to pick it up.

---

## 2. Claude.ai (Web / Desktop / Mobile)

Claude.ai supports custom skill upload for Pro, Max, Team, and Enterprise plans.

### Upload via Settings

1. Open **Claude.ai** → click your avatar → **Settings**
2. Go to **Features** → **Skills** (ensure *Code execution and file creation* is enabled)
3. Click **Upload Skill**
4. Upload the `backend-code-standards.zip` file directly
5. Toggle the skill **on**

The skill now applies automatically in all your conversations when you work on Java/Spring Boot code.

### Team / Organization sharing (Team & Enterprise plans)

1. Go to **Settings** → **Skills** → open the uploaded skill
2. Click **Share** → choose:
   - **Specific people** — enter team members' emails
   - **Entire organization** — publishes to your org's skill directory
3. Recipients can enable it from their Skills list

---

## 3. Cursor

Cursor supports Agent Skills natively as of version 2.3+. Skills are defined in `SKILL.md` files inside a `.cursor/skills/` directory.

### Global install (all projects)

```bash
mkdir -p ~/.cursor/skills
cp -r backend-code-standards ~/.cursor/skills/
```

### Project-level install

```bash
mkdir -p .cursor/skills
cp -r backend-code-standards .cursor/skills/
```

### Via Cursor Settings UI

1. Open Cursor → **Settings** (⌘, / Ctrl+,)
2. Search for **Skills** or go to **Cursor Settings → Rules → Skills**
3. Add the path to your `backend-code-standards` directory

### How it triggers

Cursor reads the skill's `description` frontmatter and loads it dynamically when the agent determines it's relevant. You can also invoke manually:

```
/backend-code-standards
```

> Skills are better than Rules for procedural "how-to" instructions. Rules are always-on; Skills load only when needed, keeping context clean.

---

## 4. VS Code — GitHub Copilot

VS Code + GitHub Copilot supports Agent Skills as of VS Code 1.108+ (December 2025).

### Global install (personal, all projects)

```bash
mkdir -p ~/.copilot/skills
cp -r backend-code-standards ~/.copilot/skills/
```

Alternative global paths (all equivalent):
```bash
~/.claude/skills/backend-code-standards/    # also recognized by Copilot
~/.agents/skills/backend-code-standards/    # universal path
```

### Project-level install

```bash
mkdir -p .github/skills
cp -r backend-code-standards .github/skills/
```

### Via VS Code Chat Customizations UI

1. Open VS Code → Command Palette (`⌘⇧P` / `Ctrl+Shift+P`)
2. Run: **Chat: Open Chat Customizations**
3. Select **Skills** tab → click **+** to add skill directory
4. Point to the `backend-code-standards` folder

Or use the AI shortcut — type in Copilot chat:
```
/create-skill
```
and follow the prompts.

### How it triggers

Copilot reads the `SKILL.md` frontmatter. When you ask Copilot to write or review Java/Spring Boot code, it automatically loads this skill. You can also invoke directly:
```
/backend-code-standards
```

---

## 5. Universal path (works everywhere)

If you use multiple tools and want one install location recognized by all of them:

```bash
mkdir -p ~/.agents/skills
cp -r backend-code-standards ~/.agents/skills/
```

`~/.agents/skills/` is part of the Agent Skills open standard and is recognized by Claude Code, GitHub Copilot, Cursor, and other compatible agents.

---

## Shared Team Setup (Recommended)

This skill is hosted on the internal GitLab repository:

```
https://gitlab.tma.com.vn/sw-products/program-27-agent-skills/backend-development-skills.git
```

Repository structure:
```
backend-development-skills/
└── backend-code-standards/
    ├── SKILL.md
    ├── INSTALLATION.md
    ├── INSTALLATION.vi.md
    └── references/
        └── examples.md
```

Each developer installs once:
```bash
# Clone the repo
git clone https://gitlab.tma.com.vn/sw-products/program-27-agent-skills/backend-development-skills.git

# Install to your preferred tool (pick one)
cp -r backend-development-skills/backend-code-standards ~/.claude/skills/     # Claude Code
cp -r backend-development-skills/backend-code-standards ~/.cursor/skills/     # Cursor
cp -r backend-development-skills/backend-code-standards ~/.copilot/skills/    # VS Code Copilot
cp -r backend-development-skills/backend-code-standards ~/.agents/skills/     # Universal
```

When standards are updated, pull and reinstall:
```bash
cd backend-development-skills && git pull

# Reinstall (example for Claude Code)
rm -rf ~/.claude/skills/backend-code-standards
cp -r backend-code-standards ~/.claude/skills/
```

---

## Updating the Skill

When a new version is pushed to GitLab:

```bash
# Pull latest from GitLab
cd backend-development-skills && git pull

# Remove old version and reinstall
rm -rf ~/.claude/skills/backend-code-standards
cp -r backend-code-standards ~/.claude/skills/
```

Then restart your AI tool to reload.

---

## Troubleshooting

**Skill not triggering automatically**
- Check the `description` in `SKILL.md` — it must clearly describe the use case
- Try invoking manually with `/backend-code-standards`
- Restart the tool after installing (skills load at session start)

**Wrong directory depth**
The structure must be:
```
✅ ~/.claude/skills/backend-code-standards/SKILL.md
❌ ~/.claude/skills/backend-code-standards/backend-code-standards/SKILL.md
```

**Too many skills slowing things down**
Each skill adds to the metadata Claude scans at session start (~100 tokens per skill for the frontmatter). Keep your installed skills under 15 for best performance.

**Skill not available in Claude.ai on mobile**
Skills enabled in your Claude.ai settings automatically apply in the Claude mobile app and the Claude for Excel / Claude for PowerPoint add-ins. No separate install needed.

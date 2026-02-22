# Antigravity Agent & Workflow Guide

This guide explains how to extend Antigravity's capabilities using **Agents**, **Rules**, and **Workflows**.

## 1. Directory Structure

Antigravity looks for configuration in a `.agent` folder at the root of your project:

- `.agent/rules/`: Markdown files defining behavior rules or personalities (like `king.md`).
- `.agent/workflows/`: Markdown files defining multi-step automation sequences.

### Global vs Local
Antigravity searches **upwards** from the current project directory for a `.agent` folder. 
- **Local:** Root of your project repo.
- **Global:** A parent directory (e.g., `~/Documents/Projects/.agent`) to share rules across projects.

---

## 2. Creating Rules (Personalities)
Rules are markdown files in `.agent/rules/`. They define how the model should behave, its role, and any special commands (triggers).

**Example (`.agent/rules/king.md`):**
Defined as a "Senior Frontend Architect" with a trigger command "ULTRATHINK" for deep reasoning.

---

## 3. Creating Workflows
Workflows are markdown files in `.agent/workflows/`. They provide structured instructions for complex tasks.

### Format:
1. **YAML Frontmatter:** Must include a `description`.
2. **Markdown Content:** Numbered steps describing the process.

### Features:
- **`// turbo`**: Add this comment above a `run_command` step to allow Antigravity to run it without asking for permission (if safe).
- **`// turbo-all`**: Add this anywhere in the file to auto-approve all `run_command` calls in that workflow.

---

## 4. Best Practices
- **Persistence:** Use Rules to enforce coding standards (e.g., "Always use Shadcn UI").
- **Automation:** Use Workflows for repetitive tasks (e.g., "Deploy to Staging," "Generate API Docs").
- **Modularity:** Keep rules focused. Create separate files for backend, frontend, and design rules.

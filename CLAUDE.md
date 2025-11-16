# Claude Code Instructions

## ⛔ CRITICAL: ABSOLUTELY FORBIDDEN ACTIONS ⛔

**NEVER EVER run development servers, start processes, or use background execution:**

### Explicitly Banned Commands:
- ❌ `pnpm dev` - ABSOLUTELY FORBIDDEN
- ❌ `npm dev` - ABSOLUTELY FORBIDDEN
- ❌ `next dev` - ABSOLUTELY FORBIDDEN
- ❌ `yarn dev` - ABSOLUTELY FORBIDDEN
- ❌ `npm start` - ABSOLUTELY FORBIDDEN
- ❌ `pnpm start` - ABSOLUTELY FORBIDDEN
- ❌ `/usr/local/bin/pnpm dev` - ABSOLUTELY FORBIDDEN (absolute path)
- ❌ `/usr/local/bin/npm dev` - ABSOLUTELY FORBIDDEN (absolute path)
- ❌ `node /path/to/node_modules/.bin/next dev` - ABSOLUTELY FORBIDDEN (absolute path)
- ❌ `npx next dev` - ABSOLUTELY FORBIDDEN
- ❌ `pnpm exec next dev` - ABSOLUTELY FORBIDDEN
- ❌ ANY dev/start command with absolute or relative paths - ABSOLUTELY FORBIDDEN
- ❌ ANY command with `run_in_background: true` - ABSOLUTELY FORBIDDEN
- ❌ ANY command that starts a server (express, vite, webpack-dev-server, etc.) - ABSOLUTELY FORBIDDEN
- ❌ ANY long-running process whatsoever - ABSOLUTELY FORBIDDEN

### Banned Patterns - DO NOT USE:
- ❌ `rm -rf .next && pnpm dev` - FORBIDDEN (workaround attempt)
- ❌ `command1 && command2` where command2 is a dev server - FORBIDDEN
- ❌ Background processes (`&` suffix or `run_in_background`) - FORBIDDEN
- ❌ `nohup`, `screen`, `tmux` - FORBIDDEN
- ❌ Process managers (`pm2`, `forever`) - FORBIDDEN
- ❌ Direct node execution (`node server.js`, `node dist/index.js`) - FORBIDDEN
- ❌ Absolute path to executables (`/usr/local/bin/*`, `/usr/bin/*`, `~/.npm/*`) with dev/start - FORBIDDEN
- ❌ `./node_modules/.bin/next dev` or any .bin path - FORBIDDEN
- ❌ Shell script execution that starts servers (`./start.sh`, `bash run-dev.sh`) - FORBIDDEN
- ❌ ANY creative workaround to start processes - ABSOLUTELY FORBIDDEN
- ❌ ANY path-based workaround (absolute, relative, symlink) - ABSOLUTELY FORBIDDEN

### Why This Is Critical:
The user **explicitly prohibits** any process creation. Violating this rule:
1. Wastes system resources
2. Creates unwanted background processes
3. Directly contradicts user instructions
4. Shows lack of attention to requirements

## ✅ ALLOWED ACTIONS ONLY ✅

**Only these actions are permitted:**
- ✅ `pnpm build` - Build the project (NO background execution)
- ✅ `pnpm test` - Run tests (NO background execution)
- ✅ `pnpm lint` - Run linter (NO background execution)
- ✅ File operations (Read, Write, Edit, Glob, Grep)
- ✅ Code analysis and migration tasks
- ✅ Installing dependencies (`pnpm add`, `pnpm install`)
- ✅ Git operations (status, diff, log, add, commit - NO push without permission)
- ✅ Static file operations (mkdir, cp, mv, rm for files/directories)

## Workflow

1. **Make code changes** using Read/Write/Edit tools
2. **Verify with build** using `pnpm build` (synchronous only)
3. **User manually runs** `pnpm dev` to test
4. **Never start any server or background process**

## Enforcement

- If you ever use `pnpm dev`, `run_in_background: true`, or ANY server command
- If you use ANY absolute path to run dev/start commands (`/usr/local/bin/pnpm dev`, etc.)
- If you use ANY relative path to .bin executables (`./node_modules/.bin/next dev`, etc.)
- If you use `npx`, `pnpm exec`, or any executor with dev/start commands
- If you directly invoke node to start a server (`node server.js`, etc.)
- You have **VIOLATED** this instruction
- **NO EXCEPTIONS** - No "just to check", no "temporary", no workarounds, no path tricks
- The user will manually handle all server processes
- **EVERY path-based attempt to circumvent this rule is FORBIDDEN**

**READ THIS INSTRUCTION CAREFULLY AND FOLLOW IT STRICTLY.**

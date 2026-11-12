# UniDB Desktop

UniDB Desktop is a desktop workspace for connecting to and working with a running UniDB server.

This repository contains the Electron application. The database engine runs separately; the desktop app does not open or modify database files directly.

## Current status

The first milestone establishes the application shell:

- Electron main process and a restricted preload bridge
- React + TypeScript renderer
- Initial desktop workspace UI
- Typecheck, lint and build scripts
- GitHub Actions quality checks

Database connections, SQL execution, table browsing and packaging are planned for later milestones. The current connection controls are intentionally placeholders and do not claim to connect to a server.

## Requirements

- Node.js 22 or newer
- npm

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Security boundaries

- Renderer Node.js integration is disabled.
- Context isolation and Electron sandboxing are enabled.
- The renderer receives only a small, typed API from the preload script.
- Database networking will be implemented in a later change through the official `unidb-node` client.

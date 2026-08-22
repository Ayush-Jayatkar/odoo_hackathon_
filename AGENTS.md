# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Instructions

* Follow the version of Next.js installed in this repository, not assumptions from previous versions.
* Inspect existing project code and conventions before introducing new patterns.
* Prefer existing dependencies and utilities over adding new packages.
* Keep changes focused and avoid modifying unrelated files.
* Use TypeScript and maintain strict type safety.
* Prefer Server Components unless client-side behavior is required.
* Use Next.js APIs and conventions appropriate for the installed version.
* Do not hard-code secrets, API keys, tokens, or credentials.
* Never expose server-only environment variables to the client.
* Reuse existing components, hooks, utilities, and styles where possible.
* Preserve existing functionality unless the requested change requires otherwise.

## Validation

Before finishing a task, run the project's appropriate checks, such as:

```bash
npm run lint
npm run build
```

If the repository uses a different package manager, use the commands defined by its configuration.

Fix errors caused by your changes before completing the task.

## Git

* Do not create commits unless explicitly requested.
* Do not push changes unless explicitly requested.
* Do not rewrite Git history.
* Keep the working tree changes limited to the requested work.

# CLAUDE.md

## Project Overview

This is a Next.js application.

When working on this repository, prioritize:

* Clean, maintainable code
* TypeScript
* Reusable components
* Good performance
* Accessibility
* Responsive design
* Consistency with the existing project structure

## Tech Stack

* Next.js
* React
* TypeScript
* ESLint
* npm / pnpm / yarn (use the package manager already configured in the repository)

## Project Rules

### General

* Read the existing code before making changes.
* Follow the existing project conventions.
* Do not introduce new dependencies unless necessary.
* Prefer simple solutions over unnecessary abstractions.
* Keep changes focused on the requested task.
* Do not modify unrelated files.
* Preserve existing functionality unless the task explicitly requires changing it.

### Next.js

* Use the App Router if the project uses `app/`.
* Prefer Server Components by default.
* Add `"use client"` only when client-side behavior is required.
* Use Next.js features instead of implementing equivalent functionality manually.
* Use `next/image` for images where appropriate.
* Use `next/link` for internal navigation.
* Keep server-side and client-side responsibilities clearly separated.

### React

* Build reusable components when the same UI or logic is used multiple times.
* Keep components reasonably small and focused.
* Avoid unnecessary `useEffect`, `useState`, and client components.
* Do not duplicate logic unnecessarily.
* Use meaningful component and variable names.

### TypeScript

* Use strict typing.
* Avoid `any` unless there is a strong reason.
* Prefer explicit interfaces/types for important data structures.
* Handle nullable and optional values safely.
* Do not suppress TypeScript errors without understanding the underlying issue.

### Styling

* Follow the existing styling system.
* If Tailwind CSS is already configured, use Tailwind rather than introducing another styling solution.
* Keep responsive behavior in mind.
* Maintain consistent spacing, typography, and component patterns.

### API / Data Fetching

* Follow the existing API and data-fetching patterns.
* Validate external/user-provided data.
* Handle loading, error, and empty states where appropriate.
* Never expose secrets or private environment variables to the client.

### Environment Variables

* Never hard-code API keys, tokens, passwords, or secrets.
* Server-only secrets must not use the `NEXT_PUBLIC_` prefix.
* Do not commit `.env` files containing secrets.

## Before Making Changes

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Check related components and utilities.
4. Identify the smallest reasonable change.
5. Make the change while preserving existing conventions.

## After Making Changes

Run the appropriate checks when possible:

```bash
npm run lint
npm run build
```

If the project has tests, run the relevant test suite as well.

Fix errors introduced by the changes before considering the task complete.

## Git

* Do not create commits unless explicitly asked.
* Do not push to GitHub unless explicitly asked.
* Do not rewrite Git history.
* Keep changes limited to the requested task.

## Important

Before adding a new library, first check whether the repository already has a dependency that solves the problem.

Before creating a new component, utility, hook, or API route, check whether an existing implementation can be reused.

When requirements are ambiguous, inspect the repository and infer conventions from existing code before making large architectural changes.

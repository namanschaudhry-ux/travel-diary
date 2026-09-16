## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Working across multiple concurrent chats

This site is often edited from several Claude Code chats at once, all pointed at the
same local checkout and the same dev server (one shared preview, e.g.
`http://localhost:4321`, not one per chat). There's no per-chat isolation — that's
intentional, so every chat's saved edits show up immediately in the one shared
preview. Guardrails to keep that safe:

- Re-`Read` a file immediately before editing it. Don't rely on a read from earlier
  in a long conversation — another chat may have changed it since.
- Run `git status` / `git diff` before starting real edits, to notice if another
  chat already has uncommitted work in progress. Don't touch files that show
  unrelated pending changes without flagging it to the user first.
- Avoid touching shared/global files (`Layout.astro`, global CSS, `package.json`,
  `src/data/destinations.ts`) without checking with the user — a collision there
  is the main real risk of this shared-workspace setup.
- If you need to restart the dev server or add/change a dependency, say so first —
  that's disruptive to whatever any other chat is currently previewing.
- Commit your own logical change when it's done and verified, with a descriptive
  message — commits are the safety net here, not file locks.
- Only `git push origin main` (which deploys via Vercel) when the user explicitly
  asks for it. Never push a change — yours or one left uncommitted by another
  chat — without that explicit go-ahead.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

# OleTide Website

Website built with TanStack Start, React, TypeScript, and Tailwind CSS.

## Development

Install dependencies and start the local development server:

```sh
bun install
bun run dev
```

## Deploy to Cloudflare Pages

Configure the Cloudflare Pages project with:

- **Build command:** `bun run build`
- **Build output directory:** `dist`

The Vite build uses Nitro's Cloudflare Pages preset. `wrangler.jsonc` contains the Pages output directory and compatibility settings.

To preview the Pages build locally, run `bun run preview:cloudflare`.

## Scripts

- `bun run dev` — start the development server
- `bun run build` — create a production Cloudflare Pages build
- `bun run test` — run the test suite
- `bun run deploy` — deploy `dist` to Cloudflare Pages with Wrangler

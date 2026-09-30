# Ahorra client: decisions

Read by every later step. Status: PROPOSED means taken from the implementation plan's suggestion and applied by default; the owner can override before Step 1c.

## Environment

| Item | Value | Status |
|---|---|---|
| Development machine | macOS, zsh | AGREED (owner) |

## Step 1 decisions

| # | Decision | Answer | Status |
|---|---|---|---|
| D1 | Language | JavaScript (`.jsx`, `.js`) with `jsconfig.json`, matching the reference client. No TypeScript. | PROPOSED |
| D2 | Package manager and Node | npm. Node 22 (`.nvmrc` = `22`, `engines.node` >= 22.22.0, required by `react-router` v8). `packageManager` field pinned to the installed npm. | PROPOSED |
| D3 | PatternFly major | PatternFly 6 (`@patternfly/react-core`, exact version, latest 6.x). The bridge file (Step 1e) maps onto v6 global tokens (`--pf-t--global--*`). | PROPOSED |
| D6 | Font hosting | Self-host Red Hat Text weight 400 only, as WOFF2 (latin and latin-ext subsets), in `public/fonts/` so the URL is stable for preload and the service worker. Files are added in Step 1d. | PROPOSED |

## Known font limitation

Red Hat Text has no glyph for the naira sign (U+20A6) in either the latin or latin-ext subset. Every `₦` renders in the system fallback font. Revisit in Step 1d: accept the fallback, or pick a fallback that matches Red Hat Text closely.

Yoruba letters with a dot below (ẹ, ọ, ṣ) are also missing from both shipped subsets, so names typed with them render those letters in the fallback font.

## Theming

Light and dark are chosen with `light-dark()` in `tokens.css`, so each colour is written once. Needs Safari and iOS 17.5+, Chrome 123+, Firefox 120+. `data-theme="light"` or `"dark"` on `<html>` forces a theme (Settings, Appearance); no attribute follows the system.

## Ports

| Service | Port |
|---|---|
| `ahorra-server` | 2050 |
| `ahorra-client` (dev and preview) | 2051 |

## Tooling

ESLint is pinned to 9: `eslint-plugin-react` does not support ESLint 10 yet. Revisit when it does.

## Step 3 decisions

| # | Decision | Answer | Status |
|---|---|---|---|
| D5 | Client data cache | TanStack Query (`@tanstack/react-query`). In-memory only, nothing persisted (Ahorra is online-only). Cleared when the session ends. | AGREED (owner) |

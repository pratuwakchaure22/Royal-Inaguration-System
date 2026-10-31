# Security Policy

## Supported versions

Only the latest release on `main` receives fixes.

## Reporting a vulnerability

Please **do not** open a public issue. Use GitHub's **Security → Report a vulnerability** (private advisory) on this repository, with steps to reproduce and the impact you observed. You can expect an initial response within a few days.

## Notes for deployers

- The Firebase web config in `src/assets/js/firebase-config.js` is public by design. Security comes from your **Realtime Database rules** — publish [`firebase/database.rules.json`](firebase/database.rules.json).
- The controller has no authentication by default. For public events, add Firebase Anonymous Auth or a PIN gate, and restrict the API key to your domain in Google Cloud Console.
- Never commit service-account keys or `.env` files.

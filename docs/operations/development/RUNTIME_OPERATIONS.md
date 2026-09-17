# Asteria Runtime Operations

This file owns volatile runtime, tunnel, and development-server mechanics for
the fixed Asteria public entry point. Product, visual, scientific, browser-audit,
and release rules stay in root `AGENTS.md` and `prompts/AGENT_RULES.md`.

## Fixed Public Entry

- Public URL: `https://asteria.httpwwwcardiacnexus-ukb.com/`
- Cloudflare Tunnel name: `asteria-local`
- Tunnel id: `ac0c0293-15b3-4971-b6f5-35c9e984111a`
- DNS for `asteria.httpwwwcardiacnexus-ukb.com` must point to this tunnel.

Do not replace this entry point with a random `trycloudflare.com` URL, quick
tunnel, alternate hostname, alternate hosting project, or GitHub Pages/static
export unless the user explicitly asks for a new external link.

## Shared Local Origin

The local shared Asteria origin for the fixed link is:

```text
http://localhost:5174
```

It is backed by:

```text
/home/yuukias/.local/state/asteria/runtime/shared-map.json
```

Start it from `/home/yuukias/code/Asteria` with:

```bash
HOST=0.0.0.0 PORT=5174 ASTERIA_RUNTIME_DIR=/home/yuukias/.local/state/asteria/runtime node scripts/asteria-server.mjs
```

The long-running shared server should record state under:

```text
/home/yuukias/.local/state/asteria/
```

including `server.pid` and `server.log`.

Before blaming Cloudflare, verify the local origin:

```bash
curl -sS --max-time 10 http://127.0.0.1:5174/api/asteria/status
```

## Fixed Tunnel

Run the fixed tunnel with:

```bash
/home/yuukias/MONAILabel/cloudflared-linux-amd64 tunnel --no-autoupdate --protocol http2 run --token-file /home/yuukias/.cloudflared/asteria-local.token --url http://localhost:5174
```

In this environment, prefer `--protocol http2`; QUIC may fail even when login
and DNS are correct.

For a persistent background connector, use the same fixed tunnel command with
`setsid`, write logs to:

```text
/home/yuukias/.local/state/asteria/asteria-local-cloudflared-bg.log
```

and write the pid to:

```text
/home/yuukias/.local/state/asteria/asteria-local-cloudflared-bg.pid
```

## Secrets

Never print, commit, or copy Cloudflare tunnel tokens into tracked files. Store
the token at:

```text
/home/yuukias/.cloudflared/asteria-local.token
```

with mode `600`.

If the token or `/home/yuukias/.cloudflared/cert.pem` is missing, use
`cloudflared tunnel login`, have the user authorize the
`httpwwwcardiacnexus-ukb.com` zone, then regenerate the local token with:

```bash
cloudflared tunnel token asteria-local
```

## 1033 Recovery

If the fixed public URL returns Cloudflare 1033, first check
`cloudflared tunnel info asteria-local` for an active connector. If there is no
active connector, restart the fixed `asteria-local` connector above; do not
create a quick tunnel as a workaround.

## Verification

After fixing or updating the external link, verify both:

```bash
curl -sS --max-time 20 -D - https://asteria.httpwwwcardiacnexus-ukb.com/
curl -sS --max-time 20 https://asteria.httpwwwcardiacnexus-ukb.com/api/asteria/status
```

Record the result in the final response or task result.

## Development Server

- The default dev server command is `npm run dev`; the project script pins Vite
  to `vite --host 127.0.0.1`.
- The default URL is `http://127.0.0.1:5173/`.
- Always run dev-server commands from the repository root so Vite resolves the
  local `package.json` and `vite.config.ts` correctly. If launching through a
  wrapper, background runner, or sandboxed environment, make the working
  directory explicit before running `npm run dev`.
- Before starting the server, check whether that URL or port 5173 already has a
  usable Vite server. If the page is reachable, do not start a duplicate server.
- If 5173 is occupied but unusable, report the state first. If a temporary
  fallback port is needed, use `npm run dev -- --host 127.0.0.1 --port 5174`.
- Do not reinstall dependencies just to start the server. Only run an install
  command when dependencies are actually missing and the user approves it.
- If startup fails with a Vite temp-file or permission error, first retry
  `npm run dev` in a normal foreground terminal session from the repo root. Treat
  this as a way to distinguish a project problem from a constrained environment
  that blocks Vite from writing temporary config files.
- When starting the server in the background, hide the window and write logs to a
  temporary log file inside the repo, such as `.codex/vite-dev.log`, to avoid
  repeated startup attempts from multiple threads.
- If the user asks for the server to remain available after the conversation
  ends, do not rely on a sandbox-started background process; the sandbox may
  clean up child processes after the command exits. Request approval to start a
  hidden background process outside the sandbox, then wait a few seconds and
  confirm `http://127.0.0.1:5173/` still returns HTTP 200.
- On Windows, if the `npm run dev` background wrapper does not stay alive
  reliably, start Vite's Node entry directly as an equivalent fallback:
  `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173`. Still write
  logs to `.codex/vite-dev.log` and use `netstat -ano` to confirm 5173 is
  `LISTENING`.

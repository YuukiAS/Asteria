import { readFile } from "node:fs/promises"

const serverSource = await readFile(new URL("./asteria-server.mjs", import.meta.url), "utf8")

if (!serverSource.includes("allowedHosts: true")) {
  throw new Error("The shared server must allow external tunnel hosts in Vite middleware mode.")
}

console.log("Shared server config validation passed.")

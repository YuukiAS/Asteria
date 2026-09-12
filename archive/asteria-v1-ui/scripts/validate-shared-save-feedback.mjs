import { readFile } from "node:fs/promises"

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

function assert(condition, message) {
  if (!condition) fail(message)
}

const appSource = await readFile(new URL("../src/app/App.tsx", import.meta.url), "utf8")
const storeSource = await readFile(new URL("../src/store/useMapStore.ts", import.meta.url), "utf8")

assert(appSource.includes("saveDialogBusy"), "Expected Save dialog to track an explicit busy state.")
assert(appSource.includes("choice-dialog-option-loading"), "Expected Save dialog actions to expose a loading class.")
assert(appSource.includes("aria-busy={action.isLoading || undefined}"), "Expected loading Save dialog actions to expose aria-busy.")
assert(appSource.includes('setSaveDialogBusy("shared")'), "Expected shared saves to set a shared publishing busy state.")
assert(appSource.includes("disabled={action.disabled}"), "Expected Save dialog actions to be disabled while a save action is running.")

assert(storeSource.includes("function queueSharedPublishLocalMirror"), "Expected shared publish to use a background local mirror helper.")
assert(storeSource.includes("window.setTimeout(() =>"), "Expected shared publish local mirroring to run after the successful remote publish returns.")
assert(storeSource.includes("queueSharedPublishLocalMirror(result.record)"), "Expected successful shared publish to queue local mirroring.")
assert(
  !/queueSharedPublishLocalMirror\(result\.record\)\s*await get\(\)\.saveNow\(\)\s*return true/s.test(storeSource),
  "Shared publish success must not await local IndexedDB save before returning.",
)

if (!process.exitCode) console.log("Validated shared-save feedback and non-blocking local mirror behavior.")

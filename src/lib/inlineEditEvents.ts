export type InlineEditField = "title" | "content"

export type InlineEditTarget = {
  nodeId: string
  field: InlineEditField
}

export const startInlineEditEvent = "asteria-start-inline-edit"
export const focusEditorEvent = "asteria-focus-editor"
export const insertBlockEquationEvent = "asteria-insert-block-equation"
export const openSymbolEquationEvent = "asteria-open-symbol-equation"

export function requestInlineBlockEdit(nodeId: string, field: InlineEditField = "content") {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent<InlineEditTarget>(startInlineEditEvent, { detail: { nodeId, field } }))
  }, 0)
}

export function requestInlineEditorFocus(nodeId: string) {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent<{ nodeId: string }>(focusEditorEvent, { detail: { nodeId } }))
  }, 0)
}

export function requestBlockEquationInsert(nodeId: string, latex: string) {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent<{ nodeId: string; latex: string }>(insertBlockEquationEvent, { detail: { nodeId, latex } }))
  }, 80)
}

export function requestSymbolEquationInsert(nodeId: string) {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent<{ nodeId: string }>(openSymbolEquationEvent, { detail: { nodeId } }))
  }, 80)
}

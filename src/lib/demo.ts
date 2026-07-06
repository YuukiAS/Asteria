import type { BlockNode, ExportedMap, MapEdge } from "../types/map"
import { defaultEdgeData } from "./exportImport"
import { nowIso } from "./time"

const at = nowIso()

function block(id: string, title: string, x: number, y: number, contentJson: BlockNode["data"]["contentJson"]): BlockNode {
  return {
    id,
    type: "block",
    position: { x, y },
    data: {
      title,
      contentJson,
      contentHtml: "",
      variants: { common: { title, contentJson, contentHtml: "", updatedAt: at } },
      activeVariantKey: "common",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderColor: "#111827",
      width: 340,
      height: 220,
      displayMode: "full",
      nodeType: "generic",
      showStatus: false,
      status: "undo",
      emojis: [],
      createdAt: at,
      updatedAt: at,
    },
  }
}

export function createDemoMap(): ExportedMap {
  const nodes: BlockNode[] = [
    block("demo-problem", "Problem statement", 80, 80, {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Summarize the object, assumptions, and open decisions in one place." }] },
        {
          type: "paragraph",
          content: [
            { type: "inlineMath", attrs: { latex: "\\theta \\mid y" } },
            { type: "text", text: " marks the current working quantity." },
          ],
        },
        {
          type: "blockMath",
          attrs: {
            latex: "p(\\theta \\mid y) \\propto p(y \\mid \\theta)p(\\theta)",
          },
        },
      ],
    }),
    block("demo-evidence", "Evidence block", 520, 160, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Collect notes, equations, references, or checks that support the current diagram.",
            },
          ],
        },
      ],
    }),
    block("demo-output", "Output summary", 300, 460, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Keep the intended result visible without forcing a fixed workflow." },
          ],
        },
        {
          type: "blockMath",
          attrs: {
            latex: "\\widehat{q} = \\operatorname*{arg\\,min}_{q \\in \\mathcal{Q}} \\mathcal{L}(q)",
          },
        },
      ],
    }),
  ]
  const edges: MapEdge[] = [
    {
      id: "demo-edge-1",
      source: "demo-problem",
      target: "demo-evidence",
      sourceHandle: "right",
      targetHandle: "left-target",
      type: "smoothstep",
      data: { label: "informs", ...defaultEdgeData, createdAt: at, updatedAt: at },
      style: { stroke: defaultEdgeData.color, strokeWidth: defaultEdgeData.strokeWidth },
    },
    {
      id: "demo-edge-2",
      source: "demo-evidence",
      target: "demo-output",
      sourceHandle: "bottom",
      targetHandle: "top-target",
      type: "smoothstep",
      data: { label: "summarizes", ...defaultEdgeData, createdAt: at, updatedAt: at },
      style: { stroke: defaultEdgeData.color, strokeWidth: defaultEdgeData.strokeWidth },
    },
  ]
  return {
    version: 1,
    title: "Local map",
    modelVersions: [],
    activeVersionId: "all",
    displayModeOverride: "block",
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: at,
  }
}

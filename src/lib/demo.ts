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
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderColor: "#e5e7eb",
      width: 340,
      height: 220,
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
    block("demo-open-tail", "Open-tail TRACE", 80, 80, {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Open-tail columns use TRACE-calibrated intercepts." }] },
        {
          type: "paragraph",
          content: [
            { type: "inlineMath", attrs: { latex: "\\alpha^U_{hg}\\mid\\gamma_g,p_{U,g}" } },
            { type: "text", text: " controls baseline rarity." },
          ],
        },
        {
          type: "blockMath",
          attrs: {
            latex:
              "\\mu_{p_{U,g}}(\\gamma_g)\n=\n(1+\\tau^2_{p_{U,g}})^{1/2}\n\\Phi^{-1}\\left(\\frac{\\gamma_g}{\\gamma_g+p_{U,g}}\\right)",
          },
        },
      ],
    }),
    block("demo-catalogue", "Catalogue component", 520, 160, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Finite catalogue species use identity-aware borrowing, not extreme-value calibration.",
            },
          ],
        },
      ],
    }),
    block("demo-copula", "Residual copula", 300, 460, {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Residual factors enter the Gaussian copula, not the marginal mean." },
          ],
        },
        {
          type: "blockMath",
          attrs: {
            latex:
              "\\Omega_W=\\Lambda_W\\Lambda_W^\\top+I,\n\\qquad\n\\Sigma_W=\\operatorname{diag}(\\Omega_W)^{-1/2}\n\\Omega_W\n\\operatorname{diag}(\\Omega_W)^{-1/2}",
          },
        },
      ],
    }),
  ]
  const edges: MapEdge[] = [
    {
      id: "demo-edge-1",
      source: "demo-open-tail",
      target: "demo-catalogue",
      sourceHandle: "right",
      targetHandle: "left-target",
      type: "smoothstep",
      data: { label: "contrasts", ...defaultEdgeData, createdAt: at, updatedAt: at },
      style: { stroke: defaultEdgeData.color, strokeWidth: defaultEdgeData.strokeWidth },
    },
    {
      id: "demo-edge-2",
      source: "demo-catalogue",
      target: "demo-copula",
      sourceHandle: "bottom",
      targetHandle: "top-target",
      type: "smoothstep",
      data: { label: "feeds residual layer", ...defaultEdgeData, createdAt: at, updatedAt: at },
      style: { stroke: defaultEdgeData.color, strokeWidth: defaultEdgeData.strokeWidth },
    },
  ]
  return { version: 1, nodes, edges, viewport: { x: 0, y: 0, zoom: 1 }, updatedAt: at }
}

# TODO1: Asteria Celestial Canvas Background Plan

## 1. Goal

Implement a visually polished but low-risk canvas background for Asteria. The target design is a fixed, viewport-level “scholarly celestial atlas” atmosphere behind the React Flow workspace, while nodes, edges, and a subtle React Flow dot/grid background still move with pan and zoom.

The intended result is not a full visual-system redesign yet. This task only upgrades the canvas background in a simple, robust way:

- A fixed celestial map background remains visually stable in the browser viewport.
- The React Flow nodes, edges, selection state, and dot/grid reference layer continue to pan and zoom normally.
- The background is subdued enough that statistical blocks, formulas, edge labels, and inspector interactions remain readable.
- The implementation should be easy to remove, theme, or replace later.

## 2. Design Rationale

Do not attach the generated celestial background image directly to the infinite canvas world coordinates. Asteria’s canvas behaves like an infinite workspace, while the current celestial background image has a strong poster-like center: a central astrolabe, faint `N / E / S / W` direction labels, edge constellations, and corner astronomical ornaments. If this image is treated as the world background, users will see awkward behavior when panning far away, zooming deeply, or revisiting the canvas from non-origin locations.

Use the background as a fixed ambient viewport layer instead. This preserves the refined Asteria theme without creating false spatial meaning. The moving React Flow dot/grid layer supplies the actual sense of spatial navigation.

The final layering should be:

1. `asteria-canvas-shell`: fixed viewport/canvas container background color.
2. `asteria-celestial-background`: fixed decorative celestial image or CSS/SVG fallback, not transformed by React Flow pan/zoom.
3. Optional subtle overlay/vignette/readability layer.
4. `ReactFlow`: transparent background; nodes, edges, controls, minimap, and React Flow `Background` remain above the fixed background.
5. React Flow `Background`: very faint moving dots/grid, still tied to the canvas transform.

## 3. Current Code Context

The main canvas is currently implemented in `src/components/Canvas.tsx`. It renders a `<main>` wrapper and a `<ReactFlow>` instance. The current wrapper is:

```tsx
<main className="min-h-0 min-w-0 flex-1 bg-canvas" onDoubleClick={onCanvasDoubleClick}>
```

Inside `ReactFlow`, it currently renders:

```tsx
<Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--canvas-grid)" />
<Controls position="bottom-left" />
<MiniMap ... />
```

The global canvas styling is in `src/styles/index.css`. Current relevant variables include `--color-canvas`, `--canvas-grid`, `--edge-label-bg`, `--edge-label-text`, `--minimap-node`, and `--minimap-mask`. Current `.react-flow` styling sets `background: rgb(var(--color-canvas));`, which would cover a fixed background layer unless changed.

## 4. Required Implementation

### 4.1 Add a fixed celestial background layer

Modify `src/components/Canvas.tsx` so that the canvas wrapper has a named class and contains a decorative background element before `ReactFlow`.

Preferred structure:

```tsx
return (
  <main className="asteria-canvas-shell min-h-0 min-w-0 flex-1" onDoubleClick={onCanvasDoubleClick}>
    <div className="asteria-celestial-background" aria-hidden="true" />
    <div className="asteria-canvas-readability-overlay" aria-hidden="true" />
    <InteractionModeContext.Provider value={{ interactionMode, inlineEditTarget, selectedNodeIds, onInlineEditTargetChange }}>
      <ReactFlow
        ...
        className={`${interactionMode === "edit" ? "asteria-flow-edit" : "asteria-flow-move"} asteria-flow-canvas`}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.1} color="var(--canvas-grid)" />
        <Controls position="bottom-left" />
        <MiniMap ... />
      </ReactFlow>
    </InteractionModeContext.Provider>
  </main>
)
```

Use an actual string/template expression safely. Do not break existing `interactionMode` class behavior.

### 4.2 Add CSS for the fixed background

Add the main styling in `src/styles/index.css`. Keep this near the existing React Flow / canvas styles.

Required behavior:

- `.asteria-canvas-shell` is `position: relative`, fills available space, clips overflow, and uses `background: rgb(var(--color-canvas))` or a slightly richer canvas token.
- `.asteria-celestial-background` is `position: absolute; inset: 0; pointer-events: none; z-index: 0;`.
- `.asteria-canvas-readability-overlay` is above the background but below React Flow, with `pointer-events: none`.
- `.asteria-flow-canvas` is `position: relative; z-index: 2; background: transparent !important;`.
- Existing `.react-flow` background must not cover the fixed layer. Either remove the global `background: rgb(var(--color-canvas));` from `.react-flow`, or override it specifically for `.asteria-flow-canvas`.

Recommended CSS starting point:

```css
.asteria-canvas-shell {
  position: relative;
  overflow: hidden;
  background: rgb(var(--color-canvas));
}

.asteria-celestial-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: rgb(var(--color-canvas));
  background-image:
    var(--asteria-celestial-image, none),
    radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.62) 34%, rgba(226, 232, 240, 0.28) 100%),
    radial-gradient(circle at 12% 82%, rgba(191, 219, 254, 0.22), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(253, 230, 138, 0.12), transparent 24%);
  background-size: cover, cover, cover, cover;
  background-position: center, center, center, center;
  background-repeat: no-repeat;
  opacity: var(--asteria-celestial-opacity, 0.68);
  transform: translateZ(0);
}

.asteria-canvas-readability-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.42), transparent 58%),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.18), rgba(241, 245, 249, 0.08));
}

.asteria-flow-canvas {
  position: relative;
  z-index: 2;
  background: transparent !important;
}
```

### 4.3 Support an optional real image asset without breaking the app

The preferred asset path is:

```text
public/backgrounds/asteria-celestial-map.png
```

Add the CSS variable only if the asset exists or is added:

```css
:root {
  --asteria-celestial-image: url("/backgrounds/asteria-celestial-map.png");
  --asteria-celestial-opacity: 0.62;
}
```

If the binary image asset is not available in the working tree, do not invent a placeholder binary and do not leave a broken hard dependency. Instead:

- Keep the CSS fallback gradients.
- Add a clear comment indicating where the final image should be placed.
- Ensure the app still looks acceptable without the PNG.

If Codex has access to the generated image file from the user, copy it to `public/backgrounds/asteria-celestial-map.png`. Otherwise, implement the fallback and document the asset path.

### 4.4 Preserve the moving spatial reference layer

Keep React Flow’s `<Background>` component, but reduce its visual weight so it works as a spatial reference rather than competing with the celestial image.

Recommended adjustment:

```tsx
<Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--canvas-grid)" />
```

Then adjust `--canvas-grid` to a subtler value if needed. The important point is that React Flow `Background` should still pan and zoom with the canvas. The celestial background should not.

### 4.5 Dark mode behavior

Do not ignore dark mode. Add a simple dark-mode override in `[data-theme="dark"]`:

- Reduce image opacity.
- Use a darker blue/slate fallback gradient.
- Keep grid visibility subtle but usable.

Example:

```css
[data-theme="dark"] {
  --asteria-celestial-opacity: 0.22;
}

[data-theme="dark"] .asteria-celestial-background {
  background-image:
    var(--asteria-celestial-image, none),
    radial-gradient(circle at 50% 48%, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.96)),
    radial-gradient(circle at 18% 82%, rgba(59, 130, 246, 0.16), transparent 34%);
  mix-blend-mode: normal;
}

[data-theme="dark"] .asteria-canvas-readability-overlay {
  background: radial-gradient(circle at 50% 46%, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.36));
}
```

Adjust exact values after visual inspection. Do not make dark mode noisy.

## 5. Optional Enhancement If Still Simple

If implementation remains simple, add a small density/readability behavior based only on CSS classes, not complicated canvas state:

- Add a class such as `.asteria-canvas-shell-content-heavy` only later if node density logic already exists or is trivial.
- Do not spend time implementing dynamic opacity based on node count in this task unless it is very small and safe.

For now, fixed opacity is acceptable.

## 6. Non-Goals

Do not perform a full redesign of Asteria in this task. Specifically, do not:

- Redesign every block type card.
- Rewrite the inspector panel.
- Change block data models.
- Change export/import schema.
- Change edge semantics beyond visual compatibility if needed.
- Add heavy animation libraries.
- Add particle systems.
- Add procedural infinite star generation.
- Convert the whole canvas background into a massive image that moves with React Flow pan/zoom.

This task is only the fixed celestial background layer plus compatibility polish.

## 7. Acceptance Criteria

The implementation is complete only if all of the following are true:

1. The app builds successfully with the existing package scripts.
2. The celestial background is visible behind the canvas in light mode.
3. Panning and zooming move nodes, edges, and the React Flow dot/grid reference layer, but the celestial background remains fixed relative to the viewport.
4. The background does not block mouse interactions, selection, dragging, connecting edges, double-click block creation, controls, or minimap.
5. The React Flow background no longer covers the fixed celestial layer with an opaque solid color.
6. Node content, formulas, edge labels, and inspector text remain readable.
7. Dark mode is not broken and has an intentional subdued background treatment.
8. If the image asset is absent, the app still renders an acceptable CSS fallback and no broken import or runtime error occurs.
9. Existing behavior in `Canvas.tsx` remains intact: fit view, viewport persistence, edit/move interaction mode, inline edit, selection, edge click, pane click, connection, controls, and minimap.

## 8. Verification Steps

Run the normal local checks. At minimum:

```bash
npm install
npm run build
```

If the repo has lint/test scripts, also run them:

```bash
npm run lint
npm test
```

Manual verification:

1. Open the app in light mode.
2. Confirm the celestial background appears behind the canvas.
3. Pan far left/right/up/down; confirm the background remains fixed while nodes and grid move.
4. Zoom in and out; confirm the background remains stable and does not pixelate distractingly.
5. Create a new block by double-clicking the pane.
6. Drag a block in move mode.
7. Switch to edit mode and edit title/content.
8. Select a node and confirm the inspector still works.
9. Select an edge and confirm edge inspector still works.
10. Toggle dark mode and confirm the canvas remains readable.

## 9. Suggested Commit Message

```text
Add fixed celestial atlas canvas background
```

## 10. Implementation Priority

Priority order:

1. Add wrapper/background layering in `Canvas.tsx`.
2. Update `src/styles/index.css` so the fixed background is visible and React Flow stays transparent.
3. Tune light-mode opacity/readability.
4. Add dark-mode override.
5. Add optional asset path or fallback comment.
6. Run build and manually inspect.

Do not skip the verification steps. Do not claim completion if the background moves with React Flow or if the app only works when an external image file happens to exist locally.

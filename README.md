# Asteria

Asteria is a local-first visual block map for Bayesian model development, paper reading, and meeting preparation.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Data

Map data is saved locally in IndexedDB under the `asteria-map` database. JSON export and import are available from the top toolbar.

## Block Color and Marker Notes

Asteria keeps block text and block background palettes separate so readable canvas notes do not accidentally use dark text colors as backgrounds.

- Text colors: `#111827`, `#374151`, `#6b7280`, `#ef4444`, `#f97316`, `#b45309`, `#eab308`, `#22c55e`, `#06b6d4`, `#3b82f6`, `#8b5cf6`, `#ec4899`.
- Background colors: `#ffffff`, `#f9fafb`, `#fef3c7`, `#dbeafe`, `#dcfce7`, `#fce7f3`, `#fee2e2`, `#e5e7eb`.
- Block borders are fixed to black for now and are not exposed as an editable color.

Current block type defaults:

- Generic: default white background, black text, black badge.
- Definition and Notation: terminology-style yellow background, black text.
- Model: default background, yellow text.
- Prior: blue background.
- Assumption: gray background.
- Theorem: default background, dark orange text.
- Dataset: pink background.
- Result: generic block body colors, blue badge, and an initial ordered list.
- Citation: generic block body colors and gray badge.
- Warning: warning background and a default warning emoji marker.
- TODO: generic block colors and an initial checkbox list; pressing Enter in the list creates another checkbox item.

The single marker emoji keeps free-form input and also provides a small preset picker so users do not have to open an OS emoji input method for common markers. On the canvas, the emoji is shown directly before the block title and can be edited from the selected block header in Edit mode.

## V2 TODO

- PWA offline install
- More block types
- Tags and search
- Group/frame regions
- Edge semantic types
- LaTeX, SVG, PDF, and Obsidian export
- Image and PDF screenshot paste
- Cloud sync and version history
- Automatic layout and minimap
- Deeper mobile editing

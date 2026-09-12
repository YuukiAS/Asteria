# Asteria 1.x UI Archive

This directory preserves the retired Asteria 1.x live canvas UI and runtime source after the `2.0.0-rc.4` acceptance cleanup.

The complete Asteria 1.x product shell remains frozen at version tag/commit `v1.0.0`. Use that historical point for the full legacy Canvas, Toolbar, Inspector, Story, startup chooser, local/shared workspace gate, and React Flow editing runtime.

The files in this archive are historical reference only:

- They are not imported by the active Asteria 2.0 Web build.
- They do not provide a hidden Legacy Canvas live mode.
- They should not be used as an alternate product shell.

Active `src/` keeps only the compatibility pieces required for v1 -> v2 migration, including the legacy v1 payload types, parser/normalizer, freeze fixture, migration bridge, and regression coverage.

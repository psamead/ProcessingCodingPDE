# Processing PDE Support

Lightweight VS Code language support for Processing `3.5.4` Java-mode `.pde` sketches.

## Features

- Recognizes `.pde` files as Processing sketches.
- Adds Processing syntax highlighting.
- Adds Processing snippets.
- Provides lightweight completions and hover help for common Processing 3.5.4 APIs.
- Runs the active sketch through an external Processing 3.5.4 `processing-java` command.

This extension does not bundle Processing, `processing-java`, or `core.jar`.

## Requirements

Editing features work without Processing installed.

To run sketches, install Processing `3.5.4` and configure `processing35.path` if `processing-java` is not on your `PATH`.

Common Windows values:

```json
"processing35.path": "C:\\Program Files\\processing-3.5.4\\processing-java.exe"
```

If Processing 3.5.4 fails on Windows with `Could not find or load main class Files`, point `processing35.path` to a wrapper script that launches `processing-java.exe` with a minimal safe `PATH`.

## Extension Settings

- `processing35.path`: Path to Processing 3.5.4 `processing-java` or a wrapper script.
- `processing35.outputFolder`: Output folder name used by the run command. Defaults to `out`.
- `processing35.referenceBaseUrl`: Base URL for Processing reference links.

## Commands

- `Processing 3.5.4: Run Sketch`
- `Processing 3.5.4: Open Reference for Selection`

## Scope

This project targets Processing `3.5.4`. Processing 4+ support is intentionally outside the current scope.

## Attribution

The TextMate grammar and snippets are derived from Tobiah Zarlez's MIT-licensed Processing VS Code extension. See `THIRD_PARTY_NOTICES.md`.

# Processing PDE Support

Lightweight VS Code language support for Processing `3.5.4` Java-mode `.pde` sketches.

Compatible with VS Code `1.70.3` and newer. Automated compatibility tests use Microsoft's downloadable `1.70.2` archive because the update service does not provide a `1.70.3` archive.

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

On Windows, this extension automatically launches absolute `processing-java.exe` paths with a minimal safe `PATH` to avoid the Processing 3.5.4 `Could not find or load main class Files` launcher bug. If the problem still appears, point `processing35.path` to a wrapper script that launches `processing-java.exe` with a minimal safe `PATH`.

## Extension Settings

- `processing35.path`: Path to Processing 3.5.4 `processing-java` or a wrapper script.
- `processing35.outputFolder`: Output folder name used by the run command. Defaults to `out`.
- `processing35.cleanWindowsPath`: Launch absolute Windows `processing-java.exe` paths with a minimal safe `PATH`. Defaults to `true`.
- `processing35.referenceBaseUrl`: Base URL for Processing reference links.

## Commands

- `Processing 3.5.4: Run Sketch`
- `Processing 3.5.4: Open Reference for Selection`

## Scope

This project targets Processing `3.5.4`. Processing 4+ support is intentionally outside the current scope.

The minimum supported VS Code version is `1.70.3`.

## Attribution

The TextMate grammar and snippets are derived from Tobiah Zarlez's MIT-licensed Processing VS Code extension. See `THIRD_PARTY_NOTICES.md`.

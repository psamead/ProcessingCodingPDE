# Processing 3.5.4 PDE VS Code Extension Development Guide

## Project Goal

Build a lightweight, publishable VS Code extension for Java-mode Processing `.pde` files, targeting Processing `3.5.4`.

The extension provides `.pde` file recognition, syntax highlighting, snippets, lightweight IntelliSense, hover/reference help, and optional run/build commands using an external Processing 3.5.4 installation.

The extension does not bundle Processing, `processing-java`, or `core.jar`.

The extension should remain compatible with VS Code `1.70.3` and newer. Automated tests use VS Code `1.70.2` because Microsoft's downloadable archive service does not provide `1.70.3`.

## Current Direction

Use `PDEextension_Dev/Psamead` as the clean extension project. The older patched extension folders under `newer` and `older` are reference material only.

Tobiah's Processing VS Code extension is MIT licensed, so grammar and snippet assets may be reused with attribution. Do not reuse Tobiah's publisher identity, extension id, Marketplace metadata, `.vsixmanifest`, installer scripts, or hardcoded local paths.

## Lightweight Architecture

The first version should avoid a heavy LSP or JDT.LS integration. Editing features should work without Processing installed.

Core implementation pieces:

- VS Code `package.json` language, grammar, snippet, command, and configuration contributions.
- TextMate grammar for `.pde` syntax highlighting.
- Snippets for Processing APIs.
- Bundled Processing 3.5.4 API metadata for completions and hover help.
- Optional run command that calls the configured external `processing-java` path.

## Processing 3.5.4 Runtime Handling

The extension targets Processing `3.5.4` only. Processing 4+ support is out of scope.

Use `processing35.path` for the external Processing command. The value may point to `processing-java.exe`, `processing-java`, or a wrapper script.

On Windows, Processing 3.5.4 may fail with `Could not find or load main class Files` when the old launcher sees a noisy `PATH`. The extension should not silently install a wrapper. It should document the workaround and show a helpful error when the known failure appears.

## Development Phases

1. Clean extension base: replace Hello World, define `.pde` language support, grammar, snippets, settings, and commands.
2. Legal asset import: include MIT attribution for Tobiah-derived grammar and snippets.
3. Lightweight IntelliSense: use bundled Processing 3.5.4 metadata for completions and hover help.
4. Run support: run the active sketch with configured Processing 3.5.4 command path.
5. Marketplace readiness: clean README, changelog, third-party notices, `.vscodeignore`, and package with `@vscode/vsce`.

## Acceptance Criteria

- The extension installs through normal VS Code extension packaging.
- `.pde` files are recognized automatically.
- Syntax highlighting and snippets work on a clean machine.
- Completion and hover help work without Processing installed.
- Run command works when Processing 3.5.4 is installed or `processing35.path` points to a wrapper.
- The package contains Tobiah attribution but no Tobiah identity or local installer metadata.

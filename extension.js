const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const api = require('./data/processing-35-api.json');

const languageSelector = { language: 'pde', scheme: 'file' };

function getConfig() {
	return vscode.workspace.getConfiguration('processing35');
}

function fileExists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}

function resolveProcessingPath() {
	const configuredPath = getConfig().get('path', 'processing-java');
	if (configuredPath && configuredPath !== 'processing-java') {
		return configuredPath;
	}

	const systemDrive = process.env.SystemDrive || 'C:';
	const candidates = [
		path.join(systemDrive, 'Program Files', 'processing-3.5.4', 'processing-java.exe'),
		path.join(systemDrive, 'processing-3.5.4', 'processing-java.exe')
	];

	for (const candidate of candidates) {
		if (fileExists(candidate)) {
			return candidate;
		}
	}

	return configuredPath || 'processing-java';
}

function getReferenceUrl(entry) {
	const baseUrl = getConfig().get('referenceBaseUrl', 'https://processing.org/reference/');
	return vscode.Uri.parse(new URL(entry.reference, baseUrl).toString());
}

function completionKind(entry) {
	if (entry.kind === 'variable') {
		return vscode.CompletionItemKind.Variable;
	}
	return vscode.CompletionItemKind.Function;
}

function buildCompletionItems() {
	return Object.entries(api).map(([name, entry]) => {
		const item = new vscode.CompletionItem(name, completionKind(entry));
		const signature = entry.signatures[0] || name;
		const argsMatch = signature.match(/\((.*)\)/);

		item.detail = signature;
		item.documentation = new vscode.MarkdownString(`${entry.description}\n\n[Processing 3.5.4 reference](${getReferenceUrl(entry).toString()})`);

		if (entry.kind === 'function') {
			const args = argsMatch && argsMatch[1].trim()
				? argsMatch[1].split(',').map((arg, index) => `\${${index + 1}:${arg.trim()}}`).join(', ')
				: '';
			item.insertText = new vscode.SnippetString(`${name}(${args})`);
		}

		return item;
	});
}

function buildHover(word) {
	const entry = api[word];
	if (!entry) {
		return undefined;
	}

	const markdown = new vscode.MarkdownString();
	markdown.isTrusted = true;
	markdown.appendCodeblock(entry.signatures.join('\n'), 'pde');
	markdown.appendMarkdown(`\n${entry.description}\n\n[Open Processing 3.5.4 reference](${getReferenceUrl(entry).toString()})`);
	return new vscode.Hover(markdown);
}

function getActivePdeEditor() {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== 'pde') {
		vscode.window.showErrorMessage('Open a Processing .pde file first.');
		return undefined;
	}
	return editor;
}

function getSketchFolder(editor) {
	const documentPath = editor.document.uri.fsPath;
	return path.dirname(documentPath);
}

function buildRunArgs(sketchFolder) {
	const outputFolder = getConfig().get('outputFolder', 'out');
	return [
		'--force',
		`--sketch=${sketchFolder}`,
		`--output=${path.join(sketchFolder, outputFolder)}`,
		'--run'
	];
}

function shouldUseCleanWindowsPath(processingPath) {
	return process.platform === 'win32'
		&& getConfig().get('cleanWindowsPath', true)
		&& path.isAbsolute(processingPath)
		&& path.basename(processingPath).toLowerCase() === 'processing-java.exe';
}

function buildProcessingEnvironment(processingPath) {
	if (!shouldUseCleanWindowsPath(processingPath)) {
		return process.env;
	}

	const processingDir = path.dirname(processingPath);
	const safePath = [
		processingDir,
		path.join(processingDir, 'java', 'bin'),
		path.join(process.env.SystemRoot || 'C:\\Windows', 'System32'),
		process.env.SystemRoot || 'C:\\Windows'
	].join(path.delimiter);

	return {
		...process.env,
		PATH: safePath,
		Path: safePath
	};
}

function showKnownWindowsPathMessage() {
	vscode.window.showErrorMessage(
		'Processing 3.5.4 failed with the known Windows PATH parsing error. The extension tried a clean PATH automatically; if this continues, configure processing35.path to a wrapper script that launches processing-java with a minimal PATH.'
	);
}

function runSketch() {
	const editor = getActivePdeEditor();
	if (!editor) {
		return;
	}

	const processingPath = resolveProcessingPath();
	const sketchFolder = getSketchFolder(editor);
	const args = buildRunArgs(sketchFolder);
	const output = vscode.window.createOutputChannel('Processing 3.5.4');
	const env = buildProcessingEnvironment(processingPath);

	output.show(true);
	output.appendLine(`Running: ${processingPath} ${args.join(' ')}`);
	if (env !== process.env) {
		output.appendLine('Using clean Windows PATH for Processing 3.5.4 launcher compatibility.');
	}

	const child = childProcess.spawn(processingPath, args, {
		cwd: sketchFolder,
		env,
		shell: false
	});

	child.stdout.on('data', (data) => output.append(data.toString()));
	child.stderr.on('data', (data) => {
		const text = data.toString();
		output.append(text);
		if (text.includes('Could not find or load main class Files')) {
			showKnownWindowsPathMessage();
		}
	});
	child.on('error', (error) => {
		output.appendLine(error.message);
		vscode.window.showErrorMessage(`Failed to run Processing 3.5.4: ${error.message}`);
	});
	child.on('close', (code) => {
		output.appendLine(`Processing exited with code ${code}.`);
	});
}

function openReferenceForSelection() {
	const editor = getActivePdeEditor();
	if (!editor) {
		return;
	}

	const range = editor.selection.isEmpty
		? editor.document.getWordRangeAtPosition(editor.selection.active)
		: new vscode.Range(editor.selection.start, editor.selection.end);

	if (!range) {
		vscode.window.showInformationMessage('Select or place the cursor on a Processing API name first.');
		return;
	}

	const word = editor.document.getText(range).trim();
	const entry = api[word];

	if (!entry) {
		vscode.window.showInformationMessage(`No bundled Processing 3.5.4 reference entry for "${word}".`);
		return;
	}

	vscode.env.openExternal(getReferenceUrl(entry));
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const completionProvider = vscode.languages.registerCompletionItemProvider(
		languageSelector,
		{ provideCompletionItems: buildCompletionItems },
		'.'
	);

	const hoverProvider = vscode.languages.registerHoverProvider(languageSelector, {
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position);
			if (!range) {
				return undefined;
			}
			return buildHover(document.getText(range));
		}
	});

	context.subscriptions.push(
		completionProvider,
		hoverProvider,
		vscode.commands.registerCommand('processing35.runSketch', runSketch),
		vscode.commands.registerCommand('processing35.openReference', openReferenceForSelection)
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
	buildRunArgs,
	buildProcessingEnvironment,
	resolveProcessingPath
};

import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'test/**/*.test.js',
	version: '1.70.2',
	launchArgs: ['--disable-extension=github.copilot-chat'],
});

import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'test/**/*.test.js',
	launchArgs: ['--disable-extension=github.copilot-chat'],
});

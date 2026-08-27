const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('all published entry points load without a package-local zod runtime', () => {
	const packageRoot = path.resolve(__dirname, '..');
	const script = String.raw`
		const Module = require('node:module');
		const originalLoad = Module._load;
		Module._load = function(request, parent, isMain) {
			if (request === 'zod' && parent?.filename?.includes('/dist/nodes/Cipp/')) {
				throw new Error('package-local zod is intentionally unavailable');
			}
			return originalLoad.call(this, request, parent, isMain);
		};
		require('./dist/index.js');
		require('./dist/nodes/Cipp/CippApp.node.js');
		require('./dist/nodes/Cipp/advanced/CippAdvancedAiTools.node.js');
	`;

	const result = spawnSync(process.execPath, ['-e', script], {
		cwd: packageRoot,
		encoding: 'utf8',
	});

	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

// nodes/CippAdvanced/ai-tools/runtime.ts
// Resolves DynamicStructuredTool and Zod from n8n's module tree so instanceof checks pass at runtime.
// NOTE: No value imports from @langchain/core — only runtime resolution via createRequire.
// The DynamicStructuredTool type is defined inline to avoid requiring @langchain/core as a devDep.
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const require: {
	(id: string): any;
	resolve(id: string, options?: any): string;
	cache?: Record<string, unknown>;
	main?: { filename: string };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

import type { z as ZodNamespace } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicStructuredToolFields = { name: string; description: string; schema: any; func: (params: Record<string, unknown>) => Promise<string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicStructuredToolCtor = new (fields: DynamicStructuredToolFields) => any;

export type RuntimeZod = typeof ZodNamespace;
type RuntimeRequire = { (moduleId: string): unknown; resolve(id: string): string };

/**
 * n8n has THREE distinct module resolution trees that do NOT share instances:
 *
 * Tree 1 — n8n/node_modules/                       : top-level (canonical zod)
 * Tree 2 — @langchain/classic/node_modules/        : DynamicStructuredTool, @langchain/core
 * Tree 3 — @n8n/n8n-nodes-langchain/node_modules/  : separate @langchain/core copy
 *
 * A wrong-tree copy of `zod` causes a SILENT failure: n8n's normalizeToolSchema does
 * `tool.schema instanceof ZodType`; a foreign ZodType class identity fails that check,
 * the schema degrades to raw JSON Schema, and tools surface as "object schema missing
 * properties" with no error in the logs. So the copy we hand n8n must be n8n's own.
 *
 * Resolution order:
 *   1. require.main anchor — createRequire(require.main.filename). Guarded: if
 *      require.main is undefined (ESM-launched n8n, queue-mode / worker_threads) we do
 *      NOT fall back to __filename, because that self-resolves our OWN bundled copy.
 *   2. filesystem anchor (@langchain/classic) — for DynamicStructuredTool on hoisted
 *      npm installs where require.resolve can walk into Tree 2. NOT used for zod.
 *   3. requireFromCachedTree — positive anchor for pnpm-strict-isolated installs
 *      (n8n v2.29.x+) where this package lives outside n8n's node_modules.
 *
 * Must be called lazily (not at module load): n8n registers node files before any
 * workflow runs, i.e. before its langchain nodes are loaded into require.cache.
 */

/** Belt-and-braces self-exclusion — never anchor from our own package's cached files. */
const OWN_PACKAGE_NAME = '@joshuanode/n8n-nodes-cipp';

/** Filesystem anchor candidates for DynamicStructuredTool on hoisted installs. */
const ANCHOR_CANDIDATES = ['@langchain/classic/agents', 'langchain/agents'] as const;

/**
 * n8n-owned packages to anchor DynamicStructuredTool resolution against, in order.
 * @n8n/n8n-nodes-langchain is first: it runs normalizeToolSchema's instanceof checks
 * and is always resident in require.cache by the time supplyData() executes.
 */
const LANGCHAIN_TREE_PATTERNS = ['@n8n/n8n-nodes-langchain', '@langchain/classic'] as const;

/**
 * n8n-owned packages to anchor zod resolution against, in order.
 * @n8n/n8n-nodes-langchain first, then n8n-workflow, then n8n-core — all guaranteed
 * to resolve the SAME top-level zod n8n's instanceof ZodType uses.
 */
const ZOD_TREE_PATTERNS = ['@n8n/n8n-nodes-langchain', 'n8n-workflow', 'n8n-core'] as const;

// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
const { createRequire } = require('module') as {
	createRequire: (filename: string) => RuntimeRequire;
};

/** Build a cross-platform require.cache-key matcher for a package name. */
function packageKeyPattern(pkg: string): RegExp {
	const parts = pkg.split('/').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	return new RegExp(`[\\\\/]${parts.join('[\\\\/]')}[\\\\/]`);
}

/**
 * Positive-anchor resolver. Finds an already-cached module whose path belongs to one of
 * `patterns` (n8n-owned packages), then createRequire()s `id` from that module's
 * location. Patterns are tried in order; the first cached anchor that resolves `id`
 * wins. Returns undefined if none resolve it — the caller then fails clean.
 */
function requireFromCachedTree(patterns: readonly string[], id: string): unknown {
	const cache = require.cache;
	if (!cache) return undefined;
	const keys = Object.keys(cache);
	for (const pkg of patterns) {
		const anchorPattern = packageKeyPattern(pkg);
		for (const key of keys) {
			if (key.includes(OWN_PACKAGE_NAME)) continue;
			if (!anchorPattern.test(key)) continue;
			try {
				const anchorReq = createRequire(key);
				const resolved = anchorReq(id);
				if (resolved) return resolved;
			} catch {
				// This cached module can't reach `id`; try the next cached key / pattern.
			}
		}
	}
	return undefined;
}

/**
 * createRequire bound to require.main. Returns null when require.main is undefined
 * (ESM-launched n8n, queue-mode / worker_threads). Deliberately NO __filename fallback.
 */
function getMainRequire(): RuntimeRequire | null {
	const mainFile = require.main?.filename;
	if (!mainFile) return null;
	try {
		return createRequire(mainFile);
	} catch {
		return null;
	}
}

/** Filesystem anchor probe for hoisted npm installs (DynamicStructuredTool only). */
function getFilesystemAnchorRequire(): { runtimeReq: RuntimeRequire | null; diagnostic: string | null } {
	const tried: string[] = [];
	for (const anchor of ANCHOR_CANDIDATES) {
		try {
			const anchorPath = require.resolve(anchor) as string;
			return {
				runtimeReq: createRequire(anchorPath),
				diagnostic: `resolved via filesystem anchor: ${anchor}`,
			};
		} catch (e) {
			tried.push(`${anchor}: ${e instanceof Error ? e.message : String(e)}`);
		}
	}
	return {
		runtimeReq: null,
		diagnostic:
			`[CippAdvancedAiTools] No filesystem anchor. Tried: ${ANCHOR_CANDIDATES.join(', ')}. ` +
			`Errors: ${tried.join(' | ')}`,
	};
}

const _mainReq = getMainRequire();
const { runtimeReq: _filesystemAnchorReq, diagnostic: _anchorDiagnostic } =
	getFilesystemAnchorRequire();

// Memoized resolutions + last-attempt diagnostics for Proxy error messages.
let _RuntimeDynamicStructuredTool: DynamicStructuredToolCtor | undefined;
let _runtimeZod: RuntimeZod | undefined;
let langchainResolutionDiagnostic: string | null = _anchorDiagnostic;
let zodResolutionDiagnostic: string | null = null;
let langchainLoadError: string | null = null;
let zodLoadError: string | null = null;

function extractDynamicStructuredTool(mod: unknown): DynamicStructuredToolCtor | undefined {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const rec = mod as Record<string, any> | undefined;
	return typeof rec?.['DynamicStructuredTool'] === 'function'
		? (rec['DynamicStructuredTool'] as DynamicStructuredToolCtor)
		: undefined;
}

function isZodNamespace(mod: unknown): mod is RuntimeZod {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const rec = mod as Record<string, any> | undefined;
	// n8n's normalizeToolSchema does `instanceof ZodType`, so ZodType must be present;
	// `object` is the factory our schema-generator calls. Shape-check, not identity —
	// identity correctness comes from anchoring to an n8n-owned tree.
	return typeof rec?.['ZodType'] === 'function' && typeof rec?.['object'] === 'function';
}

function resolveDynamicStructuredTool(): DynamicStructuredToolCtor | undefined {
	if (_RuntimeDynamicStructuredTool) return _RuntimeDynamicStructuredTool;

	// 1. require.main anchor.
	if (_mainReq) {
		try {
			const ctor = extractDynamicStructuredTool(_mainReq('@langchain/core/tools'));
			if (ctor) {
				_RuntimeDynamicStructuredTool = ctor;
				langchainLoadError = null;
				langchainResolutionDiagnostic = 'resolved via require.main';
				return ctor;
			}
		} catch (e) {
			langchainLoadError = e instanceof Error ? e.message : String(e);
		}
	}

	// 2. filesystem anchor (@langchain/classic) — hoisted npm installs.
	if (_filesystemAnchorReq) {
		try {
			const ctor = extractDynamicStructuredTool(_filesystemAnchorReq('@langchain/core/tools'));
			if (ctor) {
				_RuntimeDynamicStructuredTool = ctor;
				langchainLoadError = null;
				langchainResolutionDiagnostic = _anchorDiagnostic ?? 'resolved via filesystem anchor';
				return ctor;
			}
		} catch (e) {
			langchainLoadError = e instanceof Error ? e.message : String(e);
		}
	}

	// 3. positive n8n-owned-tree anchor — pnpm-strict-isolated installs.
	try {
		const ctor = extractDynamicStructuredTool(
			requireFromCachedTree(LANGCHAIN_TREE_PATTERNS, '@langchain/core/tools'),
		);
		if (ctor) {
			_RuntimeDynamicStructuredTool = ctor;
			langchainLoadError = null;
			langchainResolutionDiagnostic = 'resolved via n8n-owned-tree anchor (pnpm-isolated install)';
			return ctor;
		}
	} catch (e) {
		langchainLoadError = e instanceof Error ? e.message : String(e);
	}

	return undefined;
}

function resolveRuntimeZod(): RuntimeZod | undefined {
	if (_runtimeZod) return _runtimeZod;

	// 1. require.main anchor, path-checked so we never accept our OWN bundled zod
	//    (wrong ZodType identity for n8n's instanceof ZodType).
	//    Deliberately NO filesystem-anchor step for zod: the LangChain tree's nested
	//    zod fails n8n's top-level instanceof ZodType check.
	if (_mainReq) {
		try {
			const zodPath = _mainReq.resolve('zod');
			if (!zodPath.includes(OWN_PACKAGE_NAME)) {
				const mod = _mainReq('zod');
				if (isZodNamespace(mod)) {
					_runtimeZod = mod;
					zodLoadError = null;
					zodResolutionDiagnostic = 'resolved via require.main';
					return mod;
				}
			}
		} catch (e) {
			zodLoadError = e instanceof Error ? e.message : String(e);
		}
	}

	// 2. positive n8n-owned-tree anchor — pnpm-strict-isolated installs.
	try {
		const mod = requireFromCachedTree(ZOD_TREE_PATTERNS, 'zod');
		if (isZodNamespace(mod)) {
			_runtimeZod = mod;
			zodLoadError = null;
			zodResolutionDiagnostic = 'resolved via n8n-owned-tree anchor (pnpm-isolated install)';
			return mod;
		}
	} catch (e) {
		zodLoadError = e instanceof Error ? e.message : String(e);
	}

	return undefined;
}

// IMPORTANT: Proxy target MUST be `function () {}`, not `{}`.
// ECMAScript spec §10.5.13: a Proxy only has [[Construct]] if its target does.
// Plain objects lack [[Construct]], so `new Proxy({}, ...)` throws
// "is not a constructor" before the construct trap fires.
export const RuntimeDynamicStructuredTool: DynamicStructuredToolCtor = new Proxy(
	function () {} as unknown as DynamicStructuredToolCtor,
	{
		construct(_target, args) {
			const ctor = resolveDynamicStructuredTool();
			if (!ctor) {
				throw new Error(
					'RuntimeDynamicStructuredTool: @langchain/core/tools could not be resolved from n8n\'s module tree. ' +
					'Ensure @langchain/core is installed in the n8n environment.' +
					(langchainResolutionDiagnostic ? ` Diagnostic: ${langchainResolutionDiagnostic}` : '') +
					(langchainLoadError ? ` Load error: ${langchainLoadError}` : ''),
				);
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return new (ctor as any)(...args) as object;
		},
		get(_target, prop) {
			const ctor = resolveDynamicStructuredTool();
			if (ctor) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return (ctor as any)[prop];
			}
			return undefined;
		},
	},
) as DynamicStructuredToolCtor;

export const runtimeZod: RuntimeZod = new Proxy({} as RuntimeZod, {
	get(_target, prop) {
		// Allow safe structural probes (Symbol.toPrimitive, Symbol.toStringTag, Promise thenable check)
		// without triggering the error — frameworks and inspection utilities may probe these.
		if (typeof prop === 'symbol' || prop === 'then' || prop === 'constructor') return undefined;
		const zod = resolveRuntimeZod();
		if (!zod) {
			throw new Error(
				`runtimeZod: zod could not be resolved from n8n's module tree (accessing .${String(prop)}). ` +
				'Ensure zod is installed in the n8n environment.' +
				(zodResolutionDiagnostic ? ` Diagnostic: ${zodResolutionDiagnostic}` : '') +
				(zodLoadError ? ` Load error: ${zodLoadError}` : ''),
			);
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (zod as any)[prop];
	},
});

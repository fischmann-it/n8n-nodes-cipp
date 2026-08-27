import type { IDataObject } from 'n8n-workflow';

export const GRAPH_REQUEST_TIMEOUT_MS = 60_000;
export const GRAPH_RETURN_ALL_TIMEOUT_MS = 120_000;
export const GRAPH_MAX_PAGES_DEFAULT = 25;
export const GRAPH_MAX_PAGES_LIMIT = 100;

const supportedEndpointQueryParameters = new Set([
	'$count',
	'$expand',
	'$filter',
	'$format',
	'$orderby',
	'$search',
	'$select',
	'$top',
]);

function parseBoolean(value: string): boolean {
	if (value.toLowerCase() === 'true' || value === '1') return true;
	if (value.toLowerCase() === 'false' || value === '0') return false;
	throw new Error('$count in graphEndpoint must be true or false');
}

function parseEndpointQueryValue(key: string, value: string): string | number | boolean {
	if (key === '$top') {
		const parsed = Number(value);
		if (!Number.isInteger(parsed) || parsed <= 0) {
			throw new Error('$top in graphEndpoint must be a positive integer');
		}
		return parsed;
	}
	if (key === '$count') return parseBoolean(value);
	return value;
}

export function buildGraphRequestQuery(
	tenantFilter: string,
	rawEndpoint: string,
	graphOptions: IDataObject,
): IDataObject {
	const trimmedEndpoint = rawEndpoint.trim();
	if (!trimmedEndpoint) throw new Error('Graph endpoint is required');
	if (/^https?:\/\//i.test(trimmedEndpoint)) {
		throw new Error('Graph endpoint must be a relative Microsoft Graph path');
	}

	const queryStart = trimmedEndpoint.indexOf('?');
	const endpoint = (queryStart === -1 ? trimmedEndpoint : trimmedEndpoint.slice(0, queryStart))
		.replace(/^\/+/, '')
		.trim();
	if (!endpoint) throw new Error('Graph endpoint path is required');

	const query: IDataObject = { TenantFilter: tenantFilter, Endpoint: endpoint };
	if (queryStart !== -1) {
		const endpointQuery = new URLSearchParams(trimmedEndpoint.slice(queryStart + 1));
		endpointQuery.forEach((value, key) => {
			if (!supportedEndpointQueryParameters.has(key)) {
				throw new Error(
					`Unsupported graphEndpoint query parameter "${key}". Supported parameters: ${Array.from(supportedEndpointQueryParameters).join(', ')}`,
				);
			}
			query[key] = parseEndpointQueryValue(key, value);
		});
	}

	const optionMappings: Array<[string, string]> = [
		['select', '$select'],
		['filter', '$filter'],
		['orderby', '$orderby'],
		['search', '$search'],
		['expand', '$expand'],
		['format', '$format'],
		['top', '$top'],
		['count', '$count'],
	];
	for (const [optionName, queryName] of optionMappings) {
		if (!Object.prototype.hasOwnProperty.call(graphOptions, optionName)) continue;
		const value = graphOptions[optionName];
		if (value === undefined || value === null || value === '') continue;
		if (queryName === '$top') {
			const parsed = Number(value);
			if (!Number.isInteger(parsed) || parsed <= 0) {
				throw new Error('$top must be a positive integer');
			}
			query[queryName] = parsed;
			continue;
		}
		query[queryName] = value;
	}

	return query;
}

export interface IGraphPage {
	items: IDataObject[];
	nextLink?: string;
	queued?: {
		queueId?: string;
		message?: string;
	};
}

function getNextLink(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value : undefined;
}

function assertGraphPageNotQueued(page: IGraphPage): void {
	if (page.queued) {
		const queueDetails = [
			page.queued.queueId ? `Queue ID: ${page.queued.queueId}.` : '',
			page.queued.message ?? '',
		].filter(Boolean).join(' ');
		throw new Error(
			`CIPP queued the Graph Return All request instead of returning a complete collection.${queueDetails ? ` ${queueDetails}` : ''} Re-run the request after the CIPP queue finishes, or narrow the Graph query.`,
		);
	}
}

function asDataObject(value: unknown): IDataObject | undefined {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? value as IDataObject
		: undefined;
}

function isQueuedValue(value: unknown): boolean {
	return value === true || value === 1 ||
		(typeof value === 'string' && value.trim().toLowerCase() === 'true');
}

function getQueuedState(response: IDataObject | IDataObject[]): IGraphPage['queued'] {
	if (Array.isArray(response)) return undefined;

	// Queue state is CIPP control metadata, not Graph entity data. Restricting
	// detection to this envelope prevents business fields named `queued` from
	// being mistaken for CIPP's asynchronous request state.
	const candidates = [
		asDataObject(response.Metadata),
		asDataObject(response.metadata),
	].filter((candidate): candidate is IDataObject => candidate !== undefined);

	for (const candidate of candidates) {
		if (!isQueuedValue(candidate.Queued ?? candidate.queued)) continue;
		const queueId = candidate.QueueId ?? candidate.queueId;
		const message = candidate.QueueMessage ?? candidate.queueMessage;
		return {
			...(typeof queueId === 'string' && queueId.trim() ? { queueId: queueId.trim() } : {}),
			...(typeof message === 'string' && message.trim() ? { message: message.trim() } : {}),
		};
	}

	return undefined;
}

export function extractGraphPage(response: IDataObject | IDataObject[]): IGraphPage {
	const queued = getQueuedState(response);
	if (Array.isArray(response)) {
		let nextLink: string | undefined;
		const items = response.filter((item) => {
			const candidate = getNextLink(item.nextLink ?? item['@odata.nextLink']);
			if (!candidate) return true;
			nextLink = candidate;
			return Object.keys(item).some((key) => key !== 'nextLink' && key !== '@odata.nextLink');
		});
		return {
			items,
			...(nextLink ? { nextLink } : {}),
			...(queued ? { queued } : {}),
		};
	}

	const metadata = response.Metadata as IDataObject | undefined;
	const nextLink = getNextLink(
		metadata?.nextLink ??
			metadata?.['@odata.nextLink'] ??
			response.nextLink ??
			response['@odata.nextLink'],
	);
	const resultItems = Array.isArray(response.Results)
		? (response.Results as IDataObject[])
		: Array.isArray(response.value)
			? (response.value as IDataObject[])
			: [response];

	return {
		items: resultItems,
		...(nextLink ? { nextLink } : {}),
		...(queued ? { queued } : {}),
	};
}

export function parseGraphMaxPages(value: unknown): number {
	const parsed = typeof value === 'number' ? value : Number(value);
	if (!Number.isInteger(parsed) || parsed < 1 || parsed > GRAPH_MAX_PAGES_LIMIT) {
		throw new Error(`Max Pages must be an integer between 1 and ${GRAPH_MAX_PAGES_LIMIT}`);
	}
	return parsed;
}

function validateGraphNextLink(nextLink: string): string {
	try {
		if (nextLink !== nextLink.trim()) throw new Error('invalid Graph continuation URL');
		const parsed = new URL(nextLink);
		if (
			parsed.protocol !== 'https:' ||
			parsed.hostname.toLowerCase() !== 'graph.microsoft.com' ||
			parsed.port !== '' ||
			parsed.username !== '' ||
			parsed.password !== '' ||
			parsed.hash !== ''
		) {
			throw new Error('invalid Graph continuation URL');
		}
	} catch {
		throw new Error('Graph nextLink must be an absolute https://graph.microsoft.com URL');
	}

	// The cursor is opaque. Return it byte-for-byte instead of rebuilding it with
	// URLSearchParams, which could alter signed or already-escaped skip tokens.
	return nextLink;
}

function fingerprintGraphPage(items: IDataObject[]): string {
	return JSON.stringify(items);
}

async function withGraphDeadline<T>(
	operation: () => Promise<T>,
	remainingMs: number,
	totalTimeoutMs: number,
): Promise<T> {
	let deadlineTimer: number | undefined;
	const deadline = new Promise<never>((_, reject) => {
		// A native Node timer is referenced by default, so this operation-wide
		// deadline remains active even while the underlying HTTP promise is pending.
		// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals
		deadlineTimer = setTimeout(
			() => reject(new Error(`Graph Request timed out after ${totalTimeoutMs} ms`)),
			remainingMs,
		);
	});

	try {
		return await Promise.race([Promise.resolve().then(operation), deadline]);
	} finally {
		// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals
		if (deadlineTimer) clearTimeout(deadlineTimer);
	}
}

export async function withGraphRequestDeadline<T>(
	operation: () => Promise<T>,
	timeoutMs: number = GRAPH_REQUEST_TIMEOUT_MS,
): Promise<T> {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw new Error('Graph Request timeout must be a positive number');
	}
	return await withGraphDeadline(operation, timeoutMs, timeoutMs);
}

export interface IGraphPaginationOptions {
	maxPages?: number;
	timeoutMs?: number;
}

export type GraphPageRequester = (
	query: IDataObject,
) => Promise<IDataObject | IDataObject[]>;

export async function paginateGraphRequest(
	initialQuery: IDataObject,
	requestPage: GraphPageRequester,
	options: IGraphPaginationOptions = {},
): Promise<IDataObject[]> {
	const maxPages = parseGraphMaxPages(options.maxPages ?? GRAPH_MAX_PAGES_DEFAULT);
	const timeoutMs = options.timeoutMs ?? GRAPH_RETURN_ALL_TIMEOUT_MS;
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		throw new Error('Graph Request timeout must be a positive number');
	}

	const tenantFilter = initialQuery.TenantFilter;
	const endpoint = initialQuery.Endpoint;
	if (typeof tenantFilter !== 'string' || tenantFilter.trim() === '') {
		throw new Error('Graph Request TenantFilter is required');
	}
	if (typeof endpoint !== 'string' || endpoint.trim() === '') {
		throw new Error('Graph Request Endpoint is required');
	}

	const startedAt = performance.now();
	const deadlineAt = startedAt + timeoutMs;
	const allItems: IDataObject[] = [];
	const seenLinks = new Set<string>();
	const seenPages = new Set<string>();
	let nextLink: string | undefined;
	let previousRemainingMs = Math.ceil(timeoutMs) + 1;

	for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
		const calculatedRemainingMs = Math.floor(deadlineAt - performance.now());
		const remainingMs = Math.min(calculatedRemainingMs, previousRemainingMs - 1);
		if (remainingMs <= 0) {
			throw new Error(`Graph Request timed out after ${timeoutMs} ms`);
		}
		previousRemainingMs = remainingMs;

		const pageQuery: IDataObject = nextLink
			? {
					TenantFilter: tenantFilter,
					Endpoint: endpoint,
					manualPagination: true,
					NoPagination: true,
					nextLink,
				}
			: {
					...initialQuery,
					TenantFilter: tenantFilter,
					Endpoint: endpoint,
					manualPagination: true,
					NoPagination: true,
				};

		const response = await withGraphDeadline(
			() => requestPage(pageQuery),
			remainingMs,
			timeoutMs,
		);
		const page = extractGraphPage(response);
		assertGraphPageNotQueued(page);

		const pageFingerprint = fingerprintGraphPage(page.items);
		if (seenPages.has(pageFingerprint)) {
			throw new Error('Graph Request stopped because CIPP returned repeated page content without making pagination progress.');
		}
		seenPages.add(pageFingerprint);
		allItems.push(...page.items);

		if (!page.nextLink) return allItems;

		const validatedNextLink = validateGraphNextLink(page.nextLink);
		if (seenLinks.has(validatedNextLink)) {
			throw new Error('Graph Request stopped because CIPP returned a repeated nextLink instead of advancing to the next page.');
		}
		seenLinks.add(validatedNextLink);

		if (pageNumber >= maxPages) {
			throw new Error(`Graph Request reached the Max Pages safety cap (${maxPages}) before pagination completed.`);
		}
		nextLink = validatedNextLink;
	}

	throw new Error(`Graph Request reached the Max Pages safety cap (${maxPages}) before pagination completed.`);
}

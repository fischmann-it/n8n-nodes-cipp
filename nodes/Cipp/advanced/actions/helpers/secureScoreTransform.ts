// nodes/CippAdvanced/actions/helpers/secureScoreTransform.ts
import type { IDataObject } from 'n8n-workflow';

/** Modes that only ever need the latest daily entry — ignore historyCount */
const SINGLE_ENTRY_MODES = new Set(['summary', 'categoryBreakdown', 'implementationStatus']);

/**
 * Returns the effective $top value to send to the API.
 * Single-entry modes always fetch 1 to avoid over-fetching.
 */
export function effectiveTop(outputMode: string, historyCount: number): number {
	return SINGLE_ENTRY_MODES.has(outputMode) ? 1 : Math.max(1, historyCount);
}

function scorePercent(current: number, max: number): string {
	return max === 0 ? '0.0' : (current / max * 100).toFixed(1);
}

function toSummary(result: IDataObject): IDataObject {
	const current = (result.currentScore as number) ?? 0;
	const max = (result.maxScore as number) ?? 0;
	return {
		createdDateTime: result.createdDateTime,
		currentScore: current,
		maxScore: max,
		scorePercent: scorePercent(current, max),
		activeUserCount: result.activeUserCount,
		licensedUserCount: result.licensedUserCount,
		enabledServices: result.enabledServices,
		averageComparativeScores: result.averageComparativeScores,
		Tenant: result.Tenant,
		CippStatus: result.CippStatus,
	};
}

function toImplementationStatus(result: IDataObject, includeDescriptions: boolean): IDataObject[] {
	const controls = (result.controlScores as IDataObject[]) ?? [];
	return controls.map((c) => {
		const out: IDataObject = {
			controlName: c.controlName,
			controlCategory: c.controlCategory,
			score: c.score,
			scoreInPercentage: c.scoreInPercentage,
			implementationStatus: c.implementationStatus,
			on: c.on,
		};
		if (includeDescriptions && c.description) out.description = c.description;
		return out;
	});
}

function toCategoryBreakdown(result: IDataObject): IDataObject {
	const current = (result.currentScore as number) ?? 0;
	const max = (result.maxScore as number) ?? 0;
	const controls = (result.controlScores as IDataObject[]) ?? [];
	const categories: Record<string, { score: number; controlCount: number }> = {};
	for (const c of controls) {
		const cat = (c.controlCategory as string) ?? 'Unknown';
		if (!categories[cat]) categories[cat] = { score: 0, controlCount: 0 };
		categories[cat].score += (c.score as number) ?? 0;
		categories[cat].controlCount += 1;
	}
	for (const cat of Object.values(categories)) {
		cat.score = parseFloat(cat.score.toFixed(2));
	}
	return {
		createdDateTime: result.createdDateTime,
		currentScore: current,
		maxScore: max,
		scorePercent: scorePercent(current, max),
		categories,
	};
}

function toSlim(results: IDataObject[], includeDescriptions: boolean): IDataObject[] {
	return results.map((entry) => {
		const controls = (entry.controlScores as IDataObject[]) ?? [];
		return {
			...entry,
			controlScores: includeDescriptions
				? controls
				: controls.map(({ description: _d, ...rest }) => rest as IDataObject), // eslint-disable-line @typescript-eslint/no-unused-vars
		};
	});
}

function toAveraged(results: IDataObject[], includeDescriptions: boolean): IDataObject {
	if (results.length === 0) return {};
	const n = results.length;
	const first = results[0];
	const last = results[n - 1];

	const avgCurrent = results.reduce((s, r) => s + ((r.currentScore as number) ?? 0), 0) / n;
	const avgMax = results.reduce((s, r) => s + ((r.maxScore as number) ?? 0), 0) / n;

	const acc: Record<string, {
		score: number; pct: number; count: number;
		category: string; description?: string;
	}> = {};
	for (const entry of results) {
		for (const c of (entry.controlScores as IDataObject[]) ?? []) {
			const name = c.controlName as string;
			if (!acc[name]) {
				acc[name] = {
					score: 0, pct: 0, count: 0,
					category: (c.controlCategory as string) ?? '',
					description: c.description as string | undefined,
				};
			}
			acc[name].score += (c.score as number) ?? 0;
			acc[name].pct += (c.scoreInPercentage as number) ?? 0;
			acc[name].count += 1;
		}
	}

	const controlScores = Object.entries(acc).map(([name, s]) => {
		const out: IDataObject = {
			controlName: name,
			controlCategory: s.category,
			score: parseFloat((s.score / s.count).toFixed(2)),
			scoreInPercentage: parseFloat((s.pct / s.count).toFixed(1)),
		};
		if (includeDescriptions && s.description) out.description = s.description;
		return out;
	});

	return {
		// API returns results newest-first: results[0] = most recent, results[n-1] = oldest
		periodStart: last.createdDateTime,
		periodEnd: first.createdDateTime,
		daysAveraged: n,
		currentScore: parseFloat(avgCurrent.toFixed(2)),
		maxScore: parseFloat(avgMax.toFixed(2)),
		scorePercent: scorePercent(avgCurrent, avgMax),
		controlScores,
	};
}

/**
 * Apply output mode transformation to raw secureScores API results.
 * Unknown mode values fall through to 'summary' (safe default).
 * Empty results return an appropriate empty shape per mode.
 */
export function applyOutputMode(
	results: IDataObject[],
	mode: string,
	includeDescriptions: boolean,
): IDataObject | IDataObject[] {
	if (results.length === 0) {
		return (mode === 'implementationStatus' || mode === 'slim' || mode === 'full') ? [] : {};
	}
	switch (mode) {
		case 'categoryBreakdown': return toCategoryBreakdown(results[0]);
		case 'implementationStatus': return toImplementationStatus(results[0], includeDescriptions);
		case 'slim': return toSlim(results, includeDescriptions);
		case 'averaged': return toAveraged(results, includeDescriptions);
		case 'full': return results;
		case 'summary':
		default: return toSummary(results[0]);
	}
}

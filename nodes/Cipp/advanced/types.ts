export interface ICippCredentials {
	baseUrl: string;
	tenantId: string;
	clientId: string;
	clientSecret: string;
	enableTenantCache?: boolean;
	tenantCacheTtl?: number;
	enableSecureScoreCache?: boolean;
	secureScoreCacheTtl?: number;
}

export interface ITenant {
	customerId: string;
	defaultDomainName?: string;
	displayName?: string;
	domains?: string[];
}

export interface ITenantCacheEntry {
	tenants: ITenant[];
	expiresAt: number;
}

export interface ISecureScoreCacheEntry {
	data: unknown[];
	expiresAt: number;
}

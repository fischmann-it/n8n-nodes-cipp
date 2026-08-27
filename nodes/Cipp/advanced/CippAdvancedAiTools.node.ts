// CippAdvancedAiTools.node.ts
// AI Tools node for CIPP — exposes one unified tool per resource for AI Agent and MCP Trigger.
import { NodeOperationError } from 'n8n-workflow';
import type {
	NodeConnectionType, IDataObject, IExecuteFunctions, ILoadOptionsFunctions,
	INodeType, INodeTypeDescription, INodePropertyOptions, INodeExecutionData,
	ISupplyDataFunctions, SupplyData,
} from 'n8n-workflow';
import { executeAiTool } from './ai-tools/tool-executor';
import { buildUnifiedDescription } from './ai-tools/description-builders';
import { getRuntimeSchemaBuilders } from './ai-tools/schema-generator';
import { RuntimeDynamicStructuredTool, runtimeZod } from './ai-tools/runtime';
import { wrapError, ERROR_TYPES } from './ai-tools/error-formatter';
import { RESOURCE_REGISTRY, N8N_METADATA_FIELDS, isWriteOperation } from './ai-tools/registry';

const runtimeSchemas = getRuntimeSchemaBuilders(runtimeZod);

function parseToolResult(resultJson: string): IDataObject {
	try { return JSON.parse(resultJson) as IDataObject; }
	catch { return { error: resultJson }; }
}

const N8N_METADATA_PREFIXES = ['Prompt__'];

function stripExecuteMetadata(params: Record<string, unknown>): Record<string, unknown> {
	const cleaned: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(params)) {
		if (N8N_METADATA_FIELDS.has(key)) continue;
		if (N8N_METADATA_PREFIXES.some((p) => key.startsWith(p))) continue;
		cleaned[key] = value;
	}
	return cleaned;
}

export class CippAdvancedAiTools implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CIPP.app AI Tools',
		name: 'cippAdvancedAiTools',
		icon: 'file:cipp.svg',
		group: ['output'],
		version: 1,
		description: 'Expose CIPP operations as AI tools for the AI Agent and MCP Trigger',
		defaults: { name: 'CIPP.app AI Tools' },
		usableAsTool: true,
		inputs: [],
		outputs: [{ type: 'ai_tool' as NodeConnectionType, displayName: 'Tool' }],
		credentials: [{ name: 'cippApi', required: true }],
		properties: [
			{
				displayName: 'Resource Name or ID',
				name: 'resource',
				type: 'options',
				required: true,
				noDataExpression: true,
				typeOptions: { loadOptionsMethod: 'getToolResources' },
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Operation Names or IDs',
				name: 'operations',
				type: 'multiOptions',
				required: true,
				typeOptions: {
					loadOptionsMethod: 'getToolResourceOperations',
					loadOptionsDependsOn: ['resource', 'allowWriteOperations'],
				},
				default: [],
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Allow Write Operations',
				name: 'allowWriteOperations',
				type: 'boolean',
				default: false,
				description: 'Whether to enable mutating operations (add, edit, remove, etc). When disabled, only read operations are available.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getToolResources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return Object.entries(RESOURCE_REGISTRY)
					.map(([value, config]) => ({
						name: config.label,
						value,
						description: config.description,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},
			async getToolResourceOperations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const resource = this.getCurrentNodeParameter('resource') as string;
				const allowWrite = (this.getCurrentNodeParameter('allowWriteOperations') ?? false) as boolean;
				if (!resource) return [];
				const config = RESOURCE_REGISTRY[resource];
				if (!config) return [];
				return Object.entries(config.operations)
					.filter(([, opDef]) => allowWrite || !opDef.isWrite)
					.map(([opName, opDef]) => ({
						name: `${opName}${opDef.isWrite ? ' (write)' : ''}`,
						value: opName,
						description: opDef.description,
					}));
			},
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const resource = this.getNodeParameter('resource', itemIndex) as string;
		const operations = this.getNodeParameter('operations', itemIndex) as string[];
		const allowWriteOperations = this.getNodeParameter('allowWriteOperations', itemIndex, false) as boolean;

		if (!resource) throw new NodeOperationError(this.getNode(), 'Resource is required');
		if (!operations?.length) throw new NodeOperationError(this.getNode(), 'At least one operation must be selected');

		const config = RESOURCE_REGISTRY[resource];
		if (!config) throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);

		// Layer 1: Filter write ops from schema when disabled
		const enabledOperations = operations.filter((op) => {
			const opDef = config.operations[op];
			if (!opDef) return false;
			if (opDef.isWrite && !allowWriteOperations) return false;
			return true;
		});

		if (enabledOperations.length === 0) {
			throw new NodeOperationError(this.getNode(),
				'No operations available. Select operations and enable "Allow Write Operations" if needed.');
		}

		const referenceUtc = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
		const unifiedSchema = runtimeSchemas.buildUnifiedSchema(resource, enabledOperations);
		const unifiedDescription = buildUnifiedDescription(resource, enabledOperations, referenceUtc);

		// Tool name: cipp_{resource} — complies with ^[a-zA-Z0-9_-]{1,128}$
		const toolName = `cipp_${resource}`;

		const unifiedTool = new RuntimeDynamicStructuredTool({
			name: toolName,
			description: unifiedDescription,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			schema: unifiedSchema as any,
			func: async (params: Record<string, unknown>) => {
				const operationFromArgs = params.operation;
				const operation = typeof operationFromArgs === 'string' ? operationFromArgs : undefined;

				// Layer 2: Write safety — re-check in func() path
				if (operation && isWriteOperation(operation, config) && !allowWriteOperations) {
					return JSON.stringify(wrapError(
						resource, operation, ERROR_TYPES.WRITE_OPERATION_BLOCKED,
						'Write operations are disabled for this tool.',
						'Enable allowWriteOperations on the CIPP.app AI Tools node to use mutating operations.',
					));
				}

				if (!operation || !enabledOperations.includes(operation)) {
					return JSON.stringify(wrapError(
						resource, (operationFromArgs as string) ?? 'unknown',
						ERROR_TYPES.INVALID_OPERATION,
						'Missing or unsupported operation.',
						`Allowed operations: ${enabledOperations.join(', ')}.`,
					));
				}

				const { operation: _operation, ...operationParams } = params;
					void _operation; // consumed above
					return executeAiTool(this, resource, operation, operationParams);
			},
		});

		return { response: unifiedTool };
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operations = this.getNodeParameter('operations', 0) as string[];
		const allowWriteOperations = this.getNodeParameter('allowWriteOperations', 0, false) as boolean;

		if (!resource || !operations?.length) {
			throw new NodeOperationError(this.getNode(), 'Resource and at least one operation must be configured.');
		}

		const config = RESOURCE_REGISTRY[resource];
		if (!config) throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);

		const effectiveOps = operations.filter((op) => {
			const opDef = config.operations[op];
			return opDef && (!opDef.isWrite || allowWriteOperations);
		});

		if (effectiveOps.length === 0) {
			throw new NodeOperationError(this.getNode(), 'No permitted operations. Enable "Allow Write Operations" if needed.');
		}

		const items = this.getInputData();
		const response: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];
			if (!item) continue;

			// Detect tool call via operation (n8n 2.14+) or tool (older) — return stub when neither present
			const requestedOp = (item.json.operation ?? item.json.tool) as string | undefined;
			if (!requestedOp) {
				response.push({
					json: { message: `CIPP ${config.label} tool is ready. Operations: ${effectiveOps.join(', ')}.` },
					pairedItem: { item: itemIndex },
				});
				continue;
			}

			// Layer 3: Write safety — execute() path
			if (isWriteOperation(requestedOp, config) && !allowWriteOperations) {
				response.push({
					json: parseToolResult(JSON.stringify(wrapError(
						resource, requestedOp, ERROR_TYPES.WRITE_OPERATION_BLOCKED,
						'Write operations are disabled.',
						'Enable allowWriteOperations on this node to use mutating operations.',
					))),
					pairedItem: { item: itemIndex },
				});
				continue;
			}

			if (!effectiveOps.includes(requestedOp)) {
				response.push({
					json: parseToolResult(JSON.stringify(wrapError(
						resource, requestedOp, ERROR_TYPES.INVALID_OPERATION,
						`Unknown or disabled operation: ${requestedOp}`,
						`Allowed operations: ${effectiveOps.join(', ')}.`,
					))),
					pairedItem: { item: itemIndex },
				});
				continue;
			}

			const effectiveOp = requestedOp;

			try {
				const params = stripExecuteMetadata(item.json as Record<string, unknown>);
				const resultJson = await executeAiTool(
					this as unknown as ISupplyDataFunctions,
					resource,
					effectiveOp,
					params,
				);
				response.push({ json: parseToolResult(resultJson), pairedItem: { item: itemIndex } });
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error.message : String(error),
					{ itemIndex },
				);
			}
		}

		return [response];
	}
}

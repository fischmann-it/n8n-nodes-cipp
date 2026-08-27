import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { cippApiRequest } from '../GenericFunctions';
export async function execute(
	context: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[] = {};
	if (operation === 'getDetails') {
		const rowKey = context.getNodeParameter('detailsRowKey', i, '') as string;
		const body: IDataObject = {};
		const qs: IDataObject = {};
		if (rowKey) {
			body.RowKey = rowKey;
			qs.RowKey = rowKey;
		}
		responseData = await cippApiRequest.call(
			context,
			'POST',
			'/api/ListScheduledItemDetails',
			body,
			qs,
		);
	} else if (operation === 'triggerBillingRun') {
		responseData = await cippApiRequest.call(
			context,
			'GET',
			'/api/ExecSchedulerBillingRun',
			{},
			{},
		);
	} else {
		throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`, {
			itemIndex: i,
		});
	}
	return responseData;
}

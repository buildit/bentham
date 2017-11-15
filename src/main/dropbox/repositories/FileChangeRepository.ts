import { DynamoWritePager, DynamoClient } from "../../common/clients/DynamoClient";
import { dropboxAccountId } from "../Api";

export class FileChangeRepository {

  private readonly pager: DynamoWritePager;

  constructor(private readonly dynamo: DynamoClient) {
    this.pager = new DynamoWritePager(dynamo);
  }

  async saveFileChanges(accountId: dropboxAccountId, changeList: Array<any>): Promise<void> {
    const items = changeList.map(entry => ({
      "account_id": accountId,
      "user_id": entry.modifiedBy,
      "event_timestamp": entry.modifiedAt,
      "event_type": entry.tag
    }));

    console.log(`Writing items to DynamoDB for account ${accountId}`);
    console.log(changeList);
    this.pager.putAll("dropbox_file_changes", items);
  }

  async getFileChanges(accountId: dropboxAccountId): Promise<Array<any>> {
    return this.dynamo.query(
      'dropbox_file_changes',
      {
        KeyConditionExpression: 'account_id = :hkey',
        ExpressionAttributeValues: {
          ':hkey': accountId
      }
    });
  }
}

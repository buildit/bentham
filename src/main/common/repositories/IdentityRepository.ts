import { GithubIdentity, DropboxIdentity, slackAccessToken, SlackIdentity, icarusAccessToken } from "../Api";
import { DynamoClient } from "../clients/DynamoClient";


const accountsTable = 'accounts'
const identitiesTable = 'identities'

enum IdentityType {
  Slack = 'S',
  Dropbox = 'D',
  Github = 'G'
}

export class IdentityRepository {

  constructor(
    private readonly dynamo: DynamoClient) {}

  // Save Icarus account
  async saveIcarusAccount(icarusAccessToken: icarusAccessToken, slackIdentity: SlackIdentity): Promise<icarusAccessToken> {
    console.log(`Writing Icarus Access Token ${icarusAccessToken} related to SlackID: ${slackIdentity.id}`)
    return this.dynamo.put(accountsTable, {
      slack_id: slackIdentity.id,     
      access_token: icarusAccessToken,
    }).then(res => icarusAccessToken)
  }

  // Delete an Icarus account
  async deleteIcarusAccount(slackId: string): Promise<void> {
    console.log(`Deleting Icarus account for SlackID: ${slackId}`)
    return this.dynamo.delete(accountsTable, {
      slack_id: slackId
    })
  }

  // Save DropboxIdentity into identities table
  async saveDropboxIdentity(slackId: string, dropboxIdentity: DropboxIdentity): Promise<DropboxIdentity> {
    console.log(`Writing Dropbox identity for Slack ID: ${slackId} to DynanoDB`)
    return this.dynamo.put(identitiesTable, {
      slack_id: slackId,
      type: IdentityType.Dropbox,
      account_id: dropboxIdentity.id,
      access_token: dropboxIdentity.accessToken
    }).then(res =>  dropboxIdentity )
  }



  // Save GitHub into identities table
  async saveGithubIdentity(slackId: string, githubIdentity: GithubIdentity): Promise<GithubIdentity> {
    console.log(`Writing Github identity for Slack ID: ${slackId} to DynanoDB`)
    return this.dynamo.put(identitiesTable, {
      slack_id: slackId,
      type: IdentityType.Github,
      account_id: githubIdentity.id,
      access_token: githubIdentity.accessToken
    }).then(res => githubIdentity)
  }

  // Save Slack identity into identities table
  async saveSlackIdentity(icarusAccessToken: icarusAccessToken, slackIdentity: SlackIdentity): Promise<SlackIdentity> {
    console.log(`Writing Slack identity for SlackID: ${slackIdentity.id}`)
    return this.dynamo.put(identitiesTable, {
      slack_id: slackIdentity.id,
      type: IdentityType.Slack,
      account_id: slackIdentity.id, // For Slack Identity account_id == slack_id, obviously
      access_token: slackIdentity.accessToken,
      user_name: slackIdentity.userName,
      team_id: slackIdentity.teamId,
    })
    .then(res => slackIdentity)
  }

  private async deleteIdentity(slackId: string, type: IdentityType): Promise<void> {
    console.log(`Deleting an Identity of type "${type} for SlackID: ${slackId} from DynamoDB`)
    return this.dynamo.delete(identitiesTable, {
      slack_id: slackId,
      type: type
    })     
  }

  // Delete a Dropbox identity
  async deleteDropboxIdentity(slackId: string): Promise<void> {
    return this.deleteIdentity(slackId, IdentityType.Dropbox)
  }

  // Delete a Github identity
  async deleteGithubIdentity(slackId: string): Promise<void> {
    return this.deleteIdentity(slackId, IdentityType.Github)   
  }
  
  // Delete a Slack identity
  async deleteSlackIdentity(slackId: string): Promise<void> {
    return this.deleteIdentity(slackId, IdentityType.Slack)   
  }  

  // Retrieves Slack Identity by icarus access token; reject if lookup fails
  async getSlackIdentity(icarusAccessToken: icarusAccessToken): Promise<SlackIdentity> {
    return this.getSlackIdByAccessToken(icarusAccessToken)
      .then( slackId => this.getSlackIdentityBySlackId(slackId) )
  }

  private async getSlackIdByAccessToken(icarusAccessToken: icarusAccessToken): Promise<string> {
    console.log('Looking up SlackId by Icarus Access Token')
    return this.dynamo.query(accountsTable, {
      IndexName: 'slack_id_by_access_token',
      KeyConditionExpression: 'access_token = :token',
      ExpressionAttributeValues: {
        ':token': icarusAccessToken, 
      },
      ProjectionExpression: 'slack_id',
      Limit: "1",
    })
    .then(results => {
      if ( results && results.length )
        return results[0].slack_id
      else
        throw Error('Cannot find any Slack ID for Icarus access token: ' + icarusAccessToken)
    })   
  }

  private async getSlackIdentityBySlackId(slackId: string): Promise<SlackIdentity> {
    console.log(`Retrieving Slack identity by Slack Id: ${slackId} `)
    return this.dynamo.get(identitiesTable, 
      { 
        slack_id: slackId,
        type: IdentityType.Slack
      })
    .then( result => {
      if(result)
        return {
          id: result.slack_id,
          userName: result.user_name,
          teamId: result.team_id,
          accessToken: result.access_token
        }
      else
        throw Error('Cannot find any Slack identity for Slack ID: ' + slackId)
    })
  }

  // Lookup Slack Identity by Dropbox Id; rejects if lookup fails
  async getSlackIdentityByDropboxId(dropboxId: string): Promise<SlackIdentity> {
    return this.getSlackIdByIdentityId(dropboxId, IdentityType.Dropbox)
      .then( slackId => this.getSlackIdentityBySlackId(slackId))
  }

  // Lookup Slack Identity by Github username; rejects if lookup fails
  async getSlackIdentityByGithubUser(githubUser: string): Promise<SlackIdentity> {
    return this.getSlackIdByIdentityId(githubUser, IdentityType.Github)
    .then( slackId => this.getSlackIdentityBySlackId(slackId))
  }

  // Lookup Slack ID by identity account and identity type
  private async getSlackIdByIdentityId(identityAccountId: string, identityType: IdentityType): Promise<string> {
    console.log(`Lookup identity type: ${identityType} by identity account Id: ${identityAccountId}` )

    return this.dynamo.query(identitiesTable, {
      IndexName: 'identity_by_account_id_and_type',
      ExpressionAttributeNames: {
        '#identityType': 'type' // Required as 'type' is a reserved word :()
      },
      KeyConditionExpression: 'account_id = :accountId AND type = #identityType',
      ExpressionAttributeValues: {
        ':accountId': identityAccountId, 
        ':identityType': identityType
      },
      ProjectionExpression: 'slack_id',
      Limit: "1",
    })
    .then(results => {
      // console.log('DynamoDB query result: %j', results)
      if ( results && results.length )
        return results[0].slack_id
      else
        throw Error('No SlackId found')
    })     
  }

  // Get Dropbox identity by Slack ID; returns undefined if none found
  async getDropboxIdentityBySlackId(slackId: string): Promise<DropboxIdentity | undefined> {
    console.log(`Retrieving Dropbox identity by Slack ID: ${slackId}`)
    
    return this.dynamo.get(identitiesTable, 
      { 
        slack_id: slackId,
        type: IdentityType.Dropbox 
      })
    .then( results => {
      if( results ) {
        return {
          id: results.account_id,
          accessToken: results.access_token
        }
      } else { 
        console.log('No Dropbox identity found')
        return undefined
      }
    })
  }

  // Get Github identity by Slack ID; returns undefined if none found
  async getGithubIdentityBySlackId(slackId: string): Promise<GithubIdentity | undefined> {
    console.log(`Retrieving Github identity by Slack ID: ${slackId}`)
    
    return this.dynamo.get(identitiesTable, 
      { 
        slack_id: slackId,
        type: IdentityType.Github
      })
    .then( results => {
      if( results ) {
        return {
          id: results.account_id,
          accessToken: results.access_token
        }
      } else {
        console.log('No Github identity found')
        return undefined
      }
    })
  }


  // Get the Dropbox identity by Drobox Id; reject if none found
  async getDropboxIdentityByDropboxId(dropboxId: string): Promise<DropboxIdentity> {
    console.log(`Retrieving Dropbox identity by Dropbox ID: ${dropboxId}`)

    return this.dynamo.query(identitiesTable, {
      IndexName: 'identity_by_account_id_and_type',
      KeyConditionExpression: 'account_id = :accountId AND type = :identityType',
      ExpressionAttributeValues: {
        ':accountId': dropboxId, 
        ':identityType': IdentityType.Dropbox
      },
      ProjectionExpression: 'account_id, access_token',
      Limit: "1",
    })
    .then(results => {
      // console.log('DynamoDB query result: %j', results)
      if ( results && results.length ) {
        return {
          id: results[0].account_id,
          accessToken: results[0].access_token
        }
      } else
        throw Error('No SlackId found')
    })      
  }

  // Get the Github identity by Github username; reject if none found
  async getGithubIdentityByGithubUsername(githubUsername: string): Promise<GithubIdentity> {
    console.log(`Retrieving Github identity by Github username: ${githubUsername}`)

    return this.dynamo.query(identitiesTable, {
      IndexName: 'identity_by_account_id_and_type',
      KeyConditionExpression: 'account_id = :accountId AND type = :identityType',
      ExpressionAttributeValues: {
        ':accountId': githubUsername, 
        ':identityType': IdentityType.Github
      },
      ProjectionExpression: 'account_id, access_token',
      Limit: "1",
    })
    .then(results => {
      // console.log('DynamoDB query result: %j', results)
      if ( results && results.length ) {
        return {
          id: results[0].account_id,
          accessToken: results[0].access_token
        }
      } else
        throw Error('No SlackId found')
    })      
  }  
}

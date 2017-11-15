import { IdentityRepository } from "../repositories/IdentityRepository";
import { slackAccessToken, IdentitySet, SlackIdentity, DropboxIdentity, GithubIdentity, IcarusUserToken, icarusAccessToken } from "../Api";
const v4 = require('uuid/v4');

export class IdentityService {

  constructor(private repo: IdentityRepository) {}


  /**
  If you have logged in via Slack, you can create or retrieve a Icarus User Token Token,
  which includes an Icarus access token.
  A new Icarus access token is generated.
  */
  async grantIcarusUserToken(slackIdentity: SlackIdentity): Promise<IcarusUserToken> {
    const icarusAccessToken:icarusAccessToken = v4();
    console.log(`Issued a new Icarus access token for SlackId: ${slackIdentity.id}`)

    return Promise.all([
      this.repo.saveIcarusAccount(icarusAccessToken, slackIdentity),
      this.repo.saveSlackIdentity(icarusAccessToken, slackIdentity),
      this.repo.getDropboxIdentityBySlackId(slackIdentity.id),
      this.repo.getGithubIdentityBySlackId(slackIdentity.id)
    ]).then(results => {
      const dropboxIdentity = results[2]
      const githubIdentity = results[3]
      return this.constructIcarusUserToken(icarusAccessToken, slackIdentity, dropboxIdentity, githubIdentity)
    })
  }

  /**
  Retrieves an Icarus User Token having the Icarus access token
  */
  async getIcarusUserToken(icarusAccessToken: icarusAccessToken): Promise<IcarusUserToken> {
    return this.repo.getSlackIdentity(icarusAccessToken)
      .then( slackIdentity =>
          Promise.all([
            this.repo.getDropboxIdentityBySlackId(slackIdentity.id),
            this.repo.getGithubIdentityBySlackId(slackIdentity.id)
          ])
          .then( ([dropboxIdentity, githubIdentity]) => ({
            accessToken: slackIdentity.accessToken,
            userName: slackIdentity.userName,
            dropboxAccountId: (dropboxIdentity) ? dropboxIdentity.id : undefined,
            githubUsername: (githubIdentity) ? githubIdentity.id : undefined
          }) )
      )
  }

  async getDropboxIdentity(icarusAccessToken: icarusAccessToken): Promise<DropboxIdentity> {
    return this.repo.getSlackIdentity(icarusAccessToken)
      .then( slackIdentity => this.repo.getDropboxIdentityBySlackId(slackIdentity.id))
      .then( dropboxIdentity => {
        if  ( dropboxIdentity ) return dropboxIdentity
        throw 'No Dropbox identity'
      })
  }

  async getGithubIdentity(icarusAccessToken: icarusAccessToken): Promise<GithubIdentity> {
    return this.repo.getSlackIdentity(icarusAccessToken)
      .then( slackIdentity => this.repo.getGithubIdentityBySlackId(slackIdentity.id))
      .then( githubIdentity => {
        if ( githubIdentity) return githubIdentity
        throw 'No Github identity'
      })
  }

  private constructIcarusUserToken(icarusAccessToken:icarusAccessToken, slackIdentity: SlackIdentity, dropboxIdentity: DropboxIdentity|undefined, githubIdentity: GithubIdentity|undefined): IcarusUserToken {
    return {
      accessToken: icarusAccessToken,
      userName: slackIdentity.userName,
      dropboxAccountId: dropboxIdentity ? dropboxIdentity.id : undefined,
      githubUsername: githubIdentity ? githubIdentity.id : undefined,
    }
  }

  /**
  Services which connect Icarus to other apps use this method
  to add an app's user id and access token to the identity set
  associated with this user.
  */
  async addIdentity<K extends keyof IdentitySet>(icarusAccessToken:icarusAccessToken, name: K, value: IdentitySet[K]): Promise<IcarusUserToken> {
    console.log(`Adding ${name} identity`)
    const slackIdentity = await this.repo.getSlackIdentity(icarusAccessToken);
    switch(name) {
      case 'dropbox': {
        return Promise.all([
          this.repo.saveDropboxIdentity(slackIdentity.id, value as DropboxIdentity),
          this.repo.getGithubIdentityBySlackId(slackIdentity.id)
        ])
        .then( results => this.constructIcarusUserToken(icarusAccessToken, slackIdentity, value as DropboxIdentity, results[1] as GithubIdentity) )
      }
      case 'github': {
        return Promise.all([
          this.repo.getDropboxIdentityBySlackId(slackIdentity.id),
          this.repo.saveGithubIdentity(slackIdentity.id, value as GithubIdentity)
        ])
        .then( results => this.constructIcarusUserToken(icarusAccessToken, slackIdentity, results[0] as DropboxIdentity, value as GithubIdentity) )
      }
      default: {
        throw new Error(`Cannot save identity for service ${name}`);
      }
    }
  }

  /**
   * Remove Account and all Identities for a user
   */
  async forgetUser(icarusAccessToken: icarusAccessToken): Promise<void> {
    return this.repo.getSlackIdentity(icarusAccessToken)
      .then( slackIdentity => {
        if( slackIdentity) {
          const slackId = slackIdentity.id

          return Promise.all([
            this.repo.deleteDropboxIdentity(slackId),
            this.repo.deleteGithubIdentity(slackId),
            this.repo.deleteSlackIdentity(slackId),
            this.repo.deleteIcarusAccount(slackId)
          ]).then( res => {
            console.log(`Slack ID ${slackId}: All identities and access tokens successfully deleted`) 
            return 
          })
        } else {
          throw Error('Invalid Icarus access Token')
        }
      })
  }

}

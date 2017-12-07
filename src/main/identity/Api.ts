import { icarusAccessToken} from "../common/Api"

export type slackUsername = string;
export type slackAccessToken = string;

export interface AppIdentity {
    id: string,
    accessToken: string
  }
  
export interface SlackIdentity extends AppIdentity {
teamId: string,
userName: string
}

export type DropboxIdentity = AppIdentity;
export type GithubIdentity = AppIdentity;

export interface IdentitySet {
slack: SlackIdentity,
dropbox?: DropboxIdentity,
github?: GithubIdentity,
// Other app identities go here
}

export interface IcarusUserToken {
  accessToken: icarusAccessToken,
  userName: slackUsername,
  dropboxAccountId: string|undefined,
  githubUsername: string|undefined,
}

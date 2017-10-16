import { cursor, fileInfo, dropboxClientId, dropboxClientSecret, dropboxAuthorisationCode, DropboxAccessDetails, dropboxAccountId, dropboxAccessToken } from "../Api";
import { HttpClient, pathToLambda } from "../../common/clients/HttpClient";
import { CursorRepository } from "../repositories/CursorRepository";
import { icarusAccessToken, host, uri, lambdaStage } from "../../common/Api";

export interface FileFetchResult {
  files: Array<fileInfo>
  newCursor?: cursor
}

export interface UserDetails {
  userName: string
}

export class DropboxClient {

  constructor(
    private readonly http: HttpClient,
    private readonly clientId: dropboxClientId,
    private readonly clientSecret: dropboxClientSecret) {}

  getOAuthAuthoriseUri(icarusAccessToken: icarusAccessToken, returnUri: uri): uri {
    return "https://www.dropbox.com/oauth2/authorize?response_type=code" +
    `&client_id=${this.clientId}` +
    `&redirect_uri=${returnUri}` +
    `&state=${icarusAccessToken}`;
  }

  async requestAccessDetails(code: dropboxAuthorisationCode, accessCodeRequestRedirectUri:uri): Promise<DropboxAccessDetails> {
    console.log(`Requesting user token for code ${code}`);
    // redirect_uri is for verification only.
    // It must match the redirect_uri of the access code request and configured redirect uri in API
    const responseBody = await this.http.doHttp({
      url: 'https://api.dropboxapi.com/oauth2/token',
      method: 'POST',
      form: {
        code: code,
        grant_type: "authorization_code",
        client_id: process.env.DROPBOX_CLIENT_ID,
        client_secret: process.env.DROPBOX_CLIENT_SECRET,
        redirect_uri: accessCodeRequestRedirectUri,
      }
    });

    const response = JSON.parse(responseBody);

     console.log(`Received access token ${response.access_token} for user ${response.account_id}`);
     return {
       accessToken: response.access_token,
       accountId: response.account_id
     };
   }

  async getLatestCursor(accountId: dropboxAccountId, token: dropboxAccessToken): Promise<cursor> {
    console.log(`Getting initial cursor for account ${accountId}`);

    const response = await this.http.doHttp({
      url: 'https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: {
        path: "",
        recursive: true,
        include_media_info: true,
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_mounted_folders: true
      }
    });

    return response.cursor;
  }

  async fetchFiles(accountId: dropboxAccountId, token: dropboxAccessToken, cursor: cursor): Promise<FileFetchResult> {
    console.log(`Fetching files for account ${accountId}`);

    var result = await this.listFolderContinue(token, cursor);
    console.log(result);

    var entries = result.entries;
    while (result.has_more) {
      console.log(`Fetching more files at cursor ${result.cursor}`);

      result = await this.listFolderContinue(token, result.cursor);
      entries = entries.concat(result.entries);
    }

    console.log("Fetched all files");

    return {
      files: entries,
      newCursor: result.cursor
    };
  }

  listFolderContinue(token: string, cursor: string): Promise<any> {
    return this.http.doHttp({
      url: 'https://api.dropboxapi.com/2/files/list_folder/continue',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: {
        cursor: cursor
      }
    });
  }

  getUserDetails(userId: string, token: string): Promise<UserDetails> {
    return this.http.doHttp({
      url: 'https://api.dropboxapi.com/2/users/get_account',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: {
        account_id: userId
      }
    }).then(body => ({
        userName: body.name["display_name"]
    }));
  }

  getCurrentAccountDetails(token: string): Promise<UserDetails> {
    return this.http.doHttp({
      url: 'https://api.dropboxapi.com/2/users/get_current_account',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(body => ({
        userName: JSON.parse(body).name["display_name"]
    }));
  }
}

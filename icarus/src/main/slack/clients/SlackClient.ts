import { event, uri } from "../../common/Api";

import { HttpClient } from '../../common/clients/HttpClient';
import { slackAuthCode, slackToken } from "../Api";

export class SlackClient {

  constructor(
    private readonly http: HttpClient,
    private readonly clientId: string,
    private readonly clientSecret: string) {}

  async getToken(code: slackAuthCode, loginRedirectUri: uri): Promise<slackToken> {
    console.log(`Fetching token with code ${code}`);

    const response = await this.http.doHttp({
      url: "https://slack.com/api/oauth.access",
      method: "get",
      qs: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: loginRedirectUri,
      }
    });

    console.log(response);

    return JSON.parse(response)['access_token'];
  }

  async getUserDetails(token: slackToken): Promise<any> {
    console.log(`Fetching user details with token ${token}`);

    const responseBody = await this.http.doHttp({
      url: "https://slack.com/api/users.identity",
      method: "get",
      qs: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        token: token
      }
    });

    console.log(responseBody);
    const response = JSON.parse(responseBody);
    if (!response.ok) {
      throw new Error("Response not OK");
    }

    return response;
  }

}

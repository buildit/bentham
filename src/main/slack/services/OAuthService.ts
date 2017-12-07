import { slackAuthCode } from "../Api";
import { SlackClient } from "../clients/SlackClient";
import { IdentityService } from "../../identity/services/IdentityService";
import { uri } from "../../common/Api";
import { IcarusUserToken } from "../../identity/Api";

export class OAuthService {

  constructor(
    private readonly slack: SlackClient,
    private readonly identity: IdentityService) {}

  getOAuthAuthoriseUri(returnUri: uri): uri {
    return this.slack.getOAuthAuthoriseUri(returnUri)
  }

  /*
  Completes the Slack authentication process:
  - exchanges auth code for access token
  - retrieves user's details
  - gets a UserToken from the Identity Service and returns it
  */
  async processCode(slackCode: slackAuthCode, returnUri: uri): Promise<IcarusUserToken> {
    // Redeem the slack authorization code to get slack token and id.
    const token = await this.slack.getToken(slackCode, returnUri);
    // Requires `identity.basic` auth scope
    const userDetails = await this.slack.getUserDetails(token);

    console.log(`Slack user details: ${JSON.stringify(userDetails)}`);

    // Obtain a Icarus user token from the identity service, and return it.
    return this.identity.grantIcarusUserToken({
      id: userDetails.user.id,
      teamId: userDetails.team.id,
      userName: userDetails.user.name,
      accessToken: token
    })
  }

}

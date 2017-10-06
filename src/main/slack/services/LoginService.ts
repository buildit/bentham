import { slackAuthCode } from "../Api";
import { SlackClient } from "../clients/SlackClient";
import { IdentityService } from "../../common/services/IdentityService";
import { IcarusAccessToken, uri } from "../../common/Api";

export class LoginService {

  constructor(
    private readonly slack: SlackClient,
    private readonly identity: IdentityService) {}

  /*
  Completes the Slack authentication process:
  - exchanges auth code for access token
  - retrieves user's details
  - gets a UserToken from the Identity Service and returns it
  */
  async login(slackCode: slackAuthCode, loginRedirectUri: uri): Promise<IcarusAccessToken> {
    // Redeem the slack authorization code to get slack token and id.
    const token = await this.slack.getToken(slackCode, loginRedirectUri);
    // Requires `identity.basic` auth scope
    const userDetails = await this.slack.getUserDetails(token);

    console.log(userDetails);

    // Obtain a Icarus access token from the identity service, and return it.
    return this.identity.grantIcarusAccessToken({
      id: userDetails.user.id,
      teamId: userDetails.team.id,
      userName: userDetails.user.name,
      accessToken: token
    })
  }

}
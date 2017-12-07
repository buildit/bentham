import { toPromise } from '../../common/TestUtils';
import { expect } from 'chai';
import 'mocha';
import { slackAuthCode, slackToken } from "../../../main/slack/Api";
import { SlackClient } from "../../../main/slack/clients/SlackClient";
import { DropboxIdentity, SlackIdentity, IdentitySet, IcarusUserToken } from "../../../main/identity/Api";
import { IdentityService} from "../../../main/identity/services/IdentityService";
import { OAuthService } from "../../../main/slack/services/OAuthService";
import { mock, instance, when, verify, anyString, anything } from "ts-mockito";

const mockSlackClient: SlackClient = mock(SlackClient);
const slackClient: SlackClient = instance(mockSlackClient);

when(mockSlackClient.getToken(anyString(), anyString())).thenReturn(Promise.resolve("the slack access token"));
when(mockSlackClient.getUserDetails(anyString())).thenReturn(Promise.resolve({
  "ok": true,
  "user": {
    "name": "Sonny Whether",
    "id": "U0G9QF9C6"
  },
  "team": {
    "id": "T0G9PQBBK"
  }
}));

const mockIdentityService: IdentityService = mock(IdentityService);
const identityService: IdentityService = instance(mockIdentityService);

when(mockIdentityService.grantIcarusUserToken(anything())).thenCall(slackIdentity => ({
  accessToken: slackIdentity.accessToken,
  userName: slackIdentity.userName,
  dropboxAccountId: undefined,
  githubUsername: undefined,
}));



const oAuthService = new OAuthService(slackClient, identityService);

describe("Slack OAuth Service", () => {
  it("should fetch the user's credentials from Slack, and use them to obtain a Icarus User Token from the Login service", async () => {
    const result = await oAuthService.processCode("the slack authorisation code", "http://return.uri");

    verify(mockSlackClient.getToken("the slack authorisation code", "http://return.uri"));

    expect(result).to.deep.equal({
      accessToken: "the slack access token",
      userName: "Sonny Whether",
      dropboxAccountId: undefined,
      githubUsername: undefined
    });
  });
});

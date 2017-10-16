import { complete, response, parseBody } from "../../common/endpoints/EndpointUtils";
import { redirectTo } from "../../common/clients/HttpClient";
import { slackAuthCode } from "../Api";
import { OAuthService } from "../services/OAuthService";
import { callback, event, uri, host, lambdaStage } from "../../common/Api";

export class OAuthEndpoint {

  constructor(
    private readonly oAuthService: OAuthService) {}

  /** 
    Initiate OAuth flow, sending the user to the Slack Authorise endpoint
    Expects the following querystring params:
      - returnUri: return URI after Slack authorise
    Redirects user to the Slack authorize page
  */
  initiate(callback: callback, evt: event) {
    const returnUri:uri = evt.queryStringParameters.returnUri
    
    callback(null, redirectTo(this.oAuthService.getOAuthAuthoriseUri(returnUri)));
  }


  /** 
    Complete OAuth flow

    Expects the following params in body:
      - code: Slack auth code
      - returnUri: return URI of the Authorize call, for verification by Slack
    Accepts application/json and 'application/x-www-form-urlencoded
    Returns an IcarusUserToken
  */
  complete(cb: callback, evt: event) {
    const body = parseBody(evt)
    const slackAuthCode = body.code
    const returnUri:uri = body.returnUri

    return complete(cb, this.oAuthService.processCode(slackAuthCode, returnUri)
      .then(icarusUserToken => response(200, icarusUserToken)));
  }

}

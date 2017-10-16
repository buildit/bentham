import { complete, response, parseBody } from "../../common/endpoints/EndpointUtils";
import { event, callback, icarusAccessToken, uri, host, lambdaStage } from "../../common/Api";
import { pathToLambda, redirectTo } from "../../common/clients/HttpClient";
import { OAuthService } from "../services/OAuthService";
import { githubAuthorisationCode } from "../Api"

/*
  Implements GitHub OAuth Web Application Flow
  https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-authorization-options-for-oauth-apps/
  Stores the information to map the user Icarus identity to
*/
export class OAuthEndpoint {
  constructor(private readonly oauthService: OAuthService) {}

  // Initiate OAuth flow sending the user to the GithHub Authorise endpoint
  initiate(callback: callback, event: event) {


    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const returnUri:uri = body.returnUri


    callback(null, redirectTo(this.oauthService.getOAuthAuthoriseUri(icarusAccessToken, returnUri)));
  }

  // Complete OAuth flow, redeeming Github auth code and adding Github identity to the user
  complete(cb: callback, event: event) {
    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const githubAuthorisationCode:githubAuthorisationCode = body.code
    const initReturnUri:uri = body.initReturnUri
    
    return complete(cb, this.oauthService.processCode(icarusAccessToken, githubAuthorisationCode, initReturnUri)
      .then((icarusUserToken) => response(200, icarusUserToken))
    );
  }
}

import { complete, response, sendResponse, redirectToResponse, parseBody } from "../../common/endpoints/EndpointUtils";
import { event, callback, uri, host, lambdaStage, icarusAccessToken } from "../../common/Api";
import { pathToLambda } from "../../common/clients/HttpClient";
import { OAuthService } from "../services/OAuthService";
import { githubAuthorisationCode } from "../Api"

/*
  Implements GitHub OAuth Web Application Flow
  https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-authorization-options-for-oauth-apps/
  Stores the information to map the user Icarus identity to
*/
export class OAuthEndpoint {
  constructor(private readonly oauthService: OAuthService) {}

  oauth(callback: callback, event: event) {
    const resource = event.resource
    switch(resource) {
      case '/github-oauth-initiate': {
        this.initiate(callback, event)
        break
      }
      case '/github-oauth-complete': {
        this.complete(callback, event)
        break
      }
      default: {
        console.log('Unexpected resource mapped to this handler: ', resource)
        sendResponse(callback, response(400, 'Resource not supported'))
      }       
    }

  }

  // Initiate OAuth flow sending the user to the GithHub Authorise endpoint
  private initiate(callback: callback, event: event) {


    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const returnUri:uri = body.returnUri

    sendResponse(callback, redirectToResponse(this.oauthService.getOAuthAuthoriseUri(icarusAccessToken, returnUri)))
  }

  // Complete OAuth flow, redeeming Github auth code and adding Github identity to the user
  private complete(cb: callback, event: event) {
    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const githubAuthorisationCode:githubAuthorisationCode = body.code
    const initReturnUri:uri = body.initReturnUri
    
    return complete(cb, this.oauthService.processCode(icarusAccessToken, githubAuthorisationCode, initReturnUri)
      .then((icarusUserToken) => response(200, icarusUserToken))
    );
  }
}

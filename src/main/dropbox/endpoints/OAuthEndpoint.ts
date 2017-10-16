/**
Classes in this module handle the protocol-level tasks of handling Events and returning HTTP responses.
*/
import { complete, response, parseBody } from "../../common/endpoints/EndpointUtils";
import { event, callback, host, uri, lambdaStage, icarusAccessToken } from "../../common/Api";
import { IdentityService } from "../../common/services/IdentityService";
import { pathToLambda, redirectTo } from "../../common/clients/HttpClient";
import { OAuthService } from "../services/OAuthService";
import { dropboxAccountId, dropboxAuthorisationCode } from "../Api"

export class OAuthEndpoint {

  constructor(
    private readonly oauthService: OAuthService) {}

  /** 
    Initiate OAuth web flow with Dropbox
    
    Body:
      - icarusAccessToken
      - returnUri

    Redirects user to Github authorise page
  */
  initiate(cb: callback, event: event) {
    
    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const returnUri:uri = body.returnUri
  
    
    cb(null, redirectTo(this.oauthService.getOAuthAuthoriseUri(icarusAccessToken, returnUri)));
  }

  /**
    Complete OAuth web flow, redeemin the Dropbox auth code and adding Dropbox identity to the user

    Request
      Body:
      - icarusAccessToken: Icarus access token
      - code: Dropbox Authorisation code
      - initReturnUri: the returnUri passed to the initiate request, for verification by Dropbox only
    Response
      Body: IcarusUserToken
  */
  complete(cb: callback, event: event) {
    
    const body = parseBody(event)
    const icarusAccessToken:icarusAccessToken = body.icarusAccessToken
    const dropboxAuthorisationCode:dropboxAuthorisationCode = body.code
    const initReturnUri:uri = body.initReturnUri

    return complete(cb, this.oauthService.processCode(icarusAccessToken, dropboxAuthorisationCode, initReturnUri)
      .then((icarusUserToken) => response(200, icarusUserToken))
    );
  }

}

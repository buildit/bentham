import { callback, event, icarusAccessToken } from "../../common/Api";
import { complete, response, sendResponse, xAccessTokenHeader } from "../../common/endpoints/EndpointUtils";
import { IdentityService } from "../../common/services/IdentityService"

export class IdentityEndpoint {

    constructor(private readonly service:IdentityService) {}

    /**
     * Delete account and identities for the current user
     * 
     * Expects icarus access token as 'X-AccessToken' header
     * 
     * If the acces token is present, it silently returns 204, regardless the user has been deleted.
     */
    forgetMe(cb: callback, event: event) {
        const icarusAccessToken:icarusAccessToken|undefined = xAccessTokenHeader(event)
        
        if( icarusAccessToken ) {
            complete(cb, this.service.forgetUser(icarusAccessToken)
                .then( res => response(204))
                .catch( err => {
                    // There was an issue, maybe the token was not valid, but we are silently returning 204 regardless
                    console.error(err)
                    return response(204) 
                }))
        } else {
            console.log('No access token header in request')
            sendResponse(cb, response(400, 'Missing access token' ))      
        }
    }
} 
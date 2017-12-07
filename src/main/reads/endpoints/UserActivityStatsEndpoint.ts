import { complete, response, sendResponse, xAccessTokenHeader } from "../../common/endpoints/EndpointUtils";
import { event, callback, icarusAccessToken } from "../../common/Api";
import { UserActivityStatsService } from "../services/UserActivityStatsService";

export class UserActivityStatsEndpoint {

    constructor(private readonly service: UserActivityStatsService) {}

    /**
     * Retrieve the distribution of user activity counts, by day of week and hours
     * The recordset is sparse: any record counting zero is missing
     * 
     * Expects icarus access token as 'X-AccessToken' header
     */
    getUserActivityDistribution(cb: callback, event: event) {
        const icarusAccessToken:icarusAccessToken|undefined = xAccessTokenHeader(event)

        if( icarusAccessToken) {
            complete(cb, this.service.getUserActivityDistribution(icarusAccessToken)
                .then((report) => response(200, report))
                .catch( err => { 
                    console.error(err)
                    return response(403, 'Unauthorized' ) // Returns unauthorised on any error
                })
            )
        } else {
            console.log('No access token header in request')
            sendResponse(cb, response(403, 'Unauthorized' ))
        }
    }
}

import { callback } from "../../common/Api";

export function processUserEventsAndRespond( userEvents:any[], userEventProcessor: (Array) => Promise<any> , cb: callback) {
    console.log(`${userEvents.length} user events to process`)
    return userEventProcessor(userEvents)
        .then( success => {
            console.log('Events processed')
            cb(null, "processed")
        })
        .catch(err => {
            console.log(`Error processing events: ${err}`)
            cb(err, "unable-to-process") 
        })    
}

export const isDynamoDbEvent = (event): boolean => Array.isArray(event.Records || {})
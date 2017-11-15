import { event, callback } from "../../common/Api";
import { UserActivityStatsService, GithubEvent } from "../services/UserActivityStatsService"
import { processUserEventsAndRespond, isDynamoDbEvent } from "./EventProcessorUtils"

// Process DynamoDB github_events stream events
// Abstract the service layer from the DynamoDB Stream event format
export class GithubEventProcessor {

    constructor(private readonly userActivityService: UserActivityStatsService) {}

    process(cb: callback, event: event) {
        // console.log('Raw lambda event: ' +  JSON.stringify(event, null, 2))

        const githubEvents = isDynamoDbEvent(event) ? toGithubEvents(event) : []
        console.log(`${githubEvents.length} valid github events found`)
        const _userEventProcessor = (events) => this.userActivityService.processGithubEvents(events)
        processUserEventsAndRespond(githubEvents, _userEventProcessor, cb)

    }
}

// Extract multiple GithubEvents from a lambda event
const toGithubEvents = (event: event): GithubEvent[] => {
    return event.Records
        .filter( record => isValidGithubEventRecord(record) )
        .map( record => ({
            githubUsername: record.dynamodb.NewImage.username.S, 
        timestamp: new Date( record.dynamodb.NewImage.timestamp.S )
    }))
}

const isValidGithubEventRecord = (record): boolean => {
    const newImage = (((record || {}).dynamodb || {}).NewImage || {})
    return ( newImage ) ? ((newImage.username || {}).S) && ((newImage.timestamp || {}).S) : false;
}
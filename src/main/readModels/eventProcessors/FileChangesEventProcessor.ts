import { event, callback } from "../../common/Api";
import { UserActivityStatsService, DropboxFileChangeEvent } from "../services/UserActivityStatsService"
import { processUserEventsAndRespond, isDynamoDbEvent } from "./EventProcessorUtils"

// Process DynamoDB file_changes stream events
export class FileChangesEventProcessor {

    constructor(private readonly userActivityService: UserActivityStatsService) {}

    process(cb: callback, event: event) {
        // console.log('Raw lambda event: ' +  JSON.stringify(event, null, 2))

        const fileChangeEvents = isDynamoDbEvent(event) ? this.toDropobxFileChangeEvents(event) : []
        console.log(`${fileChangeEvents.length} valid file changes events found`)
        const _userEventProcessor = (events) => this.userActivityService.processDropboxFileChangeEvents(events)
        processUserEventsAndRespond(fileChangeEvents, _userEventProcessor, cb)
    }


    // Extract multiple DropboxFileChangeEvents from a lambda event
    // It gets the dropbox ID of the user who changed the file, not the tracked account!
    // They may be different for shared directories
    private toDropobxFileChangeEvents(event: event): DropboxFileChangeEvent[] {
        return event.Records
            .filter( record => isValidFileChangeEventRecord(record))
            .map( record => ({
                dropboxUserId: record.dynamodb.NewImage.user_id.S, 
                timestamp: new Date( record.dynamodb.Keys.event_timestamp.S )
        }))
    }
}

const isValidFileChangeEventRecord = (record): boolean => {
    const newImage = (((record || {}).dynamodb || {}).NewImage || {})
    return ( newImage ) ? ((newImage.user_id || {}).S) && ((newImage.event_timestamp || {}).S) : false;
}
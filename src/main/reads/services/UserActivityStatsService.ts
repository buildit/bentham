import { UserActivityCountRepository } from "../repositories/UserActivityCountRepository"
import { UserActivity } from "../Api"
import { icarusAccessToken } from "../../common/Api"
import { SlackIdentity } from "../../identity/Api";
import { IdentityRepository } from "../../identity/repositories/IdentityRepository"

interface UserEvent {
    timestamp: Date
}

export interface DropboxFileChangeEvent extends UserEvent {
    dropboxUserId: string,
}

export interface GithubEvent extends UserEvent {
    githubUsername: string,
}

export interface UserActivityDistributionEntry {
    dow: number,
    hours: number,
    event_count: number
}

enum Integration {
    Dropbox = "D",
    Github = "G"
}

export class UserActivityStatsService {
    
    constructor(
        private readonly activityCountRepository: UserActivityCountRepository,
        private readonly identityRepository: IdentityRepository
    ) {}

    // Retrieves a user's activity distribution: activity count by day-of-week and hours
    // Returns an arrau 
    async getUserActivityDistribution(icarusAccessToken:icarusAccessToken): Promise<UserActivityDistributionEntry[]> {
        return this.identityRepository.getSlackIdentity(icarusAccessToken)
            .then(slackIdentity => {
                if ( slackIdentity ) {
                    const slackId = slackIdentity.id;
                    console.log('Retrieving User activity distribution for SlackId: ' + slackId)
                    return this.activityCountRepository.getUserActivityDistribution(slackId)
                        .then( results => results )
                } else {
                    throw Error('Invalid Icarus access Token')
                }
            })
    }

    async processDropboxFileChangeEvents(events: DropboxFileChangeEvent[]):Promise<void[]> {
        const _mapper = (event) => this.dropboxFileChangeEventToUserActivity(event)
        return this.processEvents(events, _mapper)
    }

    async processGithubEvents(events: GithubEvent[]):Promise<void[]> {
        const _mapper = (event) => this.githubEventToUserActivity(event)
        return this.processEvents(events, _mapper)
    }

    private async processEvents(events: UserEvent[], eventToActivityMapper: (UserEvent) => Promise<UserActivity|undefined> ):Promise<void[]> {        
        // TODO Creates the table if does not exists. Any smarter way?
        return this.activityCountRepository.createTableIfNotExists()
            .then( ok => {
                console.log(`Processing ${events.length} user events`)
                return Promise.all( events.map( event => eventToActivityMapper(event) )
                    .map( eventualUserActivity => {
                        eventualUserActivity
                            .then( userActivity => {
                                if ( userActivity) {
                                    console.log('Processing user activity: %j', userActivity)
                                    return this.activityCountRepository.incActivityCount(userActivity)
                                } else {
                                    console.log('Not an Icarus user: ingoring the event')
                                    return Promise.resolve()
                                }
                            })
                            .catch( err => {
                                console.error('An error occurred processing a User Activity: %s', err)
                                return Promise.resolve() // Swallow the error and process the next event
                            })
                    } )
                )
            })
            .catch(err => Promise.reject(err))       
    }


    // Maps a DropboxFileChangeEvent to a UserActivity, for known Icarus users only
    private async dropboxFileChangeEventToUserActivity(fileChangeEvent: DropboxFileChangeEvent): Promise<UserActivity|undefined> {
        const _identityMapper = (userId) => this.identityRepository.getSlackIdentityByDropboxId(userId)
        return this.toUserActivity(fileChangeEvent.dropboxUserId, fileChangeEvent.timestamp, Integration.Dropbox, _identityMapper)
    }

    private async githubEventToUserActivity(githubEvent: GithubEvent): Promise<UserActivity|undefined> {
        const _identityMapper = (userId) => this.identityRepository.getSlackIdentityByGithubUser(userId)
        return this.toUserActivity(githubEvent.githubUsername, githubEvent.timestamp, Integration.Github, _identityMapper)          
    }

    private async toUserActivity(userId:string, timestamp:Date, integration: Integration, slackIdentityMapper: (string) => Promise<SlackIdentity> ):  Promise<UserActivity|undefined> {
        return slackIdentityMapper(userId)
            .then( slackIdentity => ({
                slackId: slackIdentity.id,
                integration: integration,
                dow: timestamp.getUTCDay(),
                hours: timestamp.getUTCHours()
            }))
            .catch(err => {
                console.log(`Unable to map ${userId} on integration ${integration} to a Slack user:` + err)
                // Not an Icarus user
                return undefined
            })          
    }
}
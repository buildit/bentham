import { DynamoClient } from "../../common/clients/DynamoClient";
import { uri } from "../../common/Api"
import { timestamp } from "../Api";


export type userEventId = string; // Globally unique ID of a UserEvent
export type githubUsername = string;
export type userEventType = string;

// User event (i.e. event= tracked by Icarus)
export interface UserEvent {
  id: userEventId;
  username: githubUsername;
  eventType: userEventType;
  timestamp: timestamp;
}

const baseTablename  = 'github_events'

// Repository for UserEvent: Github user related events, handled by Icarus
// (these are different from events delivered by GitHub webhook)
export class UserEventRepository {
  constructor(private readonly dynamo: DynamoClient) {}

  async store(event: UserEvent): Promise<void> {
    const storedEvent = {
      "id": event.id,
      "event_type": event.eventType,
      "username": event.username,
      "event_timestamp": event.timestamp,
    }

    console.log(`Storing a '${event.eventType}'`)
    return this.dynamo.put(baseTablename, storedEvent);
  }
}

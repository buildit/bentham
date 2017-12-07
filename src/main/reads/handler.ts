import { fileChangesEventProcessor, githubEventsProcessor, userActivityStatsEndpoint } from "./App";

// Processes DynamoDB Stream events from Dropbox file changes
export const fileChangesEvents = (event, context, cb) => fileChangesEventProcessor.process(cb, event);

// Processes DynamoDB Stream events from Github events
export const githubEvents = (event, context, cb) => githubEventsProcessor.process(cb, event)

// Return user activity starts
export const userActivityDistribition = (event, context, cb) => userActivityStatsEndpoint.getUserActivityDistribution(cb, event)
import { IdentityRepository } from "../identity/repositories/IdentityRepository";
import { DynamoClient } from "../common/clients/DynamoClient";
import { MySqlClient } from "../common/clients/MySqlClient"
import { FileChangesEventProcessor } from "./eventProcessors/FileChangesEventProcessor";
import { GithubEventProcessor } from "./eventProcessors/GithubEventProcessor";
import { UserActivityCountRepository } from "./repositories/UserActivityCountRepository"
import { UserActivityStatsService } from "./services/UserActivityStatsService"
import { UserActivityStatsEndpoint } from "./endpoints/UserActivityStatsEndpoint"

// Clients
const dynamo = new DynamoClient(process.env.TABLE_PREFIX);
const mySql = new MySqlClient( {
    host: process.env.RDS_HOST,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB,
    user: process.env.RDS_USER,
    password: process.env.RDS_PWD,
    connectTimeout: 2000 // 2 sec
})

// Repositories
const identityRepository = new IdentityRepository(dynamo);
const userActivityCountRepository = new UserActivityCountRepository(mySql)

// Services
const userActivityStatsService = new UserActivityStatsService(userActivityCountRepository, identityRepository)

// Event Processors
export const fileChangesEventProcessor = new FileChangesEventProcessor(userActivityStatsService)
export const githubEventsProcessor = new GithubEventProcessor(userActivityStatsService)

// Endpoints
export const userActivityStatsEndpoint = new UserActivityStatsEndpoint(userActivityStatsService)
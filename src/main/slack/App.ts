// Clients
import { HttpClient } from "../common/clients/HttpClient";
import { SlackClient } from "./clients/SlackClient";
import { IdentityRepository } from "../identity/repositories/IdentityRepository";
import { IdentityService } from "../identity/services/IdentityService";
import { OAuthService } from "./services/OAuthService";
import { OAuthEndpoint } from "./endpoints/OAuthEndpoint";
import { IdentityEndpoint } from "./endpoints/IdentityEndpoint"
import { DynamoClient } from "../common/clients/DynamoClient";

const httpClient = new HttpClient();
const slackClient = new SlackClient(
  httpClient,
  process.env.SLACK_TEAM_URL,
  process.env.SLACK_CLIENT_ID,
  process.env.SLACK_CLIENT_SECRET);

const dynamoClient = new DynamoClient(process.env.TABLE_PREFIX);

// Repositories
const identityRepo = new IdentityRepository(dynamoClient);
const identityService = new IdentityService(identityRepo);

// Services
const oAuthService = new OAuthService(slackClient, identityService);

// Endpoints
export const oAuthEndpoint = new OAuthEndpoint(oAuthService);
export const identityEndpoint = new IdentityEndpoint(identityService)
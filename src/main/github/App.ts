import { DynamoClient } from "../common/clients/DynamoClient"
import { HttpClient } from "../common/clients/HttpClient"
import { GithubClient } from "./clients/GithubClient"

import { UserEventRepository } from "./repositories/UserEventRepository"
import { IdentityRepository } from "../identity/repositories/IdentityRepository"

import { IdentityService } from "../identity/services/IdentityService"
import { WebhookEventService } from "./services/WebhookEventService"
import { OAuthService } from "./services/OAuthService"

import { WebhookEndpoint } from "./endpoints/WebhookEndpoint"
import { OAuthEndpoint } from "./endpoints/OAuthEndpoint";

// Clients
const dynamo = new DynamoClient(process.env.TABLE_PREFIX);
const httpClient = new HttpClient();
const githubClient = new GithubClient(
  httpClient,
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET);

// Repositories
const userEventRepository = new UserEventRepository(dynamo)
const identityRepository = new IdentityRepository(dynamo);

// Services
const identityService = new IdentityService(identityRepository);
const webhookEventService = new WebhookEventService(userEventRepository, process.env.GITHUB_WEBHOOK_SECRET);
const oauthService = new OAuthService(identityService, githubClient);


// Endpoints
export const webhookEndpoint = new WebhookEndpoint(webhookEventService);
export const oauthEndpoint = new OAuthEndpoint(oauthService);

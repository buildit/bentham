/**
Wires everything together
*/

import { DynamoClient } from "../common/clients/DynamoClient";
import { DropboxClient } from "./clients/DropboxClient";

import { OAuthService } from "./services/OAuthService"
import { NotificationService, FileUpdateRecorder } from "./services/NotificationService";

import { WebhookEndpoint } from "./endpoints/WebhookEndpoint";
import { OAuthEndpoint } from "./endpoints/OAuthEndpoint";
import { HttpClient } from "../common/clients/HttpClient";
import { CursorRepository } from "./repositories/CursorRepository";
import { FileChangeRepository } from "./repositories/FileChangeRepository";
import { IdentityRepository } from "../identity/repositories/IdentityRepository";
import { IdentityService } from "../identity/services/IdentityService";


// Repositories
const dynamo = new DynamoClient(process.env.TABLE_PREFIX);
const cursorRepository = new CursorRepository(dynamo);
const fileChangeRepository = new FileChangeRepository(dynamo);
const identityRepository = new IdentityRepository(dynamo);

const httpClient = new HttpClient();
// Dropbox integration
const dropboxClient = new DropboxClient(
  httpClient,
  process.env.DROPBOX_CLIENT_ID,
  process.env.DROPBOX_CLIENT_SECRET);

const fileUpdateRecorder = new FileUpdateRecorder(
  identityRepository,
  cursorRepository,
  dropboxClient,
  fileChangeRepository);

// Services
const identityService = new IdentityService(identityRepository);
const notificationService = new NotificationService(fileUpdateRecorder);
const oauthService = new OAuthService(identityService, dropboxClient, cursorRepository);


// Endpoints
export const webhookEndpoint = new WebhookEndpoint(notificationService);
export const oauthEndpoint = new OAuthEndpoint(oauthService);

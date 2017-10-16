import { toPromise } from '../../common/TestUtils';
import { expect } from 'chai';
import 'mocha';
import { slackAuthCode, slackToken } from "../../../main/slack/Api";
import { DropboxIdentity, GithubIdentity, IcarusUserToken } from "../../../main/common/Api";
import { OAuthService } from "../../../main/slack/services/OAuthService";
import { OAuthEndpoint } from "../../../main/slack/endpoints/OAuthEndpoint";
import { mock, instance, when, verify, resetCalls, anyString } from "ts-mockito";
import { stringify as formStringify} from "querystring"

const mockOAuthService: OAuthService = mock(OAuthService);
const oAuthService = instance(mockOAuthService);

const endpoint = new OAuthEndpoint(oAuthService);

const _initiate = (cb, e) => endpoint.initiate(cb, e);
const _complete = (cb, e) => endpoint.complete(cb, e);

beforeEach(() => {
  resetCalls(mockOAuthService)
})

describe("Slack OAuth Endpoint", () => {

  describe("initiate", () => {

    it("should redirect an 'initiate' request to the Slack team API", async () => {
      when(mockOAuthService.getOAuthAuthoriseUri(anyString())).thenReturn("http://oauth-uri");

      const result = await toPromise(_initiate, {
        queryStringParameters: {
          returnUri: 'http://return.uri'
        }
      });

      expect(result.statusCode).to.equal(302);
      expect(result.headers.Location).to.equal("http://oauth-uri");

      verify(mockOAuthService.getOAuthAuthoriseUri('http://return.uri')).once()
    })
  })

  describe("complete", () => {

    const requestEvent = {
      headers: {
        Host: "aws-api",
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      requestContext: {
        stage: 'lambda-stage'
      },
      body: formStringify({
        code: "the auth code",
        returnUri: 'http://return.uri'
      }),
    }

    it("should pass the Slack auth code to the login service to obtain an Icarus user token", async () => {
      const icarusUserToken:IcarusUserToken = {
        accessToken: 'the access token',
        userName: "Arthur Putey",
        dropboxAccountId: undefined,
        githubUsername: undefined,
      }
      when(mockOAuthService.processCode(anyString(), anyString())).thenReturn(Promise.resolve(icarusUserToken));
      
        const result = await toPromise(_complete, requestEvent);
  
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.equal(JSON.stringify(icarusUserToken));

        verify(mockOAuthService.processCode('the auth code', 'http://return.uri')).once()
    });
  
    it("should contain user Dropbox id", async () => {
      const icarusUserToken:IcarusUserToken = {
        accessToken: 'the access token',
        userName: "Arthur Putey",
        dropboxAccountId: 'the dropbox id',
        githubUsername: undefined,
      }
  
      when(mockOAuthService.processCode(anyString(), anyString())).thenReturn(Promise.resolve(icarusUserToken));

      const result = await toPromise(_complete, requestEvent);
  
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.equal(JSON.stringify(icarusUserToken));

      verify(mockOAuthService.processCode('the auth code', 'http://return.uri')).once()
    });
  
    it("should contain GitHub username", async () => {
      const icarusUserToken:IcarusUserToken = {
        accessToken: 'the access token',
        userName: "Arthur Putey",
        dropboxAccountId: undefined,
        githubUsername: 'the github username',
      }
      when(mockOAuthService.processCode(anyString(), anyString())).thenReturn(Promise.resolve(icarusUserToken));

      const result = await toPromise(_complete, requestEvent);
  
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.equal(JSON.stringify(icarusUserToken));

      verify(mockOAuthService.processCode('the auth code', 'http://return.uri')).once()
    });
  })


});

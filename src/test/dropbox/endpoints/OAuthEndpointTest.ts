import { toPromise } from '../../common/TestUtils';
import { expect } from 'chai';
import 'mocha';
import { OAuthService } from "../../../main/dropbox/services/OAuthService";
import { OAuthEndpoint } from "../../../main/dropbox/endpoints/OAuthEndpoint";
import { IcarusUserToken } from "../../../main/identity/Api";
import { mock, instance, when, verify, anyString } from 'ts-mockito';
import { stringify as formStringify} from "querystring"

const icarusUserToken:IcarusUserToken = {
  accessToken: 'icarus-access-token',
  userName: 'slack-username',
  dropboxAccountId: 'dropbox-account-id',
  githubUsername: undefined,
}

const mockedOauthService = mock(OAuthService);
const oauthService = instance(mockedOauthService);
when(mockedOauthService.getOAuthAuthoriseUri(anyString(), anyString())).thenReturn("http://oauth-uri");
when(mockedOauthService.processCode(anyString(), anyString(), anyString())).thenReturn(Promise.resolve(icarusUserToken));

const endpoint = new OAuthEndpoint(oauthService);


const _oauth = (cb, e) => endpoint.oauth(cb, e);

describe("Dropbox OAuth Endpoint", () => {
  it("should redirect an 'initiate' request to Dropbox OAuth authorise endpoint", async () => {
      const result = await toPromise(_oauth, {
        resource: '/dropbox-oauth-initiate',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formStringify({
          icarusAccessToken: "icarus-access-token",
          returnUri: 'http://return.uri'
        }),
      });
      verify(mockedOauthService.getOAuthAuthoriseUri("icarus-access-token", "http://return.uri")).once();

      expect(result.statusCode).to.equal(302);
      expect(result.headers.Location).to.equal("http://oauth-uri");
  });

  it("should return an Icarus User Token including Dropbox ID on completion", async () => {
    const result = await toPromise(_oauth, {
      resource: '/dropbox-oauth-complete',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formStringify({
        code: "the code",
        icarusAccessToken: "icarus-access-token",
        initReturnUri: 'http://return.uri'
      }),
    });

    verify(mockedOauthService.processCode("icarus-access-token", "the code", 'http://return.uri')).once();

    expect(result.statusCode).to.equal(200);
    expect(result.body).to.equal(JSON.stringify(icarusUserToken));
  });
});

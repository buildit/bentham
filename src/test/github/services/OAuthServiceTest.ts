import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, resetCalls, anyString,  anything } from 'ts-mockito';

import { OAuthService } from "../../../main/github/services/OAuthService";
import { IdentityService } from "../../../main/identity/services/IdentityService"
import { GithubClient } from "../../../main/github/clients/GithubClient";
import { GithubIdentity } from "../../../main/identity/Api"

const identityServiceMock = mock(IdentityService)
const identityService = instance(identityServiceMock)

const githubClientMock = mock(GithubClient)
const githubClient = instance(githubClientMock)

const unit = new OAuthService(identityService, githubClient)

when(identityServiceMock.addIdentity(anyString(), 'github', anything() )).thenReturn(Promise.resolve(
  {
    accessToken: '',
    userName: '',
    dropboxAccountId: undefined,
    githubUsername: 'github-username',
  }
 ))
when(githubClientMock.getUsername(anyString())).thenReturn(Promise.resolve('github-username'))
when(githubClientMock.requestAccessToken(anyString(), anyString())).thenReturn(Promise.resolve('github-access-token'))

beforeEach(() => {
  resetCalls(identityServiceMock)
  resetCalls(githubClientMock)
})

describe('GitHub OAuth Service', () => {
  describe('Process Auth Code', async () => {


    it('should exchange Access Code for Access Token', async () => {
      const result = await unit.processCode('icarus-access-token', 'github-access-code', 'http://return.uri')
      verify(githubClientMock.requestAccessToken('github-access-code', 'http://return.uri')).once()
    })

    it('should request the username', async () => {
      const result = await unit.processCode('icarus-access-token', 'github-access-code', 'http://return.uri')
      verify(githubClientMock.getUsername('github-access-token')).once()
    })

    it('should add a new Identity to Identity Service', async () => {
      const result = await unit.processCode('icarus-access-token', 'github-access-code', 'http://return.uri')
      verify(identityServiceMock.addIdentity('icarus-access-token', 'github', anything() )).once()
    })

    it('should return the Icarus user token containing the github username', async () => {
      const result = await unit.processCode('icarus-access-token', 'github-access-code', 'http://return.uri')
      expect(result.githubUsername).is.equal('github-username')
    })
  })
})

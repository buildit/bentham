import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, resetCalls, anyString,  anything } from 'ts-mockito';

import { IdentityService } from "../../../main/identity/services/IdentityService"
import { IdentityRepository } from "../../../main/identity/repositories/IdentityRepository"
import { icarusAccessToken } from "../../../main/common/Api"
import { slackAccessToken, IdentitySet, SlackIdentity, DropboxIdentity, GithubIdentity, IcarusUserToken } from "../../../main/identity/Api";

const slackIdentity:SlackIdentity = {
  id: 'slack-account-id',
  accessToken: 'slack-access-token',
  teamId: 'slack-team-id',
  userName: 'slack-username'
}

const dropboxIdentity:DropboxIdentity = {
  id: 'dropbox-account-id',
  accessToken: 'dropbox-access-token'
}

const githubIdentity:GithubIdentity = {
  id: 'github-username',
  accessToken: 'github-access-token'
}

const repositoryMock = mock(IdentityRepository)
const unit = new IdentityService(instance(repositoryMock))

when(repositoryMock.saveIcarusAccount(anyString(), anything()))
    .thenCall((arg1: icarusAccessToken, arg2: SlackIdentity) => Promise.resolve(arg1)  )
when(repositoryMock.saveSlackIdentity(anyString(), anything()))
    .thenCall((arg1: icarusAccessToken, arg2: SlackIdentity) => Promise.resolve(arg2))
when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( dropboxIdentity ))
when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( githubIdentity ))


beforeEach(() => {
  resetCalls(repositoryMock)
})

describe('Identity service, grant Icarus user token', () => {

  it('should save the new Icarus access token', async () => {
    await unit.grantIcarusUserToken(slackIdentity)

    verify(repositoryMock.saveIcarusAccount(anyString(), slackIdentity)).once()
  } )

  it('should save the Slack identity', async () => {
    await unit.grantIcarusUserToken(slackIdentity)

    verify(repositoryMock.saveSlackIdentity(anyString(), slackIdentity)).once()
  })

  it('should retrieve Drobox and Github identities', async () => {
      await unit.grantIcarusUserToken(slackIdentity)

      verify(repositoryMock.getDropboxIdentityBySlackId(slackIdentity.id)).once()
      verify(repositoryMock.getGithubIdentityBySlackId(slackIdentity.id)).once()
  })

  it('should generate an Icarus access token containing Dropbox ID and GitHub username when all identities are available', async () => {
    const result = await unit.grantIcarusUserToken(slackIdentity)

    expect(result.accessToken).to.be.ok
    expect(result.userName).is.equal(slackIdentity.userName)
    expect(result.dropboxAccountId).is.equal(dropboxIdentity.id)
    expect(result.githubUsername).is.equal(githubIdentity.id)
  })

})

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


describe('Identity Service, Add Identity', () => {


    it('should return an Icarus user token with both Drobox ID and GitHub username, on adding Dropbox identity when the user already has Github identity', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve( slackIdentity ))
      when(repositoryMock.saveDropboxIdentity(anyString(), anything())).thenReturn(Promise.resolve( dropboxIdentity ))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( githubIdentity ))

      const result = await unit.addIdentity('icarus-access-token', 'dropbox', dropboxIdentity)

      expect(result.accessToken).is.equal('icarus-access-token')
      expect(result.userName).is.equal('slack-username')
      expect(result.dropboxAccountId).is.equal('dropbox-account-id')
      expect(result.githubUsername).is.equal('github-username')

      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.saveDropboxIdentity('slack-account-id', dropboxIdentity)).once()
      verify(repositoryMock.getGithubIdentityBySlackId('slack-account-id')).once()
    })

    it('should return an Icarus user token with both Drobox ID and GitHub username, on adding GitHub identity when the user already has Dropbox identity', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve( slackIdentity ))
      when(repositoryMock.saveGithubIdentity(anyString(), anything())).thenReturn(Promise.resolve( githubIdentity ))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( dropboxIdentity ))

      const result = await unit.addIdentity('icarus-access-token', 'github', githubIdentity)

      expect(result.accessToken).is.equal('icarus-access-token')
      expect(result.userName).is.equal('slack-username')
      expect(result.dropboxAccountId).is.equal('dropbox-account-id')
      expect(result.githubUsername).is.equal('github-username')

      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.saveGithubIdentity('slack-account-id', githubIdentity)).once()
      verify(repositoryMock.getDropboxIdentityBySlackId('slack-account-id')).once()
    })

    it('should return an Icarus user token with Dropbox ID only, on adding Drobox identity when a user does not have a Github identity', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve( slackIdentity ))
      when(repositoryMock.saveDropboxIdentity(anyString(), anything())).thenReturn(Promise.resolve( dropboxIdentity ))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))

      const result = await unit.addIdentity('icarus-access-token', 'dropbox', dropboxIdentity)

      expect(result.accessToken).is.equal('icarus-access-token')
      expect(result.userName).is.equal('slack-username')
      expect(result.dropboxAccountId).is.equal('dropbox-account-id')
      expect(result.githubUsername).to.be.undefined

      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.saveDropboxIdentity('slack-account-id', dropboxIdentity)).once()
      verify(repositoryMock.getGithubIdentityBySlackId('slack-account-id')).once()
    })

    it('should return an Icarus user token with Github username only, on adding GitHub identity when a user does not have a Dropbox identity', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve( slackIdentity ))
      when(repositoryMock.saveGithubIdentity(anyString(), anything())).thenReturn(Promise.resolve( githubIdentity ))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))

      const result = await unit.addIdentity('icarus-access-token', 'github', githubIdentity)

      expect(result.accessToken).is.equal('icarus-access-token')
      expect(result.userName).is.equal('slack-username')
      expect(result.dropboxAccountId).to.be.undefined
      expect(result.githubUsername).is.equal('github-username')

      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.saveGithubIdentity('slack-account-id', githubIdentity)).once()
      verify(repositoryMock.getDropboxIdentityBySlackId('slack-account-id')).once()
    })

})

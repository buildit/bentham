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

describe('Identity service, get Icarus user token', () => {

  describe('get Icarus user token ', () => {

    it('should return a token with Dropbox ID and GitHub username when all identities are available', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))
  
      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( dropboxIdentity ))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( githubIdentity ))
  
      const result = await unit.getIcarusUserToken('icarus-access-token')
  
      expect(result.accessToken).to.be.ok
      expect(result.userName).is.equal(slackIdentity.userName)
      expect(result.dropboxAccountId).is.equal(dropboxIdentity.id)
      expect(result.githubUsername).is.equal(githubIdentity.id)
  
      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.getDropboxIdentityBySlackId(slackIdentity.id)).once()
      verify(repositoryMock.getGithubIdentityBySlackId(slackIdentity.id)).once()
  
      verify(repositoryMock.saveIcarusAccount(anyString(), anything())).never()
      verify(repositoryMock.saveSlackIdentity(anyString(), anything())).never()
    })
  
    it('should return a token without Dropbox ID nor Github username, when only Slack identity is available', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))
  
      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))
  
      const result = await unit.getIcarusUserToken('icarus-access-token')
  
      expect(result.accessToken).to.be.ok
      expect(result.userName).is.equal(slackIdentity.userName)
      expect(result.dropboxAccountId).to.be.undefined
      expect(result.githubUsername).to.be.undefined
  
      verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
      verify(repositoryMock.getDropboxIdentityBySlackId(slackIdentity.id)).once()
      verify(repositoryMock.getGithubIdentityBySlackId(slackIdentity.id)).once()
  
      verify(repositoryMock.saveIcarusAccount(anyString(), anything())).never()
      verify(repositoryMock.saveSlackIdentity(anyString(), anything())).never()
    })
  })

  describe('get Dropbox identity', () => {
    it('should return a Dropbox identity when available ', () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( dropboxIdentity ))

      return unit.getDropboxIdentity('icarus-access-token')
      .then(result => {
          expect(result).to.be.ok
        
          verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
          verify(repositoryMock.getDropboxIdentityBySlackId(slackIdentity.id)).once()
      })

    })

    it('should reject when no Dropbox identity is available', () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getDropboxIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))

      return unit.getDropboxIdentity('icarus-access-token')
      .catch(err => {
        expect(err).to.be.ok
        verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
        verify(repositoryMock.getDropboxIdentityBySlackId(slackIdentity.id)).once()
      })
    })
  })

  describe('get Github identity', () => {
    it('should return a Github identity when available ',  () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( githubIdentity ))

      return unit.getGithubIdentity('icarus-access-token')
        .then(result => {
          expect(result).to.be.ok
          
          verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
          verify(repositoryMock.getGithubIdentityBySlackId(slackIdentity.id)).once()
        })
    })

    it('should reject when no Github identity is available',  () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      when(repositoryMock.getSlackIdentity(anyString())).thenReturn(Promise.resolve(slackIdentity))
      when(repositoryMock.getGithubIdentityBySlackId(anyString())).thenReturn(Promise.resolve( undefined ))

      return unit.getGithubIdentity('icarus-access-token')
        .catch(err => {
          expect(err).to.be.ok

          verify(repositoryMock.getSlackIdentity('icarus-access-token')).once()
          verify(repositoryMock.getGithubIdentityBySlackId(slackIdentity.id)).once()
        })

    })
  })
  
  describe('forget user', () => {
    it('should remove account and all identities of the user', async () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))

      const slackIdentity:SlackIdentity = {
        id: 'slack id',
        accessToken: 'slack access token',
        teamId: 'slack-team-id',
        userName: 'User Name'
      }
      when(repositoryMock.getSlackIdentity(anyString())).thenReturn( Promise.resolve(slackIdentity) )

      when(repositoryMock.deleteIcarusAccount(anyString())).thenReturn(Promise.resolve())
      when(repositoryMock.deleteSlackIdentity(anyString())).thenReturn(Promise.resolve())
      when(repositoryMock.deleteGithubIdentity(anyString())).thenReturn(Promise.resolve())
      when(repositoryMock.deleteDropboxIdentity(anyString())).thenReturn(Promise.resolve())

      await unit.forgetUser('icarus access token')

      verify(repositoryMock.getSlackIdentity('icarus access token')).once()
      verify(repositoryMock.deleteIcarusAccount('slack id')).once()
      verify(repositoryMock.deleteSlackIdentity('slack id')).once()
      verify(repositoryMock.deleteGithubIdentity('slack id')).once()
      verify(repositoryMock.deleteDropboxIdentity('slack id')).once()
      
    })

    it('should reject when acces token is invalid', () => {
      const repositoryMock = mock(IdentityRepository)
      const unit = new IdentityService(instance(repositoryMock))


      when(repositoryMock.getSlackIdentity(anyString())).thenReturn( Promise.reject('invalid token') )
      
      return unit.forgetUser('invalid token')
        .catch(err => {
          expect(err).to.be.ok

          verify(repositoryMock.getSlackIdentity('invalid token')).once()
          
          verify(repositoryMock.deleteIcarusAccount(anyString())).never()
          verify(repositoryMock.deleteSlackIdentity(anyString())).never()
          verify(repositoryMock.deleteGithubIdentity(anyString())).never()
          verify(repositoryMock.deleteDropboxIdentity(anyString())).never()
        })
    })
  })
 
})

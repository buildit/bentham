import { expect, assert } from 'chai';
import 'mocha';
import { mock, instance, when, verify, capture, resetCalls, anyString, anything } from 'ts-mockito';

import { DynamoClient } from "../../../main/common/clients/DynamoClient";
import { IdentityRepository } from "../../../main/common/repositories/IdentityRepository"
import { SlackIdentity, DropboxIdentity, GithubIdentity } from "../../../main/common/Api"

function mocks(): [ DynamoClient,  IdentityRepository ] {
    const dynamoClientMock = mock(DynamoClient)
    const dynamoClient = instance(dynamoClientMock)
    const identityRepository = new IdentityRepository(dynamoClient)
    return [ dynamoClientMock, identityRepository]
}

describe('Identity repository', () => {

    describe('save Icarus account', () => {

        it('should put slack id and icarus access token into accounts table', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.put(anyString(), anything())).thenReturn(Promise.resolve('icarus access token'))

            const slackIdentity:SlackIdentity = {
                id: 'slack-id',
                accessToken: 'slack access token',
                teamId: 'slack-team-id',
                userName: 'Slack User Name'
            }

            const result = await unit.saveIcarusAccount('icarus access token', slackIdentity)

            expect(result).is.equal('icarus access token')

            const [table, params] = capture(dynamoClientMock.put).last()
            expect(table).is.equal('accounts')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                access_token: 'icarus access token'
            })

            verify(dynamoClientMock.put(anyString(), anything())).once()
        })
    })

    describe('delete Icarus account', () =>{
        it('should delete a record from accounts table by slack id', async() => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.delete(anyString(), anything())).thenReturn(Promise.resolve('deleted'))

            await unit.deleteIcarusAccount('slack-id')

            const [table, params] = capture(dynamoClientMock.delete).last()
            expect(table).is.equal('accounts')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id'
            })

            verify(dynamoClientMock.delete(anyString(), anything())).once()
        })
    })

    describe('save Dropox identity', () => {

        it('should put slack_id, dropbox details into identities table with "D" integration type', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const dropboxIdentity:DropboxIdentity = {
                id: 'dropbox-id',
                accessToken: 'dropbox access token'
            }

            when(dynamoClientMock.put(anyString(), anything())).thenReturn(Promise.resolve( dropboxIdentity ))

            const result = await unit.saveDropboxIdentity('slack-id', dropboxIdentity)

            expect(result).to.be.deep.equal( dropboxIdentity )

            const [table, params] = capture(dynamoClientMock.put).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'D',
                account_id: 'dropbox-id',
                access_token: 'dropbox access token'
            })

            verify(dynamoClientMock.put(anyString(), anything())).once()
        })
    })

    describe('delete Dropbox identity', () => {
        it('should delete a record of type "D" from identities table by slack id', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.delete(anyString(), anything())).thenReturn(Promise.resolve('deleted'))

            await unit.deleteDropboxIdentity('slack-id')

            const [table, params] = capture(dynamoClientMock.delete).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'D',
            })

            verify(dynamoClientMock.delete(anyString(), anything())).once()            
        })
    })

    describe('save Github idenity', () => {

        it('should put slack_id, github details into identities table with "G" integration type', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const githubIdentity:GithubIdentity = {
                id: 'github-username',
                accessToken: 'github access token'
            }

            when(dynamoClientMock.put(anyString(), anything())).thenReturn(Promise.resolve( githubIdentity ))

            const result = await unit.saveGithubIdentity('slack-id', githubIdentity)

            expect(result).to.be.deep.equal( githubIdentity )
            
            
            const [table, params] = capture(dynamoClientMock.put).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'G',
                account_id: 'github-username',
                access_token: 'github access token'
            })

            verify(dynamoClientMock.put(anyString(), anything())).once()
        })
    })

    describe('delete Github identity', () => {
        it('should delete a record of type "G" from identities table by slack id', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.delete(anyString(), anything())).thenReturn(Promise.resolve('deleted'))

            await unit.deleteGithubIdentity('slack-id')

            const [table, params] = capture(dynamoClientMock.delete).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'G',
            })

            verify(dynamoClientMock.delete(anyString(), anything())).once()            
        })
    })    

    describe('save Slack idenity', () => {
        
        it('should put slack_id, slack details into identities table with "S" integration type', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const slackIdentity:SlackIdentity = {
                id: 'slack-id',
                teamId: 'slack-team-id',
                userName: 'slack User Name',
                accessToken: 'slack access token'
            }

            when(dynamoClientMock.put(anyString(), anything())).thenReturn(Promise.resolve( slackIdentity ))

            const result = await unit.saveSlackIdentity('slack-id', slackIdentity)

            expect(result).to.be.deep.equal( slackIdentity )
            
            
            const [table, params] = capture(dynamoClientMock.put).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'S',
                account_id: 'slack-id',
                team_id: 'slack-team-id',
                user_name: 'slack User Name',
                access_token: 'slack access token'
            })

            verify(dynamoClientMock.put(anyString(), anything())).once()
        })
    })

    describe('delete Slack identity', () => {
        it('should delete a record of type "S" from identities table by slack id', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.delete(anyString(), anything())).thenReturn(Promise.resolve('deleted'))

            await unit.deleteSlackIdentity('slack-id')

            const [table, params] = capture(dynamoClientMock.delete).last()
            expect(table).is.equal('identities')
            expect(params).to.be.deep.include({
                slack_id: 'slack-id',
                integration_type: 'S',
            })

            verify(dynamoClientMock.delete(anyString(), anything())).once()            
        })
    })     

    describe('get Slack identity by Icarus access token', () => {

        it('should query the account table on index slack_id_by_access_token and then get from identity table by slack Id', async () => {
            const [ dynamoClientMock, unit ] = mocks()
            
            const slackIdentity:SlackIdentity = {
                id: 'slack-id',
                teamId: 'slack-team-id',
                userName: 'slack User Name',
                accessToken: 'slack access token'
            }

            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve({
                slack_id: 'slack-id',
                integration_type: 'S',
                account_id: 'slack-id',
                access_token: 'slack access token',
                team_id: 'slack-team-id',
                user_name: 'slack User Name'
            }) )

            const result = await unit.getSlackIdentity('icarus access token')

            expect(result).to.be.deep.equal( slackIdentity )

            const [tableQuery, paramsQuery] = capture(dynamoClientMock.query).last()
            expect(tableQuery).is.equal('accounts')
            expect(paramsQuery).to.deep.include({
                IndexName: 'slack_id_by_access_token'
            })

            const[tableGet, paramsGet] = capture(dynamoClientMock.get).last()
            expect(tableGet).is.equal('identities')
            expect(paramsGet).to.deep.include({
                slack_id: 'slack-id',
                integration_type: 'S'
            })   
            
            verify(dynamoClientMock.query(anyString(), anything())).once()
            verify(dynamoClientMock.get(anyString(), anything())).once()
        })

        it('should reject if slack id lookup by acces_token fails', () => {
            const [ dynamoClientMock, unit ] = mocks()
    
            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ ]))
    
            return unit.getSlackIdentity('invalid access token')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('accounts', anything())).once()
                verify(dynamoClientMock.get(anyString(), anything())).never()
            })
        })
    
        it('should reject if identities table does not contain the Slack identity', () => {
            const [ dynamoClientMock, unit ] = mocks()
    
            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve(null) )
    
            return unit.getSlackIdentity('invalid access token')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('accounts', anything())).once()
                verify(dynamoClientMock.get('identities', anything())).once()
            })
        })       
    })

    describe('get Slack Identity by Dropbox Id', () => {

        it('should query the identities table on the identity_by_account_id_and_type index by Dropbox Id then get the Slack Identity from the identites table', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const slackIdentity:SlackIdentity = {
                id: 'slack-id',
                teamId: 'slack-team-id',
                userName: 'slack User Name',
                accessToken: 'slack access token'
            }

            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve( slackIdentity ) )

            const result = await unit.getSlackIdentityByDropboxId('dropbox-id')

            const [tableQuery, paramsQuery] = capture(dynamoClientMock.query).last()
            expect(tableQuery).is.equal('identities')
            expect(paramsQuery).to.deep.include({
                IndexName: 'identity_by_account_id_and_type',
                ExpressionAttributeValues: {
                    ':accountId': 'dropbox-id', 
                    ':identityType': 'D'
                  },                
            })
            
            const[tableGet, paramsGet] = capture(dynamoClientMock.get).last()
            expect(tableGet).is.equal('identities')
            expect(paramsGet).to.deep.include({
                slack_id: 'slack-id',
                integration_type: 'S'
            }) 
            
            verify(dynamoClientMock.query(anyString(), anything())).once()
            verify(dynamoClientMock.get(anyString(), anything())).once()
        })


        it('should reject if Dropbox identity lookup fails', () => {
            const [ dynamoClientMock, unit ] = mocks()
    
            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ ]))
    
            return unit.getSlackIdentityByDropboxId('invalid-dropbox-id')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('identities', anything())).once()
                verify(dynamoClientMock.get(anyString(), anything())).never()
            })
        })

        it('should reject if Slack identity lookup fails', () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve( null ) )

            return unit.getSlackIdentityByDropboxId('invalid-dropbox-id')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('identities', anything())).once()
                verify(dynamoClientMock.get('identities', anything())).once()
            })
        })
    })

    describe('get Slack Identity by Github username', () => {

        it('should query the identities table on the identity_by_account_id_and_type index by Github username then get the Slack Identity from the identites table', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const slackIdentity:SlackIdentity = {
                id: 'slack-id',
                teamId: 'slack-team-id',
                userName: 'slack User Name',
                accessToken: 'slack access token'
            }

            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve( slackIdentity ) )

            const result = await unit.getSlackIdentityByGithubUser('github-user')

            const [tableQuery, paramsQuery] = capture(dynamoClientMock.query).last()
            expect(tableQuery).is.equal('identities')
            expect(paramsQuery).to.deep.include({
                IndexName: 'identity_by_account_id_and_type',
                ExpressionAttributeValues: {
                    ':accountId': 'github-user', 
                    ':identityType': 'G'
                    },                
            })
            
            const[tableGet, paramsGet] = capture(dynamoClientMock.get).last()
            expect(tableGet).is.equal('identities')
            expect(paramsGet).to.deep.include({
                slack_id: 'slack-id',
                integration_type: 'S'
            }) 
            
            verify(dynamoClientMock.query(anyString(), anything())).once()
            verify(dynamoClientMock.get(anyString(), anything())).once()
        })


        it('should reject if Github identity lookup fails', () => {
            const [ dynamoClientMock, unit ] = mocks()
    
            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ ]))
    
            return unit.getSlackIdentityByGithubUser('invalid-github-user')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('identities', anything())).once()
                verify(dynamoClientMock.get(anyString(), anything())).never()
            })
        })

        it('should reject if Slack identity lookup fails', () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([ { slack_id: 'slack-id' } ]))
            when(dynamoClientMock.get(anyString(), anything())).thenReturn( Promise.resolve( null ) )

            return unit.getSlackIdentityByGithubUser('invalid-github-user')
            .catch(err => {
                expect(err).to.be.ok
                verify(dynamoClientMock.query('identities', anything())).once()
                verify(dynamoClientMock.get('identities', anything())).once()
            })
        })
    })

    describe('get Dropbox identity by Slack Id', () => {

        it('should get the identities table by Slack Id and Dropbox type', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const dropboxIdentity:DropboxIdentity = {
                id: 'dropbox-id',
                accessToken: 'dropbox access token'
            }

            when(dynamoClientMock.get(anyString(), anything())).thenReturn(Promise.resolve( {
                account_id: 'dropbox-id',
                access_token: 'dropbox access token'
            } ))

            const result = await unit.getDropboxIdentityBySlackId('slack-id')

            expect(result).to.be.deep.equal(dropboxIdentity)

            const[tableGet, paramsGet] = capture(dynamoClientMock.get).last()
            expect(tableGet).is.equal('identities')
            expect(paramsGet).to.deep.include({
                slack_id: 'slack-id',
                integration_type: 'D'
            })
            
            verify(dynamoClientMock.get(anyString(), anything())).once()
        })

        it('should return undefined if identity lookup fails', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.get(anyString(), anything())).thenReturn(Promise.resolve(null))

            const result = await unit.getDropboxIdentityBySlackId('invalid-slack-id')
            
            expect(result).to.be.undefined

            verify(dynamoClientMock.get(anyString(), anything())).once()
        })
    })


    describe('get Github identity by Slack Id', () => {

        it('should get the identities table by Slack Id and Github type', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            const githubIdentity:GithubIdentity = {
                id: 'github-username',
                accessToken: 'github access token'
            }            

            when(dynamoClientMock.get(anyString(), anything())).thenReturn(Promise.resolve( {
                account_id: 'github-username',
                access_token: 'github access token'
            } ))

            const result = await unit.getGithubIdentityBySlackId('slack-id')

            expect(result).to.be.deep.equal(githubIdentity)

            const[tableGet, paramsGet] = capture(dynamoClientMock.get).last()
            expect(tableGet).is.equal('identities')
            expect(paramsGet).to.deep.include({
                slack_id: 'slack-id',
                integration_type: 'G'
            })
            
            verify(dynamoClientMock.get(anyString(), anything())).once()
        })

        it('should return undefined if identity lookup fails', async () => {
            const [ dynamoClientMock, unit ] = mocks()

            when(dynamoClientMock.get(anyString(), anything())).thenReturn(Promise.resolve(null))

            const result = await unit.getGithubIdentityBySlackId('invalid-slack-id')
            
            expect(result).to.be.undefined

            verify(dynamoClientMock.get(anyString(), anything())).once()
        })
    })
    
})

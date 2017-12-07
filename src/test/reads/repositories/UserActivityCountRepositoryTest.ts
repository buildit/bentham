const chai = require('chai')
chai.use(require('chai-string'))
const expect = chai.expect
const asser = chai.assert
import 'mocha';
import { mock, instance, when, verify, capture, resetCalls, anyString, anything } from 'ts-mockito';


import { MySqlClient } from "../../../main/common/clients/MySqlClient";
import { UserActivityCountRepository } from "../../../main/reads/repositories/UserActivityCountRepository"
import { UserActivity } from "../../../main/reads/Api"

describe('User Activity counts repository', () => {

    describe('Increment activities count', () => {

        it('should send a INSERT INTO statement on "user_event_counts" table with event params', async () => {
            const mySqlClientMock = mock(MySqlClient)
            const mySqlClient = instance(mySqlClientMock)

            const unit = new UserActivityCountRepository(mySqlClient)

            when(mySqlClientMock.query(anyString(), anything())).thenReturn(Promise.resolve())

            const userActivity:UserActivity = {
                slackId: 'slack-id',
                integration: 'I',
                dow: 6,
                hours: 23,

            }

            await unit.incActivityCount(userActivity)

            const [ sql, params ] = capture(mySqlClientMock.query).last()

            expect(sql).to.startWith('INSERT INTO')
            expect(sql).to.containIgnoreSpaces('user_event_counts')
            expect(params).to.deep.equal([
                'slack-id',
                'I',
                6,
                23
            ])
            

            verify(mySqlClientMock.query(anyString(), anything())).once()

        })
    })

    describe('Create user event count table if not exists', () => {

        it('should execute a CREATE TABLE IF NOT EXISTS... statement on "user_event_counts" table without params', async () => {
            const mySqlClientMock = mock(MySqlClient)
            const mySqlClient = instance(mySqlClientMock)

            const unit = new UserActivityCountRepository(mySqlClient)
            
            when(mySqlClientMock.execute(anyString())).thenReturn(Promise.resolve())

            await unit.createTableIfNotExists()

            const [ sql ] = capture(mySqlClientMock.execute).last()

            expect(sql).to.startWith('CREATE TABLE IF NOT EXISTS')
            expect(sql).to.containIgnoreSpaces('user_event_counts')

            verify(mySqlClientMock.execute(anyString())).once()
        })
    })

    describe('query user activity distribution', () => {
        
        it('should execute a SELECT on "user_event_counts" with the slackId param', async () => {

            const mySqlClientMock = mock(MySqlClient)
            const mySqlClient = instance(mySqlClientMock)

            const unit = new UserActivityCountRepository(mySqlClient)
            
            when(mySqlClientMock.query(anyString(), anything())).thenReturn(Promise.resolve([]))
            
            const result = await unit.getUserActivityDistribution('slack-id')

            const [ sql, params ] = capture(mySqlClientMock.query).last()

            expect(sql).to.startWith('SELECT')
            expect(sql).to.containIgnoreSpaces('user_event_counts')
            expect(params[0]).be.equal('slack-id')

            verify(mySqlClientMock.query(anyString(), anything())).once()
        })
    })
})

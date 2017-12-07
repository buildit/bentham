import { toPromise } from '../../common/TestUtils';
import { expect } from 'chai';
import 'mocha';
import { UserActivityStatsEndpoint } from "../../../main/reads/endpoints/UserActivityStatsEndpoint";
import { UserActivityStatsService } from "../../../main/reads/services/UserActivityStatsService";
import { mock, instance, when, anyString, verify } from 'ts-mockito';

const report = [
    { dow: 0, hours: 0, event_count: 42 },
    { dow: 6, hours: 23, event_count: 1 }
]

const userActivityStatsServiceMock = mock(UserActivityStatsService)
const userActivityStatsService = instance(userActivityStatsServiceMock)

when(userActivityStatsServiceMock.getUserActivityDistribution(anyString())).thenReturn( Promise.resolve(report) )

const endpoint = new UserActivityStatsEndpoint(userActivityStatsService)

const _getUserActivityDistribution = (cb, e) => endpoint.getUserActivityDistribution(cb, e);

describe('User activity stats endpoint', () => {
    it('it should obtain the stats from the stat service and return success', async () => {
        const result = await toPromise(_getUserActivityDistribution, {
            headers: {
              'X-AccessToken': 'the-access-token'
            }
          });

        verify(userActivityStatsServiceMock.getUserActivityDistribution("the-access-token")).once();
          
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.equal(JSON.stringify(report));         
    })

    // TODO Test failure scenarios: missing access token header and invalid access token
})

import { toPromise } from '../../common/TestUtils';
import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, anyString, verify, anything } from 'ts-mockito';
import { IdentityEndpoint  } from "../../../main/slack/endpoints/IdentityEndpoint";
import { IdentityService } from "../../../main/common/services/IdentityService";



describe('Identity endpoint', () => {
    describe('Forget me', () => {
        it('should call forget user passing the access token and return no content, when the token is valid', async () => {
            const identityServiceMock = mock(IdentityService)
            const identityService = instance(identityServiceMock)
            
            when(identityServiceMock.forgetUser(anyString())).thenReturn(Promise.resolve())

            const endpoint = new IdentityEndpoint(identityService)           
            const _forgetMe = (cb, e) => endpoint.forgetMe(cb, e);

            const result = await toPromise(_forgetMe, {
                headers: {
                  'X-AccessToken': 'the-access-token'
                }
              });

            verify(identityServiceMock.forgetUser("the-access-token")).once();
              
            expect(result.statusCode).to.equal(204);            
        })
    })
    

    it('should return 400 when the access token header is missing', async () => {
        const identityServiceMock = mock(IdentityService)
        const identityService = instance(identityServiceMock)
        


        const endpoint = new IdentityEndpoint(identityService)           
        const _forgetMe = (cb, e) => endpoint.forgetMe(cb, e);

        const result = await toPromise(_forgetMe, {});

        expect(result.statusCode).to.equal(400);

        verify(identityServiceMock.forgetUser(anything())).never()
    })    

    it('should return 204 even when the access token is invalid', async () => {
        const identityServiceMock = mock(IdentityService)
        const identityService = instance(identityServiceMock)

        when(identityServiceMock.forgetUser(anyString())).thenReturn(Promise.reject('this token is invalid') )

        const endpoint = new IdentityEndpoint(identityService)           
        const _forgetMe = (cb, e) => endpoint.forgetMe(cb, e);

        const result = await toPromise(_forgetMe, {
            headers: {
              'X-AccessToken': 'invalid token'
            }
          });

        expect(result.statusCode).to.equal(204);

        verify(identityServiceMock.forgetUser('invalid token')).once()
    })     
})
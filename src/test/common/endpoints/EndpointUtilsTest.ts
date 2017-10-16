import { expect } from 'chai';
import 'mocha';
import { parseBody } from "../../../main/common/endpoints/EndpointUtils"
import { stringify as formStringify} from "querystring"

describe('Endpoint utils', () => {
    
    it('should parse JSON event body', () => {
        const event = {
            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              foo: 'bar',
              baz: '42'
            }),
          }

        const result = parseBody(event)

        expect(result).has.property('foo')
        expect(result.foo).is.equal('bar')
        expect(result).has.property('baz')
        
    } )


    it('should parse x-www-form-urlencoded body', () => {

        const event = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },

            body: formStringify({
              foo: 'bar',
              baz: '42'
            }),
          }

          const result = parseBody(event)
          
        expect(result).has.property('foo')
        expect(result.foo).is.equal('bar')
        expect(result).has.property('baz')          
    })
})
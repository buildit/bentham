import { callback, event, icarusAccessToken } from "../Api";
import { parse as parseEncodedForm } from "querystring"

/**
 Takes a Promise, and uses it to complete a callback.
 */
export const complete = <T>(cb: callback, p: Promise<T>) => {
  return p.then(res => cb(null, res), err => cb(null, {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(err)
  }));
};

export const response = (statusCode: number, bodyObject: any) => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(bodyObject)
})

export const parseBody = (evt: event ) => {
  const contentType = getHeaderCaseUnsensitive(evt, 'content-type')
  return ( contentType == 'application/x-www-form-urlencoded' ) ? parseEncodedForm(evt.body) : JSON.parse(evt.body) 
}
 
// Extract `X-AccessToken` header value, with case-insensitive header name 
export const xAccessTokenHeader = (evt:event): icarusAccessToken|undefined => {
  return getHeaderCaseUnsensitive(evt, 'X-AccessToken')
}

const getHeaderCaseUnsensitive = (evt: event, headerName:string): string|undefined => {
  const headerNames = Object.keys(evt.headers)
  .reduce( (keys, k) => { keys[k.toLowerCase()] = k; return keys}, {} )

  return evt.headers[headerNames[ headerName.toLowerCase() ]]
}
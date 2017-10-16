import { callback, event } from "../Api";
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
  const contentType = eventContentType(evt)
  return ( contentType == 'application/x-www-form-urlencoded' ) ? parseEncodedForm(evt.body) : JSON.parse(evt.body) 
}
 
const eventContentType = (evt: event):string|undefined => {
  // Headers mases are case insensitive :(
  const headerNames = Object.keys(evt.headers)
        .reduce( (keys, k) => { keys[k.toLowerCase()] = k; return keys}, {} )

  return evt.headers[headerNames['content-type']]
}
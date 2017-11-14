import axios from 'axios';
import { paths } from './core/config';

export const getUserToken = () => {
    const userToken = Vue.ls.get("user_token")
    return userToken
}
  
export const removeUserToken = () => {
	console.log('Clearing User Token')
    Vue.ls.remove("user_token")
}

export const setUserToken = (userToken) => {
	console.log('Updating User Token: ' + JSON.stringify(userToken))
    Vue.ls.set("user_token", userToken, 1000 * 60 * 60 * 24 * 3) // Expires every 72h
}
  
// Simple utility to POST data as a form
// based on https://www.npmjs.com/package/submitform
// Seriously, this is the clean way to post an object as a form?
// FIXME move to a common mobile
export const postForm = (url, data) => {
	if (typeof data !== 'object') {
		throw new TypeError('Expected an object');
	}
	console.log('POSTing to URI: ' + url, data)
	var form = document.createElement('form');
	form['action'] = url
	form['method'] = 'POST'
		form.style.display = 'none';
		form.appendChild(getInputs(data));

		document.body.appendChild(form);
		form.submit();
}

function getInputs(data) {
	var div = document.createElement('div');

	for (var el in data) {
		if (data.hasOwnProperty(el)) {
			var input = document.createElement('input');
			input.name = el;
			input.value = data[el];
			div.appendChild(input);
		}
	}
	return div;
}

export const integrationOauthComplete = ( oauthCompleteLambdaUri, authCode, oauthInitReturnUri) => {
	const icarusAccessToken = getUserToken().accessToken
	if( icarusAccessToken ) {
		console.log('Redeem Auth Code from: ' + oauthCompleteLambdaUri)
		return axios.post(oauthCompleteLambdaUri,{
			code: authCode,
			icarusAccessToken: icarusAccessToken,
			initReturnUri: oauthInitReturnUri,
		}).then((response) => {
			console.log('Success', response)
			setUserToken(response.data)
			return Promise.resolve(response.data)
		})
		.catch((err) => {
			console.log(err)
			throw err
		})
	} else {
		console.log('No Icarus Access Token')
		return Promise.resolve() 
	}
}
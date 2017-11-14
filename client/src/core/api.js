import axios from 'axios';
import { paths } from './config';

export const forgetMe = (token) => {
	return axios.delete(`${paths.lambdaPath}/forget-me`, {
		headers: {
			'X-AccessToken': token
		}
	}).then((response) => {
		console.log('Accounts have just been unlinked.');
	}).catch((err) => {
		console.log(err);
		throw err;
	});
}

/*
  Shared configuration parameters
  TODO To be externalised, eventually, somehow
*/
var lambdaPath = "https://ar8p8ai2u8.execute-api.eu-west-2.amazonaws.com/lorenzodev";
var siteBasePath =  window.location.href.substr(0, window.location.href.lastIndexOf("/"));

// Simple utility to POST data as a form
// based on https://www.npmjs.com/package/submitform
// TODO Seriously, this is the clean way to post an object as a form?
function postForm(url, data) {
	if (typeof data !== 'object') {
		throw new TypeError('Expected an object');
	}
  var form = document.createElement('form');
  form['action'] = url
  form['method'] = 'POST'
	form.style.display = 'none';
	form.appendChild(getInputs(data));

	document.body.appendChild(form);
	form.submit();
};

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
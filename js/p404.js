"use strict";

var path;
var pathElements =  document.getElementsByName('resources-path');
if (pathElements && pathElements.length) {
	path = pathElements[0].content;
} else {
	path = document.getElementsByTagName('head')[0].getAttribute('data-path');
}

// var path = document.getElementsByTagName('head')[0].getAttribute('data-path');
if (path.slice(-1) !== '/') path += '/';

require.config({
	baseUrl: path + 'js/modules',
	paths: {

	},
	shim: {

	}
});


require([
	'domReady'

	], function(
		domReady

	) {
	domReady(function () {









		
	});
});
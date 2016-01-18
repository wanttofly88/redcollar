define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {

	"use strict";

	var container;
	var numW = 9;
	var numH = 6;
	var shiftW = 100/9;
	var shiftH = 100/6;

	var elements = [];


	var _build = function() {
		var addLine = function(i) {
			var line = document.createElement('div');
			line.className = 'l';
			line.style.top = shiftH*i + '%';
			container.appendChild(line);
		}
		var addBar  = function(i) {
			var bar = document.createElement('div');
			bar.className = 'b';
			bar.style.left = shiftW*i + '%';
			container.appendChild(bar);
		}
		for (var i = 1; i <= numH; i++) {
			addLine(i);
		}
		for (var i = 1; i <= numW; i++) {
			addBar(i);
		}
	}

	var init = function() {
		container = document.getElementById('video-net');
		if (!container) return;

		_build();
	}

	return {
		init: init
	}
});
define(['dispatcher'], function(dispatcher) {

	"use strict";

	var idName = 'timer-id-';
	var idNum  = 1;

	var items = {}
	var container;
	var timeContainer;
	var active = false;

	var interval;

	var _handleTime = function() {
		var now      = new Date(); 
		var rusTime  = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours() + 3, now.getUTCMinutes(), now.getUTCSeconds());

		var d = new Date(rusTime);
		var hours   = d.getHours();
		var minutes = d.getMinutes();
		var hours24 = hours;
		var ampm = hours >= 12 ? 'pm' : 'am';

		var getActiveText = function(hours24) {
			for (var id in items) {
				if (items.hasOwnProperty(id)) {
					if (hours24 >= items[id].start && hours24 < items[id].stop) {
						if (active === id) return;
						active = id;

						container.innerHTML = items[id].text;
					}
				}
			}
		}

		if (!container || !timeContainer) return;

		hours = hours % 12;
		hours = hours ? hours : 12;

		if (hours < 10) {
			hours = '0' + hours;
		}
		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		timeContainer.innerHTML = hours + ':' + minutes + ' ' + ampm;

		getActiveText(hours24);
	}

	var _add = function(element) {
		var id    = element.getAttribute('data-id');
		var start = element.getAttribute('data-start');
		var stop  = element.getAttribute('data-stop');

		if (!start || !stop) {
			console.warn('data-stop or data-start attributes are missing');
			return;
		}

		start = parseInt(start);
		stop  = parseInt(stop);

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element,
			text: element.innerHTML,
			start: start,
			stop: stop
		}
	}

	var _handleMutate = function() {
		var elements  = document.getElementsByClassName('timer-item');

		container = document.getElementById('timer-view');
		timeContainer = document.getElementById('timer-time');

		if (!container || !timeContainer) return;

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i]);
		}

	}

	var init = function() {
		_handleMutate();

		interval = setInterval(_handleTime, 100);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
		});
	}

	return {
		init: init
	}
});
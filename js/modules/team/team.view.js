define(['dispatcher', 'utils'], function(dispatcher, utils) {

	"use strict";

	var items = [];
	var teamItems = {};

	var idName = 'team-id-';
	var idNum  = 1;

	var timer;
	var testNum = 0;
	var requestAnimationFrame;
	var frame = 0;

	var _handleMouseEnter = function() {
		var number = Math.floor(Math.random()*1) + 3;
		var to = Math.floor(Math.random()*500);

		var element = this.getElementsByClassName('img')[0];


		var shuffleArray = function(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
					array[i] = array[j];
					array[j] = temp;
			}
		}

		var build = function() {
			for (var i = 0; i < number; i++) {
				element.appendChild(items[i].img);
			}
			for (var i = 0; i < items.length; i++) {
				items[i].img.style.opacity = 0;
			}
		}

		var animationLoop = function(cur) {

			frame++;

			if (frame % 8 === 0) {
				items[cur].img.style.opacity = 1;
				if (items[cur - 1]) {
					items[cur - 1].img.style.opacity = 0;
				}

				cur++;
			}

			if (cur < number) {
				requestAnimationFrame(function() {
					animationLoop(cur);
				}, 60);
			}
			else {
				if (items[cur - 1]) {
					items[cur - 1].img.style.opacity = 0;
				}
			}
		}

		clearTimeout(timer);
		shuffleArray(items);

		if (number > items.length) {
			number = items.length;
		}

		build();

		timer = setTimeout(function() {
			animationLoop(0);
		}, Math.floor(Math.random()*500));
	}

	var _handleMouseLeave = function() {
		clearTimeout(timer);
	}

	var _add = function(element) {
		var src = element.getAttribute('data-src');
		var img;

		if (!src) {
			console.warn('data-src attribute is missing');
			return;
		}

		img = document.createElement('img');
		img.src = src;
		img.classList.add('hover-img');

		items.push({
			testNum: testNum,
			element: element,
			img: img
		});

		testNum++;
	}

	var _addTeam = function(items, element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			element: element
		}

		element.addEventListener('mouseenter', _handleMouseEnter);
		element.addEventListener('mouseleave', _handleMouseLeave);
	}

	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		var teamElements = document.getElementsByClassName('team-view');
		var elements = document.getElementsByClassName('dynamic-img');

		var check = function(items, element) {
			var found = false;
			for (var id in items) {
				if (items.hasOwnProperty(id)) {
					if (items[id].element === element) {
						found = true;
						break;
					}
				}
			}
			if (!found) {
				_addTeam(items, element);
			}
		}

		var backCheck = function(items, elements, item) {
			var element = item.element;
			var found   = false;

			for (var i = 0; i < elements.length; i++) {
				if (elements[i] === item.element) {
					found = true;
					break;
				}
			}

			if (!found) {
				_remove(items, item);
			}
		}

		items = [];

		if (!teamElements || !teamElements.length) return;
		if (!elements || !elements.length) return;

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i]);
		}

		for (var i = 0; i < teamElements.length; i++) {
			check(teamItems, teamElements[i]);
		}
		for (var id in teamItems) {
			if (teamItems.hasOwnProperty(id)) {
				backCheck(teamItems, teamElements, teamItems[id]);
			}
		}
	}

	var init = function() {
		_handleMutate();

		requestAnimationFrame = utils.getRequestAnimationFrame();

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
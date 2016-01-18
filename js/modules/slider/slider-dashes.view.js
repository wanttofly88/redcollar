define(['dispatcher'], function(dispatcher) {

	"use strict";


	var _handleChange = function() {
		var storeData = store.getData();
	}

	var _add = function(element) {
		var items = element.getElementsByClassName('item');
		var total = items.length;
		var h = 100/total;

		for (var i = 0; i < items.length; i++) {
			items[i].style.height = h + '%';
		}
	}

	var _handleMutate = function() {
		var elements;
		elements = document.getElementsByClassName('slider-dashes');

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i]);
		}
	}

	var init = function() {
		_handleMutate();

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
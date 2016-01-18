define(['dispatcher', 'svg-text/svg-text.store'], function(dispatcher, store) {

	"use strict";

	var items = {}

	var initialized = false;
	var svg;
	var container;


	var _addFilter = function(svg) {
		var xmlns  = "http://www.w3.org/2000/svg";
		var defs   = document.createElementNS(xmlns, 'defs');
		var filter = document.createElementNS(xmlns, 'filter');

		if (!svg) return;

		var g = svg.getElementsByTagName('g')[0];
	}

	var _handleChange = function(storeData) {
		storeData = store.getData();

		if (!container) return;
		console.log(container);

		if (storeData.items.hasOwnProperty('stage-svg-text') && storeData.items['stage-svg-text'].text !== '') {
			if (initialized) return;
			initialized = true;

			svg = container.getElementsByTagName('svg')[0];
			_addFilter(svg);
		}
	}


	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		container = document.getElementById('stage-svg-text');
		svg = false;

		initialized = false;
		if (!container) return;
	}

	var init = function() {
		_handleMutate();

		store.eventEmitter.subscribe(_handleChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleChange();
			}
		});
	}

	return {
		init: init
	}
});
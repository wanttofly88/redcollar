define(['dispatcher', 'scroll/scroll.store', 'scroll/direction.store'], function(dispatcher, store, dirStore) {

	"use strict";

	var currentPosition = false;
	var down = false;

	var _handleChange = function() {
		var storeData = store.getData();

		var top = storeData.top;

		if (top < 0) {
			top = 0;
		}

		if (currentPosition === false) {
			currentPosition = top;
		} else {
			if (down && currentPosition > top) {
				down = false;

				dispatcher.dispatch({
					type: 'direction-change',
					way: 'up'
				});
			} else if (!down && currentPosition < top) {
				down = true;

				dispatcher.dispatch({
					type: 'direction-change',
					way: 'down'
				});
			}
			currentPosition = top;
		}
	}

	var init = function() {

		_handleChange();
		store.eventEmitter.subscribe(_handleChange);
	}

	return {
		init: init
	}
});
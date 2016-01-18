define(['dispatcher', 'touch/touch.store', 'fastClick'], function(dispatcher, store, fastClick) {

	"use strict";

	var _handleChange = function() {
		var storeData = store.getData();
		if (storeData.isTouchDevice) {
			fastClick.attach(document.body);
		}
	}

	var init = function() {
		_handleChange();
	}

	return {
		init: init
	}
});
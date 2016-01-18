define(['dispatcher', 'preload/preload.store', 'images/images.store', 'video/video.store'], function(dispatcher, store, imagesStore, videoStore) {

	"use strict";

	var pageWrapper;
	var elements;
	var imgItems = {};
	var videoItems = {};
	var total = 0;
	var complete = false;

	var startTime;
	var minTimeout = 0;

	var idName = 'preload-image-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = store.getData();

		if (complete === storeData.complete) return;
		complete = storeData.complete;

		pageWrapper.classList.add('load-complete');
		pageWrapper.classList.add('load-complete-once');

		//for redcollar.digital
		dispatcher.dispatch({
			type: 'transition-step-2'
		});
	}

	var _loaded = function() {
		var delay;
		var currTime;

		currTime = Date.now();
		delay = currTime - startTime + minTimeout;

		if (delay < 0) delay = 0;

		setTimeout(function() {
			dispatcher.dispatch({
				type: 'preload-complete'
			});
		}, delay + 500);
	}

	var _handleImages = function() {
		var storeData = imagesStore.getData();
		var loaded = 0;

		var checkItem = function(item) {
			var storeItem;
			if (!storeData.items.hasOwnProperty(item.id)) return;
			if (item.loaded) return;
			storeItem = storeData.items[item.id];

			if (storeItem.loaded) {
				loaded++;
				item.loaded = true;
			}
		}

		for (var id in imgItems) {
			if (imgItems.hasOwnProperty(id)) {
				checkItem(imgItems[id]);
			}
		}

		if (loaded >= total) {
			_loaded();
		}
	}

	var _handleVideos = function() {
		var storeData = videoStore.getData();
		var loaded = 0;

		var checkItem = function(item) {
			var storeItem;
			if (!storeData.items.hasOwnProperty(item.id)) return;
			if (item.loaded) return;
			storeItem = storeData.items[item.id];
			if (storeItem.status !== 'not-ready') {
				loaded++;
				item.loaded = true;
			}
		}

		for (var id in videoItems) {
			if (videoItems.hasOwnProperty(id)) {
				checkItem(videoItems[id]);
			}
		}

		if (loaded >= total) {
			_loaded();
		}
	}

	var _add = function(element, items) {
		var id = element.getAttribute('data-preload-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-preload-id', id);
		}

		items[id] = {
			id: id,
			element: element,
			loaded: false
		}
	}

	var _handleMutate = function() {
		pageWrapper = document.querySelector('.page-wrapper');
		elements    = document.querySelectorAll('.wait-load-image');

		imgItems = {};
		videoItems = {};
		total  = 0;
		complete = false;

		pageWrapper.classList.remove('load-complete');
		dispatcher.dispatch({
			type: 'preload-reset'
		});

		total = elements.length;

		startTime = Date.now();

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i], imgItems);
		}

		elements = document.querySelectorAll('.wait-load-video');

		total += elements.length;

		for (var i = 0; i < elements.length; i++) {
			_add(elements[i], videoItems);
		}

		if (total === 0) {
			_loaded();
		}

	}

	var init = function() {
		_handleMutate();
		_handleChange();
		_handleImages();
		_handleVideos();

		store.eventEmitter.subscribe(_handleChange);
		imagesStore.eventEmitter.subscribe(_handleImages);
		videoStore.eventEmitter.subscribe(_handleVideos);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleChange();
				_handleImages();
				_handleVideos();
			}
		});
	}

	return {
		init: init
	}
});
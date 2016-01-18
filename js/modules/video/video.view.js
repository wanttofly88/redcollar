define(['dispatcher', 'video/video.store', 'utils', 'touch/touch.store'], function(dispatcher, store, utils, touch) {

	"use strict";

	var items = {}

	var idName = 'video-id-';
	var idNum  = 1;


	var _handleChange = function() {
		var storeData = store.getData();

		var checkItem = function(item) {
			var storeItem = storeData.items[item.id];
			if (!storeItem) {
				console.warn('item with id ' + item.id + ' is missing in store');
				return;
			}

			if (storeItem.status === item.status) return;
			item.status = storeItem.status;

			if (item.status === 'ready') {

				dispatcher.dispatch({
					type: 'video-play',
					me: 'video.view',
					id: id
				});
			}

			if (item.status === 'play') {
				item.element.play();
			}

			if (item.status === 'stop') {
				item.element.currentTime = 0;
				item.element.pause();
			}
		}

		for (var id in items) {
			checkItem(items[id]);
		}
	}

	var _supportsWebmVideo = function(video) {
		return video.canPlayType('video/webm; codecs="vp8, vorbis"');
	}
	var _supportsMp4Video = function(video) {
		return video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	}
	var _supportsOggVideo = function(video) {
		return video.canPlayType('video/ogg; codecs="theora, vorbis"');
	}

	var _add = function(items, element) {
		var id = element.getAttribute('data-id');
		var status = 'not-ready';
		var src, source;
		var dotIndex;

		// element.style.display = 'none';

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		src = element.getAttribute('data-src');
		dotIndex = src.lastIndexOf('.');
		if (dotIndex !== -1) {
			src = src.substring(0, dotIndex);
		} else {
			console.warn('invalid video source');
			return;
		}

		source = document.createElement('source');

		element.appendChild(source);

		if (_supportsWebmVideo(element)) {
			source.src = src + '.webm';
			source.type = 'video/webm';
		} else if (_supportsMp4Video(element)) {
			source.src = src + '.mp4';
			source.type = 'video/mp4';
		} else if (_supportsOggVideo(element)) {
			source.src = src + '.ogv';
			source.type = 'video/ogg';
		} else {
			return;
		}

		items[id] = {
			id: id,
			element: element,
			status: status
		}

		dispatcher.dispatch({
			type: 'video-add',
			id: id
		});

		element.addEventListener('canplaythrough', function() {
			// element.classList.add('visible');
			element.style.opacity = 1;
			dispatcher.dispatch({
				type: 'video-ready',
				id: id,
				me: 'video.view'
			});
		}, false);

		element.load();
	}

	var _remove = function(items, item) {
		delete items[item.id];

		dispatcher.dispatch({
			type: 'video-remove',
			id: item.id
		});
	}

	var _handleMutate = function() {
		var elements;

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
				_add(items, element);
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

		elements = document.getElementsByTagName('video');
		for (var i = 0; i < elements.length; i++) {
			check(items, elements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				backCheck(items, elements, items[id]);
			}
		}
	}

	var init = function() {
		_handleMutate();
		_handleChange();

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
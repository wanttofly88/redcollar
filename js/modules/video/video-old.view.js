define([
	'dispatcher', 
	'video/video.store',
	'utils'
], function(
	dispatcher, 
	store, 
	utils
) {

	"use strict";

	var items = {}

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
					me: 'main-video.view',
					id: id
				});
			}

			if (item.status === 'play') {
				item.video.play();
			}

			if (item.status === 'stop') {
				item.video.currentTime = 0;
				item.video.pause();
			}
		}

		for (var id in items) {
			checkItem(items[id]);
		}
	}

	function _supportsWebmVideo(video) {
		return video.canPlayType('video/webm; codecs="vp8, vorbis"');
	}
	function _supportsMp4Video(video) {
		return video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	}
	function _supportsOggVideo(video) {
		return video.canPlayType('video/ogg; codecs="theora, vorbis"');
	}

	var _add = function(video) {
		var id = video.id;
		var status = 'not-ready';
		var src, source;
		var dotIndex;

		if (!id) {
			console.warn('id attribute is missing');
			return;
		}

		src = video.getAttribute('data-src');
		dotIndex = src.lastIndexOf('.');
		if (dotIndex !== -1) {
			src = src.substring(0, dotIndex);
		} else {
			console.warn('invalid video source');
			return;
		}

		source = document.createElement('source');

		video.appendChild(source);

		if (_supportsWebmVideo(video)) {
			source.src = src + '.webm';
			source.type = 'video/webm';
		} else if (_supportsMp4Video(video)) {
			source.src = src + '.mp4';
			source.type = 'video/mp4';
		} else if (_supportsOggVideo(video)) {
			source.src = src + '.ogv';
			source.type = 'video/ogg';
		} else {
			return;
		}

		items[id] = {
			video: video,
			id: id,
			status: status
		}

		video.addEventListener('canplaythrough', function() {
			dispatcher.dispatch({
				type: 'video-ready',
				id: id,
				me: 'main-video.view'
			});
		}, false);

		video.load();
	}

	var _reset = function() {
		var elements = document.getElementsByTagName('video');
		items = {}

		for (var i = elements.length - 1; i >= 0; i--) {
			_add(elements[i]);
		}

		_handleChange();
	}

	var init = function() {

		var elements = document.getElementsByTagName('video');
		for (var i = elements.length - 1; i >= 0; i--) {
			_add(elements[i]);
		}

		_handleChange();
		store.eventEmitter.subscribe(_handleChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'total-reset') {
				setTimeout(_reset, 0);
			}
		});
	}

	return {
		init: init
	}
});
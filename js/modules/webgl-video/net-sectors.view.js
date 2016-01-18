define(['dispatcher', 'resize/resize.store', 'utils', 'THREE'], function(dispatcher, resizeStore, utils, THREE) {

	"use strict";

	var ww, wh;
	var numX  = 9;
	var numY  = 6;
	var total = numX * numY;

	var container;

	var sectorsArray = [];

	var _handleResize = function() {
		var storeData = resizeStore.getData();
		ww = storeData.width;
		wh = storeData.height;
	}

	var _handleMouse = function() {

		window.addEventListener('mousemove', function(e) {
			var sectorX = Math.floor(e.offsetX / ww * numX);
			var sectorY = Math.floor(e.offsetY / wh * numY);
			var sector;

			if (sectorX < 0) sectorX = 0;
			if (sectorY < 0) sectorY = 0;
			if (sectorX > numX - 1) sectorX = numX - 1;
			if (sectorY > numY - 1) sectorY = numY - 1;

			sector = sectorX + sectorY * numX;
		});
	}

	var _fillArray = function() {

		var runOpacityAnimation = function(i) {
			var tween = new utils.Tween(0, 1, 0.6, false, function(x) {
				sectorsArray[i].x = x;
				dispatcher.dispatch({
					type: 'net-sectors-change',
					sectors: sectorsArray
				});
			});

			setTimeout(function() {
				tween.animate();

			}, Math.random*500 + 100);
		}

		for (var i = 0; i < total; i++) {
			sectorsArray[i] = new THREE.Vector2();

			runOpacityAnimation(i);
		}

		console.dir(sectorsArray);
	}

	var init = function() {
		var storeData;
		container = document.getElementById('webgl-container');

		if (!container) return;

		_fillArray();

		_handleResize();
		_handleMouse();

		resizeStore.eventEmitter.subscribe(_handleResize);
	}

	return {
		init: init
	}
});
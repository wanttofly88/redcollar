define(['dispatcher', 'menu/menu.store', 'page-name/page-name.store', 'TweenMax'], function(dispatcher, store, pageNameStore, TweenMax) {

	"use strict";
	var menuBtn;
	var b1, b2, b3;
	var tween1, tween2, tween3;

	var _handleChange = function(storeData) {
		var pageNameActive = pageNameStore.getData().containerActive;
		storeData = store.getData();

		if (!menuBtn) return;

		if (storeData.active) {
			menuBtn.classList.add('active');

			// tween1 = TweenMax.to(b1, 0.2, {
			// 	y: '9px',
			// 	z: '1px',
			// 	rotation: '-135deg'
			// });
			// tween3 = TweenMax.to(b3, 0.2, {
			// 	y: '-9px',
			// 	z: '1px',
			// 	rotation: '-225deg'
			// });

			b1.classList.add('rotated');
			b3.classList.add('rotated');
			if (!pageNameActive) {
				tween2 = TweenMax.to(b2, 0.2, {
					opacity: 0
				});
			}
		} else {
			menuBtn.classList.remove('active');

			// tween1 = TweenMax.to(b1, 0.2, {
			// 	y: '0px',
			// 	z: '1px',
			// 	rotation: '0deg'
			// });
			// tween3 = TweenMax.to(b3, 0.2, {
			// 	y: '0',
			// 	z: '1px',
			// 	rotation: '0deg'
			// });
			b1.classList.remove('rotated');
			b3.classList.remove('rotated');
			if (!pageNameActive) {
				tween2 = TweenMax.to(b2, 0.2, {
					opacity: 1
				});
			}
		}
	}

	var _handleMutate = function() {
		menuBtn = document.getElementById('menu-btn');
		if (!menuBtn) {
			console.warn('menu-btn element is missing');
			return;
		}
		b1 = menuBtn.getElementsByClassName('b1')[0];
		b2 = menuBtn.getElementsByClassName('b2')[0];
		b3 = menuBtn.getElementsByClassName('b3')[0];


		menuBtn.addEventListener('click', function(e) {
			dispatcher.dispatch({
				type: 'menu-toggle'
			});
		});
	}

	var init = function() {
		_handleMutate();
		_handleChange();

		store.eventEmitter.subscribe(_handleChange);
	}

	return {
		init: init
	}
});
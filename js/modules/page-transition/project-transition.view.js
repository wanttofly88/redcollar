define(['dispatcher', 'TweenMax', 'page-transition/page-transition.store'], function(dispatcher, TweenMax, store) {

	"use strict";

	var projectOverlay;
	var overlayBg;
	var imgContainer;
	var body;
	var items = {}
	var imgs  = {}
	var activeImg  = false;
	var activeItem = false;

	var idName = 'project-section-id-';
	var idNum  = 1;

	var id = false;
	var animation = false;
	var transitionDelay;

	var _preventScroll = function(e) {
		e.preventDefault();
	}

	var _animateStep1 = function(e) {
		var item;
		var tl;

		//здесь мы получаем id и анимацию чтобы потом их проверять на следующих этапах
		id = e.id;
		animation = e.animation;
		if (animation !== 'project') return;

		dispatcher.dispatch({
			type: 'words-scroll-disable'
		});

		tl = new TimelineLite();

		if (!items.hasOwnProperty(id)) {
			console.warn('project-section with id ' + id + ' is missing');
			return;
		}

		dispatcher.dispatch({
			type: 'project-open',
			id: id
		});

		item = items[id];

		tl.to(item.element, 0.5, {
			onStart: function() {
				overlayBg.style.background = item.color;

				body.classList.add('prevent-scroll');
				body.addEventListener('touchmove', _preventScroll);

				dispatcher.dispatch({
					type: 'page-name-change',
					id: false
				});

				if (activeImg && imgs.hasOwnProperty(activeImg)) {
					imgs[activeImg].element.classList.remove('active');
				}
				activeImg = item.id;
				if (activeImg && imgs.hasOwnProperty(activeImg)) {
					imgs[activeImg].element.classList.add('active');
				}

				dispatcher.dispatch({
					type: 'svg-text-change',
					id:   'project-preloader-text-bg',
					text: item.text
				});
				dispatcher.dispatch({
					type: 'svg-text-change',
					id:   'project-preloader-text-fg',
					text: item.text
				});
				dispatcher.dispatch({
					type: 'svg-text-change',
					id:   'project-preloader-text-pl',
					text: item.text
				});
				dispatcher.dispatch({
					type:    'scroll-to',
					element: item.element,
					speed:   0.5
				});

				item.element.classList.add('project-loading');
			}
		});

		tl.to(projectOverlay, 1, { //1.2s animation
			onStart: function() {
				var svgContainer = document.getElementById('project-preloader-text-fg');
				var paths;
				var pathLength;
				var rand;

				if (!svgContainer) {
					console.warn('project-preloader-text-fg is missing');
					return;
				}

				paths = svgContainer.getElementsByTagName('path');
				projectOverlay.style.display = 'block';

				setTimeout(function() {
					for (var i = 0; i < paths.length; i++) {
						pathLength = paths[i].getTotalLength();
						paths[i].setAttribute('stroke-dashoffset', pathLength/1.5);
						paths[i].setAttribute('stroke-dasharray',  pathLength/2 + ',' + 0 + ',' + pathLength/2 + ',' + 0);
					}
				}, 0);

			},
			onComplete: function() {
				dispatcher.dispatch({
					type: 'transition-step-1',
					animation: 'project'
				});
			},
			opacity: 1
		});
	}

	var _animateStep2 = function() {
		var tl;
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (animation !== 'project') return;

		tl = new TimelineLite();

		tl.to(window, 1.3, { //0.3 transition + 1s delay
			onStart: function() {
				var svgContainer = document.getElementById('project-preloader-text-pl');
				var paths;
				var num;
				var delay;

				if (!svgContainer) {
					console.warn('project-preloader-text-pl is missing');
					return;
				}

				window.scrollTo(0, 0);

				paths = svgContainer.getElementsByTagName('path');
				num   = paths.length;
				delay = 1/num;

				for (var i = paths.length - 1; i >= 0; i--) {
					paths[i].style[transitionDelay] = i*delay + 's';
					paths[i].style.opacity = 1;
				}
			}
		});

		tl.to(window, 0.6, {
			onStart: function() {
				imgContainer.classList.add('fs');
				pw.classList.remove('transition-animation-complete');
			},
			onComplete: function() {
				if (items.hasOwnProperty(id)) {
					items[id].element.classList.remove('project-loading');
				}
				dispatcher.dispatch({
					type: 'transition-step-2',
					animation: 'project'
				});
				dispatcher.dispatch({
					type: 'words-scroll-enable'
				});
			}
		}, '-=0.8');
	}

	var _animateStep3 = function() {
		var tl;
		var storeData = store.getData();
		var scheme    = storeData.scheme;
		var pageName  = storeData.pageNameId;
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (animation !== 'project') return;

		tl = new TimelineLite();
		dispatcher.dispatch({
			type: 'page-name-change',
			id:   pageName
		});
		dispatcher.dispatch({
			type:  'page-color-change',
			color: scheme
		});

		tl.to(projectOverlay, 0.6, {
			opacity: 0,
			onStart: function() {
				pw.classList.add('transition-animation-complete');
			},
			onComplete: function() {
				var svgContainer = document.getElementById('project-preloader-text-fg');
				var paths;
				var pathLength;

				if (!svgContainer) {
					console.warn('project-preloader-text-fg is missing');
					return;
				}

				paths = svgContainer.getElementsByTagName('path');
				projectOverlay.style.display = 'block';

				for (var i = 0; i < paths.length; i++) {
					pathLength = paths[i].getTotalLength();
					paths[i].setAttribute('stroke-dashoffset', 0);
					paths[i].setAttribute('stroke-dasharray',  0 + ',' + pathLength/2 + ',' + 0 + ',' + pathLength/2);
				}


				svgContainer = document.getElementById('project-preloader-text-pl');
				paths = svgContainer.getElementsByTagName('path');

				if (!svgContainer) {
					console.warn('project-preloader-text-pl is missing');
					return;
				}
				for (var i = paths.length - 1; i >= 0; i--) {
					paths[i].style[transitionDelay] = 0 + 's';
					paths[i].style.opacity = 0;
				}

				projectOverlay.style.display = 'none';
				body.classList.remove('prevent-scroll');
				body.removeEventListener('touchmove', _preventScroll);
				imgContainer.classList.remove('fs');

				if (activeImg && imgs.hasOwnProperty(activeImg)) {
					imgs[activeImg].element.classList.remove('active');
					activeImg = false;
				}

				animation = false;
				dispatcher.dispatch({
					type: 'transition-step-reset',
					animation: false
				});
			}
		});
	}


	var _add = function(items, element) {
		var id    = element.getAttribute('data-id');
		var color = element.getAttribute('data-color') || false;
		var text  = element.getAttribute('data-text')  || false;

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
			color: color,
			text:  text,
			element: element
		}
	}

	var _remove = function(items, item) {
		delete items[item.id];
	}

	var _handleMutate = function() {
		var elements;
		var imgElements;

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

		imgContainer   = document.getElementById('project-preloader-img');
		projectOverlay = document.getElementById('project-preloader');
		
		if (!projectOverlay) {
			console.warn('project-overlay elemeni is missing!');
			return;
		}

		overlayBg = projectOverlay.getElementsByClassName('bg')[0];

		if (!imgContainer) {
			console.warn('project-preloader-img is missing');
			return;
		}

		elements = document.getElementsByClassName('project-preview');
		for (var i = 0; i < elements.length; i++) {
			check(items, elements[i]);
		}
		for (var id in items) {
			if (items.hasOwnProperty(id)) {
				backCheck(items, elements, items[id]);
			}
		}

		imgElements = document.getElementsByClassName('project-preload-img');
		for (var i = 0; i < imgElements.length; i++) {
			check(imgs, imgElements[i]);
		}
		for (var id in imgs) {
			if (imgs.hasOwnProperty(id)) {
				backCheck(imgs, imgElements, imgs[id]);
			}
		}
	}

	var _handle = function() {
		var storeData = store.getData();
		if (storeData.step1ready === true && storeData.step2ready === false) {
			_animateStep2();
		}
		if (storeData.step1ready === true && storeData.step2ready === true) {
			_animateStep3();
		}
	}

	var init = function() {
		_handleMutate();

		body = document.getElementsByTagName('body')[0];

		transitionDelay = Modernizr.prefixed('transition-delay');

		_handle();
		store.eventEmitter.subscribe(_handle);


		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}

			if (e.type === 'link-animation-start') {
				_animateStep1(e);
			}
		});
	}

	return {
		init: init
	}
});
define(['dispatcher', 'TweenMax', 'page-transition/page-transition.store', 'utils'], function(dispatcher, TweenMax, store, utils) {

	"use strict";

	var projectOverlay;
	var overlayBg;
	var imgContainer;
	var body;
	var imgs  = {}
	var activeImg  = false;

	var idName = 'project-close-id-';
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
		var home;
		var color;
		var text;

		//здесь мы получаем id и анимацию чтобы потом их проверять на следующих этапах
		animation = e.animation;
		if (animation !== 'close') return;

		tl = new TimelineLite();

		home  = document.getElementsByClassName('home')[0];
		id    = home.getAttribute('data-id');
		color = home.getAttribute('data-color');
		text  = home.getAttribute('data-text');

		if (!id) {
			console.warn('data-id attribute is missing');
			return;
		}
		if (!imgs.hasOwnProperty(id)) {
			console.warn('prelod-image with id ' + id + ' is missing');
			return;
		}

		tl.to({}, 0.5, { //0.5 на скролл
			onStart: function() {
				overlayBg.style.background = color;
				body.classList.add('prevent-scroll');
				body.addEventListener('touchmove', _preventScroll);

				dispatcher.dispatch({
					type: 'words-scroll-disable'
				});

				dispatcher.dispatch({
					type: 'page-name-change',
					id: false
				});

				dispatcher.dispatch({
					type: 'svg-text-change',
					id:   'project-preloader-text-pl',
					text: text
				});
				
				dispatcher.dispatch({
					type: 'scroll-to',
					speed: 0.5,
					position: 0
				});

				if (activeImg && imgs.hasOwnProperty(activeImg)) {
					imgs[activeImg].element.classList.remove('active');
				}
				activeImg = id;
				if (activeImg && imgs.hasOwnProperty(activeImg)) {
					imgs[activeImg].element.classList.add('active');
				}

				imgContainer.classList.add('fs-back');
			}
		});

		tl.to(projectOverlay, 0.5, {
			onStart: function() {
				var svgContainer = document.getElementById('project-preloader-text-pl');
				var paths = svgContainer.getElementsByTagName('path');

				projectOverlay.style.display = 'block';

				for (var i = paths.length - 1; i >= 0; i--) {
					paths[i].style[transitionDelay] = 0 +'s';
					paths[i].style.opacity = 1;
				}
			},
			opacity: 1,
			onComplete: function() {
				dispatcher.dispatch({
					type: 'transition-step-1',
					animation: 'close'
				});
			}
		});
	}

	var _animateStep2 = function() {
		var tl;
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (animation !== 'close') return;
		tl = new TimelineLite();

		tl.to({}, 0.6, {
			onStart: function() {
				pw.classList.remove('transition-animation-complete');
				imgContainer.classList.remove('fs-back');
				imgContainer.classList.add('emulate-project');
			},
			onComplete: function() {
				dispatcher.dispatch({
					type: 'transition-step-2',
					animation: 'close'
				});
			}
		})
	}

	var _animateStep3 = function() {
		var tl;
		var storeData = store.getData();
		var scheme    = storeData.scheme;
		var pageName  = storeData.pageNameId;
		var pw = document.getElementsByClassName('page-wrapper')[0];

		if (animation !== 'close') return;

		tl = new TimelineLite();
		dispatcher.dispatch({
			type: 'page-name-change',
			id:   pageName
		});
		dispatcher.dispatch({
			type:  'page-color-change',
			color: scheme
		});

		tl.to({}, 1.2, {
			onStart: function() {
				var projects = document.getElementsByClassName('project-preview');
				var offset = false;

				for (var i = 0; i < projects.length; i++) {
					if (projects[i].getAttribute('data-id') === id) {
						offset = utils.offset(projects[i]).top;
					}
				}

				if (!offset) {
					console.warn('project with id ' + id + ' is missing');
					return;
				}

				window.scrollTo(0, offset);

				dispatcher.dispatch({
					type: 'words-scroll-enable'
				});
			}
		});
		tl.to(projectOverlay, 0.6, {
			opacity: 0,
			onStart: function() {
				pw.classList.add('transition-animation-complete');
			},
			onComplete: function() {
				var svgContainer = document.getElementById('project-preloader-text-pl');
				var paths = svgContainer.getElementsByTagName('path');

				for (var i = paths.length - 1; i >= 0; i--) {
					paths[i].style[transitionDelay] = 0 +'s';
					paths[i].style.opacity = 0;
				}

				projectOverlay.style.display = 'none';
				body.classList.remove('prevent-scroll');
				body.removeEventListener('touchmove', _preventScroll);
				imgContainer.classList.remove('emulate-project');

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
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
		}

		items[id] = {
			id: id,
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
			console.warn('project-overlay element is missing!');
			return;
		}

		overlayBg = projectOverlay.getElementsByClassName('bg')[0];

		if (!imgContainer) {
			console.warn('project-preloader-img is missing');
			return;
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
"use strict";

var path;
var pathElements =  document.getElementsByName('resources-path');
if (pathElements && pathElements.length) {
	path = pathElements[0].content;
} else {
	path = document.getElementsByTagName('head')[0].getAttribute('data-path');
}

// var path = document.getElementsByTagName('head')[0].getAttribute('data-path');
if (path.slice(-1) !== '/') path += '/';

require.config({
	baseUrl: path + 'js/modules',
	paths: {
		skrollr: '../libs/skrollr',
		THREE: '../libs/three-with-composer',
		// TimelineLite: '../libs/TimelineLite',
		TweenMax: '../libs/TweenMax',
		swipe: '../libs/swipe',
		fastClick: '../libs/fstClick'
		// pixi: '../libs/pixi'
	},
	shim: {
		THREE: {
			exports: 'THREE'
		}
	}
});


require([
	'domReady',
	'resize/vhUnits.view',
	'resize/vhMinUnits.view',
	'images/images.view',
	'resize/element-resize.view',
	'resize/ios-fix.view',
	'touch/touch.view',

	'router/links.view',
	'router/fetch.view',
	'router/history.view',
	'router/scroll-load.view',
	'page-transition/project-transition.view',
	'page-transition/close-transition.view',
	'page-transition/menu-transition.view',
	'page-transition/simple-transition.view',

	'preload/preload.view',
	'trigger/trigger.view',
	'trigger/scroll-trigger.view',

	'form/form.view',
	'form/form-focus.view',
	'form/form-responce.view',
	'sidenav/sidenav.view',
	'sidenav/sidenav-hide.view',
	'slider/slider.view',
	'slider/slider-arrows.view',
	'slider/slider-slides.view',
	'slider/slider-controls.view',
	'slider/slider-dashes.view',

	// 'synthetic-scroll/synthetic-scroll.view',
	'synthetic-scroll/btn-scroll.view',
	'parallax/parallax.view',
	'parallax/simple-parallax.view',
	'menu/menu.view',
	'menu/menu-hover.view',
	'menu/menu-btn.view',
	'header/header-color.view',
	'svg-text/svg-text-init.view',
	'svg-text/svg-text-reposition.view',
	'svg-text/svg-text.view',
	'svg-text/svg-text-fallback.view',
	// 'svg-text/svg-displacement.view',

	'stage-text/stage-text-scroll.view',
	'stage-text/stage-text-timer.view',
	'stage-color/stage-color.view',
	// 'stage-color/stage-color-scroll.view',
	'decor/group-hover.view',
	'decor/project-hover.view',
	// 'decor/project-h2.view',
	'decor/team-align.view',
	'page-name/page-name.view',
	'page-name/page-name-scroll.view',

	'timer/timer.view',
	'team/team.view',
	'share/share.view',

	'video/video.view',
	'webgl/webgl-text.view',
	'webgl/texture.view',
	'webgl/webgl-video.view'
	// 'webgl-gradient/webgl-gradient.view'
	// 'webgl/webgl.view',
	// 'webgl/helper.view',
	// 'webgl/net-sectors.view'

	], function(
		domReady,
		vhUnits,
		vhMinUnits,
		images,
		resizeElement,
		iosFix,
		touch,

		links,
		fetch,
		history,
		scrollLoad,
		projectTransition,
		closeTransition,
		menuTransition,
		simpleTransition,

		preloadView,
		triggerView,
		scrollTrigger,

		form,
		formFocus,
		formResponce,
		sidenav,
		sidenavHide,
		slider,
		sliderArrows,
		sliderSlides,
		sliderControls,
		sliderDashes,

		// synthScroll,
		btnScroll,
		parallaxView,
		simpleParallax,
		menu,
		menuHover,
		menuBtn,
		headerColor,
		svgTextInit,
		svgTextReposition,
		svgTextView,
		svgTextFallback,
		// svgDisplacement,
		stageTextScroll,
		stageTextTimer,
		stageColorView,
		// stageColorScroll,
		groupHover,
		projectHover,
		// projectH2,
		teamAlign,
		pageName,
		pageNameScroll,

		timer,
		team,
		share,

		videoView,
		webGLText,
		texture,
		webGLVideo
		// webglGradient
		// webgl,
		// helper,
		// netSectors

	) {
	domReady(function () {
		vhUnits.init();
		vhMinUnits.init();
		images.init();
		resizeElement.init();
		// iosFix.init();
		touch.init();

		links.init();
		fetch.init();
		history.init();
		scrollLoad.init();
		projectTransition.init();
		closeTransition.init();
		menuTransition.init();
		simpleTransition.init();

		form.init();
		formFocus.init();
		formResponce.init();
		sidenav.init();
		sidenavHide.init();
		slider.init();
		sliderArrows.init();
		sliderSlides.init();
		sliderControls.init();
		sliderDashes.init();

		preloadView.init();
		triggerView.init();
		scrollTrigger.init();

		// synthScroll.init();
		btnScroll.init();
		parallaxView.init();
		simpleParallax.init();
		menu.init();
		menuHover.init();
		menuBtn.init();
		headerColor.init();
		svgTextInit.init();
		svgTextReposition.init();
		svgTextView.init();
		svgTextFallback.init();
		// svgDisplacement.init();
		stageTextScroll.init();
		stageTextTimer.init();
		stageColorView.init();
		// stageColorScroll.init();
		groupHover.init();
		projectHover.init();
		//projectH2.init();
		teamAlign.init();
		pageName.init();
		pageNameScroll.init();

		timer.init();
		team.init();
		share.init();

		videoView.init();
		webGLText.init();
		texture.init();
		webGLVideo.init();
		// webglGradient.init();
		// webgl.init();
		// helper.init();
		// netSectors.init();
	});
});
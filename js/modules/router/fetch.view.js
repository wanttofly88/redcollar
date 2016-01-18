define([
	'dispatcher', 
	'router/router.store', 
	'page-transition/page-transition.store', 
	'utils'
], function(
	dispatcher, 
	routerStore, 
	transitionsStore, 
	utils
) {
	"use strict";

	var idName = 'replaceable-id-';
	var idNum  = 1;

	var replaceable = {};
	var responce = false;


	//step1
	var _handleRouteChange = function(storeData) {
		storeData = routerStore.getData();

		if (!storeData.href) return;

		utils.ajax.get(storeData.href, {}, function(rs) {
			responce = rs;

			dispatcher.dispatch({
				type: 'transition-step-1'
			});
		}, true);
	}

	//step2
	var _replace = function() {
		var div;
		var newContainers = [];
		var header, home, pageNames, project;
		var color  = 'ffffff';
		var text   = '';
		var scheme = 'light';
		var projectText = '';
		var pageNameId = false;
		var title, titleValue;

		var _replaceContainer = function(newContainer) {
			var id = newContainer.getAttribute('data-id');
			if (!id) {
				console.warn('data-id attribute is missing');
				return;
			}

			if (!replaceable.hasOwnProperty(id)) {
				console.warn('container with id ' + id + ' is missing');
				return;
			}
			replaceable[id].conatainer.innerHTML = newContainer.innerHTML;
		}

		if (!responce) return;

		div = document.createElement('div');

		div.innerHTML = responce;
		newContainers = div.getElementsByClassName('replaceable');
		header     = div.getElementsByTagName('header')[0];
		pageNames  = div.getElementsByClassName('page-name');
		home       = div.getElementsByClassName('home')[0];
		project    = div.getElementsByClassName('project-preview');
		title      = div.getElementsByTagName('title')[0];
		titleValue = title.innerHTML;

		document.title = titleValue;


		if (!project || !project.length) {
			projectText = '';
		} else {
			project = project[0];
			projectText = project.getAttribute('data-text');
		}

		if (!header) {
			console.warn('header element is missing');
		}
		if (!pageNames || !pageNames.length) {
			console.warn('page-names elements are missing');
		}
		if (!home) {
			console.warn('home element is missing');
		}

		for (var i = 0; i < pageNames.length; i++) {
			if (pageNames[i].classList.contains('active')) {
				pageNameId = pageNames[i].getAttribute('data-id');
			}
		}

		if (header.classList.contains('light')) {
			scheme = 'light';
		} else if (header.classList.contains('dark')) {
			scheme = 'dark';
		}

		color = home.getAttribute('data-color');
		text  = home.getAttribute('data-text');

		for (var i = 0; i < newContainers.length; i++) {
			_replaceContainer(newContainers[i]);
		}


		setTimeout(function() {
			dispatcher.dispatch({
				type: 'transition-step-2',
				scheme: scheme,
				pageNameId: pageNameId,
				text: text,
				projectText: projectText,
				color: color
			});
			dispatcher.dispatch({
				type: 'mutate'
			})
		}, 20);
	}

	//step3
	var _reset = function() {
		responce = false;
	}

	var _add = function(conatainer) {
		var id = conatainer.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			conatainer.setAttribute('data-id', id);
		}

		replaceable[id] = {
			id: id,
			conatainer: conatainer
		}
	}

	var _handleSteps = function() {
		var storeData = transitionsStore.getData();
		if (storeData.step1ready === true && storeData.step2ready === false) {
			_replace();
		}
		if (storeData.step1ready === true && storeData.step2ready === true) {
			_reset();
		}
	}

	var _handleMutate = function() {
		var containers = document.getElementsByClassName('replaceable');
		for (var i = 0; i < containers.length; i++) {
			_add(containers[i]);
		}
	}

	var init = function() {
		_handleMutate();
		transitionsStore.eventEmitter.subscribe(_handleSteps);
		routerStore.eventEmitter.subscribe(_handleRouteChange);
	}

	return {
		init: init
	}
});
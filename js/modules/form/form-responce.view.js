define(['dispatcher'], function(dispatcher) {

	"use strict";

	var items = {}

	var idName = 'responce-id-';
	var idNum  = 1;


	var _handleChange = function(e) {
		var id;
		var inner;

		if (e.response.hasOwnProperty('response') && e.response.response !== '') {
			if (!items.hasOwnProperty(e.id)) return;

			inner = items[e.id].element.getElementsByClassName('responce-inner');

			if (e.response.status === 'success') {
				inner.innerHTML = e.response.response;
				items[e.id].element.classList.remove('status-error');
				items[e.id].element.classList.add('status-success');
				items[e.id].element.classList.add('active');
			}
			if (e.response.status === 'error') {
				inner.innerHTML = e.response.response;
				items[e.id].element.classList.add('status-error');
				items[e.id].element.classList.remove('status-success');
				items[e.id].element.classList.add('active');
			}
		} else {
			if (!items.hasOwnProperty(e.id)) return;
			inner.innerHTML = '';
			items[e.id].element.classList.remove('active');
		}

		if (e.type === 'ajax-form-reset') {
			if (!items.hasOwnProperty(e.id)) return;
			inner.innerHTML = '';
			items[e.id].element.classList.remove('active');
		}
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


		elements = document.getElementsByClassName('view-form-response');
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

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
			if (e.type === 'ajax-form-submit') {
				_handleChange(e);
			}
		});
	}

	return {
		init: init
	}
});
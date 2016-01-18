define(['dispatcher', 'popup/popup.store'], function(dispatcher, popupStore) {

	"use strict";

	var idName = 'form-dialog-id-';
	var idNum  = 1;

	var dialogPopup;
	var textContainer;

	var _handleChange = function() {
		var id;
		var storeData = popupStore.getData();
		var delay = 0;

		if (e.type === 'ajax-form-submit') {
			if (e.response.hasOwnProperty('dialog') && e.response.dialog !== '') {

				if (storeData.active === 'dialog-popup') {
					dispatcher.dispatch({
						type: 'popup-close-all'
					});
					delay = 400;
				} else {
					delay = 0;
				}

				setTimeout(function() {
					if (!dialogPopup || !textContainer) return;
					if (e.response.status === 'success') {
						textContainer.innerHTML = e.response.dialog;
						dialogPopup.classList.remove('status-error');
						dialogPopup.classList.add('status-success');
					}

					if (e.response.status === 'error') {
						textContainer.innerHTML = e.response.dialog;
						dialogPopup.classList.add('status-error');
						dialogPopup.classList.remove('status-success');
					}

					dispatcher.dispatch({
						type: 'popup-open',
						id:   'dialog-popup'
					});
				}, delay);
			}
		}
	}

	var _add = function(element) {
		var id = element.getAttribute('data-id');

		if (!id) {
			id = idName + idNum;
			idNum++;
			element.setAttribute('data-id', id);
		}
	}

	var _handleMutate = function() {
		dialogPopup = document.getElementById('dialog-popup');
		textContainer    = document.getElementById('dialog-popup-text');
	}

	var init = function() {
		_handleMutate();


		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
			if (e.type === 'ajax-form-submit') {
				_handleChange();
			}
		});
	}

	return {
		init: init
	}
});
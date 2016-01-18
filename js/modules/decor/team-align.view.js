define(['dispatcher', 'resize/breakpoint-team.store'], function(dispatcher, bpStore) {

	"use strict";

	var container;
	var elements;
	var total;
	var last;

	var _align = function() {
		var storeData = bpStore.getData();
		var bpName = storeData.breakpoint.name;

		var alignElement = function(element, i) {
			if (bpName === 'desktop') {
				last = total % 5;

				if (i > total - last - 1) {
					if (last === 2) {
						if (i % 5 === 0) {
							element.style.top = '50px';
						}
						if (i % 5 === 1) {
							element.style.top = '0px';
						}
					}
					if (last === 3) {
						if (i % 5 === 0) {
							element.style.top = '50px';
						}
						if (i % 5 === 1) {
							element.style.top = '0px';
						}
						if (i % 5 === 2) {
							element.style.top = '25px';
						}
					}
					if (last === 4) {
						if (i % 5 === 0) {
							element.style.top = '0px';
						}
						if (i % 5 === 1) {
							element.style.top = '50px';
						}
						if (i % 5 === 2) {
							element.style.top = '0px';
						}
						if (i % 5 === 3) {
							element.style.top = '25px';
						}
					}
				} else {
					if (i % 5 === 0) {
						element.style.top = '0px';
					} else if (i % 5 === 1) {
						element.style.top = '50px';
					} else if (i % 5 === 2) {
						element.style.top = '0px';
					} else if (i % 5 === 3) {
						element.style.top = '25px';
					} else if (i % 5 === 4) {
						element.style.top = '0px';
					} 
				}
			}
			if (bpName === 'tablet2') {
				last = total % 4;
				if (i > total - last - 1) {
					if (last === 3) {
						if (i % 4 === 0) {
							element.style.top = '50px';
						}
						if (i % 4 === 1) {
							element.style.top = '0px';
						}
						if (i % 4 === 2) {
							element.style.top = '25px';
						}
					}
					if (last === 2) {
						if (i % 4 === 0) {
							element.style.top = '25px';
						}
						if (i % 4 === 1) {
							element.style.top = '0px';
						}
					}
				} else {
					if (i % 4 === 0) {
						element.style.top = '0px';
					} else if (i % 4 === 1) {
						element.style.top = '50px';
					} else if (i % 4 === 2) {
						element.style.top = '0px';
					} else if (i % 4 === 3) {
						element.style.top = '25px';
					} 
				}
			}
			if (bpName === 'tablet1') {
				last = total % 3;
				if (i > total - last - 1) {
					if (last === 2) {
						if (i % 3 === 0) {
							element.style.top = '25px';
						}
						if (i % 3 === 1) {
							element.style.top = '0px';
						}
					}
				} else {
					if (i % 3 === 0) {
						element.style.top = '0px';
					} else if (i % 3 === 1) {
						element.style.top = '50px';
					} else if (i % 3 === 2) {
						element.style.top = '0px';
					}
				}
			}
			if (bpName === 'mobile') {
				last = total % 2;
				if (i > total - last - 1) {
					if (last === 1) {
						if (i % 2 === 0) {
							element.style.top = '0px';
						}
					}
				} else {
					if (i % 4 === 0) {
						element.style.top = '0px';
					} else if (i % 4 === 1) {
						element.style.top = '50px';
					} else if (i % 4 === 2) {
						element.style.top = '0px';
					} else if (i % 4 === 3) {
						element.style.top = '25px';
					} 
				}
			}
		}

		if (!container) return;

		for (var i = 0; i < elements.length; i++) {
			alignElement(elements[i], i);
		}
	}

	var _handleMutate = function() {
		container = document.getElementById('team-align');

		if (!container) return;

		elements = container.getElementsByClassName('item');
		total = elements.length;

		_align();
	}

	var init = function() {
		_handleMutate();

		bpStore.eventEmitter.subscribe(_align);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
		});
	}

	return {
		init: init
	}
});
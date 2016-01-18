define(['dispatcher'], function(dispatcher) {
	var initialized = false;

	var breakPoints = [
		{
			size: 0,
			name: 'mobile'
		}, {
			size: 640,
			name: 'tablet'
		}, {
			size: 1000,
			name: 'desktop'
		}
	];

	var currentBreakPoint = false;

	var size = {
		width: 0,
		height: 0
	}

	var _windowSize = function() {
		var width = 0, height = 0;
		if( typeof( window.innerWidth ) === 'number' ) {
			width = window.innerWidth;
			height = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
			width = document.documentElement.clientWidth;
			height = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			width = document.body.clientWidth;
			height = document.body.clientHeight;
		}
		return {
			height: height,
			width: width
		}
	}

	var _onresize = function() {
		size = _windowSize();

		var _getBreakPoint = function() {
			for (var i = breakPoints.length - 1; i >= 0; i--) {
				if (size.width >= breakPoints[i].size) {
					if (currentBreakPoint === breakPoints[i]) return;
					currentBreakPoint = breakPoints[i];
					
					eventEmitter.dispatch({
						type: 'change'
					});

					return;
				}
			}
		}

		_getBreakPoint();
	}

	var _init = function() {
		size = _windowSize();
		_onresize();
		window.addEventListener('resize', _onresize, false);
		window.addEventListener('orientationchange', _onresize, false);
		window.addEventListener('load', _onresize, false);
	}

	var eventEmitter = function() {
		var _handlers = [];

		var dispatch = function(event) {
			for (var i = _handlers.length - 1; i >= 0; i--) {
				_handlers[i](event);
			}
		}
		var subscribe = function(handler) {
			_handlers.push(handler);
		}
		var unsubscribe = function(handler) {
			for (var i = 0; i <= _handlers.length - 1; i++) {
				if (_handlers[i] == handler) {
					_handlers.splice(i--, 1);
				}
			}
		}

		return {
			dispatch: dispatch,
			subscribe: subscribe,
			unsubscribe: unsubscribe
		}
	}();

	var getData = function() {
		return {
			breakpoint: currentBreakPoint
		}
	}

	if (!initialized) {
		initialized = true;
		_init();
	}

	return {
		eventEmitter: eventEmitter,
		getData: getData
	}
});
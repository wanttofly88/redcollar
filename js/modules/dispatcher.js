define(function() {
	var _handlers = [];

	var dispatch = function(event) {
		for (var i = 0; i <= _handlers.length - 1; i++) {
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
});
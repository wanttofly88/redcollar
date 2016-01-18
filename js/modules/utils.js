define(function() {
	var offset = function(elem) {
		function getOffsetSum(elem) {
			var top = 0, left = 0;
			while(elem) {
				top = top + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}

			return {top: top, left: left};
		}

		function getOffsetRect(elem) {
			var box = elem.getBoundingClientRect();

			var body = document.body;
			var docElem = document.documentElement;

			var scrollTop = window.pageYOffset  || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			var clientTop = docElem.clientTop   || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			var top  = box.top  + scrollTop  - clientTop;
			var left = box.left + scrollLeft - clientLeft;

			return {
				top:  Math.round(top), 
				left: Math.round(left)
			};
		}

		if (elem.getBoundingClientRect) {
			return getOffsetRect(elem);
		} else {
			return getOffsetSum(elem);
		}
	}

	var requestAnimFrame = (function(){
		return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			}
	})();

	var Tween = function(from, to, duration, easing, func) {
		this.i = 0;
		this.duration = duration*60;
		this.current  = from;
		this.func     = func;
		this.to       = to;
		this.halt     = false;

		this.stop = function() {
			this.halt = true;
			this.i = 0;
			this.current = from;
		}

		this.animate = function() {
			var scope = this;
			this.halt = false;

			this.func(this.current);

			var loop = function() {
				var progress;
				var delta;
				var current;

				if (scope.halt) {
					return;
				}

				scope.i++;
				progress = scope.i/scope.duration;
				if (progress > 1) {
					progress = 1;
				}

				if (easing) {
					delta = easing(progress);
				} else {
					delta = progress;
				}
				
				scope.current = from + (to - from)*delta;
				scope.func(scope.current);

				if (Math.floor(scope.current - scope.to) === 0)  {
					return;
				}

				requestAnimFrame(loop);
			}
			loop();
		}
	}

	var ajax = {
		x: function() {
			try {
				return new ActiveXObject('Msxml2.XMLHTTP')
			} catch (e1) {
				try {
					return new ActiveXObject('Microsoft.XMLHTTP')
				} catch (e2) {
					return new XMLHttpRequest()
				}
			}
		},
		send: function(url, callback, method, data, sync) {
			var x = ajax.x();
			x.open(method, url, sync);
			x.onreadystatechange = function() {
				if (x.readyState == 4) {
					callback(x.responseText)
				}
			}
			// if (method == 'POST') {
			// 	x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			// }
			x.send(data)
		},
		get: function(url, data, callback, sync) {
			var query = [];
			for (var key in data) {
				query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
			}
			ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
		},
		post: function(url, data, callback, sync) {
			var query = [];
			for (var key in data) {
				query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
			}
			query.push(encodeURIComponent('action') + '=' + encodeURIComponent('send'));
			ajax.send(url, callback, 'POST', query.join('&'), sync)
		}
	}

	var getRequestAnimationFrame = function() {
		return requestAnimFrame;
	}

	var queryParse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#|&)/, '');

		if (!str) {
			return {};
		}

		return str.split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	}


	return {
		offset: offset,
		Tween: Tween,
		getRequestAnimationFrame: getRequestAnimationFrame,
		ajax: ajax,
		queryParse: queryParse
	}

});
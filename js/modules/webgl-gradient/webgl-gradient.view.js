define([
	'dispatcher', 
	'resize/resize.store', 
	'scroll/scroll.store', 
	'utils', 
	'THREE', 
	'webgl/mirrors.store',
	'svg-text/svg-text-positions.store',
	'resize/breakpoint-main-text.store',
	'svg-text/svg-text.store'
], function(
	dispatcher, 
	resizeStore,
	scrollStore, 
	utils, 
	THREE, 
	mirrorsStore,
	textPositionsStore, 
	breakpointStore,
	svgStore
) {

	"use strict";

	var container;
	var ww, wh;

	var requestAnimationFrame;
	var renderer;
	var scene, camera;
	var gradientPlane;
	var textPlane;
	var composer;
	var effectPass;
	var geometrySizeX = 128;
	var geometrySizeY = 256;
	var shiftY = 0;
	var dpr;

	var meshX = 128;
	var meshY = 256;

	var gradient;
	var number = 1;


	var _base = function() {
		var build = function() {
			var renderPass;
			var effectFXAA;
			var copyPass;


			dpr = 1;
			if (window.devicePixelRatio !== undefined) {
			  dpr = window.devicePixelRatio;
			}

			camera = new THREE.OrthographicCamera(
				ww*dpr / -2, 
				ww*dpr / 2,  
				wh*dpr / 2, 
				wh*dpr / -2, 
				-100, 100);

			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});

			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth*dpr, window.innerHeight*dpr);
			renderer.domElement.style.width  = '100%';
			renderer.domElement.style.height = '100%';
			container.appendChild(renderer.domElement);

			renderPass  = new THREE.RenderPass(scene, camera);
			effectFXAA  = new THREE.ShaderPass(THREE.FXAAShader);
			effectFXAA.uniforms['resolution'].value.set(1/(window.innerWidth*dpr), 1/(window.innerHeight*dpr));
			effectFXAA.renderToScreen = true;

			// effectPass = new THREE.ShaderPass(shaders);
			copyPass   = new THREE.ShaderPass(THREE.CopyShader);
			copyPass.renderToScreen = true

			composer = new THREE.EffectComposer(renderer);
			composer.setSize(window.innerWidth*dpr, window.innerHeight*dpr);
			composer.addPass(renderPass);
			// composer.addPass(effectFXAA);
			// composer.addPass(effectPass);
			composer.addPass(copyPass);
		}

		var render = function() {
			composer.render(scene, camera);
		}

		var resize = function() {
			var scale;

			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			if (camera && renderer) {
				camera.left =   ww*dpr / -2;
				camera.right =  ww*dpr / 2;
				camera.top =    wh*dpr / 2;
				camera.bottom = wh*dpr / -2;

				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.domElement.style.width  = '100%';
				renderer.domElement.style.height = '100%';
			}
		}

		return {
			build: build,
			render: render,
			resize: resize
		}
	}();

	var _gradient = function() {
		var geometry, material;
		var vertexShader;
		var texture;
		var fragmentShader;
		var shaders;

		var _generateGradientTexture = function() {
			var canvas = document.createElement('canvas');
			var ctx;
			var ctxGradient;
			var step = 1/(number - 0.5)/2;
			var gradientString;

			canvas.width  = geometrySizeX;
			canvas.height = geometrySizeY;

			ctx = canvas.getContext('2d');
			ctx.rect(0, 0, geometrySizeX, geometrySizeY);

			ctxGradient = ctx.createLinearGradient(0, 0, 0, geometrySizeY);

			for (var i = 0; i < gradient.length; i++) {
				ctxGradient.addColorStop((i*2)*step, gradient[i]);
				ctxGradient.addColorStop((i*2 + 1)*step, gradient[i]);
			}

			ctx.fillStyle = ctxGradient;
			ctx.fill();

			return canvas;
		}

		var build = function() {
			texture  = new THREE.Texture(_generateGradientTexture());
			texture.needsUpdate = true;

			geometry = new THREE.PlaneGeometry(meshX, (number*2 - 1)*meshY);
			material = new THREE.MeshBasicMaterial({map: texture, transparent: true});

			gradientPlane = new THREE.Mesh(geometry, material);
			gradientPlane.position.x = 0;
			gradientPlane.position.y = 0;
			gradientPlane.position.z = 0;

			scene.add(gradientPlane);

			// vertexShader   = document.getElementById('simpleVertexShader').innerHTML;
			// fragmentShader = document.getElementById('displacementShader').innerHTML;


			// shaders = {
			// 	uniforms: {
			// 		'tDiffuse': {type: 't', value: 0, texture: null},
			// 		'lineK1':  {type: 'f', value: 0},
			// 		'lineL1':  {type: 'f', value: 0},
			// 		'lineK2':  {type: 'f', value: 0},
			// 		'lineL2':  {type: 'f', value: 0}
			// 	},
			// 	vertexShader: vertexShader,
			// 	fragmentShader: fragmentShader
			// }
		}

		var render = function() {
			var mirrorsUniforms = mirrorsStore.getData().uniforms;
			// effectPass.material.uniforms.lineL1.value = mirrorsUniforms.lineL1.value;
			// effectPass.material.uniforms.lineK1.value = mirrorsUniforms.lineK1.value;
			// effectPass.material.uniforms.lineL2.value = mirrorsUniforms.lineL2.value;
			// effectPass.material.uniforms.lineK2.value = mirrorsUniforms.lineK2.value;
		}

		var scroll = function() {
			var scrolled = scrollStore.getData().top;
			if (gradientPlane) {
				gradientPlane.position.y = scrolled*2*dpr + shiftY;
			}
		}

		var resize = function() {
			if (gradientPlane) {
				gradientPlane.scale.set(ww*dpr/meshX, wh*dpr/meshY, 1);
				shiftY = (-wh*dpr*(number - 1));
			}
		}

		return {
			build: build,
			render: render,
			resize: resize,
			scroll: scroll
		}
	}();

	var _text = function() {
		var geometry, material;
		var texture;
		var maskTexture;
		var vertexShader;
		var fragmentShader;
		var shaders;
		var textContainer;
		var cw, ch;
		var canvas, ctx;
		var letters = [];
		var text, lastText;
		var id = 'stage-svg-text';
		var pathHeight = 1300; //почему? хуй знает
		var res = 3;

		var redraw = 0;

		var heights = {
			'mobile':  47,
			'tablet1': 78,
			'tablet2': 155,
			'desktop': 193
		}
		var fontSizes = {
			'mobile':  36,
			'tablet1': 60,
			'tablet2': 120,
			'desktop': 150
		}


		var _handleTextChange = function() {
			var textData = textPositionsStore.getData();
			var bpData   = breakpointStore.getData();
			var svgData  = svgStore.getData();
			var svgHeight;
			var scale;
			var needUpdate = false;

			var checkPosition = function(item) {
				var itemData;
				var lettersData;

				if (!textData.items.hasOwnProperty(id)) return;

				itemData = textData.items[id];
				lettersData = itemData.letters;

				for (var i = 0; i < letters.length; i++) {
					letters[i].x = lettersData[i].x;
				}
				needUpdate = true;
			}

			var checkText = function(item) {
				var splitText;
				var itemData;
				var lettersData;
				var totalLetters;


				var addLetter = function(letter, i) {
					if (!svgData.lettersData.hasOwnProperty(letter.char)) {
						console.warn('invalid letter ' + letter.char);
						return;
					}

					letters.push({
						char: letter.char,
						x: letter.x
					});
				}

				if (!textData.items.hasOwnProperty(id) || text === textData.items[id].text) return;

				itemData = textData.items[id];

				lettersData = itemData.letters;

				lastText = text;
				text = textData.items[id].text;

				letters = [];
				totalLetters = lettersData.length;
				for (var i = 0; i < lettersData.length; i++) {
					addLetter(lettersData[i], i);
				}

				needUpdate = true;
			}

			svgHeight = heights[bpData.breakpoint.name];
			scale = svgHeight/pathHeight;

			checkText();
			checkPosition();

			if (needUpdate) {
				needUpdate = false;
				_drawTexture();
			}
		}

		var _handleTextureResize = function() {
			var bpData = breakpointStore.getData();
			ww = resizeStore.getData().width;

			cw = ww*dpr;
			ch = heights[bpData.breakpoint.name]*dpr;

			canvas.width  = cw*res;
			canvas.height = ch*res;

			textContainer.style.height = heights[bpData.breakpoint.name] + 'px';

			if (textPlane) {
				textPlane.scale.set(cw, ch, 1);
			}

			_drawTexture();
		}

		var _drawTexture = function() {
			var bpData = breakpointStore.getData();
			var fs = fontSizes[bpData.breakpoint.name];

			var drawLetter = function(letter) {
				ctx.fillText(letter.char,   letter.x*dpr*res, heights[bpData.breakpoint.name]/2*res);
				ctx.strokeText(letter.char, letter.x*dpr*res, heights[bpData.breakpoint.name]/2*res);
			}

			ww = resizeStore.getData().width;

			// redraw++;

			cw = ww*dpr;
			ch = heights[bpData.breakpoint.name]*dpr;

			canvas.width  = cw*res;
			canvas.height = ch*res;

			ctx.font = '700 ' + (fs*dpr*res) + 'px Stem Web';
			ctx.fillStyle    = 'white';
			ctx.strokeStyle  = 'white';

			// if (redraw % 3 === 0) {
			// 	ctx.fillStyle    = 'red';
			// 	ctx.strokeStyle  = 'red';
			// } else if (redraw % 3 === 1) {
			// 	ctx.fillStyle    = 'green';
			// 	ctx.strokeStyle  = 'green';
			// } else if (redraw % 3 === 2) {
			// 	ctx.fillStyle    = 'black';
			// 	ctx.strokeStyle  = 'black';
			// }

			ctx.textBaseline = "middle";
			ctx.lineWidth    = 2*dpr*res;

			ctx.clearRect(0, 0, cw*res, ch*res);

			for (var i = 0; i < letters.length; i++) {
				drawLetter(letters[i]);
			}

			if (texture) {
				texture.needsUpdate = true;

				// texture = new THREE.Texture(canvas);
				// texture.needsUpdate = true;
				// texture.premultiplyAlpha = true;

				// texture.magFilter = THREE.NearestFilter;
				// texture.minFilter = THREE.NearestFilter;

				// material.map = texture;

				// texture.premultiplyAlpha = true;
				// texture.magFilter = THREE.NearestFilter;
				// texture.minFilter = THREE.NearestFilter;
			}
		}

		var build = function() {
			var bpData = breakpointStore.getData();
			var uniforms;
			textContainer = document.getElementById('stage-svg-text');

			canvas = document.createElement('canvas');
			ctx = canvas.getContext('2d');

			ww = resizeStore.getData().width;
			cw = ww*dpr;
			ch = heights[bpData.breakpoint.name]*dpr;

			_handleTextureResize();
			_handleTextChange();
			_drawTexture();

			texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			texture.premultiplyAlpha = true;

			maskTexture = new THREE.Texture(canvas);
			maskTexture.needsUpdate = true;
			maskTexture.premultiplyAlpha = true;

			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			maskTexture.magFilter = THREE.LinearFilter;
			maskTexture.minFilter = THREE.LinearFilter;

			uniforms = {
				textTexture: {type: "t", value: texture},
				maskTexture: {type: "t", value: maskTexture}
			}

			// var blendings = [ "NoBlending", "NormalBlending", "AdditiveBlending", "SubtractiveBlending", "MultiplyBlending", "AdditiveAlphaBlending" ];
			// var src = [ "ZeroFactor", "OneFactor", "SrcAlphaFactor", "OneMinusSrcAlphaFactor", "DstAlphaFactor", "OneMinusDstAlphaFactor", "DstColorFactor", "OneMinusDstColorFactor", "SrcAlphaSaturateFactor" ];

			geometry = new THREE.PlaneGeometry(1, 1);
			material = new THREE.ShaderMaterial({
				uniforms: uniforms,
				transparent: true,
				vertexShader: document.getElementById('simpleVertexShader').textContent,
				fragmentShader: document.getElementById('textShader').textContent
			});

			material.blending = THREE['NormalBlending'];

			textPlane = new THREE.Mesh(geometry, material);
			textPlane.position.x = 0;
			textPlane.position.y = 0;
			textPlane.position.z = 10;

			if (textPlane) {
				textPlane.scale.set(cw, ch, 1);
			}

			scene.add(textPlane);

			textPositionsStore.eventEmitter.subscribe(function() {
				_handleTextChange();
			});
			resizeStore.eventEmitter.subscribe(function() {
				_handleTextureResize();
			});
			breakpointStore.eventEmitter.subscribe(function() {
				_handleTextureResize();
			});
		}

		var resize = function() {
		}

		var render = function() {
			texture.needsUpdate = true;
		}

		return {
			build: build,
			resize: resize,
			render: render
		}
	}();


	var _handleResize = function() {
		var scaleX;
		var scaleY;
		var scale;

		ww = resizeStore.getData().width;
		wh = resizeStore.getData().height;

		_base.resize();
		_gradient.resize();
		_text.resize();
	}

	var _handleScroll = function() {
		_gradient.scroll();
	}

	var _render = function() {
		_gradient.render();
		_text.render();
		_base.render();
		requestAnimationFrame(_render);
	}

	var _build = function() {
		_base.build();
		_gradient.build();
		_text.build();

		_render();
	}

	var _handleMutate = function() {
		var getGradient = function() {
			var gradientString;
			var projects = document.getElementsByClassName('color-bg-control');
			var color;

			gradient = [];

			for (var i = 0; i < projects.length; i++) {
				color = projects[i].getAttribute('data-color');
				gradient.push(color);
			}

			number = projects.length;
		}

		container = document.getElementById('webgl-gradient');
		if (!container) return;
		if (!Modernizr.webgl) return;

		getGradient();
		_build();

	}

	var init = function() {
		requestAnimationFrame = utils.getRequestAnimationFrame();

		_handleMutate();
		_handleResize();
		_handleScroll();

		resizeStore.eventEmitter.subscribe(_handleResize);
		scrollStore.eventEmitter.subscribe(_handleScroll);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleResize();
				_handleScroll();
			}
		});
	}

	return {
		init: init
	}
});
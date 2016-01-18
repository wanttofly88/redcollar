define([
	'dispatcher', 
	'THREE', 
	'resize/resize.store', 
	'resize/breakpoint-main-text.store',
	'scroll/scroll.store',
	'utils',
	'touch/touch.store',
	'webgl/webgl.store'
], function(
	dispatcher, 
	THREE, 
	resizeStore, 
	breakpointStore,
	scrollStore,
	utils,
	touchStore,
	webglStore
) {

	"use strict";

	var requestAnimationFrame;
	var container;
	var dpr;
	var camera, scene, composer;
	var ww, wh, cw, ch;
	var plane;

	var heights = {
		'mobile':  47,
		'tablet1': 78,
		'tablet2': 155,
		'desktop': 193
	}

	var _base = function() {
		var renderer;
		var renderPass, copyPass, effectPass;
		var blur;
		var blurShaders;
		var vertexShader, blurShader;

		var init = function() {
			var bpData = breakpointStore.getData();
			var blurH;
			var blurW;
			ch = heights[bpData.breakpoint.name];
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			dpr = 1;
			if (window.devicePixelRatio !== undefined) {
			  dpr = window.devicePixelRatio;
			}

			dpr = 1/dpr;

			vertexShader = document.getElementById('simpleVertexShader').innerHTML;
			blurShader   = document.getElementById('blurShader').innerHTML;

			blurH = 0.4/(ww);
			blurW = 0.4/(ch);

			if (bpData.breakpoint.name === 'mobile') {
				blurH = 0.2/(ww);
				blurW = 0.2/(ch);
			}

			blurShaders = {
				uniforms: {
					h: {type: 'f', value: blurH},
					v: {type: 'f', value: blurW}
				},
				vertexShader: vertexShader,
				fragmentShader: blurShader
			}


			camera = new THREE.OrthographicCamera(
				ww*dpr / -2, 
				ww*dpr / 2,  
				ch*dpr / 2, 
				ch*dpr / -2, 
				-100, 100);

			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});

			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(ww, ch);

			// renderer.domElement.width = ww;
			// renderer.domElement.height = ch;
			// renderer.setViewport(0, 0, ww, ch);

			renderer.domElement.style.width  = '100%';
			renderer.domElement.style.height = '100%';
			container.appendChild(renderer.domElement);

			renderPass = new THREE.RenderPass(scene, camera);

			blur = new THREE.ShaderPass(blurShaders);

			// effectPass = new THREE.ShaderPass(shaders);
			copyPass   = new THREE.ShaderPass(THREE.CopyShader);
			//copyPass.renderToScreen = true
			blur.renderToScreen = true;

			composer = new THREE.EffectComposer(renderer);
			composer.setSize(ww, ch);

			composer.addPass(renderPass);
			// composer.addPass(blur);
			// composer.addPass(effectPass);
			composer.addPass(copyPass);
			composer.addPass(blur);
		}

		var render = function() {
			composer.render(scene, camera);
		}

		var resize = function() {
			var bpData = breakpointStore.getData();
			ch = heights[bpData.breakpoint.name];
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			if (camera && renderer) {
				camera.left =   ww*dpr / -2;
				camera.right =  ww*dpr / 2;
				camera.top =    ch*dpr / 2;
				camera.bottom = ch*dpr / -2;

				camera.updateProjectionMatrix();
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(ww, ch);

				renderer.domElement.style.width  = '100%';
				renderer.domElement.style.height = '100%';

				// renderer.domElement.width = ww;
				// renderer.domElement.height = ch;
				// renderer.setViewport(0, 0, ww, ch);
			}
		}

		return {
			init: init,
			render: render,
			resize: resize
		}
	}();

	var _text = function() {
		var geometry, material, texture;
		var textureCanvas;
		var vertexShader, fragmentShader;
		var uniforms;

		var init = function() {
			var bpData = breakpointStore.getData();
			ch = heights[bpData.breakpoint.name];
			textureCanvas = document.getElementById('text-texture');
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;


			if (!textureCanvas) return;

			texture = new THREE.Texture(textureCanvas);
			texture.needsUpdate = true;
			texture.premultiplyAlpha = true;

			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;

			geometry = new THREE.PlaneGeometry(1, 1);

			vertexShader = document.getElementById('simpleVertexShader').innerHTML;
			fragmentShader = document.getElementById('textShader').innerHTML;

			uniforms = {
				textTexture: {type: 't', value: texture},
				maskShift: {type: 'f', value: 0},
				shiftX: {type: 'f', value: 0},
				shiftY: {type: 'f', value: 0},
				globalAlpha: {type: 'f', value: 1},
				alphaFactor: {type: 'f', value: 0}
			}

			material = new THREE.ShaderMaterial({
				uniforms: uniforms,
				transparent: true,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			});

			material.blending = THREE['NormalBlending'];

			plane = new THREE.Mesh(geometry, material);
			plane.position.x = 0;
			plane.position.y = 0;
			plane.position.z = 0;

			plane.scale.set(ww*dpr, ch*dpr, 1);
			scene.add(plane);
		}

		var render = function() {
			var shadersData = webglStore.getData().shadersData;

			uniforms.shiftX.value = shadersData.displacementX;
			uniforms.shiftY.value = shadersData.displacementY;
			uniforms.maskShift.value = shadersData.maskShift;
			uniforms.globalAlpha.value = shadersData.globalAlpha;
			uniforms.alphaFactor.value = shadersData.alpha;

		}

		var resize = function() {
			var bpData = breakpointStore.getData();
			ch = heights[bpData.breakpoint.name];
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			if (plane) {
				plane.scale.set(ww*dpr, ch*dpr, 1);
			}

			// uniforms.ww.value = ww*dpr;
			// uniforms.wh.value = wh*dpr;
			// uniforms.ww.needsUpdate = true;
			// uniforms.wh.needsUpdate = true;
		}

		var update = function() {
			if (!texture) return;
			texture.needsUpdate = true;
		}

		return {
			init: init,
			render: render,
			resize: resize,
			update: update
		}
	}();

	var _render = function() {
		if (!container) return;

		if (!touchStore.getData().isTouchDevice) {
			_base.render();
			_text.render();
		}

		requestAnimationFrame(_render);
	}


	var _build = function() {
		_base.init();
		_base.resize();
		_text.init();
		_text.resize();

		_render();
	}

	var _resize = function() {
		_base.resize();
		_text.resize();
	}

	var _destruct = function() {
		container = false;
		camera    = false;
		scene     = false;
		composer  = false;
		plane     = false;
	}

	var _handleMutate = function() {
		container = document.getElementById('stage-svg-text');
		
		if (!container) {
			_destruct();
			return;
		}

		if (!webglStore.getData().webglSupport) return;
		if (!Modernizr.webgl) return;

		_build();
	}

	var init = function() {
		requestAnimationFrame = utils.getRequestAnimationFrame();

		_handleMutate();

		resizeStore.eventEmitter.subscribe(_resize);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
			if (e.type === 'texture-update') {
				_text.update();
			}
		});
	}

	return {
		init: init
	}
});
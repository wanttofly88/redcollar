define([
	'dispatcher', 
	'resize/resize.store',
	'scroll/scroll.store',
	'video/video.store',
	'webgl/webgl.store',
	'THREE',
	'touch/touch.store',
	'utils'
], function(
	dispatcher, 
	resizeStore,
	scrollStore,
	videoStore,
	webglStore,
	THREE,
	touchStore,
	utils
) {

	"use strict";

	var items = {}

	var video;
	var container;
	var camera;
	var scene;
	var renderer;
	var composer;
	var plane;
	var ww, wh;
	var planeWidth, planeHeight;
	var dpr;
	var naturalW;
	var naturalH;
	var mX = 0;
	var mY = 0;
	var normalizedVector = 0;
	var resultVector = 0;
	var disabled = false;

	var _handleMouse = function() {
		document.addEventListener('mousemove', function(e) {
			var maxVect = Math.pow(0.5, 1/2);
			var vect;

			mX = Math.abs(e.clientX/ww - 0.5);
			mY = Math.abs(e.clientY/wh - 0.5);

			// vect = Math.pow(Math.pow(mX, 2) + Math.pow(mY, 2), 0.5);

			vect = Math.max(mX, mY);

			// normalizedVector = vect/maxVect;


			normalizedVector = vect/0.5;

			normalizedVector = Math.pow(normalizedVector, 3);
		});
	}

	var _handleVideo = function() {
		var storeData = videoStore.getData();
		if (!renderer) return;
		if (!storeData.items.hasOwnProperty('main-video')) return;
		if (storeData.items['main-video'].status === 'ready') {
			setTimeout(function() {
				renderer.domElement.style.opacity = 1;
			}, 1000);
		}
	}

	var _base = function() {
		var renderPass, copyPass;
		var textureCanvas;
		var textTexture;
		var effectPass;
		var videoShader;
		var vertexShader, fragmentShader;
		var uniforms;
		var ch, cw, coef, th, tw, heightCoef, widthCoef;

		var init = function() {
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			dpr = 1;
			if (window.devicePixelRatio !== undefined) {
			  dpr = window.devicePixelRatio;
			}

			dpr = 1/dpr;

			vertexShader   = document.getElementById('simpleVertexShader').innerHTML;
			fragmentShader = document.getElementById('videoPostShader').innerHTML;

			textureCanvas = document.getElementById('text-texture');

			if (!textureCanvas) return;
			textTexture = new THREE.Texture(textureCanvas);
			ch = textureCanvas.height; //resizing magic..
			cw = textureCanvas.width;
			coef = cw/ww;
			th   = ch/coef;
			heightCoef = th/wh;

			textTexture.magFilter = THREE.NearestFilter;
			textTexture.minFilter = THREE.NearestFilter;

			textTexture.needsUpdate = true;
			textTexture.premultiplyAlpha = true;

			uniforms = {
				tDiffuse: {type: 't', value: 0, texture: null},
				textTexture: {type: 't', value: textTexture},
				heightCoef: {type: 'f', value: heightCoef},
				shift: {type: 'f', value: 0},
				maskShift: {type: 'f', value: 0},
				maskAlpha: {type: 'f', value: 0}
			}

			videoShader = {
				uniforms: uniforms,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			}

			camera = new THREE.OrthographicCamera(
				ww / -2, 
				ww / 2,  
				wh / 2, 
				wh / -2, 
				-100, 100);

			scene = new THREE.Scene();

			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});

			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(ww*dpr, wh*dpr);

			renderer.domElement.classList.add('webgl-renderer');
			// renderer.domElement.style.display = 'none';
			renderer.domElement.style.width  = '100%';
			renderer.domElement.style.height = '100%';
			container.appendChild(renderer.domElement);


			renderPass = new THREE.RenderPass(scene, camera);
			copyPass   = new THREE.ShaderPass(THREE.CopyShader);
			copyPass.renderToScreen = true;

			effectPass = new THREE.ShaderPass(videoShader);
			composer   = new THREE.EffectComposer(renderer);
			composer.setSize(ww*dpr, wh*dpr);

			composer.addPass(renderPass);
			composer.addPass(effectPass);
			composer.addPass(copyPass);
			composer.render();
		}

		var render = function() {
			var shadersData = webglStore.getData().shadersData;

			resultVector = resultVector + (normalizedVector - resultVector)/10;
			effectPass.material.uniforms.shift.value = resultVector;
			effectPass.material.uniforms.maskShift.value = shadersData.maskShift;
			effectPass.material.uniforms.maskAlpha.value = shadersData.maskAlpha;

			composer.render(scene, camera);
		}

		var update = function() {
			if (textTexture) {
				ch = textureCanvas.height; //resizing magic..
				cw = textureCanvas.width;
				coef = cw/ww;
				th   = ch/coef;
				heightCoef = th/wh;

				textTexture.needsUpdate = true;
				effectPass.material.uniforms.textTexture.value = textTexture;
				effectPass.material.uniforms.heightCoef.value = heightCoef;
			}
		}

		var resize = function() {
			ww = resizeStore.getData().width;
			wh = resizeStore.getData().height;

			if (camera && renderer) {
				camera.left =   ww / -2;
				camera.right =  ww / 2;
				camera.top =    wh / 2;
				camera.bottom = wh / -2;

				camera.updateProjectionMatrix();
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(ww*dpr, wh*dpr);

				renderer.domElement.style.width  = '100%';
				renderer.domElement.style.height = '100%';

			}
		}

		return {
			init: init,
			render: render,
			update: update,
			resize: resize
		}
	}();

	var _video = function() {
		var geometry, material, texture;
		var vertexShader, fragmentShader;
		var uniforms;
		var textTexture;
		var uniforms;
		var textureCanvas;


		var init = function() {
			textureCanvas = document.getElementById('text-texture');

			if (!textureCanvas) return;

			textTexture = new THREE.Texture(textureCanvas);

			textTexture.magFilter = THREE.NearestFilter;
			textTexture.minFilter = THREE.NearestFilter;

			textTexture.needsUpdate = true;
			textTexture.premultiplyAlpha = true;

			texture = new THREE.VideoTexture(video);
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;

			vertexShader   = document.getElementById('simpleVertexShader').innerHTML;
			fragmentShader = document.getElementById('videoShader').innerHTML;

			uniforms = {
				texture: {type: 't', value: texture}
			}

			material = new THREE.ShaderMaterial({
				uniforms: uniforms,
				transparent: true,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			});

			geometry = new THREE.PlaneGeometry(naturalW, naturalH);
			planeWidth  = naturalW;
			planeHeight = naturalH;
			plane = new THREE.Mesh(geometry, material);
			plane.material.depthTest  = false;
			plane.material.depthWrite = false;

			scene.add(plane);
		}

		var render = function() {

		}

		var update = function() {

		}

		var resize = function() {
			var storeData = resizeStore.getData();
			var scaleX;
			var scaleY;
			var scale;

			ww = storeData.width;
			wh = storeData.height;


			scaleX = ww / naturalW;
			scaleY = wh / naturalH;

			scale = Math.max(scaleX, scaleY);

			if (plane) {
				plane.scale.set(scale, scale, 1);
				planeWidth  = naturalW*scale;
				planeHeight = naturalH*scale;
			}
		}

		return {
			init: init,
			render: render,
			resize: resize,
			update: update
		}
	}();


	var _render = function() {
		if (!container || !video) return;
		if (!touchStore.getData().isTouchDevice && !disabled) {
			_base.render();
			_video.render();
		}

		requestAnimationFrame(_render);
	}

	var _build = function() {
		_base.init();
		_base.resize();
		_video.init();
		_video.resize();

		_render();
	}

	var _resize = function() {
		_base.resize();
		_video.resize();
	}

	var _destruct = function() {
		container = false;
		camera    = false;
		scene     = false;
		composer  = false;
		plane     = false;
	}

	var _handleScroll = function() {
		var scrolled = scrollStore.getData().top;
		var wh = resizeStore.getData().height;
		if (scrolled > wh) {
			disabled = true;
		} else {
			disabled = false;
		}
	}

	var _handleMutate = function() {
		container = document.getElementById('video-container');
		video = document.getElementById('main-video');
		
		if (!container || !video) {
			_destruct();
			return;
		}
		if (!webglStore.getData().webglSupport) return;
		if (!Modernizr.webgl) return;

		naturalW = video.width;
		naturalH = video.height;

		_build();
	}

	var init = function() {
		_handleMutate();

		resizeStore.eventEmitter.subscribe(_resize);
		_resize();
		_handleMouse();

		_handleVideo();
		_handleScroll();
		videoStore.eventEmitter.subscribe(_handleVideo);
		scrollStore.eventEmitter.subscribe(_handleScroll);
		resizeStore.eventEmitter.subscribe(_handleScroll);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
			}
			if (e.type === 'texture-update') {
				_base.update();
				_video.update();
				_handleVideo();
			}
		});
	}

	return {
		init: init
	}
});
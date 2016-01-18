define([
	'dispatcher', 
	'resize/resize.store',
	'video/video.store',
	'webgl/webgl-shaders.store',
	'THREE',
	'utils'
], function(
	dispatcher, 
	resizeStore,
	videoStore,
	shaderStore,
	THREE,
	utils
) {

	"use strict";
	var container;
	var video;

	var windowW;
	var windowH;
	var halfWindowW; 
	var halfWindowH;
	var naturalW, naturalH;

	var requestAnimationFrame;
	var renderer;
	var scene, camera;
	var texture, plane;
	var composer;
	var effectPass;

	var running = false;

	var _animate = function () {
		var shaderData;
		var storeUniforms;

		if (!container || !video) return;

		shaderData = shaderStore.getData();
		storeUniforms = shaderData.uniforms;

		requestAnimationFrame(_animate);
		effectPass.material.uniforms.sectors.value = storeUniforms.sectors.value;

		composer.render();
	}

	var _build = function() {
		var shaders = {
			uniforms = {
				'tDiffuse': {type: 't', value: 0, texture: null},
				'sectors': {type: 'v2v', value: sectors}
			}

			attributes = {}
			vertexShader: shaderStore.getData().vertexShader,
			fragmentShader: shaderStore.getData().fragmentShader
		}

		var geometry, material, parameters;
		var renderPass, copyPass;

		camera = new THREE.OrthographicCamera(
			windowW / -2, 
			windowW / 2,  
			windowH / 2, 
			windowH / -2, 
			-100, 100);

		scene = new THREE.Scene();

		renderer = new THREE.WebGLRenderer({
			antialias: false,
			preserveDrawingBuffer: true
		});

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		renderer.domElement.style.width  = '100%';
		renderer.domElement.style.height = '100%';

		container.appendChild(renderer.domElement);

		renderPass = new THREE.RenderPass(scene, camera);
		copyPass   = new THREE.ShaderPass(THREE.CopyShader);
		copyPass.renderToScreen = true

		effectPass = new THREE.ShaderPass(shaders);
		composer   = new THREE.EffectComposer(renderer);

		composer.addPass(renderPass);
		composer.addPass(effectPass);
		composer.addPass(copyPass);
		composer.render();

		texture = new THREE.VideoTexture(video);
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;

		geometry = new THREE.PlaneGeometry(naturalW, naturalH);

		material = new THREE.MeshBasicMaterial({
			map: texture
		});

		plane = new THREE.Mesh(geometry, material);
		//игнорим z-buffer
		plane.material.depthTest  = false;
		plane.material.depthWrite = false;

		scene.add(plane);

		_animate();
	}

	var _handleVideo = function() {
		var storeData = videoStore.getData();

		console.dir(storeData);

		if (running) return;

		if (!storeData.items.hasOwnProperty('webgl-source')) return;
		if (storeData.items['webgl-source'].status === 'ready') {
			running = true;
			_build();
		}
	}

	var _handleResize = function() {
		var storeData = resizeStore.getData();
		var scaleX;
		var scaleY;
		var scale;

		windowW = storeData.width;
		windowH = storeData.height;
		halfWindowW = windowH / 2;
		halfWindowH = windowW / 2;

		scaleX = windowH / naturalW;
		scaleY = windowW / naturalH;

		scale = Math.max(scaleX, scaleY);

		if (plane) {
			plane.scale.set(scale, scale, 1);
		}

		if (camera && renderer) {
			camera.left = windowW / -2;
			camera.right = windowW / 2;
			camera.top = windowH / 2;
			camera.bottom = windowH/ -2;

			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.domElement.style.width  = '100%';
			renderer.domElement.style.height = '100%';
		}
	}

	var init = function() {
		var storeData;

		container = document.getElementById('webgl-container');
		video     = document.getElementById('webgl-source');

		requestAnimationFrame = utils.getRequestAnimationFrame();

		if (!container || !video) return;

		naturalW = video.width;
		naturalH = video.height;

		_handleResize();
		_handleVideo();
		resizeStore.eventEmitter.subscribe(_handleResize);
		videoStore.eventEmitter.subscribe(_handleVideo);
	}

	return {
		init: init
	}
});
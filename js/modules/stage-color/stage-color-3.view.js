define(['dispatcher', 'stage-color/stage-color.store'], function(dispatcher, store) {

	"use strict";

	var stageElement;
	var stageNet;
	var stageLines;

	var transitionDelay = Modernizr.prefixed('transition-duration');
	// var transitionDelay = Modernizr.prefixed('transition-delay');
	var rand = [
		0.3,
		0.1,
		0.6
	]

	var numRows = 10;
	var numLines = 5;

	var r1 = 10;
	var l1 = 16.66;
	var rp1 = 1;
	var lp1 = 1;

	var lines = [];
	var rows  = [];

	var timeFactor = 600;

	var _handleChange = function(storeData) {
		var rand;
		var color;

		storeData = store.getData();
		if (!stageElement) return;

		if (!storeData.color) {
			for (var i = 0; i < rows.length; i++) {
				rows[i].style.backgroundColor = 'transparent';
			}
		} else {
			for (var i = 0; i < rows.length; i++) {
				rows[i].style.opacity = 1;

				color = storeData.color;
				rows[i].style.backgroundColor = color;
			}
		}
	}

	var _handleMutate = function() {
		var colorNet;
		var rowsFactor = [];


		var buldNet = function() {
			var innerLines = 100 - l1*2;
			var innerRows  = 100 - r1*2;
			var line;
			var row;

			var lineNum = 0;
			var rowNum  = 0;

			var setDelays = function(line, i) {

				var rand;

				for (var j = 0; j < line.rows.length; j++) {

					rand = Math.floor(Math.random()*Math.random()*2)*timeFactor + 600 +'ms';
				}
			}

			var addRow = function(line, i) {
				for (var i = 0; i < rp1; i++) {
					row = document.createElement('div');
					row.className = 'r';
					row.style.width = r1/rp1 + '%';
					row.style.left = r1/rp1*i + '%';
					line.element.appendChild(row);
					line.rows.push({
						element: row
					})
					rows.push(row);
				}
				for (var i = 0; i < numRows - rp1*2; i++) {
					row = document.createElement('div');
					row.className = 'r';
					row.style.width = (innerRows/(numRows - rp1*2) + 0.05) + '%';
					row.style.left = r1/rp1 + (innerRows/(numRows - rp1*2))*i + '%';
					line.element.appendChild(row);
					line.rows.push({
						element: row
					})
					rows.push(row);
				}
				for (var i = 0; i < rp1; i++) {
					row = document.createElement('div');
					row.className = 'r';
					row.style.width = r1/rp1 + '%';
					row.style.left = innerRows + r1 + r1/rp1*(i) + '%';
					line.element.appendChild(row);
					line.rows.push({
						element: row
					})
					rows.push(row);
				}
			}

			var addLines = function() {
				for (var i = 0; i < lp1; i++) {
					line = document.createElement('div');
					line.className = 'l';
					line.style.height = l1/lp1 + '%';
					line.style.top = l1/lp1*i + '%';
					colorNet.appendChild(line);
					lines.push({
						element: line,
						rows: []
					});
				}
				for (var i = 0; i < numLines - lp1*2; i++) {
					line = document.createElement('div');
					line.className = 'l';
					line.style.height = (innerLines/(numLines - lp1*2) + 0.05) + '%';
					line.style.top = l1/lp1 + (innerLines/(numLines - lp1*2))*i + '%';
					colorNet.appendChild(line);
					lines.push({
						element: line,
						rows: []
					});
				}
				for (var i = 0; i < lp1; i++) {
					line = document.createElement('div');
					line.className = 'l';
					line.style.height = l1/lp1 + '%';
					line.style.top = innerLines + l1 + l1/lp1*(i) + '%';
					colorNet.appendChild(line);
					lines.push({
						element: line,
						rows: []
					});
				}
			}



			if (!colorNet) return;

			addLines();
			for (var i = 0; i < lines.length; i++) {
				addRow(lines[i], i);
			}
			for (var i = 0; i < lines.length; i++) {
				setDelays(lines[i], i);
			}
		}

		for (var i = 0; i < numRows; i++) {
			rowsFactor.push(Math.random()*timeFactor);
		}

		colorNet = document.getElementById('color-net');
		buldNet();
		stageElement = document.getElementById('stage-color-bg');
	}

	var init = function() {
		_handleMutate();
		setTimeout(_handleChange, 0);

		store.eventEmitter.subscribe(_handleChange);

		dispatcher.subscribe(function(e) {
			if (e.type === 'mutate') {
				_handleMutate();
				_handleChange();
			}
		});
	}

	return {
		init: init
	}
});
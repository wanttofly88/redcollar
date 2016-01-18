define(['dispatcher'], function(dispatcher) {

	"use strict";

	//global

	var initialized = false;
	var lettersData = {};
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.-АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

	var items = {};

	var _handleEvent = function(e) {
		if (e.type === 'svg-text-change') {
			if (items.hasOwnProperty(e.id) && items[e.id].text === e.text) return;

			items[e.id] = {
				id: e.id,
				text: e.text
			}
			
			eventEmitter.dispatch();
		}

		if (e.type === 'svg-text-delete') {
			if (items.hasOwnProperty(e.id)) {
				delete items[e.id];
			}
		}
		// if (e.type === 'svg-text-reposition') {
		// 	console.log(e);
		// 	items[e.id] = e;

		// 	eventEmitter.dispatch();
		// }

	}

	var _add = function(ch) {
		var w;
		var w2;
		var ls;

		probeElemnt.style.letterSpacing = '0px';
		probeElemnt.innerHTML = ch;
		w = probeElemnt.offsetWidth;
		probeElemnt.style.letterSpacing = '100px';
		w2 = probeElemnt.offsetWidth;

		ls = w2;

		lettersData[ch] = {
			char: ch,
			width: w,
			spacing: ls
		}
	}

	var _init = function() {
		// var probeElemnt;
		// var defaultText = '';
		// var probeContainer = document.getElementById('stage-text-static');

		// if (!probeContainer) {
		// 	console.warn('stage-text-static element is missing');
		// 	return;
		// }

		// probeElemnt = document.createElement('span');
		// probeElemnt.className = 'probe';
		// probeContainer.appendChild(probeElemnt);

		// defaultText = probeElemnt.innerHTML;
		// probeElemnt.innerHTML = '';

		// setTimeout(function() {
		// 	_add(chars[0]); //safari fix
		// 	for (var i = 0; i <= chars.length - 1; i++) {
		// 		_add(chars[i]);
		// 	}

		// 	console.log(JSON.stringify(lettersData));
		// }, 1000);

		//100 font size 100 letter spacing
		//T - ?
		lettersData = { 
			A: {char: "A", width: 73,  spacing: 173, w: 800, h: 700, bezier: 'M267 261h182l-90 209zM303 700h115l307 -700h-162l-57 130h-293l-57 -130h-160z'},
			B: {char: "B", width: 68,  spacing: 168, w: 800, h: 700, bezier: 'M220 555v-128h145q47 0 70.5 16t23.5 43q0 17 -5 30t-17 21.5t-32.5 13t-52.5 4.5h-132zM220 287v-142h134q70 0 98.5 17t28.5 55q0 37 -26.5 53.5t-92.5 16.5h-142zM65 700h313q69 0 115 -13t74.5 -37t40.5 -57t12 -72q0 -52 -19.5 -88t-48.5 -62q43 -20 67 -58.5 t24 -104.5q0 -55 -20.5 -94.5t-57 -64.5t-86.5 -37t-109 -12h-305v700z'},
			C: {char: "C", width: 70,  spacing: 170, w: 800, h: 700, bezier: 'M686 132q-48 -69 -126 -106.5t-172 -37.5q-82 0 -148 26t-112.5 73.5t-72 114.5t-25.5 148q0 75 26 141t73.5 115t114.5 77.5t148 28.5q97 0 171 -36.5t112 -96.5l-105 -96q-32 39 -78 59t-89 20q-47 0 -86 -15t-67 -42.5t-43.5 -66.5t-15.5 -88q0 -47 16 -86t44 -67 t66.5 -43.5t83.5 -15.5q59 0 108 24t85 69z'},
			D: {char: "D", width: 72,  spacing: 172, w: 800, h: 700, bezier: 'M220 555v-410h65q66 0 112.5 15t76 43t43 67.5t13.5 88.5q0 44 -12.5 80.5t-41.5 62t-76 39.5t-115 14h-65zM65 700h222q112 0 189.5 -27.5t124.5 -74.5t68 -108.5t21 -130.5q0 -75 -24 -140.5t-75 -114t-130 -76.5t-189 -28h-207v700z'},
			E: {char: "E", width: 65,  spacing: 165, w: 800, h: 700, bezier: 'M65 700h535v-145h-380v-130h355v-140h-355v-140h389v-145h-544v700z'},
			F: {char: "F", width: 62,  spacing: 162, w: 800, h: 700, bezier: 'M65 700h530v-145h-375v-153h350v-145h-350v-257h-155v700z'},
			G: {char: "G", width: 74,  spacing: 174, w: 800, h: 700, bezier: 'M365 392h326v-283q-51 -57 -124 -89t-158 -32q-83 0 -152.5 26t-119.5 73.5t-78.5 114.5t-28.5 148q0 75 26 141t74 115t114.5 77.5t147.5 28.5q45 0 88 -9t80 -25.5t67 -40t48 -51.5l-107 -96q-30 34 -73 53t-97 19q-96 0 -151.5 -56t-55.5 -156q0 -51 16.5 -90.5 t45.5 -66.5t69 -41t88 -14q35 0 69.5 10t62.5 30v74h-177v140z'},
			H: {char: "H", width: 76,  spacing: 176, w: 800, h: 700, bezier: 'M531 280h-311v-280h-155v700h155v-275h311v275h155v-700h-155v280z'},
			I: {char: "I", width: 30,  spacing: 130, w: 800, h: 700, bezier: 'M70 700h155v-700h-155v700z'},
			J: {char: "J", width: 49,  spacing: 149, w: 800, h: 700, bezier: 'M426 219q0 -113 -58 -172t-154 -59q-46 0 -82 11t-63 29.5t-46.5 43t-32.5 50.5l113 87q37 -76 97 -76q39 0 55 29t16 87v451h155v-481z'},
			K: {char: "K", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M65 700h155v-273l269 273h202l-304 -310l324 -390h-204l-237 286l-50 -51v-235h-155v700z'},
			L: {char: "L", width: 61,  spacing: 161, w: 800, h: 700, bezier: 'M65 700h155v-555h378v-145h-533v700z'},
			M: {char: "M", width: 86,  spacing: 186, w: 800, h: 700, bezier: 'M65 700h144l224 -335l213 335h140v-700h-155v420l-182 -279h-41l-188 282v-423h-155v700z'},
			N: {char: "N", width: 74,  spacing: 174, w: 800, h: 700, bezier: 'M555 0l-339 415v-415h-151v700h119l340 -416v416h151v-700h-120z'},
			O: {char: "O", width: 79,  spacing: 179, w: 800, h: 700, bezier: 'M191 350q0 -49 16.5 -88t44 -66.5t63.5 -42.5t76 -15q41 0 77.5 15t63.5 42.5t42.5 66.5t15.5 88t-17 88t-44.5 66.5t-63.5 42.5t-74 15q-40 0 -76 -15t-63.5 -42.5t-44 -66.5t-16.5 -88zM30 350q0 76 28 142t76.5 115t114.5 77t142 28q75 0 140.5 -27.5t114.5 -75.5 t77 -114.5t28 -144.5q0 -77 -28 -143.5t-77 -115t-114.5 -76t-140.5 -27.5t-141 27.5t-114.5 75.5t-77 114.5t-28.5 144.5z'},
			P: {char: "P", width: 68,  spacing: 168, w: 800, h: 700, bezier: 'M220 555v-190h133q73 0 105.5 25t32.5 70q0 21 -7 38t-22.5 30t-40.5 20t-62 7h-139zM65 0v700h290q89 0 146.5 -21.5t91 -56t46.5 -77.5t13 -86q0 -44 -15.5 -87t-50.5 -77t-91.5 -54.5t-139.5 -20.5h-135v-220h-155z'},
			Q: {char: "Q", width: 79,  spacing: 179, w: 800, h: 700, bezier: 'M191 350q0 -49 15 -88t42 -66.5t63.5 -42.5t79.5 -15q27 0 41 3.5t29 9.5l-56 64l98 83l56 -68q16 23 23.5 53.5t7.5 66.5q0 49 -15 88t-41.5 66.5t-63 42.5t-79.5 15t-79.5 -15t-63.5 -42.5t-42 -66.5t-15 -88zM30 350q0 76 27 142t75.5 115t114.5 77t144 28 q80 0 146 -27.5t113.5 -75.5t74 -114.5t26.5 -144.5q0 -69 -22 -130t-70 -112l60 -74l-108 -87l-64 78q-35 -17 -74 -27t-82 -10q-80 0 -146.5 26t-114 73t-74 114t-26.5 149z'},
			R: {char: "R", width: 69,  spacing: 169, w: 800, h: 700, bezier: 'M220 555v-171h131q57 0 88 23t31 65q0 19 -5.5 34t-20 26t-38.5 17t-61 6h-125zM65 0v700h283q84 0 138.5 -19.5t86.5 -51t45 -73t13 -84.5q0 -68 -37 -124t-100 -81l195 -267h-187l-171 239h-111v-239h-155z'},
			S: {char: "S", width: 62,  spacing: 162, w: 800, h: 700, bezier: 'M429 194q0 31 -29 48t-72 30t-94 27t-94 38t-72 63t-29 103q0 42 19 80.5t54 68t85.5 47t112.5 17.5q90 0 159.5 -34.5t114.5 -94.5l-104 -100q-30 33 -73.5 58.5t-102.5 25.5q-54 0 -79.5 -18t-25.5 -48q0 -27 29 -42t72 -27t94 -26t94 -38t72 -63.5t29 -102.5 q0 -48 -20 -88.5t-55.5 -70t-84 -46.5t-105.5 -17q-63 0 -115 14t-92.5 37.5t-69.5 54.5t-47 65l113 94q35 -56 88.5 -88t118.5 -32q59 0 84 19.5t25 45.5z'},
			T: {char: "T", width: 61,  spacing: 161, w: 800, h: 700, bezier: 'M0 700h604v-145h-225v-555h-155v555h-224v145z'},
			U: {char: "U", width: 72,  spacing: 172, w: 800, h: 700, bezier: 'M665 300q0 -82 -25.5 -140.5t-67.5 -95.5t-95.5 -54t-108.5 -17q-63 0 -119.5 19.5t-99.5 59t-68.5 98t-25.5 136.5v394h155v-376q0 -41 10 -75.5t30 -59t49.5 -38t68.5 -13.5q76 0 109 49t33 133v380h155v-400z'},
			V: {char: "V", width: 73,  spacing: 173, w: 800, h: 700, bezier: 'M427 0h-108l-329 700h171l213 -464l199 464h167z'},
			W: {char: "W", width: 98,  spacing: 198, w: 800, h: 700, bezier: 'M764 0h-126l-149 424l-145 -424h-126l-218 700h160l128 -422l140 422h124l143 -419l122 419h154z'},
			X: {char: "X", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M446 355l261 -355h-189l-164 229l-165 -229h-189l262 355l-251 345h187l157 -217l156 217h188z'},
			Y: {char: "Y", width: 70,  spacing: 170, w: 800, h: 700, bezier: 'M426 251v-251h-155v251l-281 449h185l176 -280l180 280h179z'},
			Z: {char: "Z", width: 64,  spacing: 164, w: 800, h: 700, bezier: 'M27 700h579v-103l-373 -452h382v-145h-605v103l371 452h-354v145z'},
			А: {char: "А", width: 73,  spacing: 173, w: 800, h: 700, bezier: 'M267 261h182l-90 209zM303 700h115l307 -700h-162l-57 130h-293l-57 -130h-160z'},
			Б: {char: "Б", width: 67,  spacing: 167, w: 800, h: 700, bezier: 'M220 296v-151h135q64 0 94 18t30 61q0 39 -27 55.5t-91 16.5h-141zM592 555h-372v-114h176q124 0 184 -57t60 -159q0 -117 -75.5 -171t-215.5 -54h-284v700h527v-145z'},
			В: {char: "В", width: 68,  spacing: 168, w: 800, h: 700, bezier: 'M220 555v-128h145q47 0 70.5 16t23.5 43q0 17 -5 30t-17 21.5t-32.5 13t-52.5 4.5h-132zM220 287v-142h134q70 0 98.5 17t28.5 55q0 37 -26.5 53.5t-92.5 16.5h-142zM65 700h313q69 0 115 -13t74.5 -37t40.5 -57t12 -72q0 -52 -19.5 -88t-48.5 -62q43 -20 67 -58.5 t24 -104.5q0 -55 -20.5 -94.5t-57 -64.5t-86.5 -37t-109 -12h-305v700z'},
			Г: {char: "Г", width: 59,  spacing: 159, w: 800, h: 700, bezier: 'M65 700h525v-145h-370v-555h-155v700zM298 516q-3 -126 -20 -222t-40 -149h267v410h-206zM2 145h76q10 21 22.5 57.5t23.5 93.5t19 136t8 184v84h509v-555h81v-262h-145v117h-449v-117h-145v262z'},
			Д: {char: "Д", width: 76,  spacing: 176, w: 800, h: 700, bezier: 'M298 516q-3 -126 -20 -222t-40 -149h267v410h-206zM2 145h76q10 21 22.5 57.5t23.5 93.5t19 136t8 184v84h509v-555h81v-262h-145v117h-449v-117h-145v262z'},
			Е: {char: "Е", width: 65,  spacing: 165, w: 800, h: 700, bezier: 'M65 700h535v-145h-380v-130h355v-140h-355v-140h389v-145h-544v700z'},
			Ё: {char: "Ё", width: 65,  spacing: 165, w: 800, h: 700, bezier: 'M65 700h535v-145h-380v-130h355v-140h-355v-140h389v-145h-544v700zM364 831q0 33 25.5 54.5t59.5 21.5q31 0 56.5 -20.5t25.5 -55.5t-25.5 -56t-56.5 -21q-34 0 -59.5 21t-25.5 56zM115 831q0 33 24.5 54.5t60.5 21.5q15 0 30 -5.5t27 -16t19 -24.5t7 -30q0 -35 -26 -56 t-57 -21q-36 0 -60.5 21t-24.5 56z'},
			Ж: {char: "Ж", width: 99,  spacing: 199, w: 800, h: 700, bezier: 'M-4 700h190l232 -277v277h155v-279l229 279h192l-280 -325l278 -375h-184l-215 286l-20 -30v-256h-155l1 255l-19 27l-225 -282h-176l277 360z'},
			З: {char: "З", width: 66,  spacing: 166, w: 800, h: 700, bezier: 'M338 -12q-109 0 -194.5 35.5t-143.5 121.5l123 83q36 -48 87 -71.5t124 -23.5q39 0 64.5 5.5t41.5 16t22.5 24t6.5 30.5q0 40 -37 57.5t-109 17.5h-110v145h104q63 0 96 18t33 47q0 22 -12 36t-30 22t-39.5 11.5t-41.5 3.5q-61 0 -102 -19t-76 -58l-120 81 q47 64 120 102.5t187 38.5q133 0 201.5 -54t68.5 -150q0 -44 -16 -77t-56 -56q31 -12 49.5 -30.5t28.5 -39.5t13.5 -43.5t3.5 -43.5q0 -54 -21 -96.5t-59 -72.5t-90.5 -45.5t-116.5 -15.5z'},
			И: {char: "И", width: 76,  spacing: 176, w: 800, h: 700, bezier: 'M65 0v700h155v-429l339 429h129v-700h-155v427l-341 -427h-127z'},
			Й: {char: "Й", width: 76,  spacing: 176, w: 800, h: 700, bezier: 'M65 0v700h155v-429l339 429h129v-700h-155v427l-341 -427h-127zM323 893q7 -29 22.5 -40t37.5 -11q21 0 39.5 12t22.5 39h130q-2 -35 -19.5 -65t-43.5 -52t-58.5 -34.5t-64.5 -12.5q-46 0 -80.5 12.5t-58.5 34.5t-38 52t-19 65h130z'},
			К: {char: "К", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M65 700h155v-273l269 273h202l-304 -310l324 -390h-204l-237 286l-50 -51v-235h-155v700z'},
			Л: {char: "Л", width: 73,  spacing: 173, w: 800, h: 700, bezier: 'M507 550h-219l-4 -81q-5 -108 -16 -185.5t-27.5 -130t-37.5 -83.5t-47.5 -47t-57.5 -21t-66 -5q-9 0 -19.5 0.5t-20.5 2.5v144q14 -2 25 -2q12 0 27.5 2.5t31 18.5t26.5 48t18 86t10.5 133.5t5.5 190.5l1 79h525v-700h-155v550z'},
			М: {char: "М", width: 86,  spacing: 186, w: 800, h: 700, bezier: 'M65 700h144l224 -335l213 335h140v-700h-155v420l-182 -279h-41l-188 282v-423h-155v700z'},
			Н: {char: "Н", width: 76,  spacing: 176, w: 800, h: 700, bezier: 'M531 280h-311v-280h-155v700h155v-275h311v275h155v-700h-155v280z'},
			О: {char: "О", width: 79,  spacing: 179, w: 800, h: 700, bezier: 'M191 350q0 -49 16.5 -88t44 -66.5t63.5 -42.5t76 -15q41 0 77.5 15t63.5 42.5t42.5 66.5t15.5 88t-17 88t-44.5 66.5t-63.5 42.5t-74 15q-40 0 -76 -15t-63.5 -42.5t-44 -66.5t-16.5 -88zM30 350q0 76 28 142t76.5 115t114.5 77t142 28q75 0 140.5 -27.5t114.5 -75.5 t77 -114.5t28 -144.5q0 -77 -28 -143.5t-77 -115t-114.5 -76t-140.5 -27.5t-141 27.5t-114.5 75.5t-77 114.5t-28.5 144.5z'},
			П: {char: "П", width: 75,  spacing: 175, w: 800, h: 700, bezier: 'M530 555h-310v-555h-155v700h620v-700h-155v555z'},
			Р: {char: "Р", width: 68,  spacing: 168, w: 800, h: 700, bezier: 'M220 555v-190h133q73 0 105.5 25t32.5 70q0 21 -7 38t-22.5 30t-40.5 20t-62 7h-139zM65 0v700h290q89 0 146.5 -21.5t91 -56t46.5 -77.5t13 -86q0 -44 -15.5 -87t-50.5 -77t-91.5 -54.5t-139.5 -20.5h-135v-220h-155z'},
			С: {char: "С", width: 70,  spacing: 170, w: 800, h: 700, bezier: 'M686 132q-48 -69 -126 -106.5t-172 -37.5q-82 0 -148 26t-112.5 73.5t-72 114.5t-25.5 148q0 75 26 141t73.5 115t114.5 77.5t148 28.5q97 0 171 -36.5t112 -96.5l-105 -96q-32 39 -78 59t-89 20q-47 0 -86 -15t-67 -42.5t-43.5 -66.5t-15.5 -88q0 -47 16 -86t44 -67 t66.5 -43.5t83.5 -15.5q59 0 108 24t85 69z'},
			Т: {char: "Т", width: 61,  spacing: 161, w: 800, h: 700, bezier: 'M0 700h604v-145h-225v-555h-155v555h-224v145z'},
			У: {char: "У", width: 73,  spacing: 173, w: 800, h: 700, bezier: 'M728 700l-254 -536q-19 -39 -38.5 -69.5t-43.5 -51.5t-52.5 -32t-65.5 -11q-34 0 -71.5 16.5t-69.5 63.5l100 91q17 -26 43 -26q12 0 25 8t25 34l-326 513h192l213 -348l161 348h162z'},
			Ф: {char: "Ф", width: 90,  spacing: 190, w: 800, h: 700, bezier: 'M185 360q0 -29 10.5 -56t33 -47.5t57.5 -33t83 -12.5h3v298q-102 0 -144.5 -36.5t-42.5 -112.5zM527 509v-298h6q89 0 135 36.5t46 112.5q0 72 -41.5 110.5t-143.5 38.5h-2zM372 66h-4q-78 0 -141.5 21t-108.5 59.5t-69 93t-24 120.5q0 71 23.5 125.5t68.5 92t109.5 57 t145.5 19.5v61h155v-61q75 0 138.5 -18t110 -54.5t72.5 -92t26 -129.5q0 -66 -24 -120t-68 -93t-107 -60t-142 -21h-6v-81h-155v81z'},
			Х: {char: "Х", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M446 355l261 -355h-189l-164 229l-165 -229h-189l262 355l-251 345h187l157 -217l156 217h188z'},
			Ц: {char: "Ц", width: 75,  spacing: 175, w: 800, h: 700, bezier: 'M65 700h155v-555h283v555h155v-555h81v-262h-144v117h-530v700z'},
			Ч: {char: "Ч", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M644 0h-155v263q-29 -15 -75 -27t-96 -12q-59 0 -109.5 13.5t-88 42t-59 74t-21.5 110.5v236h156v-138q0 -54 8.5 -91t25.5 -59.5t44 -32.5t65 -10t79 11t71 31v289h155v-700z'},
			Ш: {char: "Ш", width: 95,  spacing: 195, w: 800, h: 700, bezier: 'M65 700h155v-555h177v555h155v-555h177v555h155v-700h-819v700z'},
			Щ: {char: "Щ", width: 98,  spacing: 198, w: 800, h: 700, bezier: 'M65 700h155v-555h178v555h155v-555h178v555h155v-555h81v-262h-145v117h-757v700z'},
			Ъ: {char: "Ъ", width: 75,  spacing: 175, w: 800, h: 700, bezier: 'M308 323v-178h124q69 0 103.5 19t34.5 72q0 45 -33.5 66t-101.5 21h-127zM0 700h308v-232h129q294 0 294 -232q0 -61 -20.5 -105.5t-59.5 -73.5t-95.5 -43t-127.5 -14h-275v555h-153v145z'},
			Ы: {char: "Ы", width: 90,  spacing: 190, w: 800, h: 700, bezier: 'M220 468h104q74 0 129 -16.5t92 -47t55 -73.5t18 -95q0 -118 -80 -177t-223 -59h-250v700h155v-232zM220 323v-178h99q69 0 103.5 19t34.5 72q0 45 -33.5 66t-102.5 21h-101zM680 700h155v-700h-155v700z'},
			Ь: {char: "Ь", width: 66,  spacing: 166, w: 800, h: 700, bezier: 'M221 468h132q149 0 221.5 -58.5t72.5 -173.5q0 -117 -80 -176.5t-222 -59.5h-280v700h156v-232zM221 323v-178h127q138 0 138 91q0 45 -33.5 66t-101.5 21h-130z'},
			Э: {char: "Э", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M207 430h308q-17 61 -68.5 97t-132.5 36q-23 0 -50 -4.5t-54 -14.5t-52.5 -27.5t-46.5 -42.5l-102 100q26 35 61 60t75.5 41.5t85 24.5t89.5 8q82 0 148.5 -25t112.5 -71t71 -112t25 -147q0 -78 -24.5 -144t-71 -114.5t-114.5 -75.5t-155 -27q-38 0 -79.5 6.5t-83 23.5 t-80 46t-69.5 74l103 88q19 -27 44.5 -45t53.5 -28.5t57.5 -15t57.5 -4.5q82 0 136 40t65 108h-310v145z'},
			Ю: {char: "Ю", width: 102, spacing: 202, w: 800, h: 700, bezier: 'M443 350q0 -49 14.5 -88.5t40.5 -67t61 -42.5t76 -15q87 0 137.5 57.5t50.5 155.5q0 49 -13.5 88t-38.5 67t-59.5 43t-76.5 15q-41 0 -76.5 -15t-61 -43t-40 -67t-14.5 -88zM65 700h155v-278h71q11 62 41 114.5t75 90.5t103 59.5t125 21.5q80 0 144.5 -26.5t110 -74.5 t70 -113.5t24.5 -143.5q0 -77 -26.5 -142.5t-73 -113.5t-110.5 -75t-139 -27q-69 0 -128 20t-104 58t-74.5 93.5t-38.5 126.5h-70v-290h-155v700z'},
			Я: {char: "Я", width: 71,  spacing: 171, w: 800, h: 700, bezier: 'M481 376v179h-147q-67 0 -95 -23t-28 -67q0 -37 31.5 -63t85.5 -26h153zM481 231h-119l-179 -231h-183l206 260q-75 23 -115.5 74.5t-40.5 129.5q0 50 18 93t55 75t91.5 50t128.5 18h293v-700h-155v231z'},
			space:  {char: " ", width: 24, spacing: 124, w: 800, h: 700, bezier: ''},
			comma:  {char: ",", width: 27, spacing: 127, w: 800, h: 700, bezier: 'M96 -5q-25 9 -43 32t-18 53q0 40 25 61.5t71 21.5q45 0 69 -29t24 -75q0 -44 -14.5 -80t-38 -62.5t-52.5 -43t-59 -22.5l-40 87q10 2 22.5 6.5t23.5 11t19 16.5t11 23z'},
			period: {char: ".", width: 29, spacing: 129, w: 800, h: 700, bezier: 'M50 81q0 15 6.5 30.5t19 27.5t30 19.5t38.5 7.5q19 0 36 -7.5t29.5 -19.5t19.5 -27.5t7 -30.5q0 -17 -7 -32.5t-19.5 -27.5t-29.5 -19.5t-36 -7.5q-43 0 -68.5 26.5t-25.5 60.5z'},
			hyphen: {char: "-", width: 43, spacing: 143, w: 800, h: 700, bezier: 'M60 347h304v-130h-304v130z'}
		}

		dispatcher.subscribe(_handleEvent);
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
			lettersData: lettersData,
			items: items
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
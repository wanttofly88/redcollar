<script type="x-shader/x-vertex" id="simpleVertexShader">
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
</script>

<script type="x-shader/x-fragment" id="simpleFragmentShader">
	varying vec2 vUv;
	uniform sampler2D tDiffuse;

	void main() {
		float vx = vUv.x;
		float vy = vUv.y;
		gl_FragColor = texture2D(tDiffuse, vec2(vx, vy));
	}
</script>

<script type="x-shader/x-fragment" id="videoShader">
	varying vec2 vUv;
	uniform sampler2D texture;

	void main() {
		float vx = vUv.x;
		float vy = vUv.y;

		vec4 color  = texture2D(texture, vec2(vx, vy));

		gl_FragColor = color;
	}
</script>

<script type="x-shader/x-fragment" id="videoPostShader">
	varying vec2 vUv;
	uniform sampler2D tDiffuse;
	uniform sampler2D textTexture;
	uniform float shift;
	uniform float heightCoef;
	uniform float maskShift;
	uniform float maskAlpha;

	void main() {
		float vx = vUv.x;
		float vy = vUv.y;
		float softShift1 = shift/15.0;
		float softShift2 = shift/10.0;

		float vx1 = vx;
		float vy1 = vy;
		float vyMask;
		float vxMask;

		if (vx > 0.1 && vx < 1.0 - 0.1 && vy > 0.166 && vy < 1.0 - 0.166) {
			vx1 = (vx - 0.5)*(1.0 + softShift1) + 0.5;
			vy1 = (vy - 0.5)*(1.0 + softShift1) + 0.5;
		} else {
			vx1 = (vx - 0.5)*(1.0 - softShift2) + 0.5;
			vy1 = (vy - 0.5)*(1.0 - softShift2) + 0.5;
		}

		vxMask = vx;
		vyMask = (vy - 0.5)/heightCoef + 0.5;

		vec4 mask1  = texture2D(textTexture, vec2((vxMask - 0.5)*0.5 + 0.5 + maskShift, (vyMask - 0.5)*0.5 + 0.5));
		vec4 mask2  = texture2D(textTexture, vec2((vxMask - 0.5)*0.5 - 0.5 + (1.2 - maskShift), (vyMask - 0.5)*0.5 + 0.5));
		// vec4 maskColor  = texture2D(textTexture, vec2(vx1, vyMask));

		vec4 inColor   = texture2D(tDiffuse, vec2(vx1, vy1));

		if (mask1.a > 0.0 || mask2.a > 0.0) {
			vy1 = vy1 + 0.1;
			vy1 = vy1 - 0.07;
		}

		vec4 outColor  = texture2D(tDiffuse, vec2(vx1, vy1));

		if (mask1.a > 0.0 || mask2.a > 0.0) {
			outColor.r *= 0.99;
			outColor.g *= 0.99;
			outColor.b *= 0.99;
		}
		if ((mask1.a > 0.0 && mask1.a < 1.0) || (mask2.a > 0.0 && mask2.a < 1.0)) {
			outColor.r *= 1.02;
			outColor.g *= 1.02;
			outColor.b *= 1.02;
		}


		outColor.r = outColor.r + (inColor.r - outColor.r)*(1.0 - maskAlpha);
		outColor.g = outColor.g + (inColor.g - outColor.g)*(1.0 - maskAlpha);
		outColor.b = outColor.b + (inColor.b - outColor.b)*(1.0 - maskAlpha);
		outColor.a = outColor.a + (inColor.a - outColor.a)*(1.0 - maskAlpha);

		// if (mask1.a == 0.0 && mask2.a == 0.0) {
		// 	outColor.r = outColor.r + (grey - outColor.r)*0.7;
		// 	outColor.g = outColor.g + (grey - outColor.g)*0.7;
		// 	outColor.b = outColor.b + (grey - outColor.b)*0.7;
		// }

		float grey = outColor.r*0.2126 + outColor.g*0.7152 + outColor.b*0.0722;

		// outColor.r = outColor.r + (grey - outColor.r)*0.5;
		// outColor.g = outColor.g + (grey - outColor.g)*0.5;
		// outColor.b = outColor.b + (grey - outColor.b)*0.5;

		gl_FragColor =  outColor;

	}
</script>

<script type="x-shader/x-fragment" id="textShader">
	uniform sampler2D textTexture;
	uniform float shiftX;
	uniform float shiftY;
	uniform float maskShift;
	uniform float alphaFactor;
	uniform float globalAlpha;

	varying vec2 vUv;

	void main() {
		float vx  = vUv.x;
		float vy  = vUv.y;
		float vx2 = vx;
		float vy2 = vy;
		float shift;

		vec4 mask1  = texture2D(textTexture, vec2((vx - 0.5)*0.5 + 0.5 + maskShift, (vy - 0.5)*0.5 + 0.5));
		vec4 mask2  = texture2D(textTexture, vec2((vx - 0.5)*0.5 - 0.5 + (1.0 - maskShift), (vy - 0.5)*0.5 + 0.5));
		vec4 color  = texture2D(textTexture, vec2(vx, vy));

		// shift = shiftFactor;
		// if (shift > 0.95) {
		// 	shift = 1.0;
		// }

		vec4 shiftColor1 = texture2D(textTexture, vec2(vx, vy + 0.03*(shiftY)));
		vec4 shiftColor2 = texture2D(textTexture, vec2(vx, vy - 0.02*(shiftY)));

		vec4 outColor   = color;
		vec4 inColor    = color;

		outColor.a = outColor.a*(1.0 - mask1.a);
		inColor.a  = shiftColor1.a*mask1.a*alphaFactor;

		outColor.r = max(outColor.r, inColor.r);
		outColor.g = max(outColor.g, inColor.g);
		outColor.b = max(outColor.b, inColor.b);
		outColor.a = max(outColor.a, inColor.a);


		outColor.a = outColor.a*(1.0 - mask2.a);
		inColor.a  = shiftColor2.a*mask2.a*alphaFactor;

		outColor.r = max(outColor.r, inColor.r);
		outColor.g = max(outColor.g, inColor.g);
		outColor.b = max(outColor.b, inColor.b);
		outColor.a = max(outColor.a, inColor.a);

		// if (alphaFactor >= 1.0 && shiftY >= 1.0) {
		// 	outColor = color;
		// }

		outColor.r = 1.0;
		outColor.g = 1.0;
		outColor.b = 1.0;
		outColor.a = outColor.a*globalAlpha;

		gl_FragColor = outColor;
	}
</script>

<script type="x-shader/x-fragment" id="displacementShader">
	uniform sampler2D tDiffuse;
	varying vec2 vUv;
	uniform float lineL1;
	uniform float lineK1;
	uniform float lineL2;
	uniform float lineK2;

	void main() {
		float vx = vUv.x;
		float vy = vUv.y;

		
		vec4 color2;

		float vw1 = lineK1*vx + lineL1;
		float vw2 = lineK2*vx + lineL2;

		vec4 color = texture2D(tDiffuse, vec2(vx, vy));
		gl_FragColor = color;
	}
</script>

<script type="x-shader/x-fragment" id="blurShader">
	uniform sampler2D tDiffuse;
	uniform float h;
	uniform float v;

	varying vec2 vUv;
	const float smoothing = 1.0/16.0;

	void main() {
		vec4 sum = vec4(0.0);

		sum += texture2D(tDiffuse, vec2(vUv.x - 4.0 * h, vUv.y)) * 0.051;
		sum += texture2D(tDiffuse, vec2(vUv.x - 3.0 * h, vUv.y)) * 0.0918;
		sum += texture2D(tDiffuse, vec2(vUv.x - 2.0 * h, vUv.y)) * 0.12245;
		sum += texture2D(tDiffuse, vec2(vUv.x - 1.0 * h, vUv.y)) * 0.1531;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.1633;
		sum += texture2D(tDiffuse, vec2(vUv.x + 1.0 * h, vUv.y)) * 0.1531;
		sum += texture2D(tDiffuse, vec2(vUv.x + 2.0 * h, vUv.y)) * 0.12245;
		sum += texture2D(tDiffuse, vec2(vUv.x + 3.0 * h, vUv.y)) * 0.0918;
		sum += texture2D(tDiffuse, vec2(vUv.x + 4.0 * h, vUv.y)) * 0.051;

		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 4.0 * v)) * 0.051;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 3.0 * v)) * 0.0918;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 2.0 * v)) * 0.12245;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y - 1.0 * v)) * 0.1531;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.1633;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 1.0 * v)) * 0.1531;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 2.0 * v)) * 0.12245;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 3.0 * v)) * 0.0918;
		sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y + 4.0 * v)) * 0.051;

		gl_FragColor = sum;
	}
</script>
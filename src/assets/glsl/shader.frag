precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec4 resolution;
uniform vec2 u_mouse;
uniform vec2 u_screen;
uniform float u_progress;
uniform bool u_inProgress;
uniform vec2 gradient;
varying vec2 vUv;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;

float circle(in vec2 _st, in float _radius, in float blurriness){
    vec2 dist = _st;
	return 1. - smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

vec4 toGray(in vec3 _color) {
    float gray = dot(_color.rgb, vec3(redScale, greenScale, blueScale));
    return vec4(vec3(gray), 1.);
}

void main() {

    // 画像テクスチャの適用
    vec2 whole = u_screen * PR;

    vec2 newUv = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
    vec4 color = texture2D( u_texture1, newUv );

    // ページ切り替え
    vec2 p = newUv; // gl_FragCoord.xy / u_screen.xy;
	float v = mix(0.0, 1.0, u_progress * (1.0+gradient.x+gradient.y) - ((1.0-p.x)*gradient.x+newUv.y*gradient.y));
    vec4 color2 = texture2D( u_texture2, p );
	v = clamp(v, 0.0, 1.0);
	vec2 p0 = p;
	vec2 p1 = p;
	p0 -= 0.5;
	p0 *= (1.0 - v);
	p0 += 0.5;
	p1 -= 0.5;
	p1 *= v;
	p1 += 0.5;
	vec4 progressColor1 = texture2D(u_texture1, p0);
	vec4 progressColor2 = texture2D(u_texture2, p1);

    // マウス座標とFragCoordの距離計算
    vec2 st = gl_FragCoord.xy / whole.xy - vec2(.5);
    st.y *= whole.y / whole.x;

    vec2 mouse = vec2((u_mouse.x / u_screen.x) * 2. - 1.,-(u_mouse.y / u_screen.y) * 2. + 1.) * -.5;
    mouse.y *= whole.y / whole.x;

    vec2 cpos = st + mouse;

    float c = circle(cpos, .02 * 2. * 0.8, 2.);

    // グレースケール変換
    float gray = dot(color.rgb, vec3(redScale, greenScale, blueScale));
    vec4 bw = vec4(vec3(gray), 1.);

    if(u_inProgress) {
        gl_FragColor = mix(toGray(progressColor1.rgb), toGray(progressColor2.rgb), v);
    } else {
        gl_FragColor = mix(bw, color, c);
    }
}

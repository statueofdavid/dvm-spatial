import * as THREE from 'three';

export const FILTERS = [
  { id: -1, label: 'RAW_HUMAN' },
  { id: 0, label: 'BLUEPRINT' },
  { id: 1, label: 'THERMAL' },
  { id: 2, label: 'VAPOR' },
  { id: 3, label: 'NIGHT_VIS' },
  { id: 4, label: '1-BIT' },      
  { id: 5, label: 'CHROMATIC' },  
  { id: 6, label: 'GLITCH' },
];

export const FutureShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uDivider: { value: 0.5 },
    uFilterMode: { value: -1 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uDivider;
    uniform int uFilterMode;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    vec3 applyFilter(vec3 color, vec2 uv) {
        if (uFilterMode == -1) return color;
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        if (uFilterMode == 0) return mix(vec3(0.05, 0.2, 0.9), vec3(0.9, 0.95, 1.0), gray);
        if (uFilterMode == 1) { 
             vec3 c = vec3(0.0,0.0,1.0); vec3 m = vec3(1.0,1.0,0.0); vec3 h = vec3(1.0,0.0,0.0);
             return mix(c, m, gray * 2.0) * step(0.0, 0.5 - gray) + mix(m, h, (gray - 0.5) * 2.0) * step(0.5, gray);
        }
        if (uFilterMode == 2) return mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 1.0), gray);
        if (uFilterMode == 3) {
             float noise = random(uv * uTime) * 0.2;
             return vec3(0.0, (gray + noise) * 1.5, 0.0);
        }
        if (uFilterMode == 4) {
             float blocks = 400.0;
             vec2 ditherUV = floor(uv * blocks);
             float noise = random(ditherUV);
             float threshold = gray + (noise - 0.5) * 0.3;
             return vec3(step(0.5, threshold));
        }
        if (uFilterMode == 6) {
             float bar = step(0.95, fract(uv.y * 10.0 + uTime * 5.0));
             vec3 glitch = mix(color, 1.0 - color, bar);
             return mix(glitch, vec3(0.0, 1.0, 0.0), bar * 0.5);
        }
        return color;
    }

    vec3 getShadedColor(sampler2D tex, vec2 uv) {
        if (uFilterMode == 5) {
            float dist = distance(uv, vec2(0.5));
            float offset = dist * 0.02 * sin(uTime * 2.0) + 0.005;
            float r = texture2D(tex, uv + vec2(offset, 0.0)).r;
            float g = texture2D(tex, uv).g;
            float b = texture2D(tex, uv - vec2(offset, 0.0)).b;
            return vec3(r, g, b);
        }
        if (uFilterMode == 6) {
            float shift = step(0.98, random(vec2(floor(uv.y * 40.0), floor(uTime * 20.0))));
            uv.x += shift * 0.1 * sin(uTime);
        }
        return applyFilter(texture2D(tex, uv).rgb, uv);
    }

    float getHexChar(vec2 uv, int n) {
        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
        vec2 grid = floor(uv * vec2(3.0, 5.0));
        float x = grid.x; float y = grid.y;
        bool t=y==4.0; bool b=y==0.0; bool m=y==2.0; bool l=x==0.0; bool r=x==2.0;
        bool on = false;
        if(n==0) on=(t||b||l||r) && !m;
        if(n==1) on=(r);
        if(n==2) on=t||m||b||(r&&y>2.0)||(l&&y<2.0);
        if(n==3) on=t||m||b||r;
        if(n==4) on=m||r||(l&&y>2.0);
        if(n==5) on=t||m||b||(l&&y>2.0)||(r&&y<2.0);
        if(n==6) on=t||m||b||l||(r&&y<2.0);
        if(n==7) on=t||r;
        if(n==8) on=t||b||l||r||m;
        if(n==9) on=t||m||r||(l&&y>2.0);
        if(n>=10) on=(l||r||m||t) && !(n==11&&t) && !(n==13&&t);
        return on ? 1.0 : 0.0;
    }

    vec3 rawHexDump(sampler2D tex, vec2 uv) {
        float rows = 80.0; 
        float cols = rows * (uResolution.x / uResolution.y) * 0.6;
        vec2 cellId = floor(uv * vec2(cols, rows));
        vec2 cellUv = fract(uv * vec2(cols, rows));
        vec2 sampleUv = (cellId + 0.5) / vec2(cols, rows);
        vec3 dataColor = getShadedColor(tex, sampleUv);
        float lum = dot(dataColor, vec3(0.33));
        int val = int(lum * 15.99);
        vec2 charUv = (cellUv - 0.2) / 0.6;
        float charMask = getHexChar(charUv, val);
        return charMask * max(dataColor * 1.8, vec3(0.0, 0.05, 0.0));
    }

    void main() {
      vec2 uv = vUv;
      vec3 rawCheck = texture2D(tDiffuse, uv).rgb;
      if (length(rawCheck) < 0.1) {
          gl_FragColor = vec4(applyFilter(vec3(random(uv * uTime) * 0.15), uv), 1.0); 
          return;
      }
      vec3 leftColor = getShadedColor(tDiffuse, uv);
      vec3 rightColor = rawHexDump(tDiffuse, uv);
      float split = step(uDivider, uv.x);
      vec3 finalColor = mix(leftColor, rightColor, split);
      float line = 1.0 - smoothstep(0.002, 0.003, abs(uv.x - uDivider));
      gl_FragColor = vec4(finalColor + vec3(1.0, 0.5, 0.0) * line, 1.0);
    }
  `
};
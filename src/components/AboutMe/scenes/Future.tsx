import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const CompilerShader = {
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

    // --- UTILS ---
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Post-Sampling
    vec3 applyFilter(vec3 color, vec2 uv) {
        if (uFilterMode == -1) return color; // RAW_HUMAN
        
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        
        // 0: BLUEPRINT (Technical)
        if (uFilterMode == 0) { 
             return mix(vec3(0.05, 0.2, 0.9), vec3(0.9, 0.95, 1.0), gray);
        }
        
        // 1: THERMAL (Heatmap)
        if (uFilterMode == 1) { 
             vec3 c = vec3(0.0,0.0,1.0); vec3 m = vec3(1.0,1.0,0.0); vec3 h = vec3(1.0,0.0,0.0);
             return mix(c, m, gray * 2.0) * step(0.0, 0.5 - gray) + mix(m, h, (gray - 0.5) * 2.0) * step(0.5, gray);
        }
        
        // 2: VAPOR (Aesthetic)
        if (uFilterMode == 2) {
             return mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 1.0), gray);
        }
        
        // 3: NIGHT_VIS (Noisy Green)
        if (uFilterMode == 3) {
             float noise = random(uv * uTime) * 0.2;
             return vec3(0.0, (gray + noise) * 1.5, 0.0);
        }

        // 4: 1-BIT (Retro Dither)
        if (uFilterMode == 4) {
             float blocks = 400.0;
             vec2 ditherUV = floor(uv * blocks);
             float noise = random(ditherUV);
             float threshold = gray + (noise - 0.5) * 0.3;
             return vec3(step(0.5, threshold));
        }

        // 6: GLITCH (Color Inversion Component)
        if (uFilterMode == 6) {
             float bar = step(0.95, fract(uv.y * 10.0 + uTime * 5.0));
             vec3 glitch = mix(color, 1.0 - color, bar);
             return mix(glitch, vec3(0.0, 1.0, 0.0), bar * 0.5);
        }

        return color;
    }

    // Handles Distortion/Displacement ---
    vec3 getShadedColor(sampler2D tex, vec2 uv) {
        
        // 5: CHROMATIC (RGB Split Displacement)
        if (uFilterMode == 5) {
            float dist = distance(uv, vec2(0.5));
            float offset = dist * 0.02 * sin(uTime * 2.0) + 0.005;
            float r = texture2D(tex, uv + vec2(offset, 0.0)).r;
            float g = texture2D(tex, uv).g;
            float b = texture2D(tex, uv - vec2(offset, 0.0)).b;
            return vec3(r, g, b);
        }

        // 6: GLITCH (Spatial Tearing)
        if (uFilterMode == 6) {
            float shift = step(0.98, random(vec2(floor(uv.y * 40.0), floor(uTime * 20.0))));
            uv.x += shift * 0.1 * sin(uTime);
        }

        // Default
        vec3 color = texture2D(tex, uv).rgb;
        return applyFilter(color, uv);
    }

    // generating hex
    float getHexChar(vec2 uv, int n) {
        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
        vec2 grid = floor(uv * vec2(3.0, 5.0));
        float x = grid.x; float y = grid.y;
        bool on = false;
        bool t=y==4.0; bool b=y==0.0; bool m=y==2.0; bool l=x==0.0; bool r=x==2.0;
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

    // --- 4. RAW HEX DUMP ---
    vec3 rawHexDump(sampler2D tex, vec2 uv) {
        float rows = 80.0; 
        float cols = rows * (uResolution.x / uResolution.y) * 0.6;
        
        vec2 cellId = floor(uv * vec2(cols, rows));
        vec2 cellUv = fract(uv * vec2(cols, rows));
        vec2 sampleUv = (cellId + 0.5) / vec2(cols, rows);
        
        // CRITICAL: Use the Distorted Shading Logic here too!
        // This ensures the hex code "glitches" when the video glitches.
        vec3 dataColor = getShadedColor(tex, sampleUv);
        
        float lum = dot(dataColor, vec3(0.33));
        int val = int(lum * 15.99);
        
        vec2 charUv = (cellUv - 0.2) / 0.6;
        float charMask = getHexChar(charUv, val);
        
        vec3 textColor = max(dataColor * 1.8, vec3(0.0, 0.05, 0.0)); 
        return charMask * textColor;
    }

    void main() {
      vec2 uv = vUv;
      
      // STATIC FALLBACK
      vec3 rawCheck = texture2D(tDiffuse, uv).rgb;
      if (length(rawCheck) < 0.1) {
          vec3 noise = vec3(random(uv * uTime) * 0.15);
          // Apply filter to noise too
          gl_FragColor = vec4(applyFilter(noise, uv), 1.0); 
          return;
      }

      // RENDER BOTH SIDES
      vec3 leftColor = getShadedColor(tDiffuse, uv);
      vec3 rightColor = rawHexDump(tDiffuse, uv);

      // COMPOSITE
      float split = step(uDivider, uv.x);
      vec3 finalColor = mix(leftColor, rightColor, split);

      float line = 1.0 - smoothstep(0.002, 0.003, abs(uv.x - uDivider));
      finalColor += vec3(1.0, 0.5, 0.0) * line; 

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

const FILTERS = [
  { id: -1, label: 'RAW_HUMAN' },
  { id: 0, label: 'BLUEPRINT' },
  { id: 1, label: 'THERMAL' },
  { id: 2, label: 'VAPOR' },
  { id: 3, label: 'NIGHT_VIS' },
  { id: 4, label: '1-BIT' },      
  { id: 5, label: 'CHROMATIC' },  
  { id: 6, label: 'GLITCH' },
]

const SplitScreenScene = ({ activeFilter, dividerPos, isInitialized }: { activeFilter: number, dividerPos: number, isInitialized: boolean }) => {
  const [video] = useState(() => {
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    return v;
  });
  
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  const texture = useMemo(() => {
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [video]);

  useEffect(() => {
    if (!isInitialized) return;
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      .then(s => { video.srcObject = s; video.play(); })
      .catch(e => console.warn("Camera denied:", e));
    return () => {
      const stream = video.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [video, isInitialized]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uDivider.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uDivider.value,
        dividerPos,
        0.2
      );
      materialRef.current.uniforms.uFilterMode.value = activeFilter;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        ref={materialRef} 
        {...CompilerShader} 
        uniforms-tDiffuse-value={texture} 
      />
    </mesh>
  );
};

const Future = ({ progress, step, onNavigate }: { progress: number; step: any; onNavigate: (id: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState(-1);
  const [dividerPos, setDividerPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);
  
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const newPos = Math.max(0.01, Math.min(0.99, clientX / window.innerWidth));
    setDividerPos(newPos);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
    }
  }, [isDragging, handleDragMove]);

  const uiOpacity = progress > 0.15 ? 1 : 0;

  return (
    <div className="future-scene-wrapper" style={{ 
      position: 'absolute', inset: 0, width: '100%', height: '100%', 
      background: '#000', pointerEvents: 'all',
      cursor: isDragging ? 'ew-resize' : 'default'
    }}>
      
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas dpr={[1, 1.5]}>
          <SplitScreenScene 
            activeFilter={activeFilter} 
            dividerPos={dividerPos} 
            isInitialized={isInitialized} 
          />
          <PerspectiveCamera makeDefault position={[0, 0, 1]} />
        </Canvas>
      </div>

      <div 
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          position: 'absolute', top: 0, bottom: 0, width: '60px',
          left: `calc(${dividerPos * 100}% - 30px)`,
          zIndex: 200, cursor: 'ew-resize',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <div style={{ width: '2px', height: '100%', background: '#ff810a', boxShadow: '0 0 15px #ff810a' }} />
        <div style={{ 
          position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', 
          border: '2px solid #ff810a', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
           <div style={{ width: '8px', height: '8px', background: '#ff810a', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Asking for Camera Use */}
      {!isInitialized && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px'
        }}>
           <h3 style={{ color: '#fff', fontFamily: 'monospace', letterSpacing: '4px' }}>// SYSTEM_READY</h3>
           <button 
             onClick={() => setInitialized(true)}
             style={{
               background: '#ff810a', color: '#000', border: 'none', padding: '16px 32px',
               fontFamily: 'monospace', fontWeight: 900, cursor: 'pointer',
               boxShadow: '0 0 20px rgba(255, 129, 10, 0.4)', borderRadius: '2px'
             }}
           >
             [ INITIALIZE_CAMERA ]
           </button>
           <p style={{ color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>
             Input required for neural handshake.
           </p>
        </div>
      )}

      {/* Left Side: All the Filter Selectors */}
      <div style={{ 
        position: 'absolute', 
        left: '40px', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        zIndex: 100, 
        opacity: isInitialized ? uiOpacity : 0, 
        transition: '0.5s'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontFamily: 'monospace', color: '#888', fontSize: '10px', marginBottom: '8px' }}>// FILTER_STACK</span>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              textAlign: 'left', padding: '8px', background: 'transparent',
              borderLeft: activeFilter === f.id ? '3px solid #fff' : '1px solid rgba(255,255,255,0.2)',
              borderTop: 'none', borderRight: 'none', borderBottom: 'none',
              color: activeFilter === f.id ? '#fff' : '#666',
              fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer', transition: '0.2s'
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Side: Quip and Contact */}
      <div style={{ 
        position: 'absolute', 
        right: '12%', 
        top: '50%', 
        transform: 'translateY(-50%)', 
        zIndex: 100, 
        opacity: isInitialized ? uiOpacity : 0, 
        transition: '0.5s',
        
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        maxWidth: '550px',
        width: '85%',      
        textAlign: 'right'
      }}>
        
        {/* Step Text */}
        <h2 style={{ 
            color: '#fff', 
            fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', 
            margin: '0 0 1.5rem 0', 
            fontFamily: 'serif', 
            fontStyle: 'italic', 
            lineHeight: 1.2,
            textShadow: '0 0 30px rgba(0,0,0,0.8)'
          }}>
           {step?.text || "What gaps can we build together..."}
        </h2>
        
        {/* Actions */}
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: '15px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
             <button 
              onClick={() => onNavigate('passion')} 
              style={{ 
                background: '#ff810a', color: '#000', border: 'none', padding: '12px 24px', 
                fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            >
              [ CONNECT ]
            </button>
            <a 
              href="mailto:admin@declared.space" 
              style={{ 
                padding: '12px 24px', color: '#fff', border: '1px solid #fff', 
                textDecoration: 'none', fontFamily: 'monospace', fontSize: '12px',
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
              }}
            >
              [ EMAIL_ME ]
            </a>
        </div>
      </div>

    </div>
  );
};

export default Future;
import { shaderMaterial } from "@react-three/drei";
import { extend, ShaderMaterialProps } from "@react-three/fiber";
import glsl from "glslify";
import * as THREE from "three";

// This shader is adapted from magician0809 on Shadertoy: https://www.shadertoy.com/view/3tBGRm
const HaloMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color("red"),
    color2: new THREE.Color("green"),
    color3: new THREE.Color("blue"),
    aspect: 1,
    magnitude: 0,
  },
  glsl`
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        vUv = uv;
      }`,
  glsl`
      uniform float time;
      uniform vec3 colorStart;
      uniform vec3 colorEnd;
      uniform float aspect;
      uniform float magnitude;
      varying vec2 vUv;
      
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      
      const float innerRadius = 0.6;
      const float noiseScale = 0.65;

      #define BG_COLOR (vec3(sin(time)*0.5+0.5) * 0.0 + vec3(0.0))
      
      float light1(float intensity, float attenuation, float dist) {
        return intensity / (1.0 + dist * attenuation);
      }

      float light2(float intensity, float attenuation, float dist) {
        return intensity / (1.0 + dist * dist * attenuation);
      }
      
      vec4 extractAlpha(vec3 colorIn) {
        vec4 colorOut;
        float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
        if (maxValue > 1e-5) {
          colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
          colorOut.a = maxValue;
        }
        else {
          colorOut = vec4(0.0);
        }
        return colorOut;
      }

      vec2 scaleUv(vec2 uv) {
        vec2 scaledUv = uv - 0.5;
        if (aspect > 1.0) {
          scaledUv *= vec2(aspect * aspect, aspect);
        } else {
          scaledUv /= vec2(aspect, aspect * aspect);
        }
        return scaledUv;
      }
      
      void main() {
        // Scale UV for portrait and landscape orientations
        vec2 uv = scaleUv(vUv);

        float ang = atan(uv.y, uv.x);
        float len = length(uv);
        float v0, v1, v2, v3, cl;
        float r0, d0, n0;
        float r, d;

        float min_input = 0.;
        float max_input = 1000.;
        float scaling_factor = 1. / log(1. + max_input - min_input);
        float intensity = scaling_factor * log(1. + max(magnitude - min_input, 0.));
        
        // ring
        n0 = 1.0;
        r0 = mix(innerRadius, 1.0, 0.5);
        d0 = distance(uv, r0 / len * uv);
        v0 = light1(1.0 * intensity, 10.0, d0);
        v0 *= smoothstep(r0 * 1.05, r0, len);
        cl = cos(ang + time * 2.0) * 0.5 + 0.5;
        
        // high light
        float a = time * -1.0;
        vec2 pos = vec2(cos(a), sin(a)) * r0;
        d = distance(uv, pos);
        v1 = light2(1.5 * intensity, 5.0, d);
        v1 *= light1(1.0 * intensity, 50.0 , d0);
        
        // back decay
        v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
        
        // hole
        v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
        
        // color
        vec3 c = mix(color1, color2, cl);
        vec3 col = mix(color1, color2, cl);
        col = mix(color3, col, v0);
        col = (col + v1) * v2 * v3;
        col.rgb = clamp(col.rgb, 0.0, 1.0);
        
        gl_FragColor = extractAlpha(col);

        vec3 bg = BG_COLOR;
        gl_FragColor.rgb = mix(bg, gl_FragColor.rgb, gl_FragColor.a); // normal blend

        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`
);

// Extend so the reconciler will learn about it
extend({ HaloMaterial });

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    haloMaterial: ShaderMaterialProps & {
      aspect: number;
      magnitude: number;
      color1?: THREE.Color;
      color2?: THREE.Color;
      color3?: THREE.Color;
    };
  }
}

export { HaloMaterial };

import * as THREE from "three";
import { extend, Object3DNode } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "glslify";

// This shader is from magician0809 on Shadertoy: https://www.shadertoy.com/view/3tBGRm
const HaloMaterial = shaderMaterial(
  {
    time: 0,
    colorStart: new THREE.Color("black"),
    colorEnd: new THREE.Color(88 / 255, 28 / 255, 135 / 255),
    aspect: 1,
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
      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d.glsl) 
      uniform float time;
      uniform vec3 colorStart;
      uniform vec3 colorEnd;
      uniform float aspect;
      varying vec2 vUv;
      const int numOctaves = 3;
      
      const vec3 color1 = vec3(0.611765, 0.262745, 0.996078);
      const vec3 color2 = vec3(0.298039, 0.760784, 0.913725);
      const vec3 color3 = vec3(0.062745, 0.078431, 0.600000);
      const float innerRadius = 0.6;
      const float noiseScale = 0.65;

      #define BG_COLOR (vec3(sin(time)*0.5+0.5) * 0.0 + vec3(0.0))
      
      float light1(float intensity, float attenuation, float dist)
      {
          return intensity / (1.0 + dist * attenuation);
      }
      float light2(float intensity, float attenuation, float dist)
      {
          return intensity / (1.0 + dist * dist * attenuation);
      }
      
      vec4 extractAlpha(vec3 colorIn)
{
    vec4 colorOut;
    float maxValue = min(max(max(colorIn.r, colorIn.g), colorIn.b), 1.0);
    if (maxValue > 1e-5)
    {
        colorOut.rgb = colorIn.rgb * (1.0 / maxValue);
        colorOut.a = maxValue;
    }
    else
    {
        colorOut = vec4(0.0);
    }
    return colorOut;
}
      
      void main() {
        vec2 uv = (vUv - 0.5) / aspect * vec2(1.0, 1.0 / aspect);
        float ang = atan(uv.y, uv.x);
        float len = length(uv);
        float v0, v1, v2, v3, cl;
        float r0, d0, n0;
        float r, d;
        
        // ring
        n0 = snoise3( vec3(uv * noiseScale, time * 0.5) ) * 0.5 + 0.5;
        r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
        d0 = distance(uv, r0 / len * uv);
        v0 = light1(1.0, 10.0, d0);
        v0 *= smoothstep(r0 * 1.05, r0, len);
        cl = cos(ang + time * 2.0) * 0.5 + 0.5;
        
        // high light
        float a = time * -1.0;
        vec2 pos = vec2(cos(a), sin(a)) * r0;
        d = distance(uv, pos);
        v1 = light2(1.5, 5.0, d);
        v1 *= light1(1.0, 50.0 , d0);
        
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
        gl_FragColor.rgb = mix(bg, gl_FragColor.rgb, gl_FragColor.a); //normal blend
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`
);

// Extend so the reconciler will learn about it
extend({ HaloMaterial });

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    haloMaterial: Object3DNode<THREE.ShaderMaterial, typeof HaloMaterial>;
  }
}

export { HaloMaterial };

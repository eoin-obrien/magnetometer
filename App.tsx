import { ExpoWebGLRenderingContext } from "expo-gl";
import { StatusBar } from "expo-status-bar";
import React, { useRef } from "react";
import { Text, View } from "react-native";
import useMagnetometer from "./hooks/useMagnetometer";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { HaloMaterial } from "./src/HaloMaterial";

interface HaloProps {
  magnitude: number;
}

function Halo({ magnitude }: HaloProps) {
  const ref = useRef<any>();
  const { width, height, aspect } = useThree((state) => state.viewport);
  useFrame((state, delta) => (ref.current.time += delta));
  return (
    <mesh scale={[width, height, 1]}>
      <planeGeometry />
      <haloMaterial
        ref={ref}
        key={HaloMaterial.key}
        toneMapped={true}
        aspect={aspect}
        magnitude={magnitude}
      />
    </mesh>
  );
}

export default function App() {
  const { magnitude } = useMagnetometer();
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <View className="w-full h-full m-10 absolute">
        <Canvas orthographic gl={{ powerPreference: "low-power" }}>
          <Halo magnitude={magnitude} />
        </Canvas>
      </View>
      <Text className="text-[56px] text-white">{Math.round(magnitude)}</Text>
      <Text className="text-xl text-slate-300 bg-purple">&micro;T</Text>
      {/* <View className="animate-ping absolute inline-flex h-64 w-64 rounded-full border-8 border-indigo-500 opacity-75"></View> */}
      <StatusBar style="auto" />
    </View>
  );
}

function onContextCreate(gl: ExpoWebGLRenderingContext) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);

  // Create vertex shader (shape & position)
  const vert = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(
    vert,
    `
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 100.0;
    }
  `
  );
  gl.compileShader(vert);

  // Create fragment shader (color)
  const frag = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(
    frag,
    `
    precision mediump float;
    
    uniform vec3 color1;
    uniform vec3 color2;
    
    void main(void) {
      vec2 st = gl_PointCoord;
      float mixValue = distance(st, vec2(0, 1));
    
      vec3 color = mix(color1, color2, mixValue);
        
      gl_FragColor = vec4(color, 1);
    }
  `
  );
  gl.compileShader(frag);

  // Link together into a program
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.uniform3f("color1", 1.0, 0.55, 0);
  gl.uniform3f("color2", 0.226, 0.0, 0.615);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);

  gl.flush();
  gl.endFrameEXP();
}

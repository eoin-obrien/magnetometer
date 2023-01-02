import React, { useRef } from "react";
import { Text, View } from "react-native";
import colors from "tailwindcss/colors";
import useMagnetometer from "../hooks/useMagnetometer";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Color } from "three";
import { HaloMaterial } from "./HaloMaterial";

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
        color1={new Color(colors.purple[500])}
        color2={new Color(colors.sky[500])}
        color3={new Color(colors.indigo[900])}
      />
    </mesh>
  );
}

export default function MagnetometerView() {
  const { magnitude } = useMagnetometer();
  return (
    <>
      <View className="w-full h-full m-10 absolute">
        <Canvas orthographic gl={{ powerPreference: "low-power" }}>
          <Halo magnitude={magnitude} />
        </Canvas>
      </View>
      <Text className="text-[56px] text-white">{Math.round(magnitude)}</Text>
      <Text className="text-xl text-slate-300 bg-purple">&micro;T</Text>
    </>
  );
}

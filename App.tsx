import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import useMagnetometer from "./hooks/useMagnetometer";

export default function App() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const magneticFluxDensity = useMagnetometer();
  return (
    // <View className="flex-1 items-center justify-center bg-white dark:bg-slate-800">
    <View className="flex-1 items-center justify-center bg-slate-800">
      <Text className="text-[56px] text-slate-900 dark:text-white">{Math.round(magneticFluxDensity)}</Text>
      <Text className="text-xl text-slate-600 dark:text-slate-300">&micro;T</Text>
      {/* <View className="animate-ping absolute inline-flex h-64 w-64 rounded-full border-8 border-indigo-500 opacity-75"></View> */}
      <StatusBar style="auto" />
    </View>
  );
}

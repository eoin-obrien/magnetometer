import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Magnetometer } from "expo-sensors";
import MagnetometerView from "./src/components/MagnetometerView";

interface HaloProps {
  magnitude: number;
}

export default function App() {
  const [hasMagnetometer, setHasMagnetometer] = useState<boolean>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    (async () => {
      Magnetometer.isAvailableAsync()
        .then((isAvailable) => setHasMagnetometer(isAvailable))
        .catch((err) => setError(err));
    })();
  }, []);

  let content;
  if (hasMagnetometer === undefined) {
    // Display placeholder text when loading
    content = (
      <Text className="text-lg text-white">Initializing magnetometer...</Text>
    );
  } else if (!hasMagnetometer) {
    // Display error message if no magnetometer is available
    content = (
      <Text className="text-lg text-white">
        Looks like your device doesn't have a magnetometer!
      </Text>
    );
  } else if (error) {
    // Display other error messages if available
    content = (
      <Text className="text-lg text-white">
        {error.name}: {error.message}
      </Text>
    );
  } else {
    content = <MagnetometerView />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-black">
      {content}
      <StatusBar style="auto" />
    </View>
  );
}

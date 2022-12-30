import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";
import { useState, useEffect } from "react";

export default function useMagnetometer() {
  const [measurement, setMeasurement] = useState(0);

  useEffect(() => {
    const handleMeasurement = ({ x, y, z }: MagnetometerMeasurement) => {
      setMeasurement(Math.sqrt(x * x + y * y + z * z));
    };

    const subscription = Magnetometer.addListener(handleMeasurement);
    return () => {
      subscription.remove();
    };
  });

  return measurement;
}

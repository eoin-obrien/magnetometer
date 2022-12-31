import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";
import { useState, useEffect, useRef } from "react";
import KalmanFilter from "../src/Kalman";

export default function useMagnetometer() {
  const [magnitude, setMagnitude] = useState(0);

  useEffect(() => {
    const handleMeasurement = ({ x, y, z }: MagnetometerMeasurement) => {
      const measurement = Math.sqrt(x * x + y * y + z * z);
      setMagnitude(measurement);
    };

    const subscription = Magnetometer.addListener(handleMeasurement);
    // Magnetometer.setUpdateInterval(16);
    return () => {
      subscription.remove();
    };
  });

  return { magnitude };
}

function smooth(
  measurement: number,
  lastMeasurement: number,
  alpha: number
): number {
  return lastMeasurement + alpha * (measurement - lastMeasurement);
}

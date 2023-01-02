import { Magnetometer, MagnetometerMeasurement } from "expo-sensors";
import { useEffect, useState } from "react";

export default function useMagnetometer() {
  const [magnitude, setMagnitude] = useState(0);

  useEffect(() => {
    const handleMeasurement = ({ x, y, z }: MagnetometerMeasurement) => {
      const measurement = Math.sqrt(x * x + y * y + z * z);
      setMagnitude(measurement);
    };

    const subscription = Magnetometer.addListener(handleMeasurement);
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

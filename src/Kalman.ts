/**
 * KalmanFilter
 * @class
 * @author Wouter Bulten
 * @see {@link http://github.com/wouterbulten/kalmanjs}
 * @version Version: 1.0.0-beta
 * @copyright Copyright 2015-2018 Wouter Bulten
 * @license MIT License
 * @preserve
 */
export default class KalmanFilter {
  R: number;
  Q: number;
  A: number;
  C: number;
  B: number;
  cov: number;
  x: number;

  /**
   * Create 1-dimensional kalman filter
   * @param options.R Process noise
   * @param options.Q Measurement noise
   * @param options.A State vector
   * @param options.B Control vector
   * @param options.C Measurement vector
   */
  constructor({ R = 1, Q = 1, A = 1, B = 0, C = 1 } = {}) {
    this.R = R; // noise power desirable
    this.Q = Q; // noise power estimated
    this.A = A;
    this.C = C;
    this.B = B;
    this.cov = NaN;
    this.x = NaN; // estimated signal without noise
  }

  /**
   * Filter a new value
   * @param z Measurement
   * @param u Control
   */
  filter(z: number, u: number = 0): number {
    if (isNaN(this.x)) {
      this.x = (1 / this.C) * z;
      this.cov = (1 / this.C) * this.Q * (1 / this.C);
    } else {
      // Compute prediction
      const predX = this.predict(u);
      const predCov = this.uncertainty();

      // Kalman gain
      const K = predCov * this.C * (1 / (this.C * predCov * this.C + this.Q));

      // Correction
      this.x = predX + K * (z - this.C * predX);
      this.cov = predCov - K * this.C * predCov;
    }

    return this.x;
  }

  /**
   * Predict next value
   * @param u Control
   */
  predict(u: number = 0): number {
    return this.A * this.x + this.B * u;
  }

  /**
   * Return uncertainty of filter
   */
  uncertainty(): number {
    return this.A * this.cov * this.A + this.R;
  }

  /**
   * Return the last filtered measurement
   */
  lastMeasurement(): number {
    return this.x;
  }

  /**
   * Set measurement noise Q
   * @param noise
   */
  setMeasurementNoise(noise: number) {
    this.Q = noise;
  }

  /**
   * Set the process noise R
   * @param noise
   */
  setProcessNoise(noise: number) {
    this.R = noise;
  }
}

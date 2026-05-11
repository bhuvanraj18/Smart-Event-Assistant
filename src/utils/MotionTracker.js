// Enhanced optical-flow motion tracker with surface detection and feature tracking
export class MotionTracker {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.canvas.width = 64;
    this.canvas.height = 48;
    this.prev = null;
    this.totalX = 0;
    this.totalY = 0;
    this.features = [];
    this.surfaceConfidence = 0;
    this.motionSmoothing = [];
  }

  reset() {
    this.prev = null;
    this.totalX = 0;
    this.totalY = 0;
    this.features = [];
    this.surfaceConfidence = 0;
    this.motionSmoothing = [];
  }

  detectFeatures(data, W, H) {
    const features = [];
    const threshold = 25;
    for (let y = 5; y < H - 5; y += 4) {
      for (let x = 5; x < W - 5; x += 4) {
        const center = data[y * W + x];
        let cornerScore = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 && dy === 0) continue;
            cornerScore += Math.abs(data[(y + dy) * W + (x + dx)] - center);
          }
        }
        if (cornerScore > threshold) {
          features.push({ x, y, score: cornerScore });
        }
      }
    }
    return features.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  trackFeatures(prev, curr, W, H) {
    let totalDx = 0, totalDy = 0, matchCount = 0;
    const R = 8;
    this.features = this.detectFeatures(curr, W, H);
    for (const feature of this.features) {
      let bestDx = 0, bestDy = 0, bestDiff = 1e9;
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const nx = feature.x + dx, ny = feature.y + dy;
          if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
            const diff = Math.abs(prev[(feature.y - dy) * W + (feature.x - dx)] - curr[ny * W + nx]);
            if (diff < bestDiff) { bestDiff = diff; bestDx = dx; bestDy = dy; }
          }
        }
      }
      if (bestDiff < 30) {
        totalDx += bestDx;
        totalDy += bestDy;
        matchCount++;
      }
    }
    return { dx: matchCount > 0 ? totalDx / matchCount : 0, dy: matchCount > 0 ? totalDy / matchCount : 0, confidence: matchCount / Math.max(1, this.features.length) };
  }

  smoothMotion(x, y) {
    this.motionSmoothing.push({ x, y });
    if (this.motionSmoothing.length > 5) this.motionSmoothing.shift();
    let avgX = 0, avgY = 0;
    for (const m of this.motionSmoothing) {
      avgX += m.x;
      avgY += m.y;
    }
    return { x: avgX / this.motionSmoothing.length, y: avgY / this.motionSmoothing.length };
  }

  track(video) {
    const W = 64, H = 48;
    this.ctx.drawImage(video, 0, 0, W, H);
    const d = this.ctx.getImageData(0, 0, W, H).data;
    const curr = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) curr[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 150 + d[i * 4 + 2] * 29) >> 8;

    if (this.prev) {
      const R = 6, M = R + 1;
      let bestDx = 0, bestDy = 0, bestS = 1e9;
      for (let dy = -R; dy <= R; dy += 1) {
        for (let dx = -R; dx <= R; dx += 1) {
          let s = 0;
          for (let y = M; y < H - M; y += 3)
            for (let x = M; x < W - M; x += 3)
              s += Math.abs(this.prev[y * W + x] - curr[(y + dy) * W + (x + dx)]);
          if (s < bestS) { bestS = s; bestDx = dx; bestDy = dy; }
        }
      }

      const { dx: featureDx, dy: featureDy, confidence } = this.trackFeatures(this.prev, curr, W, H);
      this.surfaceConfidence = confidence;

      if (confidence > 0.5) {
        bestDx = featureDx;
        bestDy = featureDy;
      }

      const { x: smoothX, y: smoothY } = this.smoothMotion(bestDx, bestDy);
      this.totalX += smoothX;
      this.totalY += smoothY;
    }
    this.prev = curr;
    return { x: this.totalX, y: this.totalY, surfaceConfidence: this.surfaceConfidence, featureCount: this.features.length };
  }
}

// Optical-flow motion tracker — compares consecutive video frames to estimate camera movement
export class MotionTracker {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.canvas.width = 64;
    this.canvas.height = 48;
    this.prev = null;
    this.totalX = 0;
    this.totalY = 0;
  }

  reset() { this.prev = null; this.totalX = 0; this.totalY = 0; }

  track(video) {
    const W = 64, H = 48;
    this.ctx.drawImage(video, 0, 0, W, H);
    const d = this.ctx.getImageData(0, 0, W, H).data;
    const curr = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) curr[i] = (d[i*4]*77 + d[i*4+1]*150 + d[i*4+2]*29) >> 8;

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
      this.totalX += bestDx;
      this.totalY += bestDy;
    }
    this.prev = curr;
    return { x: this.totalX, y: this.totalY };
  }
}

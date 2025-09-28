export class H5PProgressTracker {
  private progress: number = 0;
  private callbacks: ((progress: number) => void)[] = [];

  constructor() {
    this.progress = 0;
  }

  setProgress(progress: number) {
    this.progress = Math.max(0, Math.min(100, progress));
    this.callbacks.forEach(callback => callback(this.progress));
  }

  getProgress(): number {
    return this.progress;
  }

  onProgress(callback: (progress: number) => void) {
    this.callbacks.push(callback);
  }

  reset() {
    this.progress = 0;
    this.callbacks.forEach(callback => callback(this.progress));
  }
}

export default H5PProgressTracker;
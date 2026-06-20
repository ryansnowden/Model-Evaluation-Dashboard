import { alignAudioFrames } from './alignment';

describe('alignAudioFrames', () => {
  it('should align raw audio frames with VAD trigger boundaries', () => {
    const rawFrames = [0.1, 0.5, 0.9, 0.8, 0.2];
    const triggerThreshold = 0.5;
    const aligned = alignAudioFrames(rawFrames, triggerThreshold);
    expect(aligned.triggers).toEqual([
      { startFrame: 1, endFrame: 3, peak: 0.9 }
    ]);
  });
});

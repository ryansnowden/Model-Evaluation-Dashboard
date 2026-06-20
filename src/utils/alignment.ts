export interface TriggerBoundary {
  startFrame: number;
  endFrame: number;
  peak: number;
}

export function alignAudioFrames(rawFrames: number[], triggerThreshold: number): { triggers: TriggerBoundary[] } {
  const triggers: TriggerBoundary[] = [];
  let inTrigger = false;
  let currentStart = -1;
  let currentPeak = 0;

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i];
    if (frame >= triggerThreshold) {
      if (!inTrigger) {
        inTrigger = true;
        currentStart = i;
        currentPeak = frame;
      } else {
        if (frame > currentPeak) {
          currentPeak = frame;
        }
      }
    } else {
      if (inTrigger) {
        triggers.push({ startFrame: currentStart, endFrame: i - 1, peak: currentPeak });
        inTrigger = false;
      }
    }
  }

  // Handle case where trigger extends to the end of the frames
  if (inTrigger) {
    triggers.push({ startFrame: currentStart, endFrame: rawFrames.length - 1, peak: currentPeak });
  }

  return { triggers };
}

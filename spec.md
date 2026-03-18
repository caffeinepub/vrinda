# Vrinda - Facial Emotion Detection

## Current State
Vrinda is a music app with mood-based song queuing. Users manually select a mood from the MoodsPage. Camera component is now available.

## Requested Changes (Diff)

### Add
- FaceEmotionDetector component using face-api.js (TensorFlow.js-based open-source library)
- Camera feed captures user face, detects dominant emotion in real-time
- Emotion-to-mood mapping: happy->happy, sad->sad, neutral->chill, surprised->energetic, fearful->sad, disgusted->dark, angry->dark
- Detect My Mood button on MoodsPage that opens camera overlay
- After 4-second scan, auto-selects matching mood and closes camera
- Scanning animation with countdown while processing

### Modify
- MoodsPage: add Detect My Mood button at top with camera/scan icon
- Detected mood gets highlighted and songs auto-queue same as manual selection

### Remove
- Nothing

## Implementation Plan
1. Install face-api.js
2. Download model weight files to public/models/
3. Create FaceEmotionDetector modal component
4. Wire button in MoodsPage
5. Map face emotions to mood keys and call handleMoodSelect

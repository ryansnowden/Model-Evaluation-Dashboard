# Product Guidelines - VAD Model Evaluation Dashboard

## 1. Tone and Voice
- **Friendly & Approachable:** Use a conversational, helpful tone. The dashboard should feel like a collaborative assistant rather than a sterile machine.
- **Supportive Context:** Provide helpful tooltips, descriptive empty states, and encouraging feedback when users are navigating complex traces or addressing failed evaluations.
- **Clarity over Jargon:** While technical terms (like F1-score, Precision, Recall) are necessary, ensure that error messages and workflow steps are written in plain, accessible language.

## 2. Visual Identity & Color Palette
- **Accessible Utility Colors:** 
  - Rely on clear semantic colors to convey status: Red for failures/errors, Green for success/passing traces, and Amber for warnings/anomalies.
  - Use neutral grays and subdued tones for structural elements (backgrounds, borders, sidebar) to let the data visualization stand out.
- **Theme Support:** Ensure that semantic colors maintain WCAG accessibility contrast ratios in both light and dark modes.

## 3. Motion & Animation Principles
- **Functional & Snappy:** Keep transitions very fast (under 150ms) to ensure the interface feels highly responsive.
- **Immediate Feedback:** Use motion primarily for micro-interactions, such as button presses, hover states, and revealing tooltips, to provide immediate tactile feedback.
- **Avoid Distraction:** Avoid gratuitous, long, or elaborate animations that might distract users from analyzing dense technical data.

import type { EvaluationResult } from '../contracts/index.js'
export const DEMO_SAMPLES: Array<{ id: string; label: string; text: string; expected: EvaluationResult['status']; sample: true; note: string }> = [
  { id: 'sample_correct', label: 'Sample dictated correct insertion', text: 'Um, point N next to the old head, then set head to N.', expected: 'correct', sample: true, note: 'Sample response, not from a real student' },
  { id: 'sample_wrong', label: 'Sample dictated wrong insertion', text: 'Make the new node the head and then point it to the head.', expected: 'incorrect', sample: true, note: 'Sample response, not from a real student' },
  { id: 'sample_ambiguous', label: 'Sample ambiguous insertion', text: 'somehow connect them up', expected: 'insufficient_answer', sample: true, note: 'Sample response, not from a real student' },
]

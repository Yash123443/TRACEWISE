import type { Trace } from '../contracts/index.js'

export interface TraceComparison { firstDivergenceIndex: number | null; explanation: string }

export function compareTraces(student: Trace, correct: Trace): TraceComparison {
  const count = Math.max(student.steps.length, correct.steps.length)
  for (let index = 0; index < count; index++) {
    const studentFrame = student.steps[index]
    const correctFrame = correct.steps[index]
    if (!studentFrame || !correctFrame || studentFrame.head !== correctFrame.head || JSON.stringify(studentFrame.nodes) !== JSON.stringify(correctFrame.nodes) || JSON.stringify(studentFrame.reachable) !== JSON.stringify(correctFrame.reachable) || JSON.stringify(studentFrame.unreachable) !== JSON.stringify(correctFrame.unreachable)) {
      return { firstDivergenceIndex: index, explanation: `The traces first differ at step ${index + 1}${studentFrame ? `: ${studentFrame.note}` : ': the student trace has no corresponding step.'}` }
    }
  }
  return { firstDivergenceIndex: null, explanation: 'The traces match at every step.' }
}

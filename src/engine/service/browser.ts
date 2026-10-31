import { createAiAnswerEvaluator, createAiInterpreter, createHybridEvaluator } from '../evaluation/index.js'
import { createTracewiseService } from './service.js'
import { LocalStorageAdapter } from './storage.js'

export function createBrowserService() {
  return createTracewiseService({ storage: new LocalStorageAdapter(), evaluator: createHybridEvaluator({ interpreter: createAiInterpreter(), answerEvaluator: createAiAnswerEvaluator() }) })
}

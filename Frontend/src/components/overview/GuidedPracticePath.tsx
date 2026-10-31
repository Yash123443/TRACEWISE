import { questions } from '@engine/data'
import { ArrowRight, Check, Circle } from 'lucide-react'
import { guidedQuestionIds } from '../../services/practicePath'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card, CardBody } from '../common/Card'

const pathQuestions = guidedQuestionIds.flatMap((id) => {
  const question = questions.find((item) => item.id === id)
  return question ? [{ id, prompt: question.prompt, type: question.type, difficulty: question.difficulty, conceptIds: question.conceptIds }] : []
})

export function GuidedPracticePath({
  history,
  getConceptName,
  onStart,
}: {
  history: Array<{ questionId: string }>
  getConceptName: (id: string) => string
  onStart: (id: string) => void
}) {
  const attemptedIds = new Set(history.map((attempt) => attempt.questionId))
  const attemptedCount = pathQuestions.filter((question) => attemptedIds.has(question.id)).length

  return (
    <section className="space-y-4" aria-labelledby="guided-practice-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="guided-practice-title" className="text-lg font-bold text-stone-900">Guided practice path</h2>
          <p className="text-sm text-stone-600">A 20-question route through the existing engine question bank.</p>
        </div>
        <Badge variant="teal" size="sm">
          {`${attemptedCount} of ${pathQuestions.length} attempted`}
        </Badge>
      </div>

      <Card className="border-stone-200 bg-white">
          <CardBody className="space-y-3">
            {pathQuestions.map((question, index) => {
              const attempted = attemptedIds.has(question.id)
              return (
                <div key={question.id} className="flex flex-col gap-3 rounded-lg border border-stone-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                      {attempted ? <Check className="h-3.5 w-3.5 text-teal-700" /> : <Circle className="h-3 w-3" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900">{index + 1}. {question.prompt.split('\n')[0]}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {question.conceptIds.map(getConceptName).join(' · ')} · {question.type === 'mcq' ? 'Multiple choice' : question.type === 'trace' ? 'Trace' : 'Explain'} · {question.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:pl-4">
                    <span className="text-xs text-stone-500">{attempted ? 'Attempted' : 'Not attempted'}</span>
                    <Button type="button" variant={attempted ? 'outline' : 'secondary'} size="sm" onClick={() => onStart(question.id)} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                      {attempted ? 'Practice again' : 'Start'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardBody>
      </Card>
    </section>
  )
}

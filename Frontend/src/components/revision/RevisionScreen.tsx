import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'
import { Card, CardBody, CardHeader } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  Clock,
  RotateCcw,
  FastForward,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react'

export function RevisionScreen({
  onStartRevision,
  onRefresh = () => {},
}: {
  onStartRevision: (questionId?: string) => void
  onRefresh?: () => void
}) {
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [demoTime, setDemoTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)

  const reload = async () => {
    setLoading(true)
    try {
      const [q, now] = await Promise.all([TracewiseApi.getRevisionQueue(), TracewiseApi.demoNow()])
      setQueue(q)
      setDemoTime(now)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const changeTime = async (days: number) => {
    setAdvancing(true)
    try {
      await TracewiseApi.advanceDemoTime(days)
      await reload()
      onRefresh()
    } finally {
      setAdvancing(false)
    }
  }

  const reset = async () => {
    if (!window.confirm('Reset the local demo learner profile, simulation clock, and mastery history?')) return
    await TracewiseApi.resetDemo()
    await reload()
    onRefresh()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? 'Date not set'
      : new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
  }

  const getDaysUntil = (dateString: string) => {
    if (!demoTime) return ''
    const due = new Date(dateString).getTime()
    const now = demoTime.getTime()
    const diffDays = Math.ceil((due - now) / 86400000)
    if (diffDays <= 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  if (loading && !queue) {
    return (
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-1/3"></div>
        <div className="h-32 bg-stone-200 rounded-xl"></div>
        <div className="h-64 bg-stone-200 rounded-xl"></div>
      </main>
    )
  }

  const dueItems = queue?.due ?? []
  const upcomingItems = queue?.upcoming ?? []

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Spaced Revision Queue
            </h1>
            <Badge variant="amber" size="sm" icon={<Flame className="w-3.5 h-3.5 text-amber-700" />}>
              Memory Decay Protection
            </Badge>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Targeted active retrieval sessions scheduled by the <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">evidence-v1</code> spacing model.
            Review concepts at the optimal inflection point to lock in invariant proof patterns.
          </p>
        </div>

        {dueItems.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{dueItems.length} {dueItems.length === 1 ? 'task' : 'tasks'} due for review now</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Simulation Clock Toolbar */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 text-sm">Demo Simulation Clock</span>
                <span className="text-[10px] font-mono uppercase bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-medium">
                  Active Sandbox
                </span>
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Current simulated time: <strong className="text-stone-800 font-semibold">{demoTime ? demoTime.toLocaleString() : 'Loading...'}</strong>
              </p>
            </div>
          </div>

          {/* Time Advancement Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={advancing}
              onClick={() => void changeTime(1)}
              leftIcon={<FastForward className="w-3.5 h-3.5" />}
            >
              Advance +1 Day
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={advancing}
              onClick={() => void changeTime(3)}
              leftIcon={<FastForward className="w-3.5 h-3.5" />}
            >
              Advance +3 Days
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={advancing}
              onClick={() => void changeTime(7)}
              leftIcon={<FastForward className="w-3.5 h-3.5" />}
            >
              Advance +7 Days
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={advancing}
              onClick={() => void reset()}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-stone-500" />}
            >
              Reset Demo
            </Button>
          </div>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 inline mr-1" />
          Advance the simulation clock to test how spaced repetition tasks transition from <span className="font-semibold text-stone-700">scheduled</span> to <span className="font-semibold text-amber-700">due</span>, mimicking true student time progression.
        </p>
      </section>

      {/* 3. Urgent: Tasks Due Now */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <span>Immediate Practice Due</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {dueItems.length} {dueItems.length === 1 ? 'task' : 'tasks'} waiting
          </span>
        </div>

        {dueItems.length === 0 ? (
          <Card className="border-teal-200 bg-teal-50/20">
            <CardBody className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-sm">No Pending Reviews Right Now</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Your concepts are within their optimal retention window. Check the upcoming schedule below or advance the demo clock to simulate future review cycles.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueItems.map((task) => (
              <Card
                key={task.id}
                className="border-amber-300 bg-amber-50/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="bg-amber-100/40 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-bold">
                        {TracewiseApi.conceptName(task.conceptId)}
                      </span>
                      <h3 className="font-bold text-stone-900 text-base leading-tight">
                        {TracewiseApi.questionTitle(task.questionId)}
                      </h3>
                    </div>

                    <Badge variant="amber" size="sm">
                      Priority {task.priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {task.reason}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Target: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">Ready for review</span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onStartRevision(task.questionId)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Start Review
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 4. Upcoming Scheduled Reviews */}
      <section className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-stone-700" />
            <span>Upcoming Scheduled Reviews</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {upcomingItems.length} future {upcomingItems.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {upcomingItems.length === 0 ? (
          <Card className="border-stone-200 bg-stone-50/40">
            <CardBody className="py-8 text-center text-xs text-stone-500">
              No future reviews currently queued. Complete diagnostic or learning studio questions to register new concepts.
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingItems.map((task) => (
              <Card key={task.id} className="border-stone-200 bg-white hover:border-stone-300 transition-all">
                <CardBody className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-medium">
                      {TracewiseApi.conceptName(task.conceptId)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-600">
                      {getDaysUntil(task.dueDate)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-stone-900 text-sm leading-tight">
                    {TracewiseApi.questionTitle(task.questionId)}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {task.reason}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Priority {task.priority}</span>
                    <button
                      onClick={() => onStartRevision(task.questionId)}
                      className="text-stone-900 font-semibold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                    >
                      Practice early <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'
import { Card, CardBody, CardHeader } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitFork,
  Search,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

export function ConceptMapScreen({
  onSelectConceptToLearn,
}: {
  onSelectConceptToLearn: (name: string) => void
}) {
  const [concepts, setConcepts] = useState<Awaited<ReturnType<typeof TracewiseApi.getConcepts>>>([])
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [misconceptions, setMisconceptions] = useState<Awaited<ReturnType<typeof TracewiseApi.getMisconceptions>>>([])
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof TracewiseApi.getDiagnosticStatus>> | null>(null)
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof TracewiseApi.getNextQuestion>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'strong' | 'developing' | 'due' | 'not_assessed'>('all')

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      TracewiseApi.getConcepts(),
      TracewiseApi.getHistory(),
      TracewiseApi.getMisconceptions(),
      TracewiseApi.getDiagnosticStatus(),
      TracewiseApi.getRevisionQueue(),
      TracewiseApi.getNextQuestion(),
    ])
      .then(([c, h, m, d, q, n]) => {
        if (!active) return
        setConcepts(c)
        setHistory(h)
        setMisconceptions(m)
        setDiagnostic(d)
        setQueue(q)
        setRecommendation(n)
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !diagnostic || !queue || !recommendation) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-1/3"></div>
        <div className="h-32 bg-stone-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </main>
    )
  }

  const filtered = concepts.filter(({ concept, mastery }) => {
    const matchesSearch =
      concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.id.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterStatus === 'all') return true
    if (filterStatus === 'not_assessed') return mastery.status === 'not_assessed'
    if (filterStatus === 'strong') return mastery.status === 'strong'
    if (filterStatus === 'developing') return mastery.status === 'developing'
    if (filterStatus === 'due') return mastery.status === 'due'
    return true
  })

  const diagnosticPercent = Math.round((diagnostic.answered / diagnostic.total) * 100)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Concept Dependency Graph & Syllabus
            </h1>
            <Badge variant="teal" size="sm" icon={<Compass className="w-3.5 h-3.5 text-teal-700" />}>
              Curriculum Map
            </Badge>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Explore the relational graph of pointer semantics, boundary invariants, and prerequisite pathways.
            Select any node to practice its corresponding diagnostic or challenge questions.
          </p>
        </div>

        {/* Diagnostic Progress Summary Pill */}
        <div className="bg-stone-100 border border-stone-200 px-4 py-2.5 rounded-xl text-xs space-y-1 self-start md:self-auto min-w-[200px]">
          <div className="flex justify-between items-center text-stone-700">
            <span className="font-semibold">Baseline Diagnostic</span>
            <span className="font-mono font-bold text-stone-900">
              {diagnostic.answered}/{diagnostic.total}
            </span>
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 rounded-full transition-all duration-300"
              style={{ width: `${diagnosticPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block">
            {diagnostic.complete ? 'Diagnostic verified complete' : 'Diagnostic in progress'}
          </span>
        </div>
      </div>

      {/* 2. Next Recommended Practice Banner */}
      <Card className="border-teal-200 bg-teal-50/20 shadow-xs">
        <CardBody className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Engine Recommendation
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {recommendation.question.prompt.split('\n')[0]}
            </h2>
            <p className="text-xs text-stone-600">
              {recommendation.reason} ({recommendation.difficulty})
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onSelectConceptToLearn(recommendation.question.prompt.split('\n')[0])}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Practice Next Concept
          </Button>
        </CardBody>
      </Card>

      {/* 3. Search and Status Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All (${concepts.length})` },
            { id: 'strong', label: 'Strong' },
            { id: 'developing', label: 'Developing' },
            { id: 'due', label: 'Due for Review' },
            { id: 'not_assessed', label: 'Not Assessed Yet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts or prerequisites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* 4. Concepts Grid */}
      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
            No concepts match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ concept, mastery }) => {
              const scorePercent = mastery.mastery === null ? null : Math.round(mastery.mastery * 100)
              const conceptHistory = history.filter((h) => h.conceptId === concept.id)
              const conceptRevisions = [...queue.due, ...queue.upcoming].filter((r) => r.conceptId === concept.id)
              const conceptMisconceptions = misconceptions.filter((m) =>
                concept.misconceptionCodes.includes(m.code)
              )

              return (
                <Card
                  key={concept.id}
                  className="border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <CardHeader className="bg-stone-50/60 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => onSelectConceptToLearn(concept.name)}
                          className="font-bold text-stone-900 text-sm text-left hover:text-teal-700 transition-colors cursor-pointer"
                        >
                          {concept.name}
                        </button>
                        <span className="text-[10px] font-mono text-stone-500 block">
                          ID: {concept.id}
                        </span>
                      </div>

                      {scorePercent === null ? (
                        <Badge variant="gray" size="sm" icon={<HelpCircle className="w-3 h-3 text-stone-400" />}>
                          Not assessed yet
                        </Badge>
                      ) : mastery.status === 'strong' ? (
                        <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
                          {scorePercent}% · Strong
                        </Badge>
                      ) : mastery.status === 'due' ? (
                        <Badge variant="amber" size="sm" icon={<Clock className="w-3 h-3 text-amber-700" />}>
                          {scorePercent}% · Due
                        </Badge>
                      ) : (
                        <Badge variant="blue" size="sm">
                          {scorePercent}% · Developing
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {concept.description}
                      </p>

                      {/* Visual Mastery Bar if assessed */}
                      {scorePercent !== null && (
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                scorePercent >= 80 ? 'bg-teal-600' : 'bg-amber-600'
                              }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Prerequisites Section */}
                      <div className="space-y-1 pt-2 border-t border-stone-100">
                        <span className="text-[11px] font-semibold text-stone-500 block">
                          Prerequisites & Edges:
                        </span>
                        {concept.prerequisites.length === 0 ? (
                          <span className="text-xs text-stone-400 italic">No prerequisites (Foundational)</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {concept.prerequisites.map((p) => (
                              <span
                                key={p.conceptId}
                                className="inline-flex items-center gap-1 text-[10px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200"
                              >
                                <GitFork className="w-2.5 h-2.5 text-stone-500" />
                                {TracewiseApi.conceptName(p.conceptId)} ({p.type})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Misconceptions tracked */}
                      {conceptMisconceptions.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-stone-100">
                          <span className="text-[11px] font-semibold text-stone-500 block">
                            Common Traps:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {conceptMisconceptions.map((m) => (
                              <span
                                key={m.code}
                                className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                              >
                                <ShieldAlert className="w-2.5 h-2.5 text-amber-600" />
                                {TracewiseApi.misconceptionName(m.code) ?? m.code}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Stats & CTA */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="text-[11px]">
                        {conceptHistory.length} attempts · {conceptRevisions.length} reviews
                      </span>
                      <button
                        onClick={() => onSelectConceptToLearn(concept.name)}
                        className="text-stone-900 font-semibold hover:text-teal-700 flex items-center gap-1 text-xs cursor-pointer"
                      >
                        Practice <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

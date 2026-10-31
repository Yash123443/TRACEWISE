import { useEffect, useState } from 'react'
import { concepts, misconceptions } from '@engine/data'
import { TracewiseApi } from '../../services/apiService'
import { Card, CardBody, CardHeader } from '../common/Card'
import { Badge } from '../common/Badge'
import {
  Users,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Search,
} from 'lucide-react'

export function TeacherScreen() {
  const [data, setData] = useState<Awaited<ReturnType<typeof TracewiseApi.getTeacherAnalytics>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'misconceptions' | 'learners'>('all')

  useEffect(() => {
    let active = true
    setLoading(true)
    TracewiseApi.getTeacherAnalytics()
      .then((res) => {
        if (active) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setData(null)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-stone-200 rounded-xl"></div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardBody className="py-12 space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <h1 className="text-xl font-bold text-stone-900">Class Analytics Unavailable</h1>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Unable to load the simulated cohort data from the engine service. Please refresh or verify the local service instance.
            </p>
          </CardBody>
        </Card>
      </main>
    )
  }

  // Calculate cohort aggregates
  const assessedConcepts = data.conceptMastery.filter((c) => c.average !== null && c.average !== undefined)
  const cohortOverallAverage = assessedConcepts.length
    ? Math.round(
        (assessedConcepts.reduce((acc, curr) => acc + (curr.average || 0), 0) / assessedConcepts.length) * 100
      )
    : 0

  const filteredConcepts = concepts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header with Title and Simulated Cohort Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Instructor Insights & Class Analytics
            </h1>
            <Badge variant="amber" size="sm" icon={<Info className="w-3 h-3 text-amber-700" />}>
              Simulated Class Cohort
            </Badge>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Real-time mental model diagnostic telemetry across all active students. Flags persistent conceptual misconceptions and automatically drafts targeted reteach outlines.
          </p>
        </div>

        {/* Attention Threshold Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-stone-100 border border-stone-200 px-3.5 py-2 rounded-xl text-xs text-stone-700">
          <GraduationCap className="w-4 h-4 text-stone-700 shrink-0" />
          <div>
            <span className="font-semibold text-stone-900">Attention Threshold: </span>
            <span className="font-mono font-bold text-stone-900">
              {Math.round(data.attentionThreshold * 100)}%
            </span>
            <span className="block text-[10px] text-stone-500">Flags avg &lt; 40% or recurring flaws</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Cohort Size</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{data.learnerCount}</h2>
              <span className="text-xs text-stone-500">Active simulated learners</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
              <Users className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 2 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Cohort Average</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{cohortOverallAverage}%</h2>
              <span className="text-xs text-stone-500">Across assessed topics</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 3 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Needs Attention</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1">
                {data.learnersNeedingAttention.length}
              </h2>
              <span className="text-xs text-rose-600 font-medium">Flagged for support</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 4 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Root Misconceptions</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                {data.topMisconceptions.length}
              </h2>
              <span className="text-xs text-stone-500">Distinct mental traps detected</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Telemetry' },
            { id: 'concepts', label: `Concept Mastery (${concepts.length})` },
            { id: 'misconceptions', label: `Misconceptions (${data.topMisconceptions.length})` },
            { id: 'learners', label: `Flagged Students (${data.learnersNeedingAttention.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* 4. Concept Mastery Grid */}
      {(activeTab === 'all' || activeTab === 'concepts') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-stone-700" />
              <span>Curriculum Concept Mastery Breakdown</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              Target benchmark: &ge; 70%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map((concept) => {
              const scoreEntry = data.conceptMastery.find((item) => item.conceptId === concept.id)
              const scorePercent =
                scoreEntry && typeof scoreEntry.average === 'number'
                  ? Math.round(scoreEntry.average * 100)
                  : null

              const isAtRisk = scorePercent !== null && scorePercent <= Math.round(data.attentionThreshold * 100)
              const isSolid = scorePercent !== null && scorePercent >= 70

              return (
                <Card
                  key={concept.id}
                  className={`border transition-all hover:shadow-md ${
                    isAtRisk
                      ? 'border-rose-300 bg-rose-50/20'
                      : isSolid
                      ? 'border-teal-200 bg-teal-50/10'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <CardHeader className="bg-stone-50/60 pb-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-stone-900 text-sm leading-tight">
                          {concept.name}
                        </h3>
                        <span className="text-[11px] font-mono text-stone-500">ID: {concept.id}</span>
                      </div>
                      {scorePercent === null ? (
                        <Badge variant="gray" size="sm" icon={<HelpCircle className="w-3 h-3 text-stone-400" />}>
                          Not assessed
                        </Badge>
                      ) : isAtRisk ? (
                        <Badge variant="red" size="sm" icon={<AlertTriangle className="w-3 h-3 text-rose-700" />}>
                          Needs Attention
                        </Badge>
                      ) : isSolid ? (
                        <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
                          Solidified
                        </Badge>
                      ) : (
                        <Badge variant="blue" size="sm">
                          Developing
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="p-4 space-y-3.5">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {concept.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-500">Class Average</span>
                        <span className="font-mono font-bold text-stone-900">
                          {scorePercent === null ? 'Not assessed yet' : `${scorePercent}%`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                        {scorePercent !== null && (
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAtRisk ? 'bg-rose-600' : isSolid ? 'bg-teal-600' : 'bg-amber-600'
                            }`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Distribution Pills */}
                    {scoreEntry?.distribution && (
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                        <span className="text-stone-400">Distribution:</span>
                        {Object.entries(scoreEntry.distribution).map(([status, count]) => (
                          <span
                            key={status}
                            className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px]"
                          >
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* 5. Dual Section: Top Misconceptions & Students Needing Support */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Misconceptions Column */}
        {(activeTab === 'all' || activeTab === 'misconceptions') && (
          <section className={`${activeTab === 'misconceptions' ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-amber-700" />
                <span>Detected Algorithmic Misconceptions</span>
              </h2>
              <span className="text-xs text-stone-500">
                {data.topMisconceptions.length} active patterns
              </span>
            </div>

            <div className="space-y-3">
              {data.topMisconceptions.length === 0 ? (
                <Card className="border-stone-200 bg-stone-50/50">
                  <CardBody className="py-8 text-center text-xs text-stone-500">
                    No persistent student misconceptions recorded for this cohort.
                  </CardBody>
                </Card>
              ) : (
                data.topMisconceptions.map((item) => {
                  const details = misconceptions.find((m) => m.code === item.code)
                  return (
                    <Card key={item.code} className="border-amber-200 bg-amber-50/30">
                      <CardBody className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                              {item.code}
                            </span>
                            <h3 className="font-bold text-stone-900 text-sm">
                              {details?.name ?? item.code}
                            </h3>
                          </div>
                          <Badge variant="amber" size="sm">
                            {item.count} {item.count === 1 ? 'student' : 'students'} affected
                          </Badge>
                        </div>

                        {details?.description && (
                          <p className="text-xs text-stone-700 leading-relaxed pt-1">
                            {details.description}
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  )
                })
              )}
            </div>
          </section>
        )}

        {/* Learners Needing Support Column */}
        {(activeTab === 'all' || activeTab === 'learners') && (
          <section className={`${activeTab === 'learners' ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-700" />
                <span>Students Flagged for Support</span>
              </h2>
              <Badge variant="red" size="sm">
                {data.learnersNeedingAttention.length} flagged
              </Badge>
            </div>

            <div className="space-y-3">
              {data.learnersNeedingAttention.length === 0 ? (
                <Card className="border-stone-200 bg-stone-50/50">
                  <CardBody className="py-8 text-center text-xs text-stone-500">
                    All learners currently above the {Math.round(data.attentionThreshold * 100)}% threshold.
                  </CardBody>
                </Card>
              ) : (
                data.learnersNeedingAttention.map((learner) => (
                  <Card key={learner.learnerId} className="border-rose-200 bg-rose-50/30">
                    <CardBody className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {learner.learnerId}
                          </span>
                          <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-medium">
                            Intervention Recommended
                          </span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {learner.reason}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-stone-400 font-mono block">Status</span>
                        <span className="text-xs font-semibold text-rose-700">Priority Review</span>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* 6. AI-Assisted Class Reteach Plan */}
      <section className="space-y-3 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h2 className="text-lg font-bold text-stone-900">
              Curriculum Reteach Strategy
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            Synthesized directly from simulated cohort mistakes
          </span>
        </div>

        <Card className="border-stone-300 bg-white shadow-xs">
          <CardHeader className="bg-stone-50/80 border-b border-stone-200">
            <p className="text-xs font-semibold text-stone-800">
              Targeted Lesson & Lab Intervention Outline
            </p>
          </CardHeader>
          <CardBody className="p-5 space-y-3">
            {data.reteachOutline.length === 0 ? (
              <p className="text-xs text-stone-500">No specific reteach recommendations needed.</p>
            ) : (
              <ol className="space-y-2.5">
                {data.reteachOutline.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-stone-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-900 text-white font-mono text-[10px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Footer Disclaimer */}
      <footer className="pt-4 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
        <p>Cohort Data Source: {data.dataSource} (synthesized for validation and demonstration purposes).</p>
        <p className="font-mono text-[11px]">Deterministic Class Analytics Engine v1.0</p>
      </footer>
    </main>
  )
}

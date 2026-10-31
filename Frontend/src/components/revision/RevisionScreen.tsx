import React, { useEffect, useState } from 'react';
import type { RevisionItem } from '../../types/revision';
import { REVISION_QUEUE_FIXTURE } from '../../mock/revisionFixture';
import { TracewiseApi } from '../../services/apiService';
import { RevisionCard } from './RevisionCard';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { ErrorDisplay } from '../common/StateSwitcher';
import type { UiSimulationState } from '../common/StateSwitcher';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface RevisionScreenProps {
  onStartRevision: (questionId?: string) => void;
  uiState?: UiSimulationState;
  onRetry?: () => void;
}

export const RevisionScreen: React.FC<RevisionScreenProps> = ({
  onStartRevision,
  uiState = 'ready',
  onRetry = () => {},
}) => {
  const [items, setItems] = useState<RevisionItem[]>(REVISION_QUEUE_FIXTURE.items);
  const [filter, setFilter] = useState<'all' | 'due_now' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    TracewiseApi.getRevisionQueue().then((response) => {
      if (!cancelled) setItems(response.data.items);
    }).catch((error) => console.error('Could not load revision queue', error));
    return () => { cancelled = true; };
  }, []);

  // Toggle completion state (records interactive demo state)
  const handleToggleComplete = async (itemId: string) => {
    const current = items.find((item) => item.id === itemId);
    if (!current) return;

    if (current.dueStatus !== 'completed') {
      try {
        const response = await TracewiseApi.completeRevision(current);
        setItems((prevItems) => prevItems.map((item) => item.id === itemId ? response.data : item));
        setLastActionMessage(`Recorded completion for "${current.questionTitle}"${response.isMock ? ' in this demo session' : ''}.`);
      } catch (error) {
        console.error('Could not save revision completion', error);
        setLastActionMessage('Could not save this review. Please try again.');
      }
    } else {
      try {
        const response = await TracewiseApi.reopenRevision(current);
        setItems((prevItems) => prevItems.map((item) => item.id === itemId ? response.data : item));
        setLastActionMessage(`Re-opened "${current.questionTitle}" in active revision queue.`);
      } catch (error) {
        console.error('Could not reopen revision', error);
        setLastActionMessage('Could not reopen this review. Please try again.');
      }
    }

    setTimeout(() => {
      setLastActionMessage(null);
    }, 4000);
  };

  // Compute counts from state
  const dueNowCount = items.filter((i) => i.dueStatus === 'due_now').length;
  const upcomingCount = items.filter((i) => i.dueStatus === 'upcoming').length;
  const completedCount = items.filter((i) => i.dueStatus === 'completed').length;

  // Filter and search
  const filteredItems = items.filter((item) => {
    if (uiState === 'empty') return false;

    // Filter tab
    if (filter === 'due_now' && item.dueStatus !== 'due_now') return false;
    if (filter === 'upcoming' && item.dueStatus !== 'upcoming') return false;
    if (filter === 'completed' && item.dueStatus !== 'completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchConcept = item.conceptTitle.toLowerCase().includes(q);
      const matchQuestion = item.questionTitle.toLowerCase().includes(q);
      const matchReason = item.scheduleReason.toLowerCase().includes(q);
      return matchConcept || matchQuestion || matchReason;
    }

    return true;
  });

  // Handle Loading State
  if (uiState === 'loading') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-stone-200 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-stone-100 rounded-xl border border-stone-200" />
          ))}
        </div>
      </main>
    );
  }

  // Handle Error State
  if (uiState === 'error') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorDisplay
          message="Could not synchronize spaced revision schedule with the learning engine queue."
          onRetry={onRetry}
        />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150 text-stone-900">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Spaced Trace Revision Queue
            </h1>
            <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-medium">
              Targeted Invariant Retraining
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Retrain specific algorithmic invariants and correct past reasoning flaws before retention decays.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Due Now: {dueNowCount}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-medium shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-700" />
            Upcoming: {upcomingCount}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-medium shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            Completed: {completedCount}
          </span>
        </div>
      </div>

      {/* Labeled Demo Fixture Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
          <span>
            <strong className="text-stone-900">Revision Queue:</strong> {REVISION_QUEUE_FIXTURE.fixtureNotice}
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-500">
          No synthetic mastery or fake dates computed in UI
        </span>
      </div>

      {/* Action Notification Banner */}
      {lastActionMessage && (
        <div className="px-4 py-2.5 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-800 flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{lastActionMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-stone-500">Updated in session memory</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search revision queue by concept, problem, or scheduling reason..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:border-stone-400 focus:ring-2 focus:ring-stone-400/20 focus:outline-none focus:bg-white transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('due_now')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'due_now'
                ? 'bg-amber-700 text-white font-semibold shadow-2xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Due Now ({dueNowCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'upcoming'
                ? 'bg-sky-700 text-white font-semibold shadow-2xs'
                : 'text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'completed'
                ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                : 'text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Revision Queue Grid */}
      {filteredItems.length === 0 ? (
        <Card className="border-stone-200 bg-white text-center py-12">
          <CardBody className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              No Revisions Found Matching Filter
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `No items match the search query "${searchQuery}". Try a different keyword.`
                : 'All concepts under this filter have been addressed in session.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs"
              >
                Clear Search Query
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <RevisionCard
              key={item.id}
              item={item}
              onRevise={onStartRevision}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </main>
  );
};

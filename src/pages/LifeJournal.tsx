import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Book, Plus, Search, Calendar, Hash, Users, Filter } from 'lucide-react';
import { useLifeJournal } from '../hooks/useLifeJournal';
import type { LifeJournalEntry, CreateLifeJournalEntry } from '../types/lifeJournal';
import LifeJournalForm from '../components/LifeJournalForm';
import LifeJournalCard from '../components/LifeJournalCard';
import { debounce } from 'lodash';
import { ErrorBoundary } from '../components/ErrorBoundary';
import TickerTape from '../components/TickerTape';
import { TimeFilter, type TimeRange } from '../components/TimeFilter';
import { ErrorFallback } from '../components/ErrorFallback';
import { withPageWrapper } from '../components/PageWrapper';

function LifeJournal() {
  const { entries, loading, error, retryCount, retry, stats, createEntry, searchEntries, deleteEntry, updateEntry } = useLifeJournal();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LifeJournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // Memoize debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchEntries(query);
    }, 300),
    [searchEntries]
  );

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditingEntry(null);
  }, []);

  const handleEdit = useCallback((entry: LifeJournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this entry?')) {
        await deleteEntry(id);
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }, [deleteEntry]);

  const handleSubmit = useCallback(async (formData: Partial<LifeJournalEntry>) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, formData);
      } else {
        await createEntry(formData as CreateLifeJournalEntry);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  }, [editingEntry, updateEntry, createEntry, resetForm]);

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    
    // Apply time filter
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.created_at) >= cutoff);
    }

    // Apply search filter if exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [entries, timeRange, searchQuery]);

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          message="Failed to load journal"
        />
      )}
      onReset={retry}
    >
      <Suspense
        fallback={
          <div className="w-full h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-white/40">Loading journal...</div>
          </div>
        }
      >
        {/* Fixed Search Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                className="w-full bg-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white/90 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Entry</span>
            </button>
          </div>
        </div>

        {/* Main Content with Padding for Fixed Header */}
        <div className="pt-16 px-4 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
              <div className="relative z-10">
                {/* Header Content */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
                      <Book className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                        Life Journal
                      </h1>
                      <p className="text-lg text-white/40 mt-2">Document your journey, track your growth</p>
                    </div>
                  </div>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
                    {[...new Set(entries.flatMap(e => e.tags))].slice(0, 4).map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <span className="text-blue-400">#</span>
                        <span className="text-sm text-white/80">{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TimeFilter value={timeRange} onChange={setTimeRange} />
              
              <div className="flex flex-wrap gap-2">
                {[...new Set(entries.flatMap(e => e.tags))].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 rounded-full bg-[#252525] hover:bg-[#303030] text-sm text-white/60 hover:text-white/90 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Entries Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-[#252525] mb-4">
                    <Book className="w-8 h-8 text-white/40" />
                  </div>
                  <h3 className="text-xl font-medium text-white/90 mb-2">No Entries Found</h3>
                  <p className="text-white/60 text-center">
                    {searchQuery ? 'Try different search terms' : 'No entries for selected time period'}
                  </p>
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <LifeJournalCard
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {(showForm || editingEntry) && (
          <LifeJournalForm
            onSubmit={handleSubmit}
            onClose={resetForm}
            initialData={editingEntry || undefined}
          />
        )}

        {loading && (
          <div className="fixed bottom-4 right-4 bg-[#252525] px-4 py-2 rounded-lg text-sm text-white/60">
            {retryCount > 0 ? `Retrying... (${retryCount})` : 'Loading...'}
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

// Add StatCard component
interface StatCardProps {
  icon: any;
  title: string;
  value: number;
}

function StatCard({ icon: Icon, title, value }: StatCardProps) {
  return (
    <div className="bg-[#252525]/50 backdrop-blur-xl rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 text-white/60 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{title}</span>
      </div>
      <span className="text-xl font-semibold text-white">{value}</span>
    </div>
  );
}

export default withPageWrapper(LifeJournal, 'Life Journal');
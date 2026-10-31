import React from 'react';
import {
  GitBranch,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import type { NavigationTab } from '../../types/tracewise';

interface AppHeaderProps {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenShortcuts: () => void;
  dueRevisionCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onNavigate,
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenShortcuts,
  dueRevisionCount,
}) => {
  const navItems: { tab: NavigationTab; label: string; badge?: number }[] = [
    { tab: 'landing', label: 'Home' },
    { tab: 'overview', label: 'Overview' },
    { tab: 'learn', label: 'Learn Studio' },
    { tab: 'workbench', label: 'Memory Workbench' },
    { tab: 'concept-map', label: 'Concept Map' },
    { tab: 'revision', label: 'Revision', badge: dueRevisionCount },
    { tab: 'teacher', label: 'Teacher' },
    { tab: 'practice', label: 'Practice (20)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Distinctive Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-lg p-1 group cursor-pointer"
              aria-label="Tracewise home"
            >
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-xs group-hover:bg-stone-800 transition-colors">
                <GitBranch className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 tracking-tight text-base">
                    Tracewise
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 font-medium">
                    DSA Invariants
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-normal">
                  Investigate Reasoning, Not Test Cases
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-1 pl-4 border-l border-stone-200"
              aria-label="Primary Navigation"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => onNavigate(item.tab)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer ${
                      isActive
                        ? 'text-stone-900 bg-stone-100 font-semibold border border-stone-200 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-transparent'
                    }`}
                  >
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right utility elements */}
          <div className="flex items-center gap-3">
            {/* Demo Cohort Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-50 border border-stone-200 text-xs text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-mono text-[11px] text-stone-500">Simulated class · 24 learners</span>
            </div>

            {/* Student profile chip */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 border border-stone-300 flex items-center justify-center text-xs font-semibold">
                DL
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-stone-900 leading-tight">
                  Demo learner
                </span>
              </div>
            </div>

            {/* Keyboard shortcut icon */}
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              className="hidden sm:flex p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={onToggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top duration-150">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  onNavigate(item.tab);
                  onToggleMobileMenu();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-stone-100 text-stone-900 font-semibold border border-stone-200'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 px-3">
            <span>Demo learner</span>
            <span className="font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
              Simulated Sandbox
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

import { useEffect } from 'react';
import type { NavigationTab } from '../types/tracewise';

interface ShortcutOptions {
  activeTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onSubmitTrace?: () => void;
  onCloseModals?: () => void;
  onToggleShortcutsModal?: () => void;
}

export function useKeyboardShortcuts({
  onNavigate,
  onSubmitTrace,
  onCloseModals,
  onToggleShortcutsModal,
}: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused =
        activeTag === 'textarea' ||
        activeTag === 'input' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        if (onCloseModals) onCloseModals();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (onSubmitTrace) {
          e.preventDefault();
          onSubmitTrace();
        }
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '0' || e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          onNavigate('landing');
        } else if (e.key === '1') {
          e.preventDefault();
          onNavigate('overview');
        } else if (e.key === '2') {
          e.preventDefault();
          onNavigate('learn');
        } else if (e.key === '3') {
          e.preventDefault();
          onNavigate('workbench');
        } else if (e.key === '4') {
          e.preventDefault();
          onNavigate('concept-map');
        } else if (e.key === '5') {
          e.preventDefault();
          onNavigate('revision');
        } else if (e.key === '6') {
          e.preventDefault();
          onNavigate('teacher');
        }
        return;
      }

      if (e.key === '?' && !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (onToggleShortcutsModal) {
          onToggleShortcutsModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onSubmitTrace, onCloseModals, onToggleShortcutsModal]);
}

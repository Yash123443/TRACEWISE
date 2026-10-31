import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { keyCombo: 'Alt + 0 / Alt + H', description: 'Navigate to Landing Page & Mission Overview' },
    { keyCombo: 'Alt + 1', description: 'Navigate to Student Overview screen' },
    { keyCombo: 'Alt + 2', description: 'Navigate to Learning Studio & Expression field' },
    { keyCombo: 'Alt + 3', description: 'Navigate to Interactive Memory Workbench' },
    { keyCombo: 'Alt + 4', description: 'Navigate to DSA Concept Dependency Map' },
    { keyCombo: 'Alt + 5', description: 'Navigate to Spaced Trace Revision queue' },
    { keyCombo: 'Alt + 6', description: 'Navigate to Teacher Cohort screen' },
    { keyCombo: 'Ctrl + Enter', description: 'Open Review & Submit Trace dialog in studio' },
    { keyCombo: '← / →', description: 'Step backward / forward through operation tree' },
    { keyCombo: 'Space', description: 'Play / Pause auto-step trace animation' },
    { keyCombo: 'R', description: 'Reset workbench to Step 0' },
    { keyCombo: 'Esc', description: 'Dismiss any open dialog or review overlay' },
    { keyCombo: '?', description: 'Toggle this keyboard shortcuts cheat-sheet' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Navigation & Focus Shortcuts"
      subtitle="Tracewise is optimized for rapid keyboard and voice-guided reasoning"
      maxWidth="md"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <div className="space-y-2">
        {shortcuts.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs"
          >
            <span className="text-stone-700">{sc.description}</span>
            <kbd className="px-2 py-0.5 rounded bg-white border border-stone-300 font-mono text-[11px] font-semibold text-stone-900 shadow-xs">
              {sc.keyCombo}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};

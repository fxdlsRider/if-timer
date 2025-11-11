// components/Timer/StopFastingModal.jsx
import React from 'react';

/**
 * StopFastingModal - Confirmation dialog before stopping fast
 *
 * Prevents accidental fast cancellation with a clear warning
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onConfirm - Handler for confirmed stop
 * @param {function} onCancel - Handler for cancel (keep fasting)
 * @param {string} currentDuration - Current fast duration (formatted)
 */
export default function StopFastingModal({ isOpen, onConfirm, onCancel, currentDuration }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-6 animate-in fade-in zoom-in duration-200">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-accent-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-text">
            Stop fasting?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            You've been fasting for <span className="font-semibold text-accent-teal">{currentDuration}</span>.
            Are you sure you want to stop now?
          </p>
          <p className="text-sm text-text-tertiary">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Keep Fasting - Primary Action */}
          <button
            onClick={onCancel}
            className="px-4 py-3 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 shadow-xl border-2 border-black/15"
          >
            Keep Fasting
          </button>

          {/* Stop - Destructive Action */}
          <button
            onClick={onConfirm}
            className="px-4 py-3 bg-transparent text-accent-red border-2 border-accent-red rounded-lg font-medium hover:bg-accent-red hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-red focus:ring-offset-2 shadow-xl"
          >
            Stop Fast
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-text-tertiary text-center">
          Press <kbd className="px-1.5 py-0.5 bg-background-secondary rounded text-text">ESC</kbd> to continue fasting
        </p>
      </div>
    </div>
  );
}

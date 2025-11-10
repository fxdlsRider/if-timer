// components/Timer/ChangeGoalModal.jsx
import React, { useState } from 'react';

/**
 * ChangeGoalModal - Change fasting goal during active fast
 *
 * Allows user to change their fasting goal mid-fast
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {number} currentHours - Current goal in hours
 * @param {function} onConfirm - Handler with new hours
 * @param {function} onCancel - Handler for cancel
 * @param {array} fastingLevels - Available fasting levels
 */
export default function ChangeGoalModal({ isOpen, currentHours, onConfirm, onCancel, fastingLevels }) {
  const [selectedHours, setSelectedHours] = useState(currentHours);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedHours !== currentHours) {
      onConfirm(selectedHours);
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            Change Fasting Goal
          </h2>
          <p className="text-sm text-text-secondary">
            Select a new goal for your current fast
          </p>
        </div>

        {/* Fasting Levels */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fastingLevels.map((level) => {
            const isSelected = selectedHours === level.startHour;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedHours(level.startHour)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-accent-teal bg-accent-teal/10'
                    : 'border-border hover:border-accent-teal/50 hover:bg-background-secondary'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-semibold ${isSelected ? 'text-accent-teal' : 'text-text'}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {level.range}
                    </div>
                  </div>
                  {isSelected && (
                    <svg className="w-6 h-6 text-accent-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-3 bg-border text-text rounded-lg font-medium hover:bg-border/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-3 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal/90 transition-colors"
          >
            Change Goal
          </button>
        </div>
      </div>
    </div>
  );
}

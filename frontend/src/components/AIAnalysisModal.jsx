import React, { useState } from 'react';
import { Bot, Check, Edit2, X, Sparkles, AlertTriangle } from 'lucide-react';

const AIAnalysisModal = ({ suggestion, isOpen, onClose, onAccept, onEdit, onReject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  if (!isOpen || !suggestion) return null;

  const handleStartEdit = () => {
    setEditedText(suggestion.suggestedViolation || suggestion.generatedDescription || suggestion.aiExplanation || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(editedText);
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-sky-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sky-700 font-bold text-lg mb-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>AI Assist Suggestion</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          AI provides assistive suggestions only. Final legal decision rests with the Traffic Officer.
        </p>

        {/* Suggestion Card */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-4 mb-5 space-y-3">
          {suggestion.suggestedViolation && (
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">Suggested Violation</span>
              <p className="text-base font-bold text-slate-900">{suggestion.suggestedViolation}</p>
            </div>
          )}

          {suggestion.suggestedSeverity && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">Severity Level:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                suggestion.suggestedSeverity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {suggestion.suggestedSeverity}
              </span>
            </div>
          )}

          {suggestion.reason && (
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">AI Reasoning</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-sky-100 mt-1">
                {suggestion.reason}
              </p>
            </div>
          )}

          {suggestion.generatedDescription && (
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">Generated Violation Description</span>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-sky-100 mt-1 font-mono">
                {suggestion.generatedDescription}
              </p>
            </div>
          )}

          {suggestion.aiExplanation && (
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">Image Evidence Analysis</span>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-sky-100 mt-1">
                {suggestion.aiExplanation}
              </p>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              rows="3"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-xs p-3 border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-sky-600 text-white font-semibold text-xs rounded-lg shadow hover:bg-sky-700"
              >
                Save & Accept Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => { onAccept(suggestion); onClose(); }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow flex items-center justify-center gap-1 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow flex items-center justify-center gap-1 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => { onReject(); onClose(); }}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisModal;

import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} overflow-hidden border border-slate-200 transition-all`}>
        {/* Modal Header */}
        <div className="bg-brand-navy px-6 py-4 flex items-center justify-between text-white border-b border-brand-navy-dark">
          <h3 className="font-bold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

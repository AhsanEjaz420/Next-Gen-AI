import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const MultiStepLoader = ({ steps, currentStep, isComplete }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isFinished = index < currentStep || isComplete;
          
          return (
            <div 
              key={index} 
              className={`flex items-center gap-3 transition-all duration-300 ${
                isActive ? 'scale-105' : 'opacity-50'
              }`}
            >
              {isFinished ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              <span className={`text-sm font-medium ${
                isActive ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiStepLoader;

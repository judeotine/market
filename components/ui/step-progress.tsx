'use client';

import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">` `
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.title} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted || isCurrent ? '#d97706' : '#e5e7eb',
                    scale: isCurrent ? 1.2 : 1,
                  }}
                  className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full"
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{
                    color: isCurrent ? '#d97706' : '#6b7280',
                    scale: isCurrent ? 1.05 : 1,
                  }}
                  className="mt-2 text-sm font-medium text-center"
                >
                  {step.title}
                  <motion.p
                    initial={false}
                    animate={{
                      opacity: isCurrent ? 1 : 0.5,
                    }}
                    className="text-xs text-gray-500 max-w-[120px] text-center"
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress percentage */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
          className="h-full bg-amber-600 rounded-full"
        />
      </div>
    </div>
  );
}

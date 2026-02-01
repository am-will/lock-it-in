/**
 * FAQAccordion.tsx
 * 
 * Reusable FAQ accordion component with expand/collapse functionality.
 * Uses neomorphic styling with smooth animations.
 */

import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className={`rounded-xl overflow-hidden transition-all duration-300 ${
              isOpen ? "neo-recess" : "neo-extrude"
            }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display font-semibold text-sm pr-4">
                {item.question}
              </span>
              <span
                className={`shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                  isOpen ? "rotate-0" : "rotate-0"
                }`}
              >
                {isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent-purple"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-secondary"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 pb-4">
                <p className="text-sm text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FAQAccordion;

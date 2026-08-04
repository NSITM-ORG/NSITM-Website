/**
 * Accordion — collapsible item group, primary use: the FAQ page.
 * Supports `allowMultiple` (default false — opening one closes others,
 * standard FAQ UX) via internal useState (simple local state tier).
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({ items, allowMultiple = false }) {
  const [openIds, setOpenIds] = useState([]);

  const toggle = (id) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (allowMultiple) {
        return isOpen ? current.filter((i) => i !== id) : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className="divide-y mb-3 divide-border rounded-md bg-surface-elevated">
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden my-6 ${
              isOpen
                ? "border-primary/40 bg-surface-elevated shadow-md"
                : "border-primary/15 bg-surface-elevated/70 hover:border-primary/30 shadow-xs"
            }`}
          >
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left font-heading text-base sm:text-lg font-bold text-text-primary transition-colors hover:text-primary cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}
                >
                  Q
                </span>
                <span>{item.question}</span>
              </span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="px-6 py-6 text-sm sm:text-base leading-relaxed text-text-secondary border-t border-primary/10 bg-surface/50">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
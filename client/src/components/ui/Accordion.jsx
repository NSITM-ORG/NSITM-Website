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
    <div className="divide-y divide-border rounded-md border border-border bg-surface-elevated">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-text-primary">{item.question}</span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
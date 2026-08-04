/**
 * src/components/site/GuidanceBanner.jsx
 *
 * GuidanceBanner — small, dismissible-feeling (but not actually
 * dismissible — stays for clarity) info banner used across every step
 * of the enrollment/instalment flow to orient first-time students, per
 * client instruction. One component, different copy per step.
 */

import { Info } from "lucide-react";

export function GuidanceBanner({ children }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-3.5 text-sm text-text-secondary">
      <Info size={16} className="mt-0.5 shrink-0 text-primary" />
      <p>{children}</p>
    </div>
  );
}

export default GuidanceBanner;

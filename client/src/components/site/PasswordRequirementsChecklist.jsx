/**
 * PasswordRequirementsChecklist — live-updating checklist shown beneath
 * the New Password field on every reset/registration form (backend rules
 * mirrored exactly: 8+ chars, uppercase, lowercase, number).
 */

import { Check, X } from 'lucide-react';

const RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

export function PasswordRequirementsChecklist({ password = '' }) {
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-success' : 'text-text-secondary'}`}>
            {passed ? <Check size={13} /> : <X size={13} />} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default PasswordRequirementsChecklist;
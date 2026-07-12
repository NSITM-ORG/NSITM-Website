/**
 * JoinCommunityModal — Home page "Join Our Community" dialog (per
 * confirmed decision, name corrected from "Join Our Team"). Collects
 * email + role (frontend_dev | backend_dev), posts to
 * POST /public/join-requests. No email confirmation is sent — submission
 * lands in the Super Admin review queue silently, so this modal's own
 * success message IS the only confirmation the submitter ever sees.
 */

import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Button } from '../ui/Button.jsx';
import { useManageState } from '../../hooks/useManageState.js';
import { validators, validateForm } from '../../utils/validation.js';
import { JOIN_COMMUNITY_ROLE_LABELS } from '../../utils/constants.js';
import { CheckCircle2 } from 'lucide-react';

const SCHEMA = {
  email: [validators.required(), validators.email()],
  role: [validators.required('Please select a role.')],
};

const ROLE_OPTIONS = Object.entries(JOIN_COMMUNITY_ROLE_LABELS).map(([value, label]) => ({ value, label }));

export function JoinCommunityModal({ isOpen, onClose }) {
  const { actions } = useManageState();
  const [form, setForm] = useState({ email: '', role: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: validationErrors, isValid } = validateForm(form, SCHEMA);
    setErrors(validationErrors);
    if (!isValid) return;

    setSubmitting(true);
    try {
      await actions.createJoinRequest(form);
      setSubmitted(true);
    } catch {
      // error toast already shown centrally
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ email: '', role: '' });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Our Community" size="sm">
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={40} className="text-success" />
          <p className="text-sm text-text-secondary">
            Thanks for your interest in joining our community! We'll be in touch.
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Interested in contributing as a developer on future Nextserve Live Projects? Leave your details below.
          </p>
          <FormField
            type="email"
            label="Email Address"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            error={errors.email}
            required
          />
          <FormField
            type="radio-group"
            label="I am a"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(v) => setForm((f) => ({ ...f, role: v }))}
            error={errors.role}
            required
          />
          <Button type="submit" loading={submitting} fullWidth>
            Submit
          </Button>
        </form>
      )}
    </Modal>
  );
}

export default JoinCommunityModal;
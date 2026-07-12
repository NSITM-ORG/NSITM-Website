/**
 * ReceiptViewer — inline receipt display for the enrollment/instalment
 * detail views. Uses the backend's freshly-signed `receipt.signedUrl`
 * (see backend Batch 12 fix — Cloudinary authenticated resources require
 * a signature per view). Falls back to a friendly notice in local/dev
 * mode where `provider === 'local'` and no real file exists.
 */

import { FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function ReceiptViewer({ receipt }) {
  const [loadError, setLoadError] = useState(false);

  if (!receipt || !receipt.url) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-border bg-surface p-4 text-sm text-text-secondary">
        <FileText size={18} /> No receipt uploaded.
      </p>
    );
  }

  if (receipt.provider === 'local') {
    return (
      <p className="flex items-center gap-2 rounded-md border border-border bg-surface p-4 text-sm text-text-secondary">
        <FileText size={18} /> Local development mode — no real file was stored for this upload.
      </p>
    );
  }

  const isPdf = receipt.url?.includes('/raw/') || receipt.signedUrl?.includes('/raw/');
  const viewUrl = receipt.signedUrl || receipt.url;

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-error/30 bg-error/10 p-4 text-sm text-error">
        <AlertCircle size={18} /> This receipt failed to load. Contact the student via WhatsApp to request resubmission.
      </div>
    );
  }

  if (isPdf) {
    return (
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-md border border-border bg-surface p-4 text-sm font-medium text-primary hover:bg-surface-elevated"
      >
        <FileText size={18} /> View Receipt (PDF) <ExternalLink size={14} />
      </a>
    );
  }

  return (
    <img
      src={viewUrl}
      alt="Payment receipt"
      onError={() => setLoadError(true)}
      className="max-h-96 w-full rounded-md border border-border object-contain"
    />
  );
}

export default ReceiptViewer;
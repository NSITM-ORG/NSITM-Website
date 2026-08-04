/**
 * useFileUpload — Drag/drop + click-to-select + validate + preview,
 * shared by the enrollment receipt upload (Step 4) and the instalment
 * receipt upload (MyPaymentAccessPage). Lifted and generalized from the
 * validation logic already present in the original EnrollPage.jsx you
 * supplied.
 *
 * VALIDATION RULES (mirrors backend UPLOAD constants exactly):
 *   Accepted: image/jpeg, image/jpg, image/png, application/pdf
 *   Max size: 5MB
 *
 * PREVIEW:
 *   Image files → object URL for an <img> thumbnail.
 *   PDF files → no visual preview, just the filename (matches the
 *   FRD spec: "For PDF, show a file name confirmation").
 *
 * Cleans up the generated object URL on file replacement/unmount to
 * avoid a memory leak.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const previousUrlRef = useRef(null);

  useEffect(
    () => () => {
      if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
    },
    []
  );

  const validate = useCallback((candidate) => {
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      return 'Please upload a JPG, PNG, or PDF file.';
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      return 'File exceeds 5MB. Please compress your image or upload a PDF.';
    }
    return null;
  }, []);

  const selectFile = useCallback(
    (candidate) => {
      const validationError = validate(candidate);
      if (validationError) {
        setError(validationError);
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);

      const isImage = candidate.type.startsWith('image/');
      const url = isImage ? URL.createObjectURL(candidate) : null;
      previousUrlRef.current = url;

      setFile(candidate);
      setPreviewUrl(url);
      setError(null);
    },
    [validate]
  );

  const clearFile = useCallback(() => {
    if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
    previousUrlRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const candidate = e.target.files?.[0];
      if (candidate) selectFile(candidate);
    },
    [selectFile]
  );

  const dragHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      setIsDragActive(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      setIsDragActive(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      setIsDragActive(false);
      const candidate = e.dataTransfer.files?.[0];
      if (candidate) selectFile(candidate);
    },
  };

  return {
    file,
    previewUrl,
    error,
    isDragActive,
    isPdf: file?.type === 'application/pdf',
    hasFile: !!file,
    selectFile,
    clearFile,
    handleInputChange,
    dragHandlers,
  };
}

export default useFileUpload;
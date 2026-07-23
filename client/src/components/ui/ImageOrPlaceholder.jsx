/**
 * src/components/ui/ImageOrPlaceholder.jsx
 *
 * ImageOrPlaceholder — pairs with useImageFallback. Renders the real
 * image when one successfully resolves; otherwise renders a branded
 * gradient block with an initials/icon mark — never a broken-image icon,
 * never an empty gap in the layout.
 */

import { useImageFallback } from '../../hooks/useImageFallback';

export function ImageOrPlaceholder({ src, alt, className = '', placeholderText, icon: Icon }) {
  const { resolvedSrc, checked } = useImageFallback(src);

  if (!checked) {
    return <div className={`skeleton-shimmer ${className}`} />;
  }

  if (resolvedSrc) {
    return <img src={resolvedSrc} alt={alt} className={className} />;
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary/50 text-white ${className}`}>
      {Icon ? <Icon size={40} /> : <span className="font-heading text-3xl font-bold opacity-90">{placeholderText}</span>}
    </div>
  );
}

export default ImageOrPlaceholder;
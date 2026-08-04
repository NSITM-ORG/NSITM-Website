/**
 * src/components/ui/ImageOrPlaceholder.jsx
 *
 * ImageOrPlaceholder — pairs with useImageFallback. Renders the real
 * image when one successfully resolves; otherwise renders a branded
 * gradient block with an initials/icon mark — never a broken-image icon,
 * never an empty gap in the layout.
 */

import { useImageFallback } from '../../hooks/useImageFallback';

export function ImageOrPlaceholder({ src, alt, className = "h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105", placeholderText = '', placeholderSubText = '', icon: Icon }) {
  const { resolvedSrc, checked } = useImageFallback(src);

  if (!checked) {
    return <div className={`skeleton-shimmer ${className}`} />;
  }

  // if (resolvedSrc) {
  //   return <img src={resolvedSrc} alt={alt} className={className} />;
  // }

  console.log((parseInt(placeholderText?.length) + parseInt(placeholderSubText.length)))

  if (placeholderSubText || placeholderText) {
    return (
      <>
        <div className="rounded-3xl overflow-hidden group">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
            <img src={resolvedSrc} alt={alt} className={className} />;
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div
              className={`absolute bottom-4 left-4 right-4 flex ${parseInt(placeholderText?.length) + parseInt(placeholderSubText.length) > 50 ? "flex flex-col " : "flex items-center justify-between "}rounded-xl text-xs font-bold absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 border border-white/20 text-white`}
            >
              <span className={` ${parseInt(placeholderText?.length) + parseInt(placeholderSubText.length) > 50 ? "pb-1 " : " "}`}>{placeholderText}</span>
              <span className="text-secondary">{placeholderSubText}</span>
            </div> */}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary/50 text-white ${className}`}>
      {Icon ? <Icon size={40} /> : <span className="font-heading text-3xl font-bold opacity-90">{placeholderText}</span>}
    </div>
  );
}

export default ImageOrPlaceholder;
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import * as LucideIcons from 'lucide-react';
import { RouteFallback as Preloader } from '../ui/Preloader';

export function LegalPageRenderer({ slug }) {
  const { legalPages, actions } = useManageState();

  useEffect(() => {
    actions.fetchPublicLegalPage(slug);
    return () => {
      actions.clearPublicLegalPage();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const pageData = legalPages.publicPage;

  useSEO({
    title: pageData?.hero?.title || 'Legal Information',
    description: pageData?.hero?.description || 'Nextserve institutional policy page.',
  });

  if (legalPages.loading) {
    return <div className="py-24 text-center"><Preloader /></div>;
  }

  if (!pageData) {
    return (
      <div className="mx-auto max-w-content px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Policy Not Found</h2>
        <p className="mt-2 text-text-secondary">This legal page is either unpublished or does not exist.</p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  const renderIcon = (iconValue, className) => {
    if (!iconValue) return <LucideIcons.FileText className={className} />;
    
    // If it's a raw SVG paste
    if (iconValue.startsWith('<svg') || iconValue.startsWith('<path')) {
      if (iconValue.startsWith('<svg')) {
        return <div dangerouslySetInnerHTML={{ __html: iconValue }} className={`flex items-center justify-center ${className} *:w-full *:h-full`} />;
      }
      // If just paths, wrap in Lucide-like SVG container
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} dangerouslySetInnerHTML={{ __html: iconValue }} />
      );
    }

    const Icon = LucideIcons[iconValue] || LucideIcons.FileText;
    return <Icon className={className} />;
  };

  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <div className="bg-surface-elevated border-b border-primary/10">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          {pageData.hero?.badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-6 text-sm font-semibold text-primary">
              {renderIcon(pageData.hero.badgeIcon, "h-4 w-4")}
              {pageData.hero.badgeText}
            </div>
          )}
          <h1 className="font-heading text-4xl font-extrabold text-text-primary sm:text-5xl">
            {pageData.hero?.title}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            {pageData.hero?.description}
          </p>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-text-muted">
            <span>Last Updated: {pageData.hero?.lastUpdated || new Date(pageData.publishedAt).toLocaleDateString()}</span>
            <span>Version {pageData.hero?.version}</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {pageData.sections?.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="mb-6 flex items-center gap-3 border-b border-primary/10 pb-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {renderIcon(section.icon, "h-5 w-5")}
                </div>
                <h2 className="font-heading text-2xl font-bold text-text-primary">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-6 text-text-secondary leading-relaxed">
                {section.content?.map((block, bIdx) => {
                  if (block.type === 'paragraph') {
                    return <p key={bIdx}>{block.text}</p>;
                  }

                  if (block.type === 'list') {
                    return (
                      <ul key={bIdx} className="space-y-3 pl-6 list-disc">
                        {block.items?.map((item, iIdx) => (
                          <li key={iIdx}>
                            {item.label && <strong className="text-text-primary">{item.label} </strong>}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'grid') {
                    return (
                      <div key={bIdx} className="grid gap-4 sm:grid-cols-2">
                        {block.items?.map((item, iIdx) => (
                          <div key={iIdx} className="rounded-xl border border-primary/10 bg-surface-elevated p-5">
                            <h3 className="mb-2 font-semibold text-text-primary">{item.title}</h3>
                            <p className="text-sm">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Support Callout */}
        {pageData.supportCallout && (
          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-10">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              {renderIcon(pageData.supportCallout.icon, "h-6 w-6")}
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary">
              {pageData.supportCallout.title}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-text-secondary">
              {pageData.supportCallout.description}
            </p>
            {pageData.supportCallout.ctaLabel && (
              <div className="mt-6">
                {pageData.supportCallout.ctaHref ? (
                  <a href={pageData.supportCallout.ctaHref} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-focus">
                    {renderIcon(pageData.supportCallout.ctaIcon, "h-4 w-4")}
                    {pageData.supportCallout.ctaLabel}
                  </a>
                ) : (
                  <Link to={pageData.supportCallout.ctaTo || '#'} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-focus">
                    {renderIcon(pageData.supportCallout.ctaIcon, "h-4 w-4")}
                    {pageData.supportCallout.ctaLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Links */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary/10 pt-8 sm:flex-row">
          {(() => {
            const rawLeftTo = pageData.bottomLinks?.left?.to;
            const leftTo = rawLeftTo || '/faq';
            const rawLeftLabel = pageData.bottomLinks?.left?.label || (rawLeftTo ? '' : 'FAQ');
            const leftLabel = rawLeftLabel.replace(/^←\s*/, '').replace(/\s*→$/, '');

            const rawRightTo = pageData.bottomLinks?.right?.to;
            const rightTo = rawRightTo || '/about';
            const rawRightLabel = pageData.bottomLinks?.right?.label || (rawRightTo ? '' : 'About Us');
            const rightLabel = rawRightLabel.replace(/^←\s*/, '').replace(/\s*→$/, '');

            return (
              <>
                <Link to={leftTo} className="text-sm font-medium text-text-secondary hover:text-primary">
                  {leftLabel ? `← ${leftLabel}` : '← Back'}
                </Link>
                <Link to={rightTo} className="text-sm font-medium text-text-secondary hover:text-primary">
                  {rightLabel ? `${rightLabel} →` : 'Next →'}
                </Link>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default LegalPageRenderer;

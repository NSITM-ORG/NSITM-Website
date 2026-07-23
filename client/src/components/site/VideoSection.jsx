/**
 * src/components/site/VideoSection.jsx
 *
 * VideoSection — structural shell mirroring the reference's .vid_area /
 * .video-button (pulsing double-ring) pattern. Per client instruction,
 * the actual video content/embed is supplied separately — this renders
 * a poster-image placeholder with the play button, wired to open a
 * lightweight inline modal video player once a `videoUrl` prop or
 * settings field is provided. Currently defaults to a graceful
 * "coming soon" state if no video source exists yet, rather than a
 * broken embed.
 */

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Modal } from '../ui/Modal';

const STAT_HIGHLIGHTS = [
  '9/10 Average Student Satisfaction Rate',
  '96% Programme Completion Rate',
  'Friendly Environment & Expert Instructors',
];

export function VideoSection({ videoUrl }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* ── Video/Poster Panel ───────────────────────────────── */}
        <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/60 sm:h-[420px]">
          <div className="absolute inset-0 bg-black/20" />
          {videoUrl ? (
            <button onClick={() => setModalOpen(true)} className="video-play-button z-10">
              <Play size={26} fill="white" />
            </button>
          ) : (
            <p className="z-10 px-6 text-center text-sm font-medium text-white/80">
              Video coming soon
            </p>
          )}
        </div>

        {/* ── Copy ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Best Online Learning Platform
          </p>
          <h2 className="mb-4 font-heading text-3xl font-bold text-text-primary">
            One Platform, Many Programmes For You
          </h2>
          <p className="mb-6 text-text-secondary">
            From enrollment to certification, every step of your Nextserve journey is designed around
            practical outcomes and real-world readiness.
          </p>
          <ul className="space-y-3">
            {STAT_HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-secondary">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {videoUrl && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="lg">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              src={videoUrl}
              title="Nextserve introduction video"
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </Modal>
      )}
    </section>
  );
}

export default VideoSection;
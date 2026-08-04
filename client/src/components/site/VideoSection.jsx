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
import { Play } from 'lucide-react';
import { Modal } from '../ui/Modal';

import videoStudentImg from '../../assets/images/video_nigerian_student.png';

const STAT_HIGHLIGHTS = [
  '9/10 Average Student Satisfaction Rate',
  '96% Programme Completion Rate',
  'Friendly Environment & Expert Instructors',
];

export function VideoSection({ videoUrl }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mx-auto max-w-content px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* ── Video/Poster Panel ───────────────────────────────── */}
        <div className="relative flex h-88 items-center justify-center overflow-hidden rounded-3xl border border-border/80 bg-surface-elevated shadow-card-lift sm:h-110 group">
          <img
            src={videoStudentImg}
            alt="Nextserve Nigerian Student Learning"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <button onClick={() => setModalOpen(true)} className="video-play-button z-10 cursor-pointer shadow-xl">
            <Play size={28} fill="white" className="ml-1 text-white" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between rounded-2xl bg-black/40 backdrop-blur-md px-5 py-3 border border-white/20">
            <span className="text-xs font-bold text-white tracking-wide">EXPERIENCE NEXTSERVE ACADEMY</span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Watch Intro
            </span>
          </div>
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
/**
 * src/components/site/WhyChooseUsSection.jsx
 *
 * WhyChooseUsSection — mirrors the reference's .marketing_content_area /
 * .single_feature_one card pattern (icon-top, bordered, hover border
 * highlight), reskinned into our palette. Static content — six feature
 * blocks, no backend dependency.
 */

import { School, UserCheck, Users, BookOpenCheck, Eye, Headset } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: School, title: 'Learn From Anywhere', body: 'Fully online or in-person cohorts — choose whichever fits your life, without compromising on quality.' },
  { icon: UserCheck, title: 'Expert Instructors', body: 'Every instructor has real industry experience — you learn practices that hold up in the real world, not just theory.' },
  { icon: Users, title: 'Small, Focused Cohorts', body: 'We keep class sizes deliberately small so every student gets real attention, not just a seat in a crowd.' },
  { icon: BookOpenCheck, title: 'Structured Curriculum', body: 'A prerequisite system ensures you\'re always placed in the right programme for your current skill level.' },
  { icon: Eye, title: 'Real Project Work', body: 'Advanced students work on genuine projects — portfolio evidence that actually opens doors.' },
  { icon: Headset, title: '24/7 Support', body: 'Reach us any time on WhatsApp — questions about enrollment, payment, or your programme are never left hanging.' },
];

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-content px-4 py-5 sm:px-6 lg:px-8">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <p className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-secondary bg-secondary/10 px-4 py-1.5 rounded-full inline-block shadow-xs">Why Choose Nextserve</p>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary mt-2">Find the Best Features of Nextserve</h2>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group border border-primary/30 rounded-2xl bg-surface-elevated p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-card-lift shadow-card"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <Icon size={32} />
              </div>
              <h3 className="mb-3 font-heading text-xl font-bold text-text-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{feature.body}</p>
            </div>
          );
        })}
      </div>
      <div className="w-full flex justify-center items-center py-10 mt-6">
        <Link to="/about" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-white shadow-md transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98]">
          Learn More →
        </Link>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
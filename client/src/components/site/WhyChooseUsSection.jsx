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
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Why Choose Nextserve</p>
        <h2 className="font-heading text-3xl font-bold text-text-primary">Find the Best Features of Nextserve</h2>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group rounded-md border border-border bg-surface-elevated p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-card-lift"
            >
              <Icon size={40} className="mx-auto mb-4 text-primary" />
              <h3 className="mb-3 font-heading text-lg font-semibold text-text-primary">{feature.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-text-secondary">{feature.body}</p>
              <Link to="/about" className="text-sm font-semibold text-primary hover:underline">
                Read More →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
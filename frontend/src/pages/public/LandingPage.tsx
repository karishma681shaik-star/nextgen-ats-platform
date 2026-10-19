import React from 'react';
import { ThreeDHero } from '../../components/landing/ThreeDHero';
import { ResumeTransformationStory } from '../../components/landing/ResumeTransformationStory';
import { StudentFeaturesSection } from '../../components/landing/StudentFeaturesSection';
import { RecruiterFeaturesSection } from '../../components/landing/RecruiterFeaturesSection';
import { MovingCompanyLogoStrip } from '../../components/landing/MovingCompanyLogoStrip';
import { FAQ } from '../../components/landing/FAQ';
import { FinalCTA } from '../../components/landing/FinalCTA';

export const LandingPage: React.FC = () => {
  return (
    <div className="[overflow-x:clip] space-y-0">
      {/* 1. Cinematic Hero Section — Headline & Diagonally Rotated Resume */}
      <ThreeDHero />

      {/* 2. Interactive Scroll-Driven AI Transformation Pipeline Story */}
      <ResumeTransformationStory />

      {/* 3. For Students & Job Seekers — 4 Cards with Real Mini UI Previews */}
      <StudentFeaturesSection />

      {/* 4. For Recruiters & Talent Teams — 4 Cards with Realistic Mini Dashboards */}
      <RecruiterFeaturesSection />

      {/* 5. Continuously moving horizontal company logo marquee & animated roles */}
      <MovingCompanyLogoStrip />

      {/* 7. FAQ Section (Note: Four-metric benchmark StatsSection has been cleanly removed) */}
      <FAQ />

      {/* 8. Final High-Impact Conversion CTA */}
      <FinalCTA />
    </div>
  );
};

export default LandingPage;

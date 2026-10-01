import React from 'react';
import { ThreeDHero } from '../../components/landing/ThreeDHero';
import { ResumeTransformationStory } from '../../components/landing/ResumeTransformationStory';
import { StudentFeaturesSection } from '../../components/landing/StudentFeaturesSection';
import { RecruiterFeaturesSection } from '../../components/landing/RecruiterFeaturesSection';
import { HowItWorksSection } from '../../components/landing/HowItWorksSection';
import { StatsSection } from '../../components/landing/StatsSection';
import { FAQ } from '../../components/landing/FAQ';
import { FinalCTA } from '../../components/landing/FinalCTA';

export const LandingPage: React.FC = () => {
  return (
    <div className="overflow-x-hidden space-y-0">
      {/* 1. Cinematic Hero Section — Headline, Floating Resume & Real-Time AI Scan */}
      <ThreeDHero />

      {/* 2. Interactive Scroll-Driven AI Transformation Pipeline Story */}
      <ResumeTransformationStory />

      {/* 3. For Students & Job Seekers — 4 Cards with Real Mini UI Previews */}
      <StudentFeaturesSection />

      {/* 4. For Recruiters & Talent Teams — 4 Cards with Realistic Mini Dashboards */}
      <RecruiterFeaturesSection />

      {/* 5. How It Works — 01 to 06 Visual Process Journey */}
      <HowItWorksSection />

      {/* 6. Platform Benchmark Stats & FAQ */}
      <StatsSection />
      <FAQ />

      {/* 7. Final High-Impact Conversion CTA */}
      <FinalCTA />
    </div>
  );
};


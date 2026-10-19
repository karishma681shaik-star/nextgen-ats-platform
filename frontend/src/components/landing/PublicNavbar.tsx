import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { Button } from '../ui/Button';

export const PublicNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDashboardPath = () => {
    if (role === 'candidate') return '/candidate';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/candidate';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#040711]/95 backdrop-blur-2xl border-b border-indigo-500/20 shadow-2xl py-3'
          : 'bg-[#040711]/60 backdrop-blur-xl border-b border-white/[0.06] py-3.5'
      } px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 lg:gap-5">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group select-none shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 font-space tracking-tight">
            <span className="text-xl sm:text-[1.35rem] font-extrabold text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              AI
            </span>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-violet-400/80 inline-block align-middle" />
            <span className="text-xl sm:text-[1.35rem] font-extrabold bg-gradient-to-r from-violet-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent tracking-wide">
              ATS
            </span>
            <span className="ml-1 text-[8.5px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 shadow-sm">
              PRO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links — Strictly One-Line Labels with Responsive Spacing */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-5 text-xs xl:text-[13px] font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('students')}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
          >
            For Students
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('recruiters')}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
          >
            For Recruiters
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('pipeline-story')}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
          >
            AI Pipeline
          </button>
          <Link
            to="/candidate/jobs"
            data-cursor-label="Explore"
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            Explore Jobs
          </Link>
        </nav>

        {/* Right CTA / Role Switcher Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Persona selector with neutral initial state */}
          <RoleSwitcher defaultNeutral={true} />

          {isAuthenticated && user ? (
            <Link to={getDashboardPath()} className="shrink-0">
              <Button
                variant="glow"
                size="sm"
                className="whitespace-nowrap font-bold shadow-glow text-xs"
                rightIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
              >
                Open Portal ({role})
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="whitespace-nowrap text-slate-300 hover:text-white font-medium text-xs px-3"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register" data-cursor-label="Start" className="shrink-0">
                <Button
                  variant="glow"
                  size="sm"
                  className="whitespace-nowrap shadow-glow font-bold text-xs px-3.5"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-[#0a0f1d]/95 backdrop-blur-2xl border-b border-indigo-500/20 px-4 py-5 mt-3 rounded-2xl space-y-4 shadow-2xl"
          >
            <div className="flex flex-col space-y-1.5 text-xs font-semibold text-slate-300">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('students')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                For Students
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('recruiters')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                For Recruiters
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pipeline-story')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                AI Pipeline
              </button>
              <Link
                to="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              >
                Explore Jobs
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <div className="flex justify-center pb-2">
                <RoleSwitcher defaultNeutral={true} />
              </div>
              {isAuthenticated && user ? (
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" size="md" className="w-full">
                    Go to Dashboard ({role})
                  </Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full text-xs">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="glow" size="md" className="w-full text-xs">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

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
      className={`sticky top-0 z-50 public-navbar-specular ${
        isScrolled ? 'is-scrolled py-2.5' : 'py-3'
      } px-4 sm:px-6 lg:px-8 xl:px-10 box-border`}
    >
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-3 lg:gap-4 xl:gap-6 box-border">
        {/* Brand Logo — Ultra-Premium Holographic 3D Prism Emblem */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group select-none shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-[1.5px] shadow-[0_0_24px_rgba(99,102,241,0.45)] group-hover:shadow-[0_0_32px_rgba(56,189,248,0.7)] group-hover:scale-105 transition-all duration-300 shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#070c1e] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/25 via-transparent to-cyan-400/25" />
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.85)] group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-space tracking-tight">
            <span className="text-xl sm:text-[1.35rem] font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/90 shadow-[0_0_8px_#38bdf8] inline-block align-middle" />
            <span className="text-xl sm:text-[1.35rem] font-black bg-gradient-to-r from-violet-200 via-indigo-100 to-cyan-200 bg-clip-text text-transparent tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ATS
            </span>
            <span className="ml-1 text-[9px] uppercase font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              PRO
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links — Specular Hover Pills */}
        <nav className="hidden lg:flex items-center justify-center flex-1 min-w-0 gap-1 lg:gap-1.5 xl:gap-2.5 text-xs xl:text-[13px] font-medium text-slate-300 px-1 xl:px-3">
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('students')}
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl cursor-pointer"
          >
            For Students
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('recruiters')}
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl cursor-pointer"
          >
            For Recruiters
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('pipeline-story')}
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl cursor-pointer"
          >
            AI Pipeline
          </button>
          <Link
            to="/candidate/jobs"
            data-cursor-label="Explore"
            className="nav-link-specular whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Jobs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
          </Link>
        </nav>

        {/* Right CTA / Role Switcher Actions */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 2xl:gap-3 shrink-0">
          {/* Persona selector with neutral initial state */}
          <RoleSwitcher defaultNeutral={true} />

          {isAuthenticated && user ? (
            <Link to={getDashboardPath()} className="shrink-0">
              <button
                type="button"
                className="btn-luminous-cta whitespace-nowrap text-xs px-3.5 xl:px-4 py-2 rounded-xl group/cta font-bold"
              >
                <span>Open Portal ({role})</span>
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-200 group-hover/cta:rotate-12 transition-transform duration-200" />
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="shrink-0">
                <button
                  type="button"
                  className="btn-glass-pill whitespace-nowrap text-slate-200 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
                >
                  Login
                </button>
              </Link>
              <Link to="/register" data-cursor-label="Start" className="shrink-0">
                <button
                  type="button"
                  className="btn-luminous-cta whitespace-nowrap text-xs px-4 py-2 rounded-xl group/cta font-bold"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-200 group-hover/cta:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile & Tablet Header Controls (< 1024px) */}
        <div className="flex items-center gap-2.5 lg:hidden">
          {!isAuthenticated && (
            <Link to="/register" className="hidden sm:inline-flex shrink-0">
              <button
                type="button"
                className="btn-luminous-cta whitespace-nowrap text-xs px-3.5 py-1.5 rounded-xl group/cta font-bold"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-200 group-hover/cta:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-cyan-400/30 text-slate-300 hover:text-white hover:border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.2)] cursor-pointer transition-all"
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
            className="lg:hidden overflow-hidden bg-[#070c1e]/98 backdrop-blur-2xl border border-cyan-400/30 px-4 py-5 mt-3 rounded-2xl space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(56,189,248,0.2)]"
          >
            <div className="flex flex-col space-y-1.5 text-xs font-semibold text-slate-300">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="nav-link-specular text-left px-3 py-2 rounded-xl"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('students')}
                className="nav-link-specular text-left px-3 py-2 rounded-xl"
              >
                For Students
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('recruiters')}
                className="nav-link-specular text-left px-3 py-2 rounded-xl"
              >
                For Recruiters
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="nav-link-specular text-left px-3 py-2 rounded-xl"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pipeline-story')}
                className="nav-link-specular text-left px-3 py-2 rounded-xl"
              >
                AI Pipeline
              </button>
              <Link
                to="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="nav-link-specular text-left px-3 py-2 rounded-xl flex items-center justify-between"
              >
                <span>Explore Jobs</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <div className="flex justify-center pb-2">
                <RoleSwitcher defaultNeutral={true} />
              </div>
              {isAuthenticated && user ? (
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <button type="button" className="btn-luminous-cta w-full py-2.5 rounded-xl font-bold">
                    <span>Go to Dashboard ({role})</span>
                  </button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button type="button" className="btn-glass-pill w-full py-2.5 rounded-xl font-semibold text-xs">
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button type="button" className="btn-luminous-cta w-full py-2.5 rounded-xl font-bold text-xs">
                      <span>Get Started</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-200" />
                    </button>
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

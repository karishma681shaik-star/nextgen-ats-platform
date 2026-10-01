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
          ? 'bg-[#040711]/90 backdrop-blur-2xl border-b border-indigo-500/20 shadow-2xl py-3'
          : 'bg-[#040711]/50 backdrop-blur-xl border-b border-white/[0.06] py-4'
      } px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              AI ATS
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-300">
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('students')}
            className="hover:text-white transition-colors cursor-pointer text-indigo-300 hover:text-indigo-200"
          >
            For Students
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('recruiters')}
            className="hover:text-white transition-colors cursor-pointer text-purple-300 hover:text-purple-200"
          >
            For Recruiters
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('pipeline-story')}
            className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
          >
            AI Pipeline
          </button>
          <Link to="/candidate/jobs" data-cursor-label="Explore" className="hover:text-white transition-colors">
            Explore Jobs
          </Link>
        </nav>

        {/* Right CTA / Role Switcher Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Always available persona selector */}
          <RoleSwitcher />

          {isAuthenticated && user ? (
            <Link to={getDashboardPath()}>
              <Button
                variant="glow"
                size="sm"
                className="font-bold shadow-glow"
                rightIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
              >
                Open Portal ({role})
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white font-medium">
                  Login
                </Button>
              </Link>
              <Link to="/register" data-cursor-label="Start">
                <Button
                  variant="glow"
                  size="sm"
                  className="shadow-glow font-bold"
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
            className="lg:hidden overflow-hidden bg-[#0a0f1d]/95 backdrop-blur-2xl border-b border-indigo-500/20 px-4 py-6 mt-3 rounded-2xl space-y-4 shadow-2xl"
          >
            <div className="flex flex-col space-y-2 text-xs font-bold text-slate-300">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('students')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 text-indigo-300 hover:text-indigo-200"
              >
                For Students & Job Seekers
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('recruiters')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 text-purple-300 hover:text-purple-200"
              >
                For Recruiters & Hiring Teams
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pipeline-story')}
                className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
              >
                Live AI Transformation Pipeline
              </button>
              <Link
                to="/candidate/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
              >
                Explore Jobs
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <div className="flex justify-center pb-2">
                <RoleSwitcher />
              </div>
              {isAuthenticated && user ? (
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glow" size="md" className="w-full">
                    Go to Dashboard ({role})
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="glow" size="md" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

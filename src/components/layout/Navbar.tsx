
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth/AuthContext';
import { Menu, X, BookOpen, PlusCircle, Briefcase, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const Navbar = () => {
  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${isScrolled || isAuthenticated ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="bg-clip-text bg-gradient-to-r from-primary to-blue-600 text-3xl font-bold text-[#0007ff]">SkillFlowAI</h1>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? <>
              <Link to="/home" className={`font-medium transition-colors hover:text-primary ${location.pathname === '/home' ? 'text-primary' : ''}`}>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Courses</span>
                </span>
              </Link>
              <Link to="/create-course" className={`font-medium transition-colors hover:text-primary ${location.pathname === '/create-course' ? 'text-primary' : ''}`}>
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Course</span>
                </span>
              </Link>
              <Link to="/job-search" className={`font-medium transition-colors hover:text-primary ${location.pathname === '/job-search' ? 'text-primary' : ''}`}>
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Job Search</span>
                </span>
              </Link>
              <Link to="/profile" className={`font-medium transition-colors hover:text-primary ${location.pathname === '/profile' ? 'text-primary' : ''}`}>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </span>
              </Link>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </> : <>
              <Link to="/login" className="font-medium transition-colors hover:text-primary">
                Sign In
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
              <ThemeToggle />
            </>}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button className="focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm pt-20 p-6 animate-fade-in">
          <div className="flex flex-col space-y-6">
            {isAuthenticated ? <>
                <Link to="/home" className="text-xl font-medium flex items-center justify-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <BookOpen className="h-5 w-5" />
                  <span>Courses</span>
                </Link>
                <Link to="/create-course" className="text-xl font-medium flex items-center justify-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <PlusCircle className="h-5 w-5" />
                  <span>Create Course</span>
                </Link>
                <Link to="/job-search" className="text-xl font-medium flex items-center justify-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Briefcase className="h-5 w-5" />
                  <span>Job Search</span>
                </Link>
                <Link to="/profile" className="text-xl font-medium flex items-center justify-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <Button variant="ghost" onClick={logout} className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-3">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </> : <>
                <Link to="/login" className="text-xl font-medium p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-center">
                  Sign In
                </Link>
                <Link to="/signup" className="text-xl font-medium p-2 bg-primary text-white rounded-lg text-center">
                  Sign Up
                </Link>
              </>}
          </div>
        </div>}
    </nav>;
};

export default Navbar;

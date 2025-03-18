
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Learning, Personalized to Your Style",
  subtitle = "Our AI-powered platform adapts to how you learn best, creating personalized courses that evolve as you progress.",
  ctaText = "Get Started",
  ctaLink = "/signup",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#features",
}) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 z-0" />
      
      {/* Animated background shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="glass mx-auto max-w-3xl p-12 rounded-2xl">
          <div className="inline-block animate-fade-in">
            <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-medium bg-primary/10 text-primary mb-4">
              Introducing SkillFlowAI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 leading-tight tracking-tight animate-scale-in">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <Link to={ctaLink}>
              <Button size="lg" className="rounded-full font-medium px-8 py-6 shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Link to={secondaryCtaLink}>
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 border-2 transition-all duration-300">
                {secondaryCtaText}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating cards */}
        <div className="hidden lg:block absolute -top-10 right-20 w-64 h-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg rotate-6 opacity-70 animate-float">
          <div className="p-4">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
              <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
              <div className="w-10 h-10 bg-primary/20 rounded-lg"></div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block absolute top-40 left-20 w-64 h-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg -rotate-12 opacity-70 animate-float animation-delay-1000">
          <div className="p-4">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

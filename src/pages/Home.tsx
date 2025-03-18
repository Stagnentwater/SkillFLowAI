
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold mb-4">
                Welcome back, {user?.name || 'Learner'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Continue your learning journey or explore new courses.
              </p>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Your Courses Section */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Courses</h2>
              <Link to="/dashboard" className="text-primary hover:underline flex items-center gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* If no courses yet */}
              <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No courses yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't enrolled in any courses yet. Explore our catalog to find courses that match your interests.
                </p>
                <Link to="/dashboard">
                  <Button>
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Recommended Courses Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Example recommended course card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                  <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 text-xs px-2 py-1 rounded-full">
                    Beginner
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">Introduction to AI</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    Learn the fundamentals of artificial intelligence and machine learning in this introductory course.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>4 weeks</span>
                    </div>
                    <Link to="/course/intro-ai">
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Another example recommended course card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-r from-green-500 to-teal-500 relative">
                  <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 text-xs px-2 py-1 rounded-full">
                    Intermediate
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">Web Development Masterclass</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    Build modern, responsive websites using the latest web technologies.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>8 weeks</span>
                    </div>
                    <Link to="/course/web-dev">
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Continue Learning Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0 w-full md:w-64 h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
                
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">Data Science Fundamentals</h3>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                    <div className="h-full w-2/3 bg-primary rounded-full" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    67% complete - Module 4: Data Visualization
                  </p>
                  <Link to="/course/data-science">
                    <Button>
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;

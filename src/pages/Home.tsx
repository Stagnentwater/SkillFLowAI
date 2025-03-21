import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, ArrowRight, Info, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { fetchAllCourses, updateCourseEnrolledCount } from '@/services/courseService';
import { Course } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const allCourses = await fetchAllCourses();
        setCourses(allCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleEnroll = async () => {
    if (!user || !selectedCourse) return;
    
    try {
      setEnrolling(true);
      
      // Add course to user enrolled courses in Learner_Profile
      const { data: learnerProfile, error: fetchError } = await supabase
        .from('Learner_Profile')
        .select('*')
        .eq('Email', user.email)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching learner profile:', fetchError);
        toast.error('Failed to enroll in course');
        return;
      }
      
      if (learnerProfile) {
        // Get current enrolled courses
        let currentCourses = learnerProfile.Courses || [];
        if (!Array.isArray(currentCourses)) {
          currentCourses = [];
        }
        
        // Check if already enrolled
        if (currentCourses.includes(selectedCourse.id)) {
          toast.info('You are already enrolled in this course');
          return;
        }
        
        // Add course to enrolled courses
        const updatedCourses = [...currentCourses, selectedCourse.id];
        
        // Update Learner_Profile
        const { error: updateError } = await supabase
          .from('Learner_Profile')
          .update({
            Courses: updatedCourses,
            last_course_visited_id: selectedCourse.id
          })
          .eq('Email', user.email);
          
        if (updateError) {
          console.error('Error updating learner profile:', updateError);
          toast.error('Failed to enroll in course');
          return;
        }
        
        // Update enrolled count in Courses_Table using service function
        const updateSuccess = await updateCourseEnrolledCount(selectedCourse.id);
        
        if (!updateSuccess) {
          console.error('Error updating course enrolled count');
        }
        
        toast.success(`Successfully enrolled in ${selectedCourse.title}`);
      } else {
        toast.error('Learner profile not found');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div 
        className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 relative"
        style={{
          backgroundImage: course.coverImage && course.coverImage !== '/placeholder.svg' 
            ? `url(${course.coverImage})` 
            : 'linear-gradient(to right, var(--blue-500), var(--purple-500))',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 text-xs px-2 py-1 rounded-full">
          {course.skillsOffered && course.skillsOffered.length > 0 
            ? course.skillsOffered[0] 
            : 'General'}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-1" />
            <span>{course.viewCount || 0} enrolled</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedCourse(course)}
              >
                View Course
              </Button>
            </DialogTrigger>
            {selectedCourse && selectedCourse.id === course.id && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{course.title}</DialogTitle>
                  <DialogDescription>
                    Created by {course.creatorName || 'Unknown Creator'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {course.description}
                  </p>
                  {course.skillsOffered && course.skillsOffered.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Skills you'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.skillsOffered.map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );

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
          
          {/* Available Courses Section */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Available Courses</h2>
              <Link to="/dashboard" className="text-primary hover:underline flex items-center gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No courses available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  There are no courses available yet. Check back later or create your own course.
                </p>
                <Link to="/create-course">
                  <Button>
                    Create a Course
                  </Button>
                </Link>
              </div>
            )}
          </section>
          
          {/* Your Learning Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Your Learning</h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Start Learning</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enroll in a course to begin your learning journey.
                  </p>
                  <Link to="/dashboard">
                    <Button>
                      Explore Courses
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

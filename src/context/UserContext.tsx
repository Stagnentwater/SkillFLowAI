
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Course, UserCourseProgress } from '@/types';
import { useAuth } from './AuthContext';

interface UserContextType {
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  userCourses: Course[];
  enrolledCourses: Course[];
  courseProgress: UserCourseProgress[];
  loading: boolean;
  fetchUserCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user data when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserCourses();
      fetchEnrolledCourses();
    } else {
      // Reset data when logged out
      setUserCourses([]);
      setEnrolledCourses([]);
      setCourseProgress([]);
    }
  }, [isAuthenticated, user?.id]);

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would update the user in the database
      // For now, we'll just update local storage
      if (user) {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // This would update the auth context in a real implementation
        // For now, we'll reload the page to simulate the update
        window.location.reload();
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would fetch from the database
      // For now, we'll check localStorage for mock data
      const storedCourses = localStorage.getItem('userCourses');
      if (storedCourses) {
        const parsedCourses = JSON.parse(storedCourses);
        // Filter courses by creator ID if we have a user
        const filteredCourses = user 
          ? parsedCourses.filter((course: Course) => course.creatorId === user.id)
          : [];
        setUserCourses(filteredCourses);
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would fetch from the database
      // For now, we'll check localStorage for mock data
      const storedEnrollments = localStorage.getItem('userEnrollments');
      const storedCourses = localStorage.getItem('courses');
      
      if (storedEnrollments && storedCourses && user) {
        const parsedEnrollments = JSON.parse(storedEnrollments);
        const parsedCourses = JSON.parse(storedCourses);
        
        // Filter enrollments by user ID
        const userEnrollments = parsedEnrollments.filter(
          (enrollment: { userId: string }) => enrollment.userId === user.id
        );
        
        // Map to course IDs then filter courses
        const enrollmentIds = userEnrollments.map((e: { courseId: string }) => e.courseId);
        const filteredCourses = parsedCourses.filter(
          (course: Course) => enrollmentIds.includes(course.id)
        );
        
        setEnrolledCourses(filteredCourses);
        
        // Also set progress data
        const progressData = userEnrollments.map((enrollment: any) => ({
          userId: user.id,
          courseId: enrollment.courseId,
          completedModules: enrollment.completedModules || [],
          quizScores: enrollment.quizScores || {},
          lastAccessed: enrollment.lastAccessed || new Date().toISOString(),
          personalizedContent: enrollment.personalizedContent || {},
        }));
        
        setCourseProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        updateUserProfile,
        userCourses,
        enrolledCourses,
        courseProgress,
        loading,
        fetchUserCourses,
        fetchEnrolledCourses,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

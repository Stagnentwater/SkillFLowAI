
import { Course } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Helper function to get stored data or initialize it (for local storage fallback)
const getStoredData = <T>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

// Helper to convert Json array to string array
const jsonArrayToStringArray = (jsonArray: Json | null): string[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => String(item));
  }
  return [];
};

// Create a new course
export const createCourse = async (
  courseData: Omit<Course, 'id' | 'creatorId' | 'creatorName' | 'viewCount' | 'createdAt' | 'updatedAt'>, 
  creatorId: string,
  creatorName: string
): Promise<Course> => {
  try {
    // Create new course object with UUID
    const courseId = uuidv4();
    const newCourse: Course = {
      id: courseId,
      ...courseData,
      creatorId,
      creatorName,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Create course in Supabase Courses_Table
    const { data, error } = await supabase
      .from('Courses_Table')
      .insert({
        id: parseInt(courseId.replace(/-/g, '').substring(0, 9), 16) % 1000000000, // Generate a numeric ID from UUID
        c_name: newCourse.title,
        description: newCourse.description,
        content_prompt: newCourse.systemPrompt,
        skill_offered: newCourse.skillsOffered,
        cover_image: newCourse.coverImage,
        enrolled_count: 0,
        created_at: newCourse.createdAt
      })
      .select();
      
    if (error) {
      console.error('Error creating course in Supabase:', error);
      toast.error('Failed to save course to database');
      
      // Fallback to local storage if Supabase fails
      // Get current courses or initialize empty array
      const courses = getStoredData<Course[]>('courses', []);
      
      // Add new course and update storage
      const updatedCourses = [...courses, newCourse];
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      // Also update userCourses for quick access
      const userCourses = getStoredData<Course[]>('userCourses', []);
      const updatedUserCourses = [...userCourses, newCourse];
      localStorage.setItem('userCourses', JSON.stringify(updatedUserCourses));
    } else {
      console.log('Course created successfully in Supabase:', data);
      toast.success('Course created and saved to database');
    }
    
    return newCourse;
  } catch (error) {
    console.error('Unexpected error creating course:', error);
    toast.error('Something went wrong while creating the course');
    throw error;
  }
};

// Fetch all available courses
export const fetchAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from('Courses_Table')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      toast.error('Failed to load courses from database');
      
      // Fallback to local storage
      const storedCourses = localStorage.getItem('courses');
      return storedCourses ? JSON.parse(storedCourses) : [];
    }
    
    // Transform data to match Course type
    const courses: Course[] = data.map(course => ({
      id: String(course.id), // Ensure ID is a string
      title: course.c_name || '',
      description: course.content_prompt || '',
      coverImage: '/placeholder.svg', // Default placeholder
      creatorId: 'unknown', // This info isn't stored in Courses_Table
      creatorName: 'SkillFlowAI User', // Default name
      skillsOffered: jsonArrayToStringArray(course.skill_offered),
      viewCount: course.enrolled_count || 0,
      createdAt: course.created_at,
      updatedAt: course.created_at, // No updated_at in this table
      systemPrompt: course.content_prompt || ''
    }));
    
    return courses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    toast.error('Failed to load courses');
    return [];
  }
};

// Enroll in a course
export const enrollInCourse = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    // Check if already enrolled in Supabase
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking enrollment:', checkError);
    }
    
    if (existingEnrollment) {
      toast.info('You are already enrolled in this course');
      return false;
    }
    
    // Create enrollment in Supabase
    const { error } = await supabase
      .from('user_course_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        last_accessed: new Date().toISOString(),
        completed_module_ids: [],
        quiz_scores: {}
      });
    
    if (error) {
      console.error('Error enrolling in course in Supabase:', error);
      toast.error('Failed to enroll in the course');
      
      // Fallback to local storage
      // Get existing enrollments or initialize
      const enrollments = getStoredData<any[]>('userEnrollments', []);
      
      // Create new enrollment
      const newEnrollment = {
        userId,
        courseId,
        completedModules: [],
        quizScores: {},
        lastAccessed: new Date().toISOString(),
      };
      
      // Update enrollments
      const updatedEnrollments = [...enrollments, newEnrollment];
      localStorage.setItem('userEnrollments', JSON.stringify(updatedEnrollments));
    } else {
      // Try to increment enrolled count for the course
      try {
        // Get current enrolled count
        const { data: courseData } = await supabase
          .from('Courses_Table')
          .select('enrolled_count')
          .eq('id', parseInt(courseId, 10))
          .single();
          
        if (courseData) {
          const currentCount = courseData.enrolled_count || 0;
          
          // Update enrolled count
          await supabase
            .from('Courses_Table')
            .update({ enrolled_count: currentCount + 1 })
            .eq('id', parseInt(courseId, 10));
        }
      } catch (incrementError) {
        console.error('Error incrementing enrolled count:', incrementError);
      }
      
      toast.success('Successfully enrolled in the course');
    }
    
    return true;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    toast.error('Failed to enroll in the course');
    return false;
  }
};

// Update module progress
export const updateModuleProgress = async (
  userId: string, 
  courseId: string, 
  moduleId: string, 
  completed: boolean
): Promise<boolean> => {
  try {
    // Get existing progress from Supabase
    const { data: progressData, error: getError } = await supabase
      .from('user_course_progress')
      .select('completed_module_ids')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (getError) {
      console.error('Error fetching module progress:', getError);
      return false;
    }
    
    // Explicitly type the array as string[] to fix the TypeScript error
    let completedModules: string[] = progressData?.completed_module_ids || [];
    
    if (completed && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    } else if (!completed && completedModules.includes(moduleId)) {
      completedModules = completedModules.filter(id => id !== moduleId);
    }
    
    // Update progress in Supabase
    const { error: updateError } = await supabase
      .from('user_course_progress')
      .update({ 
        completed_module_ids: completedModules,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    if (updateError) {
      console.error('Error updating module progress:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating module progress:', error);
    return false;
  }
};

// Update quiz score
export const updateQuizScore = async (
  userId: string,
  courseId: string,
  moduleId: string,
  score: number,
  visualScore: number,
  textualScore: number
): Promise<boolean> => {
  try {
    // Get existing progress from Supabase
    const { data: progressData, error: getError } = await supabase
      .from('user_course_progress')
      .select('quiz_scores')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (getError) {
      console.error('Error fetching quiz scores:', getError);
      return false;
    }
    
    // Update or create quiz score
    let quizScores = progressData?.quiz_scores || {};
    quizScores[moduleId] = score;
    
    // Update progress in Supabase
    const { error: updateError } = await supabase
      .from('user_course_progress')
      .update({ 
        quiz_scores: quizScores,
        last_accessed: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    if (updateError) {
      console.error('Error updating quiz score:', updateError);
      return false;
    }
    
    // Update user's learning style points
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        visual_points: visualScore,
        textual_points: textualScore
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating user profile learning points:', profileError);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating quiz score:', error);
    return false;
  }
};

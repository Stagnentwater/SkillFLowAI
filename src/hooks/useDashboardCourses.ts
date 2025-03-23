
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Course } from '@/types';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllCourses } from '@/services/api';

export const useDashboardCourses = (user: User | null, isAuthenticated: boolean) => {
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCoursesData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoadingCourses(true);
        
        // Fetch all available courses
        const allCoursesData = await fetchAllCourses();
        setAllCourses(allCoursesData);
        
        // Fetch courses created by the user
        const { data: coursesData, error: coursesError } = await supabase
          .from('Courses_Table')
          .select('*')
          .eq('creator_id', user.id);
          
        if (coursesError) {
          console.error('Error fetching user courses:', coursesError);
          toast.error('Failed to load your courses');
        } else if (coursesData) {
          const transformedCourses: Course[] = coursesData.map(course => ({
            id: String(course.id),
            title: course.c_name || '',
            description: course.description || '',
            coverImage: course.cover_image || '/placeholder.svg',
            creatorId: user.id,
            creatorName: user.name || 'SkillFlowAI',
            skillsOffered: Array.isArray(course.skill_offered) 
              ? course.skill_offered.map((item: any) => String(item))
              : [],
            viewCount: course.enrolled_count || 0,
            createdAt: course.created_at,
            updatedAt: course.created_at,
            systemPrompt: course.content_prompt || ''
          }));
          
          setUserCourses(transformedCourses);
        }
        
        // Fetch courses the user is enrolled in
        const { data: progress, error: progressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) {
          console.error('Error fetching enrolled courses:', progressError);
          toast.error('Failed to load enrolled courses');
        } else if (progress && progress.length > 0) {
          // Get IDs of courses the user is enrolled in - convert to numbers if needed
          const enrolledCourseIds = progress.map(item => Number(item.course_id));
          
          // Find the full course data for each enrolled course
          const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
            .from('Courses_Table')
            .select('*')
            .in('id', enrolledCourseIds);
            
          if (enrolledCoursesError) {
            console.error('Error fetching enrolled course details:', enrolledCoursesError);
          } else if (enrolledCoursesData) {
            const transformedEnrolled: Course[] = enrolledCoursesData.map(course => ({
              id: String(course.id),
              title: course.c_name || '',
              description: course.description || '',
              coverImage: course.cover_image || '/placeholder.svg',
              creatorId: course.creator_id || '',
              creatorName: course.creator_name || 'SkillFlowAI',
              skillsOffered: Array.isArray(course.skill_offered) 
                ? course.skill_offered.map((item: any) => String(item))
                : [],
              viewCount: course.enrolled_count || 0,
              createdAt: course.created_at,
              updatedAt: course.created_at,
              systemPrompt: course.content_prompt || ''
            }));
            
            setEnrolledCourses(transformedEnrolled);
          }
        } else {
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error in fetchCoursesData:', error);
        toast.error('Something went wrong while loading courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (isAuthenticated) {
      fetchCoursesData();
    } else {
      setLoadingCourses(false);
      setUserCourses([]);
      setEnrolledCourses([]);
      setAllCourses([]);
    }
  }, [isAuthenticated, user]);

  const getRecommendedCourses = () => {
    return allCourses.filter(course => 
      !enrolledCourses.some(ec => ec.id === course.id) &&
      !userCourses.some(uc => uc.id === course.id)
    ).slice(0, 3);
  };

  return {
    loadingCourses,
    userCourses,
    enrolledCourses,
    recommendedCourses: getRecommendedCourses(),
  };
};

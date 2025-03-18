
import { Course, Module, ModuleContent, Quiz, Question } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert Json array to string array
const jsonArrayToStringArray = (jsonArray: Json | null): string[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => String(item));
  }
  return [];
};

// Helper to convert Json array to Question array
const jsonArrayToQuestions = (jsonArray: Json | null): Question[] => {
  if (!jsonArray) return [];
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => {
      if (typeof item === 'object' && item !== null) {
        // Type assertion after checking it's an object
        return {
          id: ((item as Record<string, any>).id as string) || uuidv4(),
          text: ((item as Record<string, any>).text as string) || 'Default question',
          options: ((item as Record<string, any>).options as string[]) || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: ((item as Record<string, any>).correctAnswer as string) || 'Option 1',
          type: ((item as Record<string, any>).type as 'visual' | 'textual') || 'textual'
        };
      }
      return {
        id: uuidv4(),
        text: 'Default question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        type: 'textual'
      };
    });
  }
  return [];
};

// Helper to convert Question array to Json
const questionsToJsonArray = (questions: Question[]): Json => {
  return questions as unknown as Json;
};

// Fetch a course by ID
export const fetchCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from('Courses_Table')
      .select('*')
      .eq('id', parseInt(courseId, 10))
      .single();
    
    if (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course details');
      return null;
    }
    
    if (!data) {
      toast.error('Course not found');
      return null;
    }
    
    // Transform to Course type
    const course: Course = {
      id: String(data.id),
      title: data.c_name || '',
      description: data.content_prompt || '',
      coverImage: '/placeholder.svg', // Default placeholder
      creatorId: 'unknown', // This info isn't stored in Courses_Table
      creatorName: 'SkillFlowAI User', // Default name
      skillsOffered: jsonArrayToStringArray(data.skill_offered),
      viewCount: data.enrolled_count || 0,
      createdAt: data.created_at,
      updatedAt: data.created_at, // No updated_at in this table
      systemPrompt: data.content_prompt || ''
    };
    
    return course;
  } catch (error) {
    console.error('Error in fetchCourseById:', error);
    toast.error('Something went wrong while loading the course');
    return null;
  }
};

// Generate modules based on course information
export const generateModules = async (
  courseId: string, 
  courseTitle: string, 
  courseDescription: string,
  systemPrompt: string
): Promise<Module[]> => {
  try {
    // First, check if modules already exist for this course
    const { data: existingModules, error: checkError } = await supabase
      .from('module_content')
      .select('module_id')
      .filter('module_id', 'ilike', `${courseId}-%`)
      .limit(1);
    
    if (!checkError && existingModules && existingModules.length > 0) {
      // Modules exist, fetch them
      return fetchModulesForCourse(courseId);
    }
    
    // Create default modules
    const moduleNames = [
      "Introduction to the Course",
      "Core Concepts",
      "Practical Applications",
      "Advanced Techniques",
      "Final Project and Review"
    ];
    
    const modules: Module[] = [];
    
    // Create each module
    for (let i = 0; i < moduleNames.length; i++) {
      const moduleId = `${courseId}-${i+1}`;
      
      // Create module record
      const moduleData: Module = {
        id: moduleId,
        title: moduleNames[i],
        courseId: courseId,
        order: i + 1
      };
      
      modules.push(moduleData);
      
      // Create empty content for this module
      await createModuleContent(
        moduleId,
        `# ${moduleNames[i]}\n\nThis content will be automatically generated when you select this module.`,
        [],
        ''
      );
    }
    
    return modules;
  } catch (error) {
    console.error('Error generating modules:', error);
    toast.error('Failed to generate course modules');
    return [];
  }
};

// Fetch modules for a course
export const fetchModulesForCourse = async (courseId: string): Promise<Module[]> => {
  try {
    // Since we don't have an actual modules table, we'll query module_content 
    // and extract module IDs that match this course's pattern
    const { data, error } = await supabase
      .from('module_content')
      .select('*')
      .filter('module_id', 'ilike', `${courseId}-%`);
    
    if (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load course modules');
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Extract unique module IDs and organize them
    const moduleMap = new Map<string, Module>();
    
    data.forEach(content => {
      const moduleId = content.module_id;
      if (!moduleMap.has(moduleId)) {
        // Parse order from module ID (assuming format: courseId-orderNum)
        const orderMatch = moduleId.match(/-(\d+)$/);
        const order = orderMatch ? parseInt(orderMatch[1], 10) : 0;
        
        // Extract module name from content if possible, or use default
        const contentText = content.content || '';
        const titleMatch = contentText.match(/^# (.*?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1] : `Module ${order}`;
        
        moduleMap.set(moduleId, {
          id: moduleId,
          title: title,
          courseId: courseId,
          order: order
        });
      }
    });
    
    // Convert map to array and sort by order
    const modules = Array.from(moduleMap.values());
    modules.sort((a, b) => a.order - b.order);
    
    return modules;
  } catch (error) {
    console.error('Error in fetchModulesForCourse:', error);
    toast.error('Something went wrong while loading modules');
    return [];
  }
};

// Generate content for a module
export const generateModuleContent = async (
  moduleId: string,
  moduleTitle: string,
  courseTitle: string,
  courseDescription: string,
  userId: string,
  userVisualPoints: number,
  userTextualPoints: number,
  userSkills: string[]
): Promise<ModuleContent | null> => {
  try {
    // Check if content already exists
    const { data: existingContent, error: checkError } = await supabase
      .from('module_content')
      .select('*')
      .eq('module_id', moduleId)
      .maybeSingle();

    if (!checkError && existingContent) {
      // Content exists, return it
      return {
        id: existingContent.id,
        moduleId: existingContent.module_id,
        content: existingContent.content || '',
        visualContent: jsonArrayToStringArray(existingContent.visual_content),
        textualContent: existingContent.textual_content || ''
      };
    }

    // Create default content based on module title
    const content = `# ${moduleTitle}\n\n## Overview\n\nThis module covers important concepts related to ${courseTitle}.\n\n## Learning Objectives\n\n- Understand core principles\n- Apply knowledge in practical scenarios\n- Develop problem-solving skills`;
    
    // Create module content
    const newContent = await createModuleContent(
      moduleId,
      content,
      ['https://placekitten.com/800/400'], // Sample visual content
      'This is the textual version of the content for this module.'
    );
    
    if (newContent) {
      return {
        id: uuidv4(),
        moduleId,
        content,
        visualContent: ['https://placekitten.com/800/400'],
        textualContent: 'This is the textual version of the content for this module.'
      };
    }
    
    toast.error('Failed to generate module content');
    return null;
  } catch (error) {
    console.error('Error generating module content:', error);
    toast.error('Something went wrong while generating content');
    return null;
  }
};

// Fetch content for a module
export const fetchModuleContent = async (moduleId: string): Promise<ModuleContent | null> => {
  try {
    const { data, error } = await supabase
      .from('module_content')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    
    if (error) {
      console.error('Error fetching module content:', error);
      toast.error('Failed to load module content');
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Transform to ModuleContent type
    const moduleContent: ModuleContent = {
      id: String(data.id),
      moduleId: String(data.module_id),
      content: data.content || '',
      visualContent: jsonArrayToStringArray(data.visual_content),
      textualContent: data.textual_content || ''
    };
    
    return moduleContent;
  } catch (error) {
    console.error('Error in fetchModuleContent:', error);
    toast.error('Something went wrong while loading module content');
    return null;
  }
};

// Generate a quiz for a module
export const generateQuiz = async (moduleId: string): Promise<Quiz | null> => {
  try {
    // Check if quiz already exists
    const { data: existingQuiz, error: checkError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('module_id', moduleId)
      .maybeSingle();
    
    if (!checkError && existingQuiz) {
      // Quiz exists, return it with proper typing
      return {
        id: String(existingQuiz.id),
        moduleId: String(existingQuiz.module_id),
        questions: jsonArrayToQuestions(existingQuiz.questions)
      };
    }
    
    // Create default quiz questions
    const defaultQuestions: Question[] = [
      {
        id: uuidv4(),
        text: 'Which of the following is a key concept in this module?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        type: 'textual'
      },
      {
        id: uuidv4(),
        text: 'What best describes the main purpose of this technique?',
        options: ['Learning new skills', 'Solving problems', 'Building projects', 'All of the above'],
        correctAnswer: 'All of the above',
        type: 'visual'
      }
    ];
    
    // Save the quiz
    const success = await saveQuiz(moduleId, defaultQuestions);
    
    if (success) {
      return {
        id: uuidv4(), // This will be different from the actual saved ID, but it doesn't matter for now
        moduleId,
        questions: defaultQuestions
      };
    }
    
    toast.error('Failed to generate quiz');
    return null;
  } catch (error) {
    console.error('Error generating quiz:', error);
    toast.error('Something went wrong while generating the quiz');
    return null;
  }
};

// Fetch quiz for a module
export const fetchModuleQuiz = async (moduleId: string): Promise<Quiz | null> => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    
    if (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      return null;
    }
    
    if (!data || !data.questions) {
      return null;
    }
    
    // Transform to Quiz type
    const quiz: Quiz = {
      id: String(data.id),
      moduleId: String(data.module_id),
      questions: jsonArrayToQuestions(data.questions)
    };
    
    return quiz;
  } catch (error) {
    console.error('Error in fetchModuleQuiz:', error);
    toast.error('Something went wrong while loading the quiz');
    return null;
  }
};

// Create module content
export const createModuleContent = async (
  moduleId: string,
  content: string,
  visualContent?: string[],
  textualContent?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('module_content')
      .insert({
        module_id: moduleId,
        content,
        visual_content: visualContent,
        textual_content: textualContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating module content:', error);
      toast.error('Failed to save module content');
      return false;
    }
    
    toast.success('Module content saved successfully');
    return true;
  } catch (error) {
    console.error('Error in createModuleContent:', error);
    toast.error('Something went wrong while saving module content');
    return false;
  }
};

// Update module content
export const updateModuleContent = async (
  contentId: string,
  content: string,
  visualContent?: string[],
  textualContent?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('module_content')
      .update({
        content,
        visual_content: visualContent,
        textual_content: textualContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);
    
    if (error) {
      console.error('Error updating module content:', error);
      toast.error('Failed to update module content');
      return false;
    }
    
    toast.success('Module content updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateModuleContent:', error);
    toast.error('Something went wrong while updating module content');
    return false;
  }
};

// Create or update quiz
export const saveQuiz = async (moduleId: string, questions: Question[]): Promise<boolean> => {
  try {
    // Check if quiz already exists
    const { data, error: fetchError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('module_id', moduleId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing quiz:', fetchError);
      toast.error('Failed to check existing quiz');
      return false;
    }
    
    // Convert questions to a format that Supabase can store
    // We need to cast our Question[] to Json for Supabase
    const questionsJson = questions as unknown as Json;
    
    if (data) {
      // Update existing quiz
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({
          questions: questionsJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating quiz:', updateError);
        toast.error('Failed to update quiz');
        return false;
      }
    } else {
      // Create new quiz
      const { error: insertError } = await supabase
        .from('quizzes')
        .insert({
          module_id: moduleId,
          questions: questionsJson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating quiz:', insertError);
        toast.error('Failed to create quiz');
        return false;
      }
    }
    
    toast.success('Quiz saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveQuiz:', error);
    toast.error('Something went wrong while saving the quiz');
    return false;
  }
};

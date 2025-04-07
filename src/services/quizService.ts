
import { supabase } from '@/integrations/supabase/client';
import { Question, Quiz } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Helper to convert Json to Question arrays
const jsonArrayToQuestions = (jsonArray: Json): Question[] => {
  if (Array.isArray(jsonArray)) {
    return jsonArray.map(item => {
      if (typeof item === 'object' && item !== null) {
        const questionObj = item as Record<string, any>;
        return {
          id: questionObj.id || uuidv4(),
          text: questionObj.text || 'Default question',
          options: Array.isArray(questionObj.options) ? questionObj.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: questionObj.correctAnswer || 'Option 1',
          type: (questionObj.type as 'visual' | 'textual') || 'textual',
          imageUrl: questionObj.imageUrl
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

// Fetch quiz for a module
export const fetchQuiz = async (moduleId: string): Promise<Quiz | null> => {
  try {
    console.log('Fetching quiz for module:', moduleId);
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    
    if (error) {
      console.error('Error fetching quiz:', error);
      return null;
    }
    
    if (!data) return null;
    
    const quiz = {
      id: data.id,
      moduleId: data.module_id,
      questions: jsonArrayToQuestions(data.questions),
      updatedAt: data.updated_at
    };
    
    console.log('Retrieved quiz:', quiz);
    return quiz;
  } catch (error) {
    console.error('Exception in fetchQuiz:', error);
    return null;
  }
};

// Generate quiz using Gemini API
export const generateQuizWithAI = async (
  courseId: string, 
  modules: any[],
  courseTitle: string,
  courseDescription: string
): Promise<Question[] | null> => {
  try {
    console.log('Generating AI quiz for course:', courseId);
    
    // Use direct REST API call instead of function invocation
    const response = await fetch('https://ncmrsccaleuhlthxkpxq.supabase.co/functions/v1/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession()}`
      },
      body: JSON.stringify({
        modules,
        courseTitle,
        courseDescription
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid response from generate-quiz function:', data);
      return null;
    }
    
    console.log('Successfully generated quiz questions:', data.length);
    return data as Question[];
  } catch (error) {
    console.error('Exception in generateQuizWithAI:', error);
    return null;
  }
};

// Save a quiz for a module (create or update)
export const saveQuiz = async (moduleId: string, questions: Question[]): Promise<boolean> => {
  try {
    console.log('Saving quiz for module:', moduleId, 'with questions:', questions);
    
    // Check if quiz already exists
    const { data, error: fetchError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('module_id', moduleId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing quiz:', fetchError);
      return false;
    }
    
    // Convert questions to a format that Supabase can store
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
        return false;
      }
      
      console.log('Quiz updated successfully');
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
        return false;
      }
      
      console.log('Quiz created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Exception in saveQuiz:', error);
    return false;
  }
};

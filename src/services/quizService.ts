
import { supabase } from '@/integrations/supabase/client';
import { Question, Quiz } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Json } from '@/integrations/supabase/types';

// Helper to convert Json to Question arrays
const jsonArrayToQuestions = (jsonArray: Json): Question[] => {
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

// Fetch quiz for a module
export const fetchQuiz = async (moduleId: string): Promise<Quiz | null> => {
  try {
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
    
    return {
      id: data.id,
      moduleId: data.module_id,
      questions: jsonArrayToQuestions(data.questions),
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Exception in fetchQuiz:', error);
    return null;
  }
};

// Save a quiz for a module (create or update)
export const saveQuiz = async (moduleId: string, questions: Question[]): Promise<boolean> => {
  try {
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
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in saveQuiz:', error);
    return false;
  }
};

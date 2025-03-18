
import { useState } from 'react';
import { Module, ModuleContent, Quiz } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateModules, 
  generateModuleContent, 
  generateQuiz, 
  fetchModulesForCourse, 
  fetchModuleContent, 
  fetchModuleQuiz 
} from '@/services/courseContentService';

interface UseCourseModulesProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  systemPrompt: string;
  userId: string;
  userVisualPoints: number;
  userTextualPoints: number;
  userSkills: string[];
}

export const useCourseModules = ({
  courseId,
  courseTitle,
  courseDescription,
  systemPrompt,
  userId,
  userVisualPoints,
  userTextualPoints,
  userSkills
}: UseCourseModulesProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  
  // Load modules for a course
  const loadModules = async () => {
    try {
      // First try to fetch existing modules
      let courseModules = await fetchModulesForCourse(courseId);
      
      // If no modules exist, generate them
      if (courseModules.length === 0) {
        courseModules = await generateModules(
          courseId, 
          courseTitle, 
          courseDescription,
          systemPrompt
        );
      }
      
      setModules(courseModules);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load course modules');
    }
  };
  
  // Handle module selection
  const handleModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setShowQuiz(false);
    setGeneratingContent(true);
    
    try {
      // First try to fetch existing content
      let content = await fetchModuleContent(module.id);
      
      // If no content exists, generate it
      if (!content) {
        content = await generateModuleContent(
          module.id,
          module.title,
          courseTitle,
          courseDescription,
          userId, 
          userVisualPoints,
          userTextualPoints,
          userSkills
        );
      }
      
      setModuleContent(content);
      
      // First try to fetch existing quiz
      let quizData = await fetchModuleQuiz(module.id);
      
      // If no quiz exists, generate it
      if (!quizData) {
        quizData = await generateQuiz(module.id);
      }
      
      setQuiz(quizData);
    } catch (error) {
      console.error('Error loading module content:', error);
      toast.error('Failed to load module content');
    } finally {
      setGeneratingContent(false);
    }
  };
  
  // Handle quiz answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!quiz || !userId) return;
    
    let visualCorrect = 0;
    let textualCorrect = 0;
    
    // Check answers and update points
    quiz.questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        if (question.type === 'visual') {
          visualCorrect++;
        } else {
          textualCorrect++;
        }
      }
    });
    
    try {
      // Update user points in Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('visual_points, textual_points')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }
      
      const newVisualPoints = (profile?.visual_points || 0) + visualCorrect;
      const newTextualPoints = (profile?.textual_points || 0) + textualCorrect;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          visual_points: newVisualPoints,
          textual_points: newTextualPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user points:', updateError);
        throw updateError;
      }
      
      // Show results
      toast.success(`Quiz complete! You got ${visualCorrect + textualCorrect} out of ${quiz.questions.length} correct.`);
    } catch (error) {
      console.error('Error updating quiz results:', error);
      toast.error('Failed to save quiz results');
    }
    
    // Reset quiz
    setSelectedAnswers({});
    setShowQuiz(false);
  };
  
  return {
    modules,
    selectedModule,
    moduleContent,
    quiz,
    generatingContent,
    showQuiz,
    selectedAnswers,
    loadModules,
    handleModuleSelect,
    handleAnswerSelect,
    handleQuizSubmit,
    setShowQuiz
  };
};

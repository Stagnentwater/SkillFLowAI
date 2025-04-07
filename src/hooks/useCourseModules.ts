import { useState, useEffect } from 'react';
import { Module, ModuleContent, Quiz, Question } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  fetchModules, 
  fetchModuleContent,
  fetchQuiz,
  createModule, 
  generateModules as generateModuleList, 
  generateModuleContent, 
  generateQuiz,
  saveQuiz 
} from '@/services/courseContentService';
import { generateQuizWithAI } from '@/services/quizService';
import { supabase } from '@/integrations/supabase/client';

interface UseCourseModulesProps {
  courseId: string;
  courseTitle?: string;
  courseDescription?: string;
  systemPrompt?: string;
  userId?: string;
  userVisualPoints?: number;
  userTextualPoints?: number;
  userSkills?: string[];
}

interface QuizGenerationOptions {
  visualRatio: number;
  moduleContent: ModuleContent | null;
  moduleTitle: string;
  courseSkills: string[];
}

export const useCourseModules = (props: UseCourseModulesProps) => {
  const { courseId, courseTitle, courseDescription } = props;
  
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getModules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const moduleData = await fetchModules(courseId);
      setModules(moduleData);
    } catch (err) {
      console.error('Error in useCourseModules:', err);
      setError('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = getModules;

  const handleModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setShowQuiz(false);
    setGeneratingContent(true);
    
    try {
      // Special handling for the quiz module
      if (module.id === 'quiz-module') {
        console.log('Quiz module selected, generating course quiz');
        setGeneratingQuiz(true);
        await handleQuizModuleSelect();
        return;
      }
      
      const content = await fetchModuleContent(module.id);
      setModuleContent(content);
      
      const quizData = await fetchQuiz(module.id);
      setQuiz(quizData);
      
      setSelectedAnswers({});
    } catch (err) {
      console.error('Error loading module content:', err);
      setError('Failed to load module content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleQuizModuleSelect = async () => {
    try {
      setGeneratingQuiz(true);
      
      // First check if we already have a quiz for this "quiz-module"
      const existingQuiz = await fetchQuiz('quiz-module');
      
      if (existingQuiz && existingQuiz.questions.length > 0) {
        console.log('Found existing course quiz:', existingQuiz);
        setQuiz(existingQuiz);
        setSelectedAnswers({});
        setShowQuiz(true);
        setGeneratingQuiz(false);
        return;
      }
      
      // If no existing quiz, generate a new one with AI
      console.log('Generating new course quiz with AI');
      toast.info('Generating course quiz with AI, please wait...');
      
      // Generate quiz using the Gemini API
      const questions = await generateQuizWithAI(
        courseId,
        modules,
        courseTitle || 'Course',
        courseDescription || 'No description'
      );
      
      if (!questions || questions.length === 0) {
        throw new Error('Failed to generate quiz questions');
      }
      
      console.log('Successfully generated course quiz with AI:', questions);
      
      // Save the quiz to the database
      const quizSaved = await saveQuiz('quiz-module', questions);
      
      if (!quizSaved) {
        throw new Error('Failed to save generated quiz');
      }
      
      // Create a Quiz object
      const newQuiz: Quiz = {
        id: uuidv4(),
        moduleId: 'quiz-module',
        questions: questions,
        updatedAt: new Date().toISOString()
      };
      
      setQuiz(newQuiz);
      setSelectedAnswers({});
      setShowQuiz(true);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating course quiz:', error);
      setError('Failed to generate course quiz');
      toast.error('Failed to generate quiz. Using placeholder questions instead.');
      
      // Create simple placeholder questions if generation fails
      const placeholderQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
        id: uuidv4(),
        text: `Question ${i + 1} about ${courseTitle || 'this course'}?`,
        options: [
          `Option A for question ${i + 1}`, 
          `Option B for question ${i + 1}`, 
          `Option C for question ${i + 1}`, 
          `Option D for question ${i + 1}`
        ],
        correctAnswer: `Option A for question ${i + 1}`,
        type: 'textual'
      }));
      
      const placeholderQuiz: Quiz = {
        id: uuidv4(),
        moduleId: 'quiz-module',
        questions: placeholderQuestions,
        updatedAt: new Date().toISOString()
      };
      
      setQuiz(placeholderQuiz);
      setSelectedAnswers({});
      setShowQuiz(true);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const getOrGenerateQuiz = async (
    moduleId: string, 
    userId: string, 
    options: QuizGenerationOptions
  ) => {
    try {
      const existingQuiz = await fetchQuiz(moduleId);
      
      if (existingQuiz && existingQuiz.questions.length > 0) {
        console.log('Found existing quiz:', existingQuiz);
        setQuiz(existingQuiz);
        setSelectedAnswers({}); // Reset selected answers
        return existingQuiz;
      }
      
      console.log('Generating new quiz for module:', moduleId);
      
      const totalQuestions = 10;
      let visualQuestions = Math.round(totalQuestions * options.visualRatio);
      let textualQuestions = totalQuestions - visualQuestions;
      
      if (visualQuestions === 0) visualQuestions = 1;
      if (textualQuestions === 0) textualQuestions = 1;
      
      if (visualQuestions + textualQuestions > 10) {
        textualQuestions = 10 - visualQuestions;
      }
      
      const moduleTitle = options.moduleTitle;
      const moduleDescription = options.moduleContent?.content || '';
      const textualContent = options.moduleContent?.textualContent || '';
      
      const questions: Question[] = [];
      
      const visualTemplates = [
        `Based on the diagram, what is the main concept illustrated in ${moduleTitle}?`,
        `What does the visual representation in ${moduleTitle} demonstrate?`,
        `According to the diagram in ${moduleTitle}, which component is central to the process?`,
        `What relationship is shown in the visual representation of ${moduleTitle}?`,
        `Which element in the diagram is directly connected to the main concept?`
      ];
      
      const textualTemplates = [
        `What is the main topic of ${moduleTitle}?`,
        `What are the key concepts covered in ${moduleTitle}?`,
        `According to ${moduleTitle}, which of the following is true?`,
        `What is the primary objective of learning about ${moduleTitle}?`,
        `Which skill is most directly related to ${moduleTitle}?`
      ];
      
      for (let i = 0; i < visualQuestions; i++) {
        const template = visualTemplates[i % visualTemplates.length];
        questions.push({
          id: uuidv4(),
          text: template,
          options: [
            `Option A for ${moduleTitle}`,
            `Option B for ${moduleTitle}`,
            `Option C for ${moduleTitle}`,
            `Option D for ${moduleTitle}`
          ],
          correctAnswer: `Option A for ${moduleTitle}`,
          type: 'visual',
          imageUrl: options.moduleContent?.visualContent?.[0]?.url || 
                   "https://placehold.co/600x400/3b82f6/ffffff.jpg?text=Question+Diagram"
        });
      }
      
      for (let i = 0; i < textualQuestions; i++) {
        const template = textualTemplates[i % textualTemplates.length];
        questions.push({
          id: uuidv4(),
          text: template,
          options: [
            `Option A for ${moduleTitle}`,
            `Option B for ${moduleTitle}`,
            `Option C for ${moduleTitle}`,
            `Option D for ${moduleTitle}`
          ],
          correctAnswer: `Option B for ${moduleTitle}`,
          type: 'textual'
        });
      }
      
      console.log('Generated questions:', questions);
      
      const quizSaved = await saveQuiz(moduleId, questions);
      
      if (!quizSaved) {
        throw new Error('Failed to save generated quiz');
      }
      
      const newQuiz = await fetchQuiz(moduleId);
      
      if (newQuiz) {
        console.log('Successfully generated and saved quiz:', newQuiz);
        setQuiz(newQuiz);
        setSelectedAnswers({}); // Reset selected answers
        return newQuiz;
      } else {
        throw new Error('Failed to retrieve generated quiz');
      }
    } catch (err) {
      console.error('Error in getOrGenerateQuiz:', err);
      setError('Failed to generate quiz');
      return null;
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuizSubmit = () => {
    console.log('Quiz submitted with answers:', selectedAnswers);
    setShowQuiz(false);
  };

  const addModule = async (title: string, orderNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const newModule = await createModule(courseId, title, orderNum);
      
      if (newModule) {
        setModules(prevModules => [...prevModules, newModule]);
        return newModule;
      } else {
        throw new Error('Failed to create module');
      }
    } catch (err) {
      console.error('Error adding module:', err);
      setError('Failed to add module');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCourseModules = async (moduleTitles: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedModules = await generateModuleList(courseId, moduleTitles);
      
      for (const module of generatedModules) {
        await generateModuleContent(module.id, module.title, `${module.title} content`, module.type);
        await generateQuiz(module.id, module.title);
      }
      
      setModules(generatedModules);
      return generatedModules;
    } catch (err) {
      console.error('Error generating course modules:', err);
      setError('Failed to generate course modules');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    modules,
    selectedModule,
    moduleContent,
    quiz,
    showQuiz,
    setShowQuiz,
    selectedAnswers,
    loading,
    generatingContent,
    generatingQuiz,
    error,
    getModules,
    loadModules,
    addModule,
    generateCourseModules,
    handleModuleSelect,
    handleAnswerSelect,
    handleQuizSubmit,
    getOrGenerateQuiz
  };
};

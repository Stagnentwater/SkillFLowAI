
import { useState, useEffect } from 'react';
import { Module, ModuleContent, Quiz, Question } from '@/types';
import { 
  fetchModules, 
  fetchModuleContent,
  fetchQuiz,
  createModule, 
  generateModules as generateModuleList, 
  generateModuleContent, 
  generateQuiz 
} from '@/services/courseContentService';

// Define the proper interface for the hook parameters
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

export const useCourseModules = (props: UseCourseModulesProps) => {
  const { courseId } = props;
  
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleContent, setModuleContent] = useState<ModuleContent | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load modules from the database
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

  // Alias for getModules to match the name used in CourseDetail.tsx
  const loadModules = getModules;

  // Handle selecting a module - updated to accept a Module object instead of just the ID
  const handleModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setShowQuiz(false);
    setGeneratingContent(true);
    
    try {
      // Fetch module content
      const content = await fetchModuleContent(module.id);
      setModuleContent(content);
      
      // Fetch quiz for this module
      const quizData = await fetchQuiz(module.id);
      setQuiz(quizData);
    } catch (err) {
      console.error('Error loading module content:', err);
      setError('Failed to load module content');
    } finally {
      setGeneratingContent(false);
    }
  };

  // Handle selecting an answer in a quiz
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    // Logic for submitting quiz answers would go here
    console.log('Quiz submitted with answers:', selectedAnswers);
    setShowQuiz(false);
  };

  // Add a new module
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

  // Generate modules for a course
  const generateCourseModules = async (moduleTitles: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedModules = await generateModuleList(courseId, moduleTitles);
      
      // Generate content and quiz for each module
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
    error,
    getModules,
    loadModules,
    addModule,
    generateCourseModules,
    handleModuleSelect,
    handleAnswerSelect,
    handleQuizSubmit
  };
};

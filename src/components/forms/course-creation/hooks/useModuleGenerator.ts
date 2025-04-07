
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useModuleGenerator = () => {
  const [creatingStatus, setCreatingStatus] = useState('');

  const generateModules = async (title: string, systemPrompt: string) => {
    try {
      setCreatingStatus('Generating course modules with AI...');
      
      // Try to use Gemini API if available
      try {
        const { data, error } = await supabase.functions.invoke('generate-quiz', {
          body: {
            courseTitle: title,
            courseDescription: systemPrompt,
            isModuleGeneration: true
          }
        });
        
        if (!error && data && Array.isArray(data) && data.length > 0) {
          console.log("Generated modules with AI:", data);
          
          // Format the modules from AI response
          const aiModules = data.map((item: any, index: number) => ({
            title: item.title || `Module ${index + 1}: ${title} Concepts`,
            description: item.description || `Learning about ${title}`
          }));
          
          // Limit to 10 modules
          const finalModules = aiModules.slice(0, 10);
          
          setCreatingStatus('Creating course in database...');
          return finalModules;
        }
      } catch (aiError) {
        console.error("Error generating modules with AI:", aiError);
        // Continue with fallback modules if AI generation fails
      }
      
      // Fallback: Create a basic module structure
      const modules = [
        {
          title: `Introduction to ${title}`,
          description: `An overview of ${title} and its importance.`
        },
        {
          title: `Key Concepts in ${title}`,
          description: `Essential terminology and concepts related to ${title}.`
        },
        {
          title: `Foundational Principles of ${title}`,
          description: `Understanding the core principles that govern ${title}.`
        },
        {
          title: `Practical Applications of ${title}`,
          description: `Real-world applications and case studies of ${title}.`
        },
        {
          title: `Advanced Topics in ${title}`,
          description: `Deeper exploration of complex topics in ${title}.`
        },
        {
          title: `Problem Solving in ${title}`,
          description: `Strategies and techniques for solving problems related to ${title}.`
        },
        {
          title: `Industry Standards for ${title}`,
          description: `Current best practices and standards in ${title}.`
        },
        {
          title: `Future Trends in ${title}`,
          description: `Emerging technologies and future directions for ${title}.`
        },
        {
          title: `Career Paths in ${title}`,
          description: `Exploring professional opportunities related to ${title}.`
        },
        {
          title: `Mastering ${title}`,
          description: `Comprehensive review and advanced skills in ${title}.`
        }
      ];
      
      console.log("Generated fallback modules:", modules);
      
      setCreatingStatus('Creating course in database...');
      return modules;
    } catch (error) {
      console.error('Error in generateModules:', error);
      toast.error('Failed to generate course modules');
      throw error;
    }
  };

  return {
    generateModules,
    creatingStatus
  };
};

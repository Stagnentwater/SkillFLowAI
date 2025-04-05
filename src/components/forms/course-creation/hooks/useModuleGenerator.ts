
import { useState } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_URL;

export const useModuleGenerator = () => {
  const [creatingStatus, setCreatingStatus] = useState('');

  const generateModules = async (title: string, systemPrompt: string) => {
    try {
      setCreatingStatus('Generating course modules with AI...');
      
      const prompt = `You are an AI Instructor. You have to create study material on the following topic: ${title}. 
      
      Additional details: ${systemPrompt}
      
      Create a JSON array containing exactly 10 modules. Each module should have title and description fields. 
      The modules should align with the course and provide all the main headings that are to be covered.
      
      Return ONLY a valid JSON array without any additional text or explanation. The format should be:
      [
        {"title": "Module 1 Name", "description": "Module 1 description..."},
        {"title": "Module 2 Name", "description": "Module 2 description..."},
        ...
      ]`;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract JSON content from Gemini response
      let moduleText = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        moduleText = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
      
      // Extract JSON from possible text response (handling potential markdown code blocks)
      const jsonMatch = moduleText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON array in response");
      }
      
      const modulesJson = JSON.parse(jsonMatch[0]);
      console.log("Generated modules:", modulesJson);
      
      setCreatingStatus('Creating course in database...');
      return modulesJson;
    } catch (error) {
      console.error('Error in generateModules:', error);
      throw error;
    }
  };

  return {
    generateModules,
    creatingStatus
  };
};

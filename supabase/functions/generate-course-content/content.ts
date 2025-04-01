
import { GEMINI_API_KEY, GEMINI_API_URL, extractJsonFromGeminiResponse, createJsonResponse } from "./utils.ts";

interface GenerateContentRequest {
  moduleId: string;
  moduleTitle: string;
  moduleDescription: string;
  courseTitle: string;
  courseDescription: string;
  userId: string;
  visualPoints: number;
  textualPoints: number;
  userSkills: string[];
}

export async function generateContent(data: GenerateContentRequest) {
  const { 
    moduleId, 
    moduleTitle, 
    moduleDescription,
    courseTitle, 
    courseDescription, 
    userId,
    visualPoints,
    textualPoints,
    userSkills 
  } = data;
  
  console.log(`Generating content for module: ${moduleTitle}`);
  console.log(`User ID: ${userId}, Visual: ${visualPoints}, Textual: ${textualPoints}`);
  
  // Determine learning preference
  const isVisualLearner = visualPoints >= textualPoints;
  const learningStyle = isVisualLearner ? 'visual' : 'textual';
  
  // Create prompt for Gemini API
  const prompt = `
You are an AI educator that creates personalized learning content.

Course: ${courseTitle}
Course Description: ${courseDescription}
Module: ${moduleTitle}
Module description : tailor your response according to the heading covered in this:- ${moduleDescription}
User Skills: ${userSkills.join(', ')}
Learning Style: ${learningStyle} (${isVisualLearner ? 'Prefers diagrams and visual examples' : 'Prefers detailed text explanations'})

Create comprehensive learning content for this module. The content should be:
1. Informative and educational
2. Tailored to the user's learning style (${isVisualLearner ? 'more visual content with diagrams' : 'more textual content with detailed explanations'})
3. Well-structured for online learning

Return ONLY a valid JSON object with this structure:
{
  "content": "Main content text with markdown formatting",
  "visualContent": [{"specfiy mermaid or url","URL or mermaid diagram for diagram 1"}, {"specify mermaid or url","URL or description for diagram 2"}],
  "textualContent": "Additional detailed text explanations if the user prefers textual learning"
}

${isVisualLearner ? 'Include multiple items in visualContent and minimal textualContent' : 'Include extensive textualContent and minimal visualContent'}
`;

  // Call Gemini API
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    })
  });

  const contentData = await extractJsonFromGeminiResponse(response);
  console.log('Successfully generated content');
  
  return createJsonResponse(contentData);
}

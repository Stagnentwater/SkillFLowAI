
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractJsonFromGeminiResponse } from "../generate-course-content/utils.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, systemPrompt, skills } = await req.json();
    
    // Get API key from environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }
    
    // Construct prompt for Gemini
    const prompt = `
      You are a course content creator AI. Generate 10 modules for a course with the following details:
      
      Course Title: ${title}
      Course Description: ${description}
      Course Skills: ${skills.join(', ')}
      Additional Details: ${systemPrompt}
      
      Return a JSON array with exactly 10 modules. Each module should have:
      1. "title": The name of the module (make these relevant and engaging)
      2. "description": A 1-2 sentence description of what this module will cover
      
      Format the response as a valid JSON array without any markdown formatting or explanations.
      Example format: 
      [
        {
          "title": "Module Title",
          "description": "Module description that explains the content..."
        },
        ...
      ]
    `;
    
    console.log("Sending request to Gemini API with prompt:", prompt);
    
    // Make request to Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    // Extract JSON from response
    const modules = await extractJsonFromGeminiResponse(response);
    
    // Return the generated modules
    return new Response(
      JSON.stringify({ modules }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

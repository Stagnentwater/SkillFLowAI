// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import dotenv from 'dotenv';

dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

// Helper to extract JSON from Gemini responses
export async function extractJsonFromGeminiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', errorData);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const geminiResponse = await response.json();
  
  try {
    const textContent = geminiResponse.candidates[0].content.parts[0].text;
    // Extract JSON if it's wrapped in markdown code blocks
    const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/) || 
                     textContent.match(/```\n([\s\S]*?)\n```/) ||
                     [null, textContent];
    
    const jsonStr = jsonMatch[1].trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse data from AI response');
  }
}

// Helper to create a standardized response
export function createJsonResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

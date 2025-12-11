import { GoogleGenAI, Type } from "@google/genai";
import { PromptResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert AI Prompt Engineer specialized in "Virtual Try-On" (VTO) and Photorealistic Fashion Photography. Your task is to analyze uploaded reference images and generate a set of highly detailed text prompts for an image generation model (NanoBanana Pro).

**YOUR OBJECTIVE:**
Create 5 distinct prompts (different angles) that mathematically and visually combine the uploaded elements into a single cohesive image.

**STRICT RULES FOR ANALYSIS & SYNTHESIS:**
1. **THE MODEL (Immutable Identity):** Analyze the reference photo of the Mannequin/Model deeply. Preserve exact facial features, skin tone, body type, hairstyle, and grooming. Constraint: Do NOT change ethnicity, age, or gender.
2. **THE GARMENT (Absolute Fidelity):** Analyze the uploaded clothing item(s). Describe exact fabric texture, color codes, logos, prints, zipper placement, stitching details, and fit. Constraint: The model must wear these clothes exactly as they appear in the reference.
3. **THE FOOTWEAR:** If provided, the model must wear these exact shoes.
4. **THE BACKGROUND:** If provided, place the model inside this environment realistically. If not, use "Professional Studio White Background with softbox lighting."

**OUTPUT:**
Return ONLY a JSON array of objects.
`;

export const generatePrompts = async (
  modelFile: File,
  garmentFile: File,
  footwearFile: File | null,
  bgFile: File | null
): Promise<PromptResult[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert Files to Base64
  const fileToPart = async (file: File) => {
    return new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve({
          mimeType: file.type,
          data: base64String,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const modelPart = await fileToPart(modelFile);
  const garmentPart = await fileToPart(garmentFile);
  
  const contentParts: any[] = [];
  
  // Construct the prompt with labeled image inputs
  let promptText = "Analyze the following images to create the prompts:\n\n";
  
  promptText += "IMAGE A (Target Model):\n";
  contentParts.push({ inlineData: modelPart });
  
  promptText += "\nIMAGE B (Target Garment):\n";
  contentParts.push({ inlineData: garmentPart });

  if (footwearFile) {
    const footwearPart = await fileToPart(footwearFile);
    promptText += "\nIMAGE C (Target Footwear):\n";
    contentParts.push({ inlineData: footwearPart });
  } else {
    promptText += "\nNo specific footwear provided. Use generic styling appropriate for the outfit.\n";
  }

  if (bgFile) {
    const bgPart = await fileToPart(bgFile);
    promptText += "\nIMAGE D (Target Background):\n";
    contentParts.push({ inlineData: bgPart });
  } else {
    promptText += "\nNo background provided. Use Studio White.\n";
  }

  contentParts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Best for reasoning and vision analysis
      contents: {
        role: 'user',
        parts: contentParts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING },
              prompt: { type: Type.STRING }
            },
            required: ["angle", "prompt"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(jsonText) as PromptResult[];
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};
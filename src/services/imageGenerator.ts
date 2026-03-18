import { GoogleGenAI } from "@google/genai";

export async function generateCharacterImages() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3.1-flash-image-preview";

  const prompts = [
    { id: 'pikachu', prompt: "Cyberpunk electric mouse pokemon, neon yellow lightning, glowing circuit patterns on fur, futuristic visor, dark tech background, high detail, 4k, digital art style" },
    { id: 'charizard', prompt: "Cyberpunk fire dragon pokemon, mechanical wings with orange neon flames, glowing red eyes, metallic scales, dark futuristic city background, high detail, 4k, digital art style" },
    { id: 'mewtwo', prompt: "Cyberpunk psychic pokemon, glowing purple energy fields, floating mechanical parts, sleek white and purple armor, laboratory background with neon lights, high detail, 4k, digital art style" },
    { id: 'tyranitar', prompt: "Cyberpunk rock pokemon, heavy green mechanical armor, glowing green energy cracks, massive metallic tail, desert wasteland background with neon sandstorms, high detail, 4k, digital art style" }
  ];

  const results: Record<string, string> = {};

  for (const p of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: p.prompt }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          results[p.id] = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e) {
      console.error(`Failed to generate image for ${p.id}`, e);
    }
  }

  return results;
}

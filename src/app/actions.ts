'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

import { PatternPersistence } from '@/services/patternPersistence';

export interface ImageAttributes {
    category: string;
    shape: string;
    stoneDensity: 'none' | 'low' | 'high';
    metalVisibility: 'low' | 'medium' | 'high';
    finish: string;
    occasion: string;
}

export async function analyzeImageAction(imageBase64: string): Promise<ImageAttributes> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // imageBase64 should be the raw base64 data (after "data:image/jpeg;base64,")
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg",
            },
        };

        const prompt = `
            Analyze this jewelry image and extract the following attributes in JSON format:
            - category: (ring, necklace, bracelet, earring)
            - shape: (round, oval, emerald, cushion, princess, pear, etc.)
            - stoneDensity: (none, low, high) - 'high' means pave or multiple stones, 'low' is solitaire
            - metalVisibility: (low, medium, high)
            - finish: (polished, matte, hammered, vintage)
            - occasion: (wedding, engagement, daily, party, formal) - Guess based on style

            Return ONLY the JSON.
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const attributes = JSON.parse(jsonStr);

        // Normalize checks
        const normalizedAttributes: ImageAttributes = {
            category: attributes.category?.toLowerCase() || 'ring',
            shape: attributes.shape?.toLowerCase() || 'round',
            stoneDensity: ['none', 'low', 'high'].includes(attributes.stoneDensity) ? attributes.stoneDensity : 'low',
            metalVisibility: ['low', 'medium', 'high'].includes(attributes.metalVisibility) ? attributes.metalVisibility : 'high',
            finish: attributes.finish?.toLowerCase() || 'polished',
            occasion: attributes.occasion?.toLowerCase() || 'daily',
        };

        // Persist the identified pattern for trending analysis
        await PatternPersistence.savePattern(normalizedAttributes);

        return normalizedAttributes;

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return {
            category: 'ring',
            shape: 'round',
            stoneDensity: 'low',
            metalVisibility: 'high',
            finish: 'polished',
            occasion: 'daily'
        };
    }
}

import { SourcingService, SourcingResult } from '@/services/sourcingService';

export async function getSourcingRecommendationsAction(attributes: ImageAttributes): Promise<SourcingResult> {
    // This runs on the server, so it can import SourcingService which uses firebase-admin
    return await SourcingService.getRecommendations(attributes);
}

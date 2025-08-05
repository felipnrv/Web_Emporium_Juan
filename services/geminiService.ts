import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { ChatMessageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Eres VisorX, un asistente de inteligencia financiera de élite. Tu misión es proporcionar respuestas claras, concisas y bien fundamentadas a las preguntas de los usuarios sobre finanzas, acciones, países y tendencias económicas.

REGLAS CLAVE:
1.  **Analiza Texto e Imágenes**: Eres un modelo multimodal. Puedes analizar gráficos, tablas, o cualquier imagen financiera que el usuario suba junto a su texto. Basa tu análisis en la información visual proporcionada.
2.  **Usa la Búsqueda de Google**: Para preguntas que requieran información actual que no está en una imagen (precios de acciones, indicadores económicos, noticias), utiliza la herramienta de Búsqueda de Google. No inventes información.
3.  **Respuestas Claras**: Evita la jerga excesiva. Explica conceptos complejos de manera sencilla. Usa formato Markdown (listas, negritas, tablas) para mejorar la legibilidad.
4.  **Sé Conciso**: Ve al grano. Responde directamente a la pregunta del usuario sin información superflua.
5.  **Cita tus Fuentes**: Siempre que uses la Búsqueda de Google, la información de las fuentes se incluirá automáticamente. Tu análisis debe basarse en estas fuentes.
6.  **Tono Profesional y Útil**: Mantén un tono experto pero accesible. Tu objetivo es empoderar al usuario con conocimiento financiero, no darle consejos de inversión. Siempre termina las respuestas relacionadas con activos específicos con un descargo de responsabilidad: "Esta información es para fines educativos y no constituye una recomendación de inversión."
`;

export const createChat = async (): Promise<Chat> => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
        },
    });
    return chat;
};

export const sendMessageToChat = async (
    chat: Chat, 
    message: string, 
    image?: { mimeType: string; data: string }
): Promise<ChatMessageData> => {
    
    const messageParts: (string | Part)[] = [];

    if (image) {
        const imagePart: Part = {
            inlineData: {
                mimeType: image.mimeType,
                data: image.data,
            },
        };
        messageParts.push(imagePart);
    }

    if (message.trim()) {
        messageParts.push(message.trim());
    }

    if (messageParts.length === 0) {
        return {
            role: 'model',
            content: 'Por favor, escribe un mensaje o sube una imagen para analizar.'
        }
    }

    const response = await chat.sendMessage({ message: messageParts });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string; } => !!web?.uri) || [];

    return {
        role: 'model',
        content: response.text,
        sources: sources,
    };
};
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from "@google/genai";
import { InputForm } from './components/InputForm';
import { ChatMessage } from './components/ChatMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LogoIcon } from './components/Icons';
import { createChat, sendMessageToChat } from './services/geminiService';
import type { ChatMessageData } from './types';

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Couldn't read file as string"));
      }
      resolve({ mimeType: file.type, data: reader.result });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      const chatInstance = await createChat();
      setChat(chatInstance);
      setMessages([
        {
          role: 'model',
          content: 'Hola, soy VisorX. Tu asistente financiero personal. ¿Qué te gustaría analizar hoy? Puedes preguntar sobre acciones, países, tendencias económicas, o subir una imagen para analizar.',
        },
      ]);
      setLoading(false);
    };
    initChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (userInput: string, imageFile?: File) => {
    if (!chat || loading || (!userInput.trim() && !imageFile)) return;

    setLoading(true);
    let userMessage: ChatMessageData = { role: 'user', content: userInput };
    let imagePayload;

    if (imageFile) {
        try {
            const { mimeType, data } = await fileToBase64(imageFile);
            userMessage.image = data;
            // We need to strip the data URL prefix for the API
            imagePayload = { mimeType, data: data.split(',')[1] };
        } catch (e) {
            console.error(e);
            const errorMessage: ChatMessageData = {
                role: 'model',
                content: `Lo siento, hubo un error procesando la imagen. Por favor, inténtalo de nuevo.`,
            };
            setMessages(prev => [...prev, userMessage, errorMessage]);
            setLoading(false);
            return;
        }
    }

    setMessages(prev => [...prev, userMessage]);

    try {
      const modelResponse = await sendMessageToChat(chat, userInput, imagePayload);
      setMessages(prev => [...prev, modelResponse]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessageData = {
        role: 'model',
        content: `Lo siento, ocurrió un error. ${e instanceof Error ? e.message : 'No pude procesar tu solicitud.'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col h-screen">
      <header className="flex items-center gap-3 p-4 border-b border-gray-800 shrink-0">
        <LogoIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold tracking-tighter text-white">VisorX</h1>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {loading && messages.length > 0 && (
           <div className="flex justify-start">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full shrink-0">
                     <LogoIcon className="w-6 h-6 text-cyan-400" />
                  </div>
                 <div className="text-gray-400 italic animate-pulse">VisorX está analizando...</div>
              </div>
           </div>
        )}
         {loading && messages.length === 0 && <LoadingSpinner />}
      </main>

      <footer className="p-4 border-t border-gray-800 shrink-0">
        <InputForm onSendMessage={handleSendMessage} isLoading={loading} />
      </footer>
    </div>
  );
};

export default App;

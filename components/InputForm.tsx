import React, { useState, useRef } from 'react';
import { SendIcon, CameraIcon, XMarkIcon } from './Icons';

interface InputFormProps {
  onSendMessage: (message: string, imageFile?: File) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || imageFile) {
      onSendMessage(inputValue, imageFile || undefined);
      setInputValue('');
      handleRemoveImage();
    }
  };

  return (
    <div className="relative">
      {imagePreview && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <div className="relative">
                <img src={imagePreview} alt="Image preview" className="h-24 w-auto rounded-md object-cover" />
                <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 flex items-center justify-center h-6 w-6 bg-gray-700 rounded-full text-white hover:bg-gray-600 hover:scale-110 transition-all"
                    aria-label="Remove image"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
            />
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors shrink-0 disabled:opacity-50"
            aria-label="Attach image"
        >
            <CameraIcon className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregúntale a VisorX (o sube una imagen)..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-gray-500"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || (!inputValue.trim() && !imageFile)}
          className="px-4 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
          ) : (
            <SendIcon className="w-6 h-6" />
          )}
        </button>
      </form>
    </div>
  );
};

import React from 'react';
import { LogoIcon, UserIcon, SourceIcon, LinkIcon } from './Icons';
import type { ChatMessageData } from '../types';

interface ChatMessageProps {
  message: ChatMessageData;
}

// A more robust markdown-to-React component renderer that produces valid HTML.
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  // Split content into logical blocks (paragraphs, lists, etc.) separated by empty lines.
  const blocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');

  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  const renderBlock = (block: string, index: number) => {
    // Function to handle inline formatting like bold and italic.
    const formatInline = (str: string): string => {
      return str
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    // Check for headers
    if (block.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-bold mt-4 mb-2" dangerouslySetInnerHTML={createMarkup(formatInline(block.substring(4)))} />;
    }
    if (block.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={createMarkup(formatInline(block.substring(3)))} />;
    }
    if (block.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={createMarkup(formatInline(block.substring(2)))} />;
    }

    // Check if the block is a list. All lines must start with a list marker.
    const listItems = block.split('\n');
    const isList = listItems.every(item => item.trim().startsWith('* ') || item.trim().startsWith('- ') || item.trim().startsWith('• '));

    if (isList) {
      return (
        <ul key={index} className="list-disc list-inside space-y-1 my-2">
          {listItems.map((item, i) => {
            const content = item.trim().substring(item.trim().indexOf(' ') + 1);
            return <li key={i} dangerouslySetInnerHTML={createMarkup(formatInline(content))} />;
          })}
        </ul>
      );
    }
    
    // Default to a paragraph. Replace single newlines with <br /> for line breaks within a paragraph.
    return <p key={index} dangerouslySetInnerHTML={createMarkup(formatInline(block.replace(/\n/g, '<br />')))} />;
  };

  return (
    <div className="space-y-4">
      {blocks.map(renderBlock)}
    </div>
  );
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 ${!isModel ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${isModel ? 'bg-gray-800' : 'bg-cyan-900/50'}`}>
        {isModel ? <LogoIcon className="w-6 h-6 text-cyan-400" /> : <UserIcon className="w-6 h-6 text-cyan-300" />}
      </div>
      <div className={`p-4 rounded-lg max-w-2xl animate-fade-in-up w-full ${isModel ? 'bg-gray-900' : 'bg-cyan-800/60'}`}>
        {message.image && (
          <div className="mb-3">
            <img src={message.image} alt="User upload" className="rounded-lg max-h-64 w-auto" />
          </div>
        )}
        <div className="text-gray-200 leading-relaxed prose prose-invert prose-sm max-w-none">
           <MarkdownRenderer text={message.content} />
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <SourceIcon className="w-4 h-4" />
              FUENTES CONSULTADAS
            </h4>
            <ul className="space-y-1.5">
              {message.sources.map((source, index) => (
                <li key={index} className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors">
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate" title={source.title}>{source.title || new URL(source.uri).hostname}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useRef, useState } from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  audioBuffer?: AudioBuffer;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, audioBuffer }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playAudio = async () => {
    if (!audioBuffer) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Stop previous if playing
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      audioSourceRef.current = null;
    };

    setIsPlaying(true);
    audioSourceRef.current = source;
    source.start();
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in fade-in slide-in-from-bottom-2`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
        }`}
      >
        <div className="text-sm md:text-base leading-relaxed">
          {message.content}
        </div>
        
        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            {message.isProcessing ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Thinking & Speaking...
              </div>
            ) : audioBuffer ? (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    Playing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Listen to Translation
                  </>
                )}
              </button>
            ) : (
              <span className="text-[10px] text-slate-300">No audio available</span>
            )}
            <span className="text-[10px] opacity-60 ml-4">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        
        {isUser && (
          <div className="text-[10px] text-blue-100 mt-2 text-right">
             {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;

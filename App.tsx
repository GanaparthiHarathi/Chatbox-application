
import React, { useState, useRef, useEffect } from 'react';
import { Message, VoiceName } from './types';
import VoiceSelector from './components/VoiceSelector';
import ChatBubble from './components/ChatBubble';
import { generateAudioResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioBuffers, setAudioBuffers] = useState<Record<string, AudioBuffer>>({});
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Fenrir');
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      isProcessing: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInputText('');

    // Call Gemini API
    try {
      const audioBuffer = await generateAudioResponse(
        userMessage.content,
        selectedLanguage,
        selectedVoice
      );

      if (audioBuffer) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content: `Translating your message to ${selectedLanguage}...`,
                  isProcessing: false,
                }
              : msg
          )
        );
        setAudioBuffers((prev) => ({
          ...prev,
          [assistantPlaceholder.id]: audioBuffer,
        }));
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content: "Sorry, I couldn't generate a translation at this time.",
                  isProcessing: false,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                content: "An unexpected error occurred. Please try again.",
                isProcessing: false,
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">LinguaVoice Chat</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Gemini TTS Connection
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Settings (Hidden on Mobile) */}
        <aside className="hidden lg:block w-72 h-full overflow-y-auto p-4 bg-slate-50 border-r border-slate-200">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full bg-slate-50 relative">
          {/* Mobile Settings Toggle (Visual Only) */}
          <div className="lg:hidden p-2 bg-white border-b border-slate-200 flex justify-center gap-2">
             <div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium">
                {selectedLanguage} • {selectedVoice}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to LinguaVoice!</h2>
                <p className="text-slate-500 max-w-sm">
                  Type any message and I'll translate and speak it in your chosen language and character voice.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatBubble 
                  key={msg.id} 
                  message={msg} 
                  audioBuffer={audioBuffers[msg.id]}
                />
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar - Sticky */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
            <form 
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto relative group"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to translate & speak..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-16 shadow-lg shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
               Press Enter to send. Language: <span className="text-slate-600">{selectedLanguage}</span> • Voice: <span className="text-slate-600">{selectedVoice}</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

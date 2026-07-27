'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isSpeaking?: boolean;
}

export interface QuickOption {
  id: string;
  label: string;
  question: string;
  answer: string;
}

const LIMITED_OPTIONS: QuickOption[] = [
  {
    id: 'opt-1',
    label: '🤖 What can Agentra AI do?',
    question: 'What can Agentra AI do for my business?',
    answer: 'Agentra provides autonomous AI Agents for marketing, sales, customer support, and workflow automation that work 24/7 to boost your business growth.'
  },
  {
    id: 'opt-2',
    label: '💰 AI Agent Pricing & Plans',
    question: 'What is the pricing for AI Agents?',
    answer: 'Our plans start at $49 per month for starter agents, up to custom Enterprise solutions with dedicated AI neural models!'
  },
  {
    id: 'opt-3',
    label: '⚡ How to access Admin Panel?',
    question: 'How do I access the Admin Panel?',
    answer: 'Click the Login button at the top header, select the "Admin / Employee Panel" tab, and log in with your admin credentials (admin@agentra.ai).'
  },
  {
    id: 'opt-4',
    label: '👤 How to access User Panel?',
    question: 'How do I access the User Panel?',
    answer: 'Click the Login button at the top header, select the "User Panel" tab, and log in to view your profile, saved chats, and voice settings!'
  },
  {
    id: 'opt-5',
    label: '📱 Login & Mobile OTP Help',
    question: 'What login methods are available?',
    answer: 'You can log in using Gmail/Google, LinkedIn, Mobile Phone Number + OTP, or Email & Password.'
  },
  {
    id: 'opt-6',
    label: '📞 Contact Agentra Team',
    question: 'How can I contact the Agentra team?',
    answer: 'You can submit a message on our Contact section or email us at support@agentra.ai.'
  }
];

export default function AIAssistant3D() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Hello! I am Maya, your Agentra AI Girl Assistant. Please select one of the topics below or ask a question!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech synthesis strictly tuned to a sweet Female Voice
  const speakText = (text: string, msgId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (msgId && speakingMsgId === msgId && isSpeaking) {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.35; // Sweet female voice tone tuning

    const voices = window.speechSynthesis.getVoices();
    // Strictly search for female voice profiles
    const femaleVoice = voices.find(
      v =>
        v.name.includes('Female') ||
        v.name.includes('Google UK English Female') ||
        v.name.includes('Google US English Female') ||
        v.name.includes('Zira') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        v.name.includes('Fiona') ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (opt: QuickOption) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: opt.question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: opt.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 80);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "Please select one of the topics above for official Agentra support, or contact us at support@agentra.ai!";

      const lower = currentInput.toLowerCase();
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        aiResponseText = "Hi there! I am Maya, your Agentra AI Girl Assistant. You can click any topic below to learn more about our AI Agents!";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
        aiResponseText = LIMITED_OPTIONS[1].answer;
      } else if (lower.includes('admin')) {
        aiResponseText = LIMITED_OPTIONS[2].answer;
      } else if (lower.includes('user') || lower.includes('profile')) {
        aiResponseText = LIMITED_OPTIONS[3].answer;
      } else if (lower.includes('login') || lower.includes('phone') || lower.includes('gmail')) {
        aiResponseText = LIMITED_OPTIONS[4].answer;
      } else if (lower.includes('contact') || lower.includes('help')) {
        aiResponseText = LIMITED_OPTIONS[5].answer;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 100);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-96 sm:w-[420px] h-[550px] bg-slate-900/95 backdrop-blur-2xl border-2 border-yellow-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-white mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-slate-900 border-b border-yellow-500/30 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-lg">
                    👩‍💻
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-yellow-400 flex items-center gap-1.5">
                    Maya AI Assistant
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      LIVE VOICE 🔊
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Interactive AI Assistance & Topic Menu</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (isSpeaking) window.speechSynthesis.cancel();
                  }}
                  title={voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
                  className={`p-1.5 rounded-lg border transition ${
                    voiceEnabled
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {voiceEnabled ? '🔊' : '🔇'}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-950/40">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl relative shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-800/90 border border-yellow-500/30 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Audio Sound Button on every message bubble */}
                    <div className="mt-2 pt-1 border-t border-slate-700/50 flex justify-between items-center text-[10px]">
                      <span className={msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-400'}>
                        {msg.timestamp}
                      </span>
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition ${
                          speakingMsgId === msg.id && isSpeaking
                            ? 'bg-red-500 text-white animate-pulse'
                            : msg.sender === 'user'
                            ? 'bg-slate-950/20 text-slate-900 hover:bg-slate-950/40'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/40'
                        }`}
                        title="Click to Listen Audio Sound"
                      >
                        {speakingMsgId === msg.id && isSpeaking ? '⏹ Stop' : '🔊 Listen Audio'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-yellow-400 text-xs italic">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-bounce [animation-delay:0.4s]"></div>
                  <span>Maya is preparing response...</span>
                </div>
              )}

              {/* Limited Quick Options Menu */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-yellow-400 mb-2 uppercase tracking-wider">
                  Select a topic for instant answer:
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIMITED_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-semibold transition text-left hover:scale-[1.02]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-yellow-500/30 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Maya girl assistant..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-yellow-500 rounded-xl text-sm outline-none text-white placeholder-slate-500"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg transition text-xs"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Badge */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1, rotateZ: 5 }}
          whileTap={{ scale: 0.9 }}
          className="relative group flex items-center justify-center p-4 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500 shadow-[0_0_35px_rgba(245,158,11,0.5)] border-2 border-yellow-300/50 cursor-pointer"
        >
          <span className="text-3xl">👩‍💻</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400"></span>
          </span>

          <div className="absolute right-full mr-3 hidden group-hover:flex items-center px-3 py-1.5 rounded-xl bg-slate-900 border border-yellow-500/40 text-yellow-400 text-xs font-bold whitespace-nowrap shadow-xl">
            Talk with Maya Girl Assistant 🔊
          </div>
        </motion.button>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingCursor from '@/components/FloatingCursor';

interface ChatHistoryItem {
  id: string;
  agentName: string;
  message: string;
  response: string;
  date: string;
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'chats' | 'voice'>('profile');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Voice Settings State
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.2);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Mocked/Saved Chat History
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: 'log-1',
      agentName: 'Maya 3D Assistant',
      message: 'Can you help me design an automated marketing agent?',
      response: 'Absolutely! Our Marketing Agent automates multi-channel campaign management, lead scoring, and content distribution 24/7.',
      date: 'Today, 01:15 AM'
    },
    {
      id: 'log-2',
      agentName: 'Sales Specialist Agent',
      message: 'What is the average response time for sales inquiries?',
      response: 'Sales AI agent responds instantly within 300ms, qualifying leads and setting up calendar meetings automatically.',
      date: 'Yesterday, 04:30 PM'
    }
  ]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setName(user.name || '');
    setCompany(user.company || '');
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    const result = await updateProfile(name.trim(), company.trim() || undefined);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Play audio sound for a chat history response
  const playSound = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = voicePitch;

    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.lang.startsWith('en'));
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} relative overflow-hidden`}>
      <FloatingCursor isDarkMode={isDarkMode} />
      
      {/* 3D Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Header */}
      <div className="border-b border-yellow-500/30 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Agentra Logo" className="w-9 h-9 object-contain rounded-xl border border-yellow-500/40 shadow-lg" />
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  AGENTRA
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 tracking-widest border border-yellow-300/40">
                  AI
                </span>
              </div>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30">
              USER PORTAL
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              ← Back to Home
            </Link>
            {user.email === 'admin@agentra.ai' && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/20 transition"
              >
                Admin Panel ⚡
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* User Hero Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-yellow-950/40 border border-yellow-500/30 backdrop-blur-2xl shadow-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-orange-500 p-0.5 shadow-lg shadow-orange-500/30">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl font-black text-yellow-400">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-2">
                {user.name}
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
                  ACTIVE USER
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">{user.email} {user.company ? `• ${user.company}` : ''}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-yellow-500/20">
              <span className="text-xs text-slate-400 block">Saved Chats</span>
              <span className="text-xl font-bold text-yellow-400">{chatHistory.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-yellow-500/20">
              <span className="text-xs text-slate-400 block">AI Voice</span>
              <span className="text-xl font-bold text-green-400">Maya 3D</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-yellow-500/20">
              <span className="text-xs text-slate-400 block">Status</span>
              <span className="text-xl font-bold text-orange-400">Pro</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            👤 Account Profile
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'chats'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            💬 Chat Logs & Sound Playback
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔊 AI Voice & Audio Settings
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 rounded-3xl bg-slate-900/90 border border-yellow-500/30 backdrop-blur-2xl shadow-xl"
            >
              <h2 className="text-xl font-bold text-yellow-400 mb-6">Edit Personal Details</h2>
              {error && <div className="p-4 mb-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-sm">{error}</div>}
              {success && <div className="p-4 mb-4 rounded-xl bg-green-950/60 border border-green-500/50 text-green-300 text-sm">{success}</div>}

              <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Email (Primary)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-500 text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-yellow-500 text-white text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 font-bold text-slate-950 text-sm shadow-lg hover:from-yellow-400 hover:to-orange-400 transition"
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'chats' && (
            <motion.div
              key="chats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm flex justify-between items-center">
                <span>🔊 Click <b>"Listen Audio"</b> on any saved conversation response to hear the AI Girl Assistant speak!</span>
              </div>

              {chatHistory.map(item => (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-yellow-500/40 transition shadow-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-yellow-400 text-sm flex items-center gap-2">
                      🤖 {item.agentName}
                    </span>
                    <span className="text-xs text-slate-500">{item.date}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm">
                    <span className="text-slate-500 font-bold block mb-1">USER MESSAGE:</span>
                    {item.message}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-yellow-500/30 text-white text-sm relative">
                    <span className="text-yellow-400 font-bold block mb-1">AI GIRL RESPONSE:</span>
                    <p className="leading-relaxed">{item.response}</p>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => playSound(item.response, item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          speakingId === item.id
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/40'
                        }`}
                      >
                        {speakingId === item.id ? '⏹ Stop Audio' : '🔊 Listen Audio Sound'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 rounded-3xl bg-slate-900/90 border border-yellow-500/30 backdrop-blur-2xl shadow-xl space-y-6"
            >
              <h2 className="text-xl font-bold text-yellow-400">AI Girl Voice & Speech Customization</h2>

              <div className="space-y-4 max-w-xl">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <h4 className="font-semibold text-white text-sm">Auto-play Girl Voice Speech</h4>
                    <p className="text-xs text-slate-400">Automatically read AI responses out loud when chatting</p>
                  </div>
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`w-12 h-6 rounded-full transition p-1 ${autoSpeak ? 'bg-yellow-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition transform ${autoSpeak ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Voice Speed ({voiceSpeed}x)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={e => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Voice Pitch ({voicePitch})</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.6"
                    step="0.1"
                    value={voicePitch}
                    onChange={e => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => playSound("Hello! This is Maya testing your voice and audio settings.", 'test-voice')}
                    className="px-5 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold hover:bg-yellow-500/30 transition flex items-center gap-2"
                  >
                    🔊 Test Voice Sound Output
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
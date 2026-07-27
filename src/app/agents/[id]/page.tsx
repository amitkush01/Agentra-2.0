'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import VideoSlider from '@/components/VideoSlider';
import FloatingCursor from '@/components/FloatingCursor';
import Background3D from '@/components/Background3D';

interface Agent {
  id: number;
  name: string;
  type: string;
  description?: string;
  status: string;
  photo_url?: string;
  key_value?: string;
  features?: string;
  created_at: string;
  updated_at: string;
}

interface AgentVideo {
  id: number;
  agent_id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
}

const DEFAULT_DEMO_VIDEOS: Record<string, AgentVideo[]> = {
  default: [
    {
      id: 101,
      agent_id: 1,
      title: 'AI Agent Autonomous Workflow Demo',
      description: 'Watch this AI Agent execute marketing campaigns, lead qualification, and automatic CRM sync live.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      created_at: new Date().toISOString()
    },
    {
      id: 102,
      agent_id: 1,
      title: 'Real-time AI Sales & Customer Engagement',
      description: 'Live demonstration of automated 24/7 lead qualification and calendar meeting scheduling.',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      created_at: new Date().toISOString()
    }
  ]
};

const getAgent3DImage = (agentId: string | number, type?: string) => {
  const idStr = String(agentId);
  if (idStr === '1' || type === 'marketing') {
    return '/images/ai_agent_3d_marketing.png';
  }
  if (idStr === '2' || type === 'sales') {
    return '/images/ai_agent_3d_sales.png';
  }
  if (idStr === '3' || type === 'support') {
    return '/images/ai_agent_3d_support.png';
  }
  return '/images/ai_agent_3d_showcase.png';
};

interface FeatureDetail {
  title: string;
  icon: string;
  desc: string;
  badge: string;
}

const AGENT_SPECIFIC_FEATURES: Record<string, FeatureDetail[]> = {
  '1': [
    {
      title: 'Multi-Platform Ad Campaign Manager',
      icon: '🚀',
      desc: 'Automates creation, budget allocation, and real-time optimization across Meta (Facebook/Instagram) and Google Ads.',
      badge: '45% Higher ROI'
    },
    {
      title: 'AI Copywriting & A/B Creative Engine',
      icon: '✍️',
      desc: 'Generates high-converting ad copy, headlines, and landing page text with automated A/B test split testing.',
      badge: 'Auto Copy'
    },
    {
      title: 'Automated Cold Email Sequences',
      icon: '✉️',
      desc: 'Dispatches personalized multi-step email drip sequences with automated inbox deliverability warming.',
      badge: '98% Inbox Rate'
    },
    {
      title: 'Real-Time ROI & Conversion Analytics',
      icon: '📊',
      desc: 'Live tracking of cost per acquisition (CPA), return on ad spend (ROAS), and real-time revenue analytics dashboard.',
      badge: 'Live Dashboard'
    },
    {
      title: 'Behavioral Retargeting & Lead Nurturing',
      icon: '🎯',
      desc: 'Tracks website visitor intent to automatically trigger retargeting ads and nurture qualified leads.',
      badge: 'Smart Retarget'
    },
    {
      title: 'Social Media Content & Scheduling',
      icon: '📱',
      desc: 'Creates brand-aligned social posts, schedules publishing calendars, and responds to audience comments.',
      badge: '24/7 Publishing'
    }
  ],
  '2': [
    {
      title: '24/7 Automated Lead Qualification',
      icon: '🎯',
      desc: 'Engages website visitors instantly, asking qualifying questions to score and filter high-value prospects.',
      badge: 'Instant Qualify'
    },
    {
      title: 'Smart Calendar & Meeting Booking',
      icon: '📅',
      desc: 'Seamlessly schedules sales discovery calls directly onto sales rep calendars (Google Calendar, Outlook).',
      badge: 'Auto Schedule'
    },
    {
      title: 'HubSpot & Salesforce CRM Sync',
      icon: '💼',
      desc: 'Automatically updates contact records, logs call notes, creates deals, and moves pipeline stages in real time.',
      badge: 'Realtime Sync'
    },
    {
      title: 'WhatsApp & SMS Automated Follow-Ups',
      icon: '💬',
      desc: 'Sends timely SMS and WhatsApp follow-up messages to prevent deal stagnation and keep leads warm.',
      badge: 'WhatsApp API'
    },
    {
      title: 'Sales Revenue & Pipeline Forecasting',
      icon: '📈',
      desc: 'Predicts monthly closing revenue, deal win probabilities, and alerts reps to high-converting deals.',
      badge: 'AI Predict'
    },
    {
      title: 'Objections Handling & Product Demos',
      icon: '🤝',
      desc: 'Answers pricing inquiries, handles feature objections, and presents interactive product demo walkthroughs.',
      badge: 'Smart Answers'
    }
  ]
};

const DEFAULT_AGENTS_MAP: Record<string, Agent> = {
  '1': {
    id: 1,
    name: 'Marketing AI Agent 1',
    type: 'marketing',
    photo_url: '/images/ai_agent_3d_marketing.png',
    description: 'Advanced marketing automation agent for lead generation, ad campaign management, and content creation.',
    status: 'active',
    key_value: 'Saves 150+ hours per month with 45% ROI boost',
    features: 'Lead generation, Campaign automation, Analytics tracking, Social media management, Email marketing, ROI optimization',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  '2': {
    id: 2,
    name: 'Sales AI Agent 2',
    type: 'sales',
    photo_url: '/images/ai_agent_3d_sales.png',
    description: 'Intelligent 24/7 sales assistant that qualifies leads, handles follow-ups, and guides prospects through deals.',
    status: 'active',
    key_value: 'Increases sales conversion rate by 40%',
    features: 'Lead qualification, Automated follow-ups, CRM integration, Sales forecasting, Customer insights, Deal tracking',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [videos, setVideos] = useState<AgentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Always use dark mode
  useEffect(() => {
    setIsDarkMode(true);
  }, []);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load agent data
  useEffect(() => {
    if (!agentId) return;

    const loadAgentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load agent details
        const agentResponse = await fetch(`/api/agents/${agentId}`);
        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          setAgent(agentData);
        } else if (DEFAULT_AGENTS_MAP[String(agentId)]) {
          setAgent(DEFAULT_AGENTS_MAP[String(agentId)]);
        } else {
          setAgent(DEFAULT_AGENTS_MAP['1']);
        }
      } catch (err) {
        if (DEFAULT_AGENTS_MAP[String(agentId)]) {
          setAgent(DEFAULT_AGENTS_MAP[String(agentId)]);
        } else {
          setAgent(DEFAULT_AGENTS_MAP['1']);
        }
      } finally {
        setLoading(false);
      }
    };

    loadAgentData();
  }, [agentId]);

  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const bgClass = isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className={`mt-4 ${textClass}`}>Loading agent details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${textClass} mb-4`}>Agent Not Found</h1>
            <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              The agent you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500 relative overflow-hidden`}>
      {/* 3D Particle Canvas Background */}
      <Background3D />

      {/* Floating Cursor */}
      <FloatingCursor isDarkMode={isDarkMode} />
      
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onContact={() => {}}
        onAbout={() => {}}
        onServices={() => {}}
        onLogin={openLoginModal}
        user={user}
        showLearnMore={false}
        isHovering={isHovering}
        setIsHovering={setIsHovering}
      />

             {/* Hero Section */}
       <section className="pt-28 md:pt-36 pb-16">
         <div className="max-w-7xl mx-auto px-6">
           {/* Back Navigation Button */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="mb-8"
           >
             <a
               href="/#agents"
               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/90 border border-yellow-500/40 text-yellow-400 font-black text-sm hover:bg-yellow-500/20 hover:scale-105 transition shadow-lg backdrop-blur-md"
             >
               <span>←</span> Back to All AI Agents
             </a>
           </motion.div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             {/* Left Content */}
             <div className="space-y-8">
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8 }}
               >
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-6">
                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6`}>
                   {agent.name}
                 </h1>
                 <p className={`text-xl md:text-2xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6`}>
                   {agent.description}
                 </p>
                 
                 {/* Status Badge */}
                 <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6">
                   <div className={`w-2 h-2 rounded-full mr-2 ${
                     agent.status === 'active' ? 'bg-green-500' : 'bg-blue-500'
                   }`}></div>
                   <span className={`${
                     agent.status === 'active' ? 'text-green-700 bg-green-100' : 'text-blue-700 bg-blue-100'
                   } px-3 py-1 rounded-full`}>
                     {agent.status === 'active' ? 'Active' : 'Ready to Launch'}
                   </span>
                 </div>

                 {/* Key Value */}
                 {agent.key_value && (
                   <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-yellow-100/50'} border-2 ${isDarkMode ? 'border-slate-700' : 'border-yellow-200'}`}>
                     <h3 className={`text-lg font-semibold ${textClass} mb-2`}>Key Value</h3>
                     <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                       {agent.key_value}
                     </p>
                   </div>
                 )}
               </motion.div>
             </div>

             {/* Right: Agent Image */}
             <div className="flex justify-center">
               <motion.div
                 className={`w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-3xl shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40' : 'bg-gradient-to-br from-yellow-100/60 to-orange-100/60'} flex items-center justify-center relative overflow-hidden border-4 border-yellow-200/30`}
                 initial={{ y: 30, opacity: 0, rotateY: -15 }}
                 animate={{ y: 0, opacity: 1, rotateY: 0 }}
                 transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                 whileHover={{ 
                   scale: 1.04, 
                   boxShadow: '0 0 40px #F59E0B',
                   rotateY: 5,
                   rotateX: 5
                 }}
               >
                 {agent.photo_url ? (
                   <img 
                     src={agent.photo_url} 
                     alt={agent.name}
                     className="w-full h-full object-cover rounded-3xl"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       if (e.currentTarget.nextElementSibling) {
                         (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                       }
                     }}
                   />
                 ) : null}
                 <div className={`w-full h-full flex items-center justify-center text-8xl lg:text-9xl ${agent.photo_url ? 'hidden' : ''}`}>
                   🤖
                 </div>
                 
                 {/* Glow effect */}
                 <motion.div
                   className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-3xl"
                   animate={{ opacity: [0.3, 0.7, 0.3] }}
                   transition={{ repeat: Infinity, duration: 3, repeatType: 'loop' }}
                 />
               </motion.div>
             </div>
           </div>
         </div>
       </section>

       {/* Videos Section - Moved Up */}
       <section className="py-20">
         <div className="max-w-7xl mx-auto px-6">
           <motion.div
             className="text-center mb-16"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30 mb-4">
                <span>✨</span> 3D HOLOGRAM VISUALIZER
              </div>
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4`}>
                3D Neural Agent Showcase
              </h2>
              <p className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} max-w-3xl mx-auto`}>
                High-definition 3D rendering and neural architecture for {agent.name}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_60px_rgba(245,158,11,0.3)] bg-slate-900/90 backdrop-blur-2xl p-4 sm:p-8 flex flex-col items-center"
            >
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative group border border-slate-700 shadow-2xl">
                <img
                  src={agent.photo_url || getAgent3DImage(agent.id, agent.type)}
                  alt={`${agent.name} 3D Neural Showcase`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 flex flex-col justify-end p-6 sm:p-8">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30 w-fit mb-2">
                    AUTONOMOUS NEURAL CORE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{agent.name} 3D Model</h3>
                  <p className="text-sm text-slate-300 mt-1 max-w-xl">
                    Equipped with real-time multi-channel data processing and adaptive neural intelligence.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold text-xs border border-yellow-500/30 mb-4">
                <span>⚡</span> DOMAIN SPECIFIC CAPABILITIES
              </div>
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4`}>
                Enabled Core Features
              </h2>
              <p className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} max-w-3xl mx-auto`}>
                Comprehensive autonomous tools and capabilities configured specifically for {agent.name}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(AGENT_SPECIFIC_FEATURES[String(agent.id)] ||
                AGENT_SPECIFIC_FEATURES[agent.type === 'sales' ? '2' : '1']).map((feat, index) => (
                <motion.div
                  key={index}
                  className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-yellow-500/60 shadow-xl'
                      : 'bg-white border-slate-200 hover:border-yellow-400 shadow-xl'
                  } hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:-translate-y-1 relative group overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 flex items-center justify-center text-3xl shadow-inner">
                      {feat.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-[11px] font-black tracking-wider border border-yellow-500/30 uppercase">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className={`text-xl font-black mb-3 ${textClass} group-hover:text-yellow-400 transition`}>
                    {feat.title}
                  </h3>

                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {feat.desc}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-yellow-400">
                    <span>ENABLED & ACTIVE</span>
                    <span className="text-base group-hover:translate-x-1 transition">→</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

       {/* Contact Section */}
       <section className="py-20">
         <div className="max-w-7xl mx-auto px-6">
           <motion.div
             className="text-center mb-16"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6`}>
               Get In Touch
             </h2>
             <p className={`text-xl md:text-2xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} max-w-3xl mx-auto`}>
               Ready to integrate {agent.name} into your business? Let&apos;s discuss how we can help you achieve your goals.
             </p>
           </motion.div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             {/* Contact Form */}
             <motion.div
               className={`p-8 rounded-3xl border-2 ${
                 isDarkMode
                   ? 'bg-slate-800/50 border-slate-700'
                   : 'bg-yellow-50/50 border-yellow-200'
               }`}
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
             >
               <h3 className={`text-2xl font-bold ${textClass} mb-6`}>Send Us a Message</h3>
               
               <form className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                       Name *
                     </label>
                     <input
                       type="text"
                       className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                         isDarkMode
                           ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                           : 'bg-white border-yellow-200 text-slate-900 placeholder-slate-500'
                       }`}
                       placeholder="Your full name"
                       required
                     />
                   </div>
                   <div>
                     <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                       Email *
                     </label>
                     <input
                       type="email"
                       className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                         isDarkMode
                           ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                           : 'bg-white border-yellow-200 text-slate-900 placeholder-slate-500'
                       }`}
                       placeholder="your@email.com"
                       required
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                     Company
                   </label>
                   <input
                     type="text"
                     className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                       isDarkMode
                         ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                         : 'bg-white border-yellow-200 text-slate-900 placeholder-slate-500'
                     }`}
                     placeholder="Your company name"
                   />
                 </div>
                 
                 <div>
                   <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                     Message *
                   </label>
                   <textarea
                     rows={4}
                     className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none ${
                       isDarkMode
                         ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                         : 'bg-white border-yellow-200 text-slate-900 placeholder-slate-500'
                     }`}
                     placeholder={`Tell us about your project and how ${agent.name} can help...`}
                     required
                   />
                 </div>
                 
                 <button
                   type="submit"
                   className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                 >
                   Send Message
                 </button>
               </form>
             </motion.div>

             {/* Contact Info */}
             <motion.div
               className="space-y-8"
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
             >
               <div className={`p-6 rounded-2xl border-2 ${
                 isDarkMode
                   ? 'bg-slate-800/50 border-slate-700'
                   : 'bg-yellow-50/50 border-yellow-200'
               }`}>
                 <div className="flex items-center mb-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                   </div>
                   <div>
                     <h4 className={`text-lg font-semibold ${textClass}`}>Email Us</h4>
                     <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>contact@agentra.ai</p>
                   </div>
                 </div>
               </div>

               <div className={`p-6 rounded-2xl border-2 ${
                 isDarkMode
                   ? 'bg-slate-800/50 border-slate-700'
                   : 'bg-yellow-50/50 border-yellow-200'
               }`}>
                 <div className="flex items-center mb-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div>
                     <h4 className={`text-lg font-semibold ${textClass}`}>Response Time</h4>
                     <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Within 24 hours</p>
                   </div>
                 </div>
               </div>

               <div className={`p-6 rounded-2xl border-2 ${
                 isDarkMode
                   ? 'bg-slate-800/50 border-slate-700'
                   : 'bg-yellow-50/50 border-yellow-200'
               }`}>
                 <div className="flex items-center mb-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div>
                     <h4 className={`text-lg font-semibold ${textClass}`}>Free Consultation</h4>
                     <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No cost, no obligation</p>
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         </div>
       </section>

      

      {/* Footer */}
      <Footer
        isDarkMode={isDarkMode}
        isHovering={isHovering}
        setIsHovering={setIsHovering}
        onAbout={() => {}}
      />
    </div>
  );
} 
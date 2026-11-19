import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { MathRenderer } from '@/components/MathRenderer';
import { TopicQuizSection } from '@/components/tutor/TopicQuizSection';
import {
  Bell,
  BookOpen,
  Compass,
  ChevronRight,
  ArrowLeft,
  Send,
  User,
  Bot,
  MessageCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  askTeacherOffer?: boolean;
}

interface TutorScreenProps {
  onStartTopicQuiz?: (subjectId: string, topicId?: string, difficulty?: number) => void;
}

export const TutorScreen: React.FC<TutorScreenProps> = ({ onStartTopicQuiz }) => {
  const {
    profile,
    tutorQuestionsRemaining,
    decrementTutorQuota,
    setShowPaywall,
    setShowLeadModal,
    setShowSkylerModal,
  } = useAppStore();

  const [activeMode, setActiveMode] = useState<'hub' | 'chat'>('hub');
  const [chatSubject, setChatSubject] = useState<'Mathematics' | 'Physics' | 'Chemistry'>('Mathematics');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'tutor',
      text: `Hello ${profile.name}! I am your ${chatSubject} GCE Tutor, grounded in Cameroon GCE syllabuses and teacher marking schemes. What topic or past paper problem would you like to master today?`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const hasPass = profile.plan === 'pass';

  const QUICK_QUESTIONS = [
    'How do I calculate acceleration on an inclined plane with friction?',
    'What is the formula for resistors in parallel vs series?',
    'What do M1, A1, and B1 marks mean in GCE marking schemes?',
    'How do I find the modulus of a complex number like 3 + 4i?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (!decrementTutorQuota()) {
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      let reply = '';
      let offerTeacher = false;
      const lower = query.toLowerCase();

      if (lower.includes('incline') || lower.includes('friction') || lower.includes('slope')) {
        reply = `For an object of mass $m$ sliding down a plane inclined at angle $\\theta$ with friction force $F$:\n\n1. Resolve forces along the incline: The component of gravity pulling down is $mg \\sin\\theta$.\n2. Friction acts up the slope against the motion.\n3. Newton's 2nd Law gives: $mg \\sin\\theta - F = ma$.\n4. Divide by $m$ to get acceleration $a$.\n\nCommon slip: Forgetting that friction always opposes motion, or using $\\cos\\theta$ instead of $\\sin\\theta$ for the parallel component! [ASK_TEACHER]`;
        offerTeacher = true;
      } else if (lower.includes('resistor') || lower.includes('parallel') || lower.includes('series')) {
        reply = `In Cameroon GCE Physics:\n\n• **Resistors in series**: $R_{total} = R_1 + R_2 + ...$ (current is identical everywhere, voltages add up).\n• **Resistors in parallel**: $1/R_{total} = 1/R_1 + 1/R_2$ (voltage across each branch is identical).\nFor example: two $6\\,\\Omega$ resistors in parallel give $1/R = 1/6 + 1/6 = 2/6 = 1/3$, so $R = 3\\,\\Omega$. Common slip: adding parallel resistors directly to get 12 Ω!`;
      } else if (lower.includes('m1') || lower.includes('a1') || lower.includes('b1') || lower.includes('mark')) {
        reply = `In the Cameroon GCE Board and Skyline marking schemes:\n\n• **M1 (Method mark)**: Awarded for using a valid mathematical or scientific formula/method with correct substitution, even if calculation fails.\n• **A1 (Accuracy mark)**: Awarded for reaching the correct numeric answer, dependent on earning the preceding method mark.\n• **B1 (Independent mark)**: Awarded for a standalone correct statement, option, definition, or correct SI unit without depending on a prior method.`;
      } else if (lower.includes('complex') || lower.includes('modulus') || lower.includes('3 + 4i')) {
        reply = `For any complex number $z = a + bi$:\n\nThe modulus $|z|$ is the distance from the origin in the Argand diagram: $|z| = \\sqrt{a^2 + b^2}$.\n\nFor $z = 3 + 4i$:\n$|z| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.\n\nThis is a classic 1-mark question on A-Level Pure Mathematics Paper 1!`;
      } else {
        reply = `Here is how to approach this in Cameroon GCE:\n\n1. Identify the core syllabus topic and write down all known data with their proper SI units.\n2. State the fundamental governing law or theorem (e.g., Newton's laws, integration rules, Le Chatelier's principle).\n3. Show clear algebraic steps to earn the examiner's Method marks (M1).\n4. State your final answer with correct significant figures and unit (A1).\n\nIf you want a Skyline teacher to review your specific question, you can connect directly on WhatsApp! [ASK_TEACHER]`;
        offerTeacher = true;
      }

      const tutorMsg: ChatMessage = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: reply.replace('[ASK_TEACHER]', '').trim(),
        askTeacherOffer: offerTeacher,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    }, 600);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: Tutor Hub matching 10._Tutor_tab_6817474e.png
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeMode === 'hub') {
    return (
      <div className="space-y-4 pb-20">
        {/* Header matching 10._Tutor_tab_6817474e.png */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#173A43]">
              Tutor
            </h1>
            <p className="text-xs text-[#55737B] mt-0.5">
              Your AI learning companion
            </p>
          </div>

          <div className="relative">
            <button className="p-2 rounded-full hover:bg-white text-[#173A43] border border-[#D5EAE9] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8A00] ring-2 ring-[#F5FAFA]" />
            </button>
          </div>
        </div>

        {/* Card 1: GCE Tutor */}
        <div className="p-5 rounded-3xl bg-[#EAFBF9] border border-[#C5F3EE] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00B8B0] text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-lg text-[#173A43]">
                GCE Tutor
              </h2>
              <p className="text-xs text-[#55737B] leading-relaxed">
                Understand topics. Practise questions. Improve your results.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveMode('chat')}
            className="w-full py-3 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 text-center"
          >
            Start Learning
          </button>
        </div>

        {/* Card 2: Skyler */}
        <div className="p-5 rounded-3xl bg-[#FFF8E7] border border-[#FBEAC4] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-4">
            {/* Colorful Compass Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00B8B0] to-[#087F7A] text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-[#FFB703]/30">
              <Compass className="w-8 h-8 stroke-[2.2] text-[#FFB703]" />
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-lg text-[#173A43]">
                Skyler
              </h2>
              <p className="text-xs text-[#55737B] leading-relaxed">
                Discover the Concours and career pathways that fit you.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSkylerModal(true)}
            className="w-full py-3 rounded-full bg-[#FF8A00] hover:bg-[#D97200] text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 text-center"
          >
            Discover My Path
          </button>
        </div>

        {/* Dedicated Topic Practice & Quiz Section */}
        <TopicQuizSection
          onStartQuiz={(subId, topId, difficulty) => {
            if (onStartTopicQuiz) {
              onStartTopicQuiz(subId, topId, difficulty);
            }
          }}
        />

        {/* Continue your conversation section */}
        <div className="space-y-2.5 pt-2">
          <h2 className="font-display font-bold text-xs text-[#173A43] px-1">
            Continue your conversation
          </h2>

          <div
            onClick={() => {
              setChatSubject('Mathematics');
              setActiveMode('chat');
            }}
            className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] hover:border-[#00B8B0] transition-all cursor-pointer shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#00B8B0]/20 text-[#00B8B0] flex items-center justify-center font-display font-bold text-sm shadow-xs">
                MT
              </div>
              <div>
                <h3 className="font-display font-bold text-xs text-[#173A43] group-hover:text-[#00B8B0] transition-colors">
                  Mathematics Tutor
                </h3>
                <div className="text-[11px] text-[#55737B]">
                  Last message • 2h ago
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#55737B] group-hover:text-[#00B8B0] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: Interactive Chat Dialog
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 pb-20 flex flex-col h-[calc(100vh-140px)] max-w-xl mx-auto">
      {/* Top Header */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveMode('hub')}
            className="p-1 rounded-full hover:bg-[#F5FAFA] text-[#173A43]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#00B8B0] text-white flex items-center justify-center font-bold text-xs">
            <Bot className="w-4 h-4" />
          </div>

          <div>
            <div className="font-display font-bold text-xs text-[#173A43]">
              {chatSubject} GCE Tutor
            </div>
            <div className="text-[10px] text-[#55737B]">
              Grounded in Cameroon GCE Syllabuses
            </div>
          </div>
        </div>

        {hasPass ? (
          <span className="text-[11px] font-semibold text-[#00B8B0] bg-[#00B8B0]/10 px-2.5 py-1 rounded-full border border-[#00B8B0]/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF8A00]" /> Unlimited Pass
          </span>
        ) : (
          <button
            onClick={() => setShowPaywall(true)}
            className="text-[11px] font-semibold text-[#FF8A00] bg-[#FF8A00]/15 px-2.5 py-1 rounded-full border border-[#FF8A00]/30 flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>{tutorQuestionsRemaining} free left</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isUser ? 'bg-[#FF8A00] text-white font-bold' : 'bg-[#00B8B0] text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-1.5 max-w-[85%]">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#00B8B0] text-white rounded-tr-none'
                      : 'bg-white border border-[#D5EAE9] text-[#173A43] rounded-tl-none shadow-xs'
                  }`}
                >
                  <MathRenderer text={m.text} />
                </div>

                {m.askTeacherOffer && (
                  <button
                    onClick={() => setShowLeadModal(true, { target: 'Tutor Question Handover' })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1b8c45] font-semibold text-[11px] transition-colors border border-[#25D366]/30"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ask a human Skyline teacher on WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#55737B] pl-10">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8B0] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8B0] animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8B0] animate-pulse delay-200" />
            </div>
            <span>Skyline Tutor is formulating solution...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-full bg-white hover:bg-[#EAFBF9] text-[#55737B] hover:text-[#00B8B0] text-[11px] font-medium whitespace-nowrap border border-[#D5EAE9] transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or calculation problem..."
          className="flex-1 px-3.5 py-2.5 rounded-full bg-white border border-[#D5EAE9] text-xs text-[#173A43] focus:outline-none focus:border-[#00B8B0] shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2.5 rounded-full bg-[#00B8B0] hover:bg-[#087F7A] disabled:opacity-40 transition-colors text-white font-bold text-xs flex items-center justify-center shadow-xs active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Lightbulb, Zap } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'

// ─── Mock responses ─────────────────────────────────────────────────────────────
// Keyed to quick-question ids so matched questions get relevant replies;
// everything else falls back to the rotating pool.

const quickQuestions = [
  { id: 'q1', label: 'What skills am I missing for promotion?'         },
  { id: 'q2', label: 'How do I improve my skill score?'                },
  { id: 'q3', label: 'Which courses should I take next?'               },
  { id: 'q4', label: 'How does the assessment process work?'           },
  { id: 'q5', label: 'Can you summarize my team\'s skill gaps?'        },
  { id: 'q6', label: 'What is my projected career timeline?'           },
]

const quickReplies: Record<string, string> = {
  q1: "Based on your current profile, you're missing Cloud / AWS (2/5) and Security Awareness (2/5) to meet the Staff Engineer bar. I'd suggest starting with the AWS Solutions Architect course — it covers both areas.",
  q2: "Your skill score of 74 is 11 points below your Staff Engineer target of 85. Completing the top 2 recommended courses and your Q1 self-assessment would push you to ~80. Consistent weekly learning (≥4h) historically adds ~3 pts per quarter.",
  q3: "Based on your gaps, I recommend: ① AWS Solutions Architect (High priority) ② Security Fundamentals ③ Advanced System Design. All three are already queued in your Learning path.",
  q4: "Assessments run quarterly. You self-rate each skill 1–5, your manager reviews it, and the AI cross-references commit activity and course completions to calibrate the final score. The next deadline is Apr 15, 2026.",
  q5: "Your Engineering team (5 members) has the sharpest gaps in Security (avg 2.2/5), Cloud (avg 2.6/5), and CI/CD (avg 2.8/5). Bao K. is the top performer at an avg score of 4.3. Want a detailed breakdown?",
  q6: "At your current trajectory you're on track for Staff Engineer by Q3 2027. Closing the AWS and Security gaps could accelerate that by ~6 months. Long-term, Engineering Manager is feasible by 2030 based on your leadership skill growth.",
}

const fallbackReplies = [
  "Great question! Let me look into that for you. Based on your profile, I can see some interesting patterns in your skill development.",
  "I've analyzed your recent activity. Your strongest area remains Backend Development — keep leveraging that while growing Cloud skills.",
  "Your team has a 15% aggregate gap vs. the engineering benchmark. The biggest opportunity is Security Awareness across all members.",
  "For Q2, I'd focus on one certification and two learning modules. That's historically the sweet spot for score improvement without burnout.",
  "Your assessment completion rate is 94% — well above the 78% company average. That consistency is a strong signal for promotion readiness.",
]

const tips = [
  { icon: '💡', text: 'Ask specific questions — e.g. "What AWS skills should I focus on?"' },
  { icon: '📊', text: 'Request team summaries — "What are my team\'s top 3 gaps?"'        },
  { icon: '🗓️', text: 'Ask about timelines — "When can I realistically hit Staff Eng?"'   },
  { icon: '📚', text: 'Get course picks — "Which course closes my Security gap fastest?"'  },
  { icon: '🎯', text: 'Set targets — "What score do I need for my next promotion?"'        },
]

let fallbackIndex = 0

// ─── Sub-components ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-white text-[11px] font-semibold shrink-0 mt-0.5">
          ✦
        </div>
      )}
      <div className={cn(
        'max-w-[78%] rounded-card px-4 py-3',
        isUser
          ? 'bg-teal text-white'
          : 'bg-white border border-faint text-ink'
      )}>
        <p className="text-[13px] leading-relaxed">{msg.content}</p>
        <p className={cn('text-[10px] mt-1.5', isUser ? 'text-white/55' : 'text-muted')}>
          {msg.timestamp}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-teal-dark flex items-center justify-center text-white text-[10px] font-semibold shrink-0 mt-0.5">
          TN
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
        ✦
      </div>
      <div className="bg-white border border-faint rounded-card px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      content: "Hi Thinh! I'm your AI Agent — here to help you navigate skills, career growth, and team insights. What would you like to explore today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeQuick, setActiveQuick] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string, quickId?: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setActiveQuick(quickId ?? null)
    setLoading(true)

    const reply = quickId && quickReplies[quickId]
      ? quickReplies[quickId]
      : fallbackReplies[fallbackIndex++ % fallbackReplies.length]

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMsg])
      setLoading(false)
      setActiveQuick(null)
    }, 700)
  }

  const handleQuick = (q: typeof quickQuestions[number]) => {
    sendMessage(q.label, q.id)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex gap-5 h-full" style={{ minHeight: 600 }}>

      {/* ── Left sidebar: Quick Questions + Tips ─────────────────────────── */}
      <div className="flex flex-col gap-4" style={{ width: 260, minWidth: 240 }}>

        {/* Quick Questions */}
        <div className="bg-white rounded-card border border-faint p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-teal" />
            <p className="text-[13px] font-semibold text-ink">Quick Questions</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {quickQuestions.map(q => (
              <button
                key={q.id}
                onClick={() => handleQuick(q)}
                disabled={loading}
                className={cn(
                  'text-left text-[12.5px] px-3 py-2 rounded-btn border transition-all',
                  activeQuick === q.id
                    ? 'bg-teal/10 border-teal/25 text-teal font-medium'
                    : 'border-faint text-ink2 hover:border-teal/20 hover:bg-teal/[0.04] hover:text-ink disabled:opacity-40'
                )}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-card border border-faint p-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-warning" />
            <p className="text-[13px] font-semibold text-ink">Tips for Better Answers</p>
          </div>
          <div className="flex flex-col gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-base shrink-0 leading-none mt-0.5">{tip.icon}</span>
                <p className="text-[12px] text-muted leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 bg-white rounded-card border border-faint flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-faint shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white text-sm font-semibold">
            ✦
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-ink">SkillMatrix AI Agent</p>
            <p className="text-[11.5px] text-muted">Powered by your skill profile &amp; team data</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11.5px] text-muted">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-faint shrink-0">
          <div className="flex gap-2.5">
            <input
              type="text"
              className="flex-1 bg-fog border border-faint rounded-btn px-4 py-2.5 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
              placeholder="Ask anything about your skills, career, or team…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-btn bg-teal flex items-center justify-center text-white hover:bg-teal-dark transition-colors disabled:opacity-40 shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[11px] text-muted mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-faint text-ink2 text-[10px] font-mono">Enter</kbd> to send
            · Responses are AI-generated from your profile data
          </p>
        </div>
      </div>
    </div>
  )
}

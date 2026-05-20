'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { botReplies } from '@/lib/mock-data'
import type { ChatMessage } from '@/lib/types'

const initialMessages: ChatMessage[] = [
  {
    id: '0',
    role: 'bot',
    content: "Hi! I'm your AI skill coach. Ask me anything about your skill gaps, career path, or learning recommendations.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
]

let replyIndex = 0

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botReplies[replyIndex % botReplies.length],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      replyIndex++
      setMessages(prev => [...prev, botMsg])
      setLoading(false)
    }, 600)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 420 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-6 h-6 rounded-lg bg-teal flex items-center justify-center text-white text-[10px] shrink-0 mr-2 mt-0.5">
                ✦
              </div>
            )}
            <div className={`max-w-[80%] rounded-card px-3.5 py-2.5 ${
              msg.role === 'user'
                ? 'bg-teal text-white text-[13px]'
                : 'bg-fog border border-faint text-ink text-[13px]'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-muted'}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal flex items-center justify-center text-white text-[10px]">✦</div>
            <div className="bg-fog border border-faint rounded-card px-3.5 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center border-t border-faint pt-3">
        <input
          type="text"
          className="flex-1 bg-fog border border-faint rounded-btn px-3 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-none focus:border-teal/50 transition-colors"
          placeholder="Ask about skills, gaps, recommendations…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-btn bg-teal flex items-center justify-center text-white hover:bg-teal-dark transition-colors disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

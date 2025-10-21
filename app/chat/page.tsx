'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function ChatPage() {
    const router = useRouter()
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setInitialLoading(false)
        }
        checkAuth()
    }, [router, supabase])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            })

            if (!response.ok) throw new Error('Failed to get response')

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
            textareaRef.current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-black">Career Coach</h1>
                        <p className="text-sm text-gray-600">Your AI career development assistant</p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="text-sm"
                    >
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-black mb-2">Start a conversation</h2>
                            <p className="text-sm text-gray-600 max-w-md mx-auto">
                                Ask me anything about your career, skills, goals, or professional development.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                                                ? 'bg-black text-white'
                                                : 'bg-gray-50 text-black border border-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                            className="min-h-[44px] max-h-[200px] resize-none"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="px-6"
                        >
                            Send
                        </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Your conversations are private and used to provide personalized career guidance.
                    </p>
                </div>
            </div>
        </div>
    )
}

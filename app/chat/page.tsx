'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import ConversationSidebar from '@/components/ConversationSidebar'
import SuggestionsPanel from '@/components/SuggestionsPanel'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

interface Conversation {
    id: string
    title: string
    messageCount: number
    lastMessage: {
        content: string
        role: string
        timestamp: string
    } | null
    createdAt: string
    updatedAt: string
}

export default function ChatPage() {
    const router = useRouter()
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
    const [conversationsLoading, setConversationsLoading] = useState(true)
    const [suggestionsKey, setSuggestionsKey] = useState(0)
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
            loadConversations()
        }
        checkAuth()
    }, [router, supabase])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const loadConversations = async () => {
        try {
            setConversationsLoading(true)
            const response = await fetch('/api/conversations')
            if (response.ok) {
                const data = await response.json()
                setConversations(data.conversations || [])
            }
        } catch (error) {
            console.error('Error loading conversations:', error)
        } finally {
            setConversationsLoading(false)
        }
    }

    const loadConversation = async (conversationId: string) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/conversations/${conversationId}`)
            if (response.ok) {
                const data = await response.json()
                const conv = data.conversation

                // Load messages from conversation
                const loadedMessages = Array.isArray(conv.messages) ? conv.messages : []
                setMessages(loadedMessages)
                setCurrentConversationId(conversationId)
            }
        } catch (error) {
            console.error('Error loading conversation:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewConversation = () => {
        setMessages([])
        setCurrentConversationId(null)
        textareaRef.current?.focus()
    }

    const handleDeleteConversation = async (conversationId: string) => {
        try {
            const response = await fetch(`/api/conversations?id=${conversationId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                // Remove from list
                setConversations(prev => prev.filter(c => c.id !== conversationId))

                // If deleting current conversation, clear it
                if (currentConversationId === conversationId) {
                    setMessages([])
                    setCurrentConversationId(null)
                }
            }
        } catch (error) {
            console.error('Error deleting conversation:', error)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        // Create a placeholder for the streaming assistant message
        const assistantMessageIndex = messages.length + 1
        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationId: currentConversationId,
                    conversationHistory: messages,
                    stream: true
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }))
                throw new Error(errorData.error || 'Failed to get response')
            }

            // Handle streaming response
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) throw new Error('No reader available')

            let fullContent = ''
            let streamError: string | null = null

            try {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))

                                if (data.error) {
                                    streamError = data.error
                                    throw new Error(data.error)
                                }

                                if (data.warning) {
                                    console.warn('Streaming warning:', data.warning)
                                }

                                if (data.content) {
                                    fullContent += data.content
                                    // Update the assistant message with accumulated content
                                    setMessages(prev => {
                                        const newMessages = [...prev]
                                        newMessages[assistantMessageIndex] = {
                                            ...newMessages[assistantMessageIndex],
                                            content: fullContent
                                        }
                                        return newMessages
                                    })
                                }

                                if (data.done) {
                                    // Streaming complete
                                    setLoading(false)

                                    // Reload conversations to update the list
                                    await loadConversations()

                                    // Refresh suggestions panel
                                    setSuggestionsKey(prev => prev + 1)

                                    // If this was a new conversation, set the current conversation ID
                                    if (!currentConversationId) {
                                        const convResponse = await fetch('/api/conversations')
                                        if (convResponse.ok) {
                                            const convData = await convResponse.json()
                                            const convs = convData.conversations || []
                                            if (convs.length > 0) {
                                                setCurrentConversationId(convs[0].id)
                                            }
                                        }
                                    }
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE data:', parseError)
                                if (streamError) {
                                    throw parseError
                                }
                            }
                        }
                    }
                }
            } catch (streamError) {
                console.error('Stream reading error:', streamError)
                throw streamError
            }

            // If we got here but have no content, something went wrong
            if (!fullContent) {
                throw new Error('No response received from AI')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.'

            // Replace the empty assistant message with an error message
            setMessages(prev => {
                const newMessages = [...prev]
                newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date().toISOString()
                }
                return newMessages
            })
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
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={loadConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                isLoading={conversationsLoading}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-black">Career Coach</h1>
                            <p className="text-sm text-gray-600">Your AI career development assistant</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push('/profile')}
                                variant="outline"
                                className="text-sm"
                            >
                                Profile
                            </Button>
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                className="text-sm"
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-black mb-2">
                                    {currentConversationId ? 'Conversation loaded' : 'Start a new conversation'}
                                </h2>
                                <p className="text-sm text-gray-600 max-w-md mx-auto">
                                    Ask me anything about your career, skills, goals, or professional development.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
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
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                {/* Suggestions Panel */}
                {currentConversationId && (
                    <SuggestionsPanel
                        key={suggestionsKey}
                        conversationId={currentConversationId}
                    />
                )}

                {/* Input */}
                <div className="border-t border-gray-200 bg-white">
                    <div className="max-w-4xl mx-auto px-6 py-4">
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
        </div>
    )
}

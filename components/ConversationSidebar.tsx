'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

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

interface ConversationSidebarProps {
    conversations: Conversation[]
    currentConversationId: string | null
    onSelectConversation: (id: string) => void
    onNewConversation: () => void
    onDeleteConversation: (id: string) => void
    isLoading?: boolean
}

export default function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    isLoading = false
}: ConversationSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this conversation?')) {
            setDeletingId(id)
            await onDeleteConversation(id)
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (diffInHours < 168) { // 7 days
            return date.toLocaleDateString([], { weekday: 'short' })
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    }

    return (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <Button
                    onClick={onNewConversation}
                    className="w-full mb-3"
                    disabled={isLoading}
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Conversation
                </Button>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`relative group ${currentConversationId === conv.id ? 'bg-gray-50 border-l-2 border-black' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => onSelectConversation(conv.id)}
                                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                                    disabled={deletingId === conv.id}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0 pr-8">
                                            <h3 className="text-sm font-medium text-black truncate mb-1">
                                                {conv.title}
                                            </h3>
                                            {conv.lastMessage && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {conv.lastMessage.role === 'user' ? 'You: ' : ''}
                                                    {conv.lastMessage.content}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(conv.updatedAt)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    • {conv.messageCount} {conv.messageCount === 1 ? 'message' : 'messages'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, conv.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    disabled={deletingId === conv.id}
                                >
                                    {deletingId === conv.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

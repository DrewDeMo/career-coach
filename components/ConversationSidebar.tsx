'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, X, Trash2, Loader2, MessageSquare } from 'lucide-react'

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
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                <Button
                    onClick={onNewConversation}
                    className="w-full mb-3 gap-2"
                    disabled={isLoading}
                >
                    <Plus className="w-4 h-4" />
                    New Conversation
                </Button>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading conversations...</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {searchQuery ? 'Try a different search term' : 'Start a new conversation to begin'}
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
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"
                                    disabled={deletingId === conv.id}
                                    title="Delete conversation"
                                >
                                    {deletingId === conv.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
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

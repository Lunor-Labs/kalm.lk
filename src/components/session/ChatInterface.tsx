import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { ChatMessage } from '../../types/session';
import { sendChatMessage, subscribeToChatMessages } from '../../lib/sessions';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  sessionId: string;
  onClose?: () => void;
  isFullScreen?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  sessionId, 
  onClose, 
  isFullScreen = false 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to real-time messages
    const unsubscribe = subscribeToChatMessages(sessionId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || isLoading) return;

    setIsLoading(true);
    try {
      await sendChatMessage(
        sessionId,
        user.uid,
        user.displayName || 'User',
        user.role as 'therapist' | 'client',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(timestamp, 'HH:mm');
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.senderId === user?.uid;
  };

  return (
    <div className={`flex flex-col bg-neutral-800 ${
      isFullScreen ? 'h-full' : 'h-96'
    } ${isFullScreen ? 'rounded-none' : 'rounded-2xl'} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        <div>
          <h3 className="text-white font-semibold">Session Chat</h3>
          <p className="text-neutral-400 text-sm">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400">No messages yet</p>
            <p className="text-neutral-500 text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                isOwnMessage(message) ? 'order-2' : 'order-1'
              }`}>
                {/* Message bubble */}
                <div className={`rounded-2xl px-4 py-2 ${
                  isOwnMessage(message)
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-700 text-white'
                }`}>
                  <p className="text-sm">{message.message}</p>
                </div>
                
                {/* Message info */}
                <div className={`flex items-center space-x-2 mt-1 text-xs text-neutral-400 ${
                  isOwnMessage(message) ? 'justify-end' : 'justify-start'
                }`}>
                  {!isOwnMessage(message) && (
                    <span className="font-medium">{message.senderName}</span>
                  )}
                  <span>{formatMessageTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="w-full bg-neutral-700 text-white placeholder-neutral-400 rounded-2xl px-4 py-3 pr-12  focus:ring-primary-500 focus:outline-none disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-300 transition-colors duration-200"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-300 transition-colors duration-200"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading}
            className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
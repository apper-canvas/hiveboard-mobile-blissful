import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { marked } from "marked";
import { messageService } from "@/services/api/messageService";
import { userService } from "@/services/api/userService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import ErrorView from "@/components/ui/ErrorView";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";

const Messages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [composeForm, setComposeForm] = useState({
    recipient: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showBlockConfirm, setShowBlockConfirm] = useState(null);
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
const loadMessages = async (convId) => {
    try {
      setMessagesLoading(true);
      const data = await messageService.getMessages(convId);
      
      // Build message threads
      const threads = buildMessageThreads(data);
      setMessages(threads);
      
      // Mark as read
      await messageService.markAsRead(convId);
      
      // Update conversation unread count
      setConversations(prev => prev.map(conv => 
        conv.Id === parseInt(convId) 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send message
const buildMessageThreads = (messages) => {
    const messageMap = {};
    const rootMessages = [];
    
    // First pass: create message map
    messages.forEach(msg => {
      messageMap[msg.Id] = { ...msg, replies: [] };
    });
    
    // Second pass: build threads
    messages.forEach(msg => {
      if (msg.parentId && messageMap[msg.parentId]) {
        messageMap[msg.parentId].replies.push(messageMap[msg.Id]);
      } else {
        rootMessages.push(messageMap[msg.Id]);
      }
    });
    
    return rootMessages;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const message = await messageService.sendMessage(
        selectedConversation.Id,
        newMessage.trim()
      );
      
      const threads = buildMessageThreads([...messages.flat(), message]);
      setMessages(threads);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.Id === selectedConversation.Id
          ? { ...conv, lastMessage: message, updatedAt: message.timestamp }
          : conv
      ));
      
      toast.success('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (parentId) => {
    if (!replyMessage.trim() || sending) return;

    try {
      setSending(true);
      const reply = await messageService.sendReply(
        selectedConversation.Id,
        replyMessage.trim(),
        parentId
      );
      
      const allMessages = getAllMessages(messages);
      const threads = buildMessageThreads([...allMessages, reply]);
      setMessages(threads);
      setReplyMessage('');
      setShowReplyForm(null);
      
      toast.success('Reply sent!');
    } catch (err) {
      console.error('Error sending reply:', err);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const getAllMessages = (threads) => {
    const allMessages = [];
    threads.forEach(thread => {
      allMessages.push(thread);
      if (thread.replies) {
        allMessages.push(...getAllMessages(thread.replies));
      }
    });
    return allMessages;
  };

  const handleMarkAsUnread = async (conversationId) => {
    try {
      await messageService.markAsUnread(conversationId);
      setConversations(prev => prev.map(conv => 
        conv.Id === conversationId
          ? { ...conv, unreadCount: 1 }
          : conv
      ));
      toast.success('Marked as unread');
    } catch (err) {
      console.error('Error marking as unread:', err);
      toast.error('Failed to mark as unread');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await userService.blockUser(userId);
      setBlockedUsers(prev => [...prev, userId]);
      setConversations(prev => prev.filter(conv => 
        !conv.participants.some(p => p.Id === userId && p.Id !== 1)
      ));
      setShowBlockConfirm(null);
      toast.success('User blocked successfully');
    } catch (err) {
      console.error('Error blocking user:', err);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await userService.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(id => id !== userId));
      loadConversations(); // Reload conversations to show unblocked user
      toast.success('User unblocked successfully');
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast.error('Failed to unblock user');
    }
  };

  const handleReportSpam = async (messageId, reason) => {
    try {
      await messageService.reportSpam(messageId, reason);
      setShowReportModal(null);
      setReportReason('');
      toast.success('Message reported successfully');
    } catch (err) {
      console.error('Error reporting message:', err);
      toast.error('Failed to report message');
    }
  };

  const renderMarkdown = (content) => {
    // Configure marked for security
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false // We'll use DOMPurify in production
    });

    const html = marked.parse(content);
    return { __html: html };
  };

  // Start new conversation
  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!composeForm.recipient.trim() || sending) return;

    try {
      setSending(true);
      const conversation = await messageService.startConversation(
        composeForm.recipient.trim(),
        composeForm.message.trim()
      );
      
      setConversations(prev => [conversation, ...prev]);
      setComposeForm({ recipient: '', message: '' });
      setShowCompose(false);
      
      // Select the new conversation
      handleSelectConversation(conversation);
      
      toast.success('Conversation started!');
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Failed to start conversation');
    } finally {
      setSending(false);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.Id);
    
    // Update URL without navigation
    window.history.replaceState(null, '', `/messages/${conversation.Id}`);
  };

  // Search conversations
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const search = searchQuery.toLowerCase();
    return conv.participants.some(p => 
      p.username.toLowerCase().includes(search)
    ) || conv.lastMessage?.content?.toLowerCase().includes(search);
  });

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.Id === parseInt(conversationId));
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [conversationId, conversations]);

  if (loading) {
    return <Loading message="Loading conversations..." />;
  }

  if (error) {
    return (
      <ErrorView 
        title="Failed to Load Messages"
        message={error}
        onRetry={loadConversations}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ApperIcon name="MessageSquare" className="w-6 h-6 text-primary" />
                Messages
              </h1>
              <Button
                onClick={() => setShowCompose(true)}
                variant="primary"
                size="sm"
                className="px-3 py-2"
              >
                <ApperIcon name="PenTool" className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <ApperIcon name="MessageSquare" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">Start messaging to see conversations here</p>
) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants?.find(p => p.username !== 'john_doe') || null;
                  const isSelected = selectedConversation?.Id === conversation.Id;

                  return (
                    <div
                      key={conversation.Id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={cn(
                        "p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3",
                        isSelected && "bg-primary bg-opacity-10 border-r-2 border-primary"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {otherParticipant?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              "font-medium truncate block",
                              isSelected ? "text-primary" : "text-gray-900"
                            )}>
                              {otherParticipant?.username || 'Unknown'}
                            </span>
                          </div>
                          
                          {conversation.unreadCount > 0 && (
                            <div className="min-w-[18px] h-[18px] bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <>
                            <p className={cn(
                              "text-sm truncate mt-1",
                              conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
                            )}>
                              {conversation.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="MessageSquare" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              </div>
            </div>
) : (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
<div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.participants?.find(p => p.username !== 'john_doe')?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.participants?.find(p => p.username !== 'john_doe')?.username || 'Unknown User'}
                      </h2>
                      <h2 className="font-medium text-gray-900">
                        {selectedConversation.participants.find(p => p.username !== 'john_doe')?.username}
                      </h2>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="p-2 hover:bg-gray-100"
                    >
                      <ApperIcon name="Mail" size={18} />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        onClick={() => setShowActionMenu(showActionMenu ? null : selectedConversation.Id)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <ApperIcon name="MoreVertical" size={18} />
                      </Button>
{showActionMenu === selectedConversation.Id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50">
                          <button
                            onClick={() => handleMarkAsUnread(selectedConversation.Id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <ApperIcon name="Mail" size={16} />
                            Mark as Unread
                          </button>
                          <button
                            onClick={() => {
                              const otherUser = selectedConversation.participants?.find(p => p.Id !== 1);
                              setShowBlockConfirm(otherUser);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <ApperIcon name="UserX" size={16} />
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      Loading messages...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((thread) => (
                      <div key={thread.Id} className="space-y-3">
                        {/* Main Message */}
<div className={cn(
                          "flex gap-3 max-w-[85%] group",
                          thread.senderId === 1 ? "ml-auto flex-row-reverse" : ""
                        )}>
                          {thread.senderId === 1 ? (
                            <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-sm font-semibold">
                              J
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-semibold">
                              {selectedConversation.participants?.find(p => p.Id === thread.senderId)?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className={cn("flex flex-col gap-1 flex-1", thread.senderId === 1 && "items-end")}>
                            <div className={cn(
                              "rounded-2xl px-4 py-2 max-w-full break-words relative group",
                              thread.senderId === 1
                                ? "bg-primary text-white rounded-br-sm" 
                                : "bg-gray-100 text-gray-900 rounded-bl-sm"
                            )}>
                              <div 
                                className="text-sm markdown-content"
                                dangerouslySetInnerHTML={renderMarkdown(thread.content)}
                              />
                              
                              {/* Message Actions */}
                              <div className={cn(
                                "absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-lg rounded-lg p-1",
                                thread.senderId === 1 ? "-right-2" : "-left-2"
                              )}>
                                <button
                                  onClick={() => setShowReplyForm(thread.Id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <ApperIcon name="Reply" size={14} />
                                </button>
                                {thread.senderId !== 1 && (
                                  <button
                                    onClick={() => setShowReportModal(thread.Id)}
                                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                                  >
                                    <ApperIcon name="Flag" size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(thread.timestamp), { addSuffix: true })}
                              </p>
                              {!thread.isRead && thread.senderId !== 1 && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            
                            {/* Reply Form */}
                            {showReplyForm === thread.Id && (
                              <div className="w-full mt-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Type a reply..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
onClick={() => handleSendReply(thread.Id)}
                                    disabled={!replyMessage.trim() || sending}
                                    variant="primary"
                                    size="sm"
                                  >
                                    Send
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setShowReplyForm(null);
                                      setReplyMessage('');
                                    }}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
{/* Thread Replies */}
                        {thread.replies && thread.replies.length > 0 && (
                          <div className="ml-8 space-y-3">
                            {thread.replies.map((reply) => (
                              <div key={reply.Id} className={cn(
                                "flex gap-3 max-w-[80%] group",
                                reply.senderId === 1 ? "ml-auto flex-row-reverse" : ""
                              )}>
                                {reply.senderId === 1 ? (
                                  <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-white text-sm font-semibold">
                                    J
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm font-semibold">
                                    {selectedConversation.participants?.find(p => p.Id === reply.senderId)?.username?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )}
                                <div className={cn("flex flex-col gap-1", reply.senderId === 1 && "items-end")}>
                                  <div className={cn(
                                    "rounded-2xl px-3 py-2 max-w-full break-words",
                                    reply.senderId === 1
                                      ? "bg-primary text-white rounded-br-sm" 
                                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                                  )}>
                                    <div 
                                      className="text-sm markdown-content"
                                      dangerouslySetInnerHTML={renderMarkdown(reply.content)}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-400">
                                      {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                    </p>
                                    {!reply.isRead && reply.senderId !== 1 && (
                                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    )}
                                  </div>
</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message... (Markdown supported)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    className="min-h-[60px] resize-none flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    variant="primary"
                  >
                    {sending ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <ApperIcon name="Send" className="w-4 h-4" />
                    )}
                  </Button>
                </div>
<strong>Tip:</strong> Use **bold**, *italic*, `code`, and other markdown formatting
                </div>
              </form>
            </>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">New Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleStartConversation} className="space-y-4 p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To:
                  </label>
                  <Input
                    placeholder="Username"
                    value={composeForm.recipient}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, recipient: e.target.value }))}
                    disabled={sending}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message:
                  </label>
                  <Textarea
                    placeholder="Type your message..."
                    value={composeForm.message}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                    disabled={sending}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={sending}
                    onClick={() => setShowCompose(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!composeForm.recipient.trim() || sending}
                    className="flex-1"
                  >
                    {sending ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Block User Confirmation Modal */}
        {showBlockConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Block User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to block <strong>{showBlockConfirm.username}</strong>? 
                You won't receive messages from them and they won't appear in your conversation list.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowBlockConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleBlockUser(showBlockConfirm.Id)}
                >
                  Block User
                </Button>
              </div>
            </div>
          </div>
        )}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Report Message</h3>
                <button
                  onClick={() => {
                    setShowReportModal(null);
                    setReportReason('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you reporting this message?
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="scam">Scam or fraud</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportModal(null);
                    setReportReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleReportSpam(showReportModal, reportReason)}
                  disabled={!reportReason}
                >
                  Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
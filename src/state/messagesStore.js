/**
 * Messages store using Zustand for managing chat message state and operations.
 * Handles message CRUD operations, search, and conversation context management.
 * 
 * State Structure:
 * - messages: Array of chat messages with id, role, content, timestamp, and metadata
 * - Each message can be user, assistant, or system type
 * - Messages include metadata like tool calls, execution results, and streaming status
 * 
 * Operations Exposed:
 * - addMessage: Add new message to conversation
 * - updateLastMessage: Modify the most recent message (for streaming updates)
 * - updateMessage: Update specific message by ID
 * - removeMessage: Delete message by ID
 * - clearMessages: Remove all messages from conversation
 * - getMessagesByRole: Filter messages by sender role
 * - getLastMessage: Retrieve the most recent message
 * - getMessageCount: Get total number of messages
 * - getConversationContext: Get last N messages for context
 * - searchMessages: Find messages containing specific text
 * - exportMessages: Download conversation as JSON
 * - importMessages: Load conversation from JSON file
 */
import { create } from 'zustand';

const useMessagesStore = create((set, get) => ({
  messages: [],
  
  // Add a new message
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, {
        id: message.id || Date.now().toString(),
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        ...message
      }]
    }));
  },
  
  // Update the last message
  updateLastMessage: (updates) => {
    set((state) => {
      if (state.messages.length === 0) return state;
      
      const newMessages = [...state.messages];
      const lastIndex = newMessages.length - 1;
      newMessages[lastIndex] = { ...newMessages[lastIndex], ...updates };
      
      return { messages: newMessages };
    });
  },
  
  // Update a specific message by ID
  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }));
  },
  
  // Remove a message by ID
  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter(msg => msg.id !== id)
    }));
  },
  
  // Clear all messages
  clearMessages: () => {
    set({ messages: [] });
  },
  
  // Get messages by role
  getMessagesByRole: (role) => {
    const state = get();
    return state.messages.filter(msg => msg.role === role);
  },
  
  // Get the last message
  getLastMessage: () => {
    const state = get();
    return state.messages[state.messages.length - 1] || null;
  },
  
  // Get message count
  getMessageCount: () => {
    const state = get();
    return state.messages.length;
  },
  
  // Add assistant message (helper function)
  addAssistantMessage: (content, metadata = {}) => {
    const message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    get().addMessage(message);
    return message;
  },
  
  // Add user message (helper function)
  addUserMessage: (content, metadata = {}) => {
    const message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    get().addMessage(message);
    return message;
  },
  
  // Add system message (helper function)
  addSystemMessage: (content, metadata = {}) => {
    const message = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    get().addMessage(message);
    return message;
  },
  
  // Get conversation context (last N messages)
  getConversationContext: (count = 10) => {
    const state = get();
    return state.messages.slice(-count);
  },
  
  // Search messages by content
  searchMessages: (query) => {
    const state = get();
    const searchTerm = query.toLowerCase();
    return state.messages.filter(msg => 
      msg.content.toLowerCase().includes(searchTerm)
    );
  },
  
  // Export messages
  exportMessages: () => {
    const state = get();
    return JSON.stringify(state.messages, null, 2);
  },
  
  // Import messages
  importMessages: (messagesData) => {
    try {
      const messages = typeof messagesData === 'string' 
        ? JSON.parse(messagesData) 
        : messagesData;
      
      if (Array.isArray(messages)) {
        set({ messages });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import messages:', error);
      return false;
    }
  }
}));

export default useMessagesStore;

// TODO: След всяко добавяне на съобщение, ако messages.length > HISTORY_LIMIT — подрежи началото (запазвай последните N).

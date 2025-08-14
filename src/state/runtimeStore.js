/**
 * Runtime state store for managing streaming status, tool execution, and error states.
 * Tracks active operations, execution times, and connection status for real-time feedback.
 * 
 * State Structure:
 * - Streaming State: isStreaming flag, streamStartTime, streamDuration, updateStreamDuration
 * - Tool Execution: isBusyTool flag, pendingToolCall object, toolExecutionStartTime
 * - Error Management: lastError object, errorCount, lastErrorTime for error tracking
 * - UI State: isLoading, isInitializing flags for loading indicators
 * - Connection State: isConnected flag, connectionRetries count for network status
 * - All timing data is tracked in milliseconds for performance monitoring
 * 
 * Operations Exposed:
 * - Streaming Control: startStreaming, stopStreaming, updateStreamDuration
 * - Tool Execution: startToolExecution, completeToolExecution, cancelToolExecution
 * - Error Handling: setError, clearError, resetErrorCount
 * - Loading States: setLoading, setInitializing
 * - Connection Management: setConnectionState, incrementRetries, resetRetries
 * - Status Queries: getRuntimeStatus, getStreamingStats, getToolExecutionStats, getErrorStats
 * - Utility: resetRuntime (clears all runtime state), isAnyOperationActive (checks if any operation is running)
 */
import { create } from 'zustand';

const useRuntimeStore = create((set, get) => ({
  // Streaming state
  isStreaming: false,
  streamStartTime: null,
  streamDuration: 0,
  
  // Tool execution state
  isBusyTool: false,
  pendingToolCall: null,
  toolExecutionStartTime: null,
  
  // Error state
  lastError: null,
  errorCount: 0,
  lastErrorTime: null,
  
  // UI state
  isLoading: false,
  isInitializing: false,
  
  // Connection state
  isConnected: false,
  connectionRetries: 0,
  
  // Start streaming
  startStreaming: () => {
    set({
      isStreaming: true,
      streamStartTime: Date.now(),
      streamDuration: 0
    });
  },
  
  // Stop streaming
  stopStreaming: () => {
    const state = get();
    const duration = state.streamStartTime ? Date.now() - state.streamStartTime : 0;
    
    set({
      isStreaming: false,
      streamStartTime: null,
      streamDuration: duration
    });
  },
  
  // Update stream duration
  updateStreamDuration: () => {
    const state = get();
    if (state.isStreaming && state.streamStartTime) {
      set({
        streamDuration: Date.now() - state.streamStartTime
      });
    }
  },
  
  // Start tool execution
  startToolExecution: (toolCall) => {
    set({
      isBusyTool: true,
      pendingToolCall: toolCall,
      toolExecutionStartTime: Date.now()
    });
  },
  
  // Complete tool execution
  completeToolExecution: () => {
    const state = get();
    const duration = state.toolExecutionStartTime ? Date.now() - state.toolExecutionStartTime : 0;
    
    set({
      isBusyTool: false,
      pendingToolCall: null,
      toolExecutionStartTime: null
    });
    
    return duration;
  },
  
  // Cancel tool execution
  cancelToolExecution: () => {
    set({
      isBusyTool: false,
      pendingToolCall: null,
      toolExecutionStartTime: null
    });
  },
  
  // Set error
  setError: (error) => {
    const state = get();
    set({
      lastError: error,
      errorCount: state.errorCount + 1,
      lastErrorTime: Date.now()
    });
  },
  
  // Clear error
  clearError: () => {
    set({
      lastError: null
    });
  },
  
  // Reset error count
  resetErrorCount: () => {
    set({
      errorCount: 0
    });
  },
  
  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  // Set initializing state
  setInitializing: (initializing) => {
    set({ isInitializing: initializing });
  },
  
  // Set connection state
  setConnectionState: (connected) => {
    set({ isConnected: connected });
  },
  
  // Increment connection retries
  incrementRetries: () => {
    const state = get();
    set({ connectionRetries: state.connectionRetries + 1 });
  },
  
  // Reset connection retries
  resetRetries: () => {
    set({ connectionRetries: 0 });
  },
  
  // Get current runtime status
  getRuntimeStatus: () => {
    const state = get();
    return {
      isStreaming: state.isStreaming,
      isBusyTool: state.isBusyTool,
      hasError: !!state.lastError,
      isLoading: state.isLoading,
      isInitializing: state.isInitializing,
      isConnected: state.isConnected,
      connectionRetries: state.connectionRetries
    };
  },
  
  // Get streaming statistics
  getStreamingStats: () => {
    const state = get();
    return {
      isStreaming: state.isStreaming,
      startTime: state.streamStartTime,
      duration: state.streamDuration,
      formattedDuration: formatDuration(state.streamDuration)
    };
  },
  
  // Get tool execution statistics
  getToolExecutionStats: () => {
    const state = get();
    return {
      isBusy: state.isBusyTool,
      pendingTool: state.pendingToolCall,
      startTime: state.toolExecutionStartTime,
      duration: state.toolExecutionStartTime ? Date.now() - state.toolExecutionStartTime : 0
    };
  },
  
  // Get error statistics
  getErrorStats: () => {
    const state = get();
    return {
      lastError: state.lastError,
      errorCount: state.errorCount,
      lastErrorTime: state.lastErrorTime,
      hasRecentError: state.lastErrorTime && (Date.now() - state.lastErrorTime) < 60000 // Last minute
    };
  },
  
  // Reset all runtime state
  resetRuntime: () => {
    set({
      isStreaming: false,
      streamStartTime: null,
      streamDuration: 0,
      isBusyTool: false,
      pendingToolCall: null,
      toolExecutionStartTime: null,
      isLoading: false,
      isInitializing: false,
      isConnected: false,
      connectionRetries: 0
    });
  },
  
  // Check if any operation is in progress
  isAnyOperationActive: () => {
    const state = get();
    return state.isStreaming || state.isBusyTool || state.isLoading || state.isInitializing;
  }
}));

// Helper function to format duration
const formatDuration = (milliseconds) => {
  if (!milliseconds) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export default useRuntimeStore;

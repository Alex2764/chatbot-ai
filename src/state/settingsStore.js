/**
 * Settings store using Zustand with persistence for user preferences and API configuration.
 * Manages chat settings, UI preferences, and tool execution policies with localStorage backup.
 * 
 * State Structure:
 * - API Configuration: apiKey, apiEndpoint, model selection
 * - Chat Behavior: systemPrompt, temperature, maxTokens for AI responses
 * - History Settings: persistHistory flag, maxHistoryItems limit
 * - UI Preferences: theme (light/dark), fontSize, showTimestamps toggle
 * - Tool Settings: enableTools flag, confirmToolExecution toggle
 * - All settings persist across browser sessions (except sensitive data like apiKey)
 * 
 * Operations Exposed:
 * - API Management: setApiKey, setApiEndpoint, setModel
 * - Chat Configuration: setSystemPrompt, setTemperature, setMaxTokens
 * - History Control: togglePersistHistory, setMaxHistoryItems
 * - UI Customization: setTheme, setFontSize, toggleTimestamps
 * - Tool Management: toggleTools, toggleToolConfirmation
 * - Bulk Operations: updateSettings, resetToDefaults
 * - Import/Export: exportSettings, importSettings
 * - Validation: isApiConfigured (checks if API is properly set up)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // API Configuration
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      
      // Chat Configuration
      systemPrompt: 'You are a helpful AI assistant. When using tools, choose the MOST APPROPRIATE tool for the user\'s request. For time questions, use ONLY get_current_time. For calculations, use ONLY calculate. Never use multiple tools for a single request unless explicitly asked.',
      temperature: 0.7,
      maxTokens: 1000,
      maxOutputTokens: 1000,
      topP: 0.9,
      
      // History Settings
      persistHistory: true,
      maxHistoryItems: 100,
      
      // UI Settings
      theme: 'light',
      fontSize: 'medium',
      showTimestamps: true,
      
      // Tool Settings
      enableTools: true,
      confirmToolExecution: true,
      
      // Update API key
      setApiKey: (apiKey) => {
        set({ apiKey });
      },
      
      // Update API endpoint
      setApiEndpoint: (endpoint) => {
        set({ apiEndpoint: endpoint });
      },
      
      // Update model
      setModel: (model) => {
        set({ model });
      },
      
      // Update system prompt
      setSystemPrompt: (prompt) => {
        set({ systemPrompt: prompt });
      },
      
      // Update temperature
      setTemperature: (temp) => {
        set({ temperature: Math.max(0, Math.min(2, temp)) });
      },
      
      // Update max tokens
      setMaxTokens: (tokens) => {
        set({ maxTokens: Math.max(1, Math.min(4000, tokens)) });
      },
      
      // Update max output tokens
      setMaxOutputTokens: (tokens) => {
        set({ maxOutputTokens: Math.max(1, Math.min(4000, tokens)) });
      },
      
      // Update top P
      setTopP: (topP) => {
        set({ topP: Math.max(0, Math.min(1, topP)) });
      },
      
      // Toggle history persistence
      togglePersistHistory: () => {
        set((state) => ({ persistHistory: !state.persistHistory }));
      },
      
      // Set max history items
      setMaxHistoryItems: (count) => {
        set({ maxHistoryItems: Math.max(10, Math.min(1000, count)) });
      },
      
      // Update theme
      setTheme: (theme) => {
        set({ theme });
      },
      
      // Update font size
      setFontSize: (size) => {
        set({ fontSize: size });
      },
      
      // Toggle timestamps
      toggleTimestamps: () => {
        set((state) => ({ showTimestamps: !state.showTimestamps }));
      },
      
      // Toggle tools
      toggleTools: () => {
        set((state) => ({ enableTools: !state.enableTools }));
      },
      
      // Toggle tool confirmation
      toggleToolConfirmation: () => {
        set((state) => ({ confirmToolExecution: !state.confirmToolExecution }));
      },
      
      // Reset to defaults
      resetToDefaults: () => {
        set({
          apiKey: '',
          apiEndpoint: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          systemPrompt: 'You are a helpful AI assistant.',
          temperature: 0.7,
          maxTokens: 1000,
          maxOutputTokens: 1000,
          topP: 0.9,
          persistHistory: true,
          maxHistoryItems: 100,
          theme: 'light',
          fontSize: 'medium',
          showTimestamps: true,
          enableTools: true,
          confirmToolExecution: true
        });
      },
      
      // Get all settings
      getAllSettings: () => {
        const state = get();
        return {
          apiKey: state.apiKey,
          apiEndpoint: state.apiEndpoint,
          model: state.model,
          systemPrompt: state.systemPrompt,
          temperature: state.temperature,
          maxTokens: state.maxTokens,
          maxOutputTokens: state.maxOutputTokens,
          topP: state.topP,
          persistHistory: state.persistHistory,
          maxHistoryItems: state.maxHistoryItems,
          theme: state.theme,
          fontSize: state.fontSize,
          showTimestamps: state.showTimestamps,
          enableTools: state.enableTools,
          confirmToolExecution: state.confirmToolExecution
        };
      },
      
      // Update multiple settings at once
      updateSettings: (updates) => {
        set((state) => ({ ...state, ...updates }));
      },
      
      // Check if API is configured
      isApiConfigured: () => {
        const state = get();
        return !!state.apiKey && !!state.apiEndpoint;
      },
      
      // Export settings
      exportSettings: () => {
        const state = get();
        const exportData = {
          ...state.getAllSettings(),
          exportDate: new Date().toISOString(),
          version: '1.0.0'
        };
        return JSON.stringify(exportData, null, 2);
      },
      
      // Import settings
      importSettings: (settingsData) => {
        try {
          const settings = typeof settingsData === 'string' 
            ? JSON.parse(settingsData) 
            : settingsData;
          
          // Remove metadata fields
          const { exportDate, version, ...cleanSettings } = settings;
          
          set(cleanSettings);
          return true;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      }
    }),
    {
      name: 'chatbot-settings',
      partialize: (state) => ({
        // Only persist non-sensitive settings
        apiEndpoint: state.apiEndpoint,
        model: state.model,
        systemPrompt: state.systemPrompt,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        persistHistory: state.persistHistory,
        maxHistoryItems: state.maxHistoryItems,
        theme: state.theme,
        fontSize: state.fontSize,
        showTimestamps: state.showTimestamps,
        enableTools: state.enableTools,
        confirmToolExecution: state.confirmToolExecution
      })
    }
  )
);

export default useSettingsStore;

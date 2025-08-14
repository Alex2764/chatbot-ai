/* ROLE: SettingsPanel — UI панел за настройки; НЕ пази трайно apiKey. Виж TODO в тялото. */

/**
 * SettingsPanel - Configuration interface for API key, system prompt, temperature, and history settings.
 * Provides form controls for customizing chat behavior and AI model parameters.
 */
import React, { useState, useEffect } from 'react';
import useSettingsStore from '../state/settingsStore';
import useMessagesStore from '../state/messagesStore';
import OpenAIClient from '../lib/openaiClient';
import ConfirmDialog from './ConfirmDialog';

const SettingsPanel = ({ isOpen, onClose }) => {
  const {
    apiKey,
    systemPrompt,
    temperature,
    persistHistory,
    setApiKey,
    setSystemPrompt,
    setTemperature,
    togglePersistHistory
  } = useSettingsStore();

  const { clearMessages } = useMessagesStore();
  
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localPersistHistory, setLocalPersistHistory] = useState(persistHistory);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Sync local state with store when store changes
  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalSystemPrompt(systemPrompt);
    setLocalTemperature(temperature);
    setLocalPersistHistory(persistHistory);
  }, [apiKey, systemPrompt, temperature, persistHistory]);

  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    setLocalApiKey(value);
    setApiKey(value);
  };

  const handleSystemPromptChange = (e) => {
    const value = e.target.value;
    setLocalSystemPrompt(value);
    setSystemPrompt(value);
  };

  const handleTemperatureChange = (e) => {
    const value = parseFloat(e.target.value);
    setLocalTemperature(value);
    setTemperature(value);
  };

  const handlePersistHistoryChange = (e) => {
    const value = e.target.checked;
    setLocalPersistHistory(value);
    togglePersistHistory();
  };

  const handleTestKey = async () => {
    if (!localApiKey.trim()) {
      setTestResult({ success: false, message: '🔑 Please enter an API key first' });
      return;
    }

    try {
      const client = new OpenAIClient(localApiKey);
      const result = await client.ping();
      
      // Convert technical messages to user-friendly ones
      let userMessage = result.message;
      if (result.message === 'Key OK') {
        userMessage = '✅ API key is valid and working!';
      } else if (result.message === 'Invalid key') {
        userMessage = '❌ Invalid API key. Please check and try again.';
      } else if (result.message === 'Network error') {
        userMessage = '🌐 Network connection issue. Please check your internet.';
      }
      
      setTestResult({ success: result.success, message: userMessage });
      
      // Auto-hide the result after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: '🌐 Network connection issue. Please check your internet.' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleClearHistory = () => {
    setShowConfirmClear(true);
  };

  const confirmClearHistory = () => {
    clearMessages();
    setShowConfirmClear(false);
    // Show a brief success message
    setTestResult({ success: true, message: '🗑️ Chat history cleared successfully' });
    setTimeout(() => setTestResult(null), 2000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      useSettingsStore.getState().resetToDefaults();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel-header">
          <h2>Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-panel-content">
          {/* API Key Section */}
          <div className="setting-group">
            <label htmlFor="apiKey" className="setting-label">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={localApiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your OpenAI API key"
              className="setting-input"
            />
            <small className="setting-help">
              Required for AI chat functionality
            </small>
            <small className="setting-hint">
              💡 Changes apply to future chat requests only
            </small>
          </div>

          {/* System Prompt Section */}
          <div className="setting-group">
            <label htmlFor="systemPrompt" className="setting-label">
              System Instruction
            </label>
            <textarea
              id="systemPrompt"
              value={localSystemPrompt}
              onChange={handleSystemPromptChange}
              placeholder="Enter system instruction for the bot"
              rows="3"
              className="setting-textarea"
            />
            <small className="setting-help">
              Defines the AI assistant's behavior and personality
            </small>
            <small className="setting-hint">
              💡 Changes apply to future chat requests only
            </small>
          </div>

          {/* Temperature Section */}
          <div className="setting-group">
            <label htmlFor="temperature" className="setting-label">
              Temperature: {localTemperature}
            </label>
            <div className="temperature-control">
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={localTemperature}
                onChange={handleTemperatureChange}
                className="setting-range"
              />
              <div className="temperature-labels">
                <span>Focused (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>
            <small className="setting-help">
              Controls response creativity: 0 = focused, 2 = creative
            </small>
            <small className="setting-hint">
              💡 Changes apply to future chat requests only
            </small>
          </div>

          {/* Persist History Section */}
          <div className="setting-group">
            <label className="setting-label setting-checkbox-label">
              <input
                type="checkbox"
                checked={localPersistHistory}
                onChange={handlePersistHistoryChange}
                className="setting-checkbox"
              />
              <span>Save Chat History</span>
            </label>
            <small className="setting-help">
              Store conversation history in your browser
            </small>
            <small className="setting-hint">
              💡 Changes apply immediately to new messages
            </small>
          </div>

          {/* Session Note */}
          <div className="setting-note">
            <p>⚠️ <strong>Note:</strong> The API key is stored for the current session only.</p>
          </div>

          {/* Test Result Toast */}
          {testResult && (
            <div className={`test-result-toast ${testResult.success ? 'success' : 'error'}`}>
              <span>{testResult.message}</span>
              <button 
                className="toast-close-btn" 
                onClick={() => setTestResult(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="setting-actions">
            <div className="setting-action-row">
              <button 
                className="btn btn-secondary" 
                onClick={handleTestKey}
                disabled={!localApiKey.trim()}
              >
                Test Key
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleClearHistory}
              >
                Clear History
              </button>
            </div>
            <div className="setting-action-row">
              <button 
                className="btn btn-secondary" 
                onClick={handleResetToDefaults}
              >
                Reset to Defaults
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onClose}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Clear History Dialog */}
      <ConfirmDialog
        isOpen={showConfirmClear}
        title="Clear Chat History"
        message="Are you sure you want to clear all chat messages? This action cannot be undone."
        onConfirm={confirmClearHistory}
        onCancel={() => setShowConfirmClear(false)}
        confirmText="Clear History"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SettingsPanel;

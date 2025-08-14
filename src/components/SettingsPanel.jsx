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
    maxOutputTokens,
    topP,
    setApiKey,
    setSystemPrompt,
    setTemperature,
    togglePersistHistory,
    setMaxOutputTokens,
    setTopP
  } = useSettingsStore();

  const { clearMessages } = useMessagesStore();
  
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localPersistHistory, setLocalPersistHistory] = useState(persistHistory);
  const [localMaxOutputTokens, setLocalMaxOutputTokens] = useState(maxOutputTokens);
  const [localTopP, setLocalTopP] = useState(topP);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Sync local state with store when store changes
  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalSystemPrompt(systemPrompt);
    setLocalTemperature(temperature);
    setLocalPersistHistory(persistHistory);
    setLocalMaxOutputTokens(maxOutputTokens);
    setLocalTopP(topP);
  }, [apiKey, systemPrompt, temperature, persistHistory, maxOutputTokens, topP]);

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

  const handleMaxOutputTokensChange = (e) => {
    const value = parseInt(e.target.value);
    setLocalMaxOutputTokens(value);
    setMaxOutputTokens(value);
  };

  const handleTopPChange = (e) => {
    const value = parseFloat(e.target.value);
    setLocalTopP(value);
    setTopP(value);
  };

  // Validate max output tokens based on conversation length
  const getMaxTokensWarning = () => {
    if (localMaxOutputTokens > 3000) {
      return "⚠️ High value may cause errors with long conversations";
    }
    return null;
  };

  const handleTestKey = async () => {
    if (!localApiKey.trim()) {
      setTestResult({ success: false, message: '🔑 Please enter an API key first' });
      return;
    }

    try {
      const client = new OpenAIClient(localApiKey);
      const result = await client.ping();
      
      if (result.success) {
        setTestResult({ success: true, message: '✅ API key is valid and working!' });
      } else {
        // Handle structured error responses
        let userMessage = result.humanMessage || result.message;
        
        // Map specific error codes to user-friendly messages
        if (result.code === 429) {
          userMessage = '💰 Квотата е изчерпана / проверѝ billing';
        } else if (result.code === 401 || result.code === 403) {
          userMessage = '🔑 Провери API ключа/правата';
        } else if (result.code === 404) {
          userMessage = '🌐 Настрой endpoint (не използвай /api/... без бекенд)';
        } else if (result.category === 'QUOTA_LIMIT') {
          userMessage = '💰 Квотата е изчерпана / проверѝ billing';
        } else if (result.category === 'AUTHENTICATION') {
          userMessage = '🔑 Провери API ключа/правата';
        } else if (result.category === 'NOT_FOUND') {
          userMessage = '🌐 Настрой endpoint (не използвай /api/... без бекенд)';
        }
        
        setTestResult({ success: false, message: userMessage });
      }
      
      // Auto-hide the result after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      // Fallback error handling
      setTestResult({ success: false, message: '🌐 Network connection issue. Please check your internet.' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleTestConfiguration = async () => {
    if (!localApiKey.trim()) {
      setTestResult({ success: false, message: '🔑 Please enter an API key first' });
      return;
    }

    try {
      setTestResult({ success: true, message: '🔄 Testing configuration...' });
      
      const client = new OpenAIClient(localApiKey);
      const result = await client.testConfiguration({
        systemPrompt: localSystemPrompt,
        temperature: localTemperature,
        maxOutputTokens: localMaxOutputTokens,
        topP: localTopP
      });
      
      if (result.success) {
        setTestResult({ 
          success: true, 
          message: `✅ ${result.message} | Cost: ${result.estimatedCost}` 
        });
      } else {
        setTestResult({ success: false, message: result.humanMessage || result.message });
      }
      
      // Auto-hide the result after 5 seconds (longer for config test)
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult({ success: false, message: '🌐 Configuration test failed. Please check your settings.' });
      setTimeout(() => setTestResult(null), 5000);
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

          {/* Max Output Tokens Section */}
          <div className="setting-group">
            <label htmlFor="maxOutputTokens" className="setting-label">
              Max Output Tokens: {localMaxOutputTokens}
            </label>
            <div className="tokens-control">
              <input
                type="range"
                id="maxOutputTokens"
                min="100"
                max="4000"
                step="100"
                value={localMaxOutputTokens}
                onChange={handleMaxOutputTokensChange}
                className="setting-range"
              />
              <div className="tokens-labels">
                <span>Short (100)</span>
                <span>Medium (1000)</span>
                <span>Long (4000)</span>
              </div>
            </div>
            <small className="setting-help">
              Maximum length of AI responses in tokens
            </small>
            {getMaxTokensWarning() && (
              <small className="setting-warning">
                {getMaxTokensWarning()}
              </small>
            )}
            <small className="setting-hint">
              💡 Changes apply to future chat requests only
            </small>
          </div>

          {/* Top P Section */}
          <div className="setting-group">
            <label htmlFor="topP" className="setting-label">
              Top P: {localTopP}
            </label>
            <div className="topp-control">
              <input
                type="range"
                id="topP"
                min="0"
                max="1"
                step="0.1"
                value={localTopP}
                onChange={handleTopPChange}
                className="setting-range"
              />
              <div className="topp-labels">
                <span>Focused (0)</span>
                <span>Balanced (0.5)</span>
                <span>Diverse (1)</span>
              </div>
            </div>
            <small className="setting-help">
              Controls response diversity: 0 = focused, 1 = diverse
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

          {/* Cost Estimation */}
          <div className="setting-group">
            <h4 className="setting-subtitle">💰 Cost Estimation</h4>
            <div className="cost-estimation">
              <div className="cost-item">
                <span className="cost-label">Short message (~100 tokens):</span>
                <span className="cost-value">~$0.000075</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Medium message (~500 tokens):</span>
                <span className="cost-value">~$0.000375</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Long message (~1000 tokens):</span>
                <span className="cost-value">~$0.00075</span>
              </div>
              <small className="setting-help">
                Based on GPT-4o-mini. Costs vary by model and actual token usage.
              </small>
            </div>
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
                onClick={handleTestConfiguration}
                disabled={!localApiKey.trim()}
              >
                Test Configuration
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

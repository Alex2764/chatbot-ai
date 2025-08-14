/* ROLE: SettingsPanel — UI панел за настройки; НЕ пази трайно apiKey. Виж TODO в тялото. */

/**
 * SettingsPanel - Configuration interface for API key, system prompt, temperature, and history settings.
 * Provides form controls for customizing chat behavior and AI model parameters.
 */
import React from 'react';

const SettingsPanel = ({ settings, onSettingsChange }) => {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      
      <div className="setting-group">
        <label htmlFor="apiKey">API Key:</label>
        <input
          type="password"
          id="apiKey"
          value={settings.apiKey || ''}
          onChange={(e) => handleChange('apiKey', e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
      </div>

      <div className="setting-group">
        <label htmlFor="systemPrompt">System Instruction:</label>
        <textarea
          id="systemPrompt"
          value={settings.systemPrompt || ''}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          placeholder="Enter system instruction for the bot"
          rows="3"
        />
      </div>

      <div className="setting-group">
        <label htmlFor="temperature">Temperature:</label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="2"
          step="0.1"
          value={settings.temperature || 0.7}
          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
        />
        <span className="temperature-value">{settings.temperature || 0.7}</span>
      </div>

      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.persistHistory || false}
            onChange={(e) => handleChange('persistHistory', e.target.checked)}
          />
          Save History
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;

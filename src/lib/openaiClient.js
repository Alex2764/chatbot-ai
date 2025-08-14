/* ROLE: openaiClient — тънка обвивка за HTTP заявки към модела (headers, endpoints). Без UI/стор логика; без знание за компоненти. */

/**
 * OpenAIClient - Thin HTTP wrapper for OpenAI API requests with streaming support.
 * Manages authentication, request formatting, and response handling for chat completions.
 */
class OpenAIClient {
  constructor(apiKey, baseURL = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  async chatCompletion(messages, options = {}) {
    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      messages
    };

    return this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestOptions)
    });
  }

  async streamChatCompletion(messages, options = {}) {
    const streamOptions = {
      ...options,
      stream: true
    };

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        ...streamOptions,
        messages
      })
    });

    return response;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setBaseURL(baseURL) {
    this.baseURL = baseURL;
  }
}

export default OpenAIClient;

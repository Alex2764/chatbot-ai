import { handleOpenAIError, handleHttpError } from './errors';

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Use the new error handling system
      if (error.message.includes('OpenAI API error:')) {
        throw error; // Let the calling function handle it
      } else {
        // Network or other errors
        throw error;
      }
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

  async ping() {
    try {
      // Test the API key by making a simple request to list models
      const response = await this.makeRequest('/models', {
        method: 'GET'
      });
      
      // If we get here, the API key is valid
      return { success: true, message: 'Key OK' };
    } catch (error) {
      // Use the new error handling system
      const errorResponse = handleOpenAIError(error);
      return errorResponse;
    }
  }

  async chat({ messages, systemPrompt, temperature, toolsCatalog }) {
    const url = `${this.baseURL}/chat/completions`;
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: temperature || 0.7,
      stream: true,
      max_tokens: 1000
    };

    // Add tools if provided
    if (toolsCatalog && toolsCatalog.length > 0) {
      requestBody.tools = toolsCatalog;
      requestBody.tool_choice = 'auto';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`;
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      return this.createStream(reader, decoder, buffer);

    } catch (error) {
      // Use the new error handling system
      const errorResponse = handleOpenAIError(error);
      throw new Error(JSON.stringify(errorResponse));
    }
  }

  async *createStream(reader, decoder, buffer) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const choice = parsed.choices?.[0];
              
              if (!choice) continue;

              if (choice.delta?.content) {
                yield {
                  type: 'text',
                  content: choice.delta.content
                };
              }

              if (choice.delta?.tool_calls) {
                for (const toolCall of choice.delta.tool_calls) {
                  if (toolCall.function) {
                    yield {
                      type: 'tool_call',
                      id: toolCall.index,
                      name: toolCall.function.name,
                      args: toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {}
                    };
                  }
                }
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setBaseURL(baseURL) {
    this.baseURL = baseURL;
  }
}

export default OpenAIClient;

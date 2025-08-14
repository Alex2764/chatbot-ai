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
      model: 'gpt-4o-mini',
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
        model: 'gpt-4o-mini',
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

  async chat({ messages, systemPrompt, temperature, toolsCatalog, maxOutputTokens, topP }) {
    const url = `${this.baseURL}/chat/completions`;
    
    // Following OpenAI official documentation for function calling
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        ...messages
      ],
      temperature: temperature || 0.7,
      max_tokens: maxOutputTokens || 1000,
      stream: true
    };

    // Add tools if provided (following official format)
    if (toolsCatalog && toolsCatalog.length > 0) {
      requestBody.tools = toolsCatalog;
      // Note: tool_choice is not needed for basic function calling
    }

    console.log("OpenAI request payload:", requestBody);

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
        console.log("OpenAI API error details:", errorData);
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
      console.log("OpenAI API error:", error);
      const errorResponse = handleOpenAIError(error);
      throw new Error(JSON.stringify(errorResponse));
    }
  }

  async *createStream(reader, decoder, buffer) {
    try {
      // Track incomplete tool calls
      const incompleteToolCalls = new Map();
      
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
                  const toolCallId = toolCall.index;
                  
                  // Initialize tool call if not exists
                  if (!incompleteToolCalls.has(toolCallId)) {
                    incompleteToolCalls.set(toolCallId, {
                      id: toolCallId,
                      name: '',
                      args: ''
                    });
                  }
                  
                  const currentToolCall = incompleteToolCalls.get(toolCallId);
                  
                  // Accumulate tool call data
                  if (toolCall.function?.name) {
                    currentToolCall.name = toolCall.function.name;
                  }
                  
                  if (toolCall.function?.arguments) {
                    currentToolCall.args += toolCall.function.arguments;
                  }
                  
                  // Check if this tool call is complete (has both name and complete args)
                  if (currentToolCall.name && currentToolCall.args) {
                    try {
                      // Try to parse the accumulated arguments
                      const parsedArgs = JSON.parse(currentToolCall.args);
                      
                      // Yield the complete tool call
                      yield {
                        type: 'tool_call',
                        id: currentToolCall.id,
                        name: currentToolCall.name,
                        args: parsedArgs
                      };
                      
                      // Remove from incomplete calls
                      incompleteToolCalls.delete(toolCallId);
                      
                    } catch (parseError) {
                      // Arguments are still incomplete, continue accumulating
                      console.debug('Tool call arguments still incomplete, continuing...');
                    }
                  }
                }
              }

            } catch (parseError) {
              // Only log parsing errors for debugging, don't break the stream
              // This is normal for incomplete JSON chunks in streaming
              if (process.env.NODE_ENV === 'development') {
                console.debug('Streaming chunk parse warning (normal):', parseError.message);
              }
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

  // Cost estimation helper (approximate)
  estimateCost(inputTokens, outputTokens, model = 'gpt-4o-mini') {
    // Approximate costs per 1K tokens (as of 2024)
    const costs = {
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }, // $0.0005/$0.0015 per 1K tokens
      'gpt-4': { input: 0.03, output: 0.06 }, // $0.03/$0.06 per 1K tokens
      'gpt-4o': { input: 0.005, output: 0.015 }, // $0.005/$0.015 per 1K tokens
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 } // $0.00015/$0.0006 per 1K tokens
    };
    
    const modelCosts = costs[model] || costs['gpt-4o-mini'];
    const inputCost = (inputTokens / 1000) * modelCosts.input;
    const outputCost = (outputTokens / 1000) * modelCosts.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputCost: inputCost.toFixed(6),
      outputCost: outputCost.toFixed(6),
      totalCost: totalCost.toFixed(6),
      inputTokens,
      outputTokens,
      model
    };
  }

  async testConfiguration({ systemPrompt, temperature, maxOutputTokens, topP }) {
    try {
      // Make a minimal request to test the configuration
      // This will validate the API key and settings without generating content
      const url = `${this.baseURL}/chat/completions`;
      
      // Calculate safe max_tokens for test
      const estimatedInputTokens = Math.ceil((systemPrompt || 'You are a helpful assistant.').length / 4) + 10; // "Hello" message
      const maxTotalTokens = 100000; // GPT-4o-mini limit
      const safeMaxTokens = Math.min(10, maxTotalTokens - estimatedInputTokens - 1000);
      
      const testRequestBody = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' }
        ],
        temperature: temperature || 0.7,
        max_tokens: Math.max(1, safeMaxTokens), // Very small limit to minimize cost
        top_p: topP || 0.9,
        stream: false // No streaming for test
      };

      // Log the test request payload
      console.log("OpenAI test configuration payload:", testRequestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`;
        throw new Error(errorMessage);
      }

      // If we get here, the configuration is valid
      return {
        success: true,
        message: 'Configuration is valid and ready to use',
        estimatedCost: 'Very low (test request)',
        settings: {
          temperature,
          maxOutputTokens,
          topP,
          systemPrompt: systemPrompt ? 'Set' : 'Default'
        }
      };

    } catch (error) {
      // Use the new error handling system
      const errorResponse = handleOpenAIError(error);
      return errorResponse;
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

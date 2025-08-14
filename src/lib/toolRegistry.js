/* ROLE: toolRegistry — регистър с дефиниции на инструменти (име, описание, схема). */

/**
 * ToolRegistry - Manages available tools that the AI can use, including their schemas and implementations.
 * Provides tool definitions, registration, and execution capabilities.
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initializeDefaultTools();
  }

  initializeDefaultTools() {
    // Get current time tool (simplest possible)
    this.registerTool({
      name: 'get_current_time',
      description: 'Get current time',
      schema: {
        type: "function",
        function: {
          name: "get_current_time",
          description: "Get the current date and time. Use ONLY for time questions like 'what time is it?' or 'колко е часът?'",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      execute: async () => {
        return {
          currentTime: new Date().toISOString(),
          formatted: new Date().toLocaleString()
        };
      },
      requiresConfirm: false
    });

    // Calculate tool (adding back for testing)
    this.registerTool({
      name: 'calculate',
      description: 'Perform mathematical calculations',
      schema: {
        type: "function",
        function: {
          name: "calculate",
          description: "Perform mathematical calculations. Use ONLY for math questions like 'calculate 2+2' or 'изчисли 5*3'",
          parameters: {
            type: "object",
            properties: {
              expression: {
                type: "string",
                description: "The mathematical expression to evaluate (e.g., '2 + 2 * 3')"
              }
            },
            required: ["expression"]
          }
        }
      },
      execute: async (args) => {
        const { expression } = args;
        
        // Safe evaluation - only allow basic math operations
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        
        try {
          // Use Function constructor for safe evaluation
          const result = new Function(`return ${sanitized}`)();
          
          if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Invalid calculation result');
          }
          
          return {
            expression: sanitized,
            result: result,
            formatted: `Result: ${result}`
          };
        } catch (error) {
          throw new Error(`Calculation failed: ${error.message}`);
        }
      },
      requiresConfirm: false
    });

    // Save note tool - disabled for testing
    // this.registerTool({...});

    // Read note tool - disabled for testing  
    // this.registerTool({...});

    // Open UI tool - disabled for testing
    // this.registerTool({...});
  }

  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getTools() {
    return Array.from(this.tools.values()).map(tool => tool.schema);
  }

  listTools() {
    return Array.from(this.tools.keys());
  }

  hasTool(name) {
    return this.tools.has(name);
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();
export default ToolRegistry;

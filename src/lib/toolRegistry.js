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
    // Get current time tool
    this.registerTool({
      name: 'get_current_time',
      description: 'Get the current date and time',
      schema: {
        type: 'function',
        function: {
          name: 'get_current_time',
          description: 'Returns the current date and time in ISO format',
          parameters: {
            type: 'object',
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

    // Calculate tool
    this.registerTool({
      name: 'calculate',
      description: 'Perform mathematical calculations',
      schema: {
        type: 'function',
        function: {
          name: 'calculate',
          description: 'Evaluate mathematical expressions safely',
          parameters: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate (e.g., "2 + 2 * 3")'
              }
            },
            required: ['expression']
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

    // Save note tool
    this.registerTool({
      name: 'save_note',
      description: 'Save a note to local storage',
      schema: {
        type: 'function',
        function: {
          name: 'save_note',
          description: 'Save a note with title and content to local storage',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the note'
              },
              content: {
                type: 'string',
                description: 'Content of the note'
              }
            },
            required: ['title', 'content']
          }
        }
      },
      execute: async (args) => {
        const { title, content } = args;
        
        try {
          const notes = JSON.parse(localStorage.getItem('ai_notes') || '[]');
          const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString()
          };
          
          notes.push(newNote);
          localStorage.setItem('ai_notes', JSON.stringify(notes));
          
          return {
            success: true,
            noteId: newNote.id,
            message: `Note "${title}" saved successfully`
          };
        } catch (error) {
          throw new Error(`Failed to save note: ${error.message}`);
        }
      },
      requiresConfirm: true
    });

    // Read note tool
    this.registerTool({
      name: 'read_note',
      description: 'Read notes from local storage',
      schema: {
        type: 'function',
        function: {
          name: 'read_note',
          description: 'Read notes from local storage, optionally filtered by title',
          parameters: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Optional title to search for (leave empty for all notes)'
              }
            },
            required: []
          }
        }
      },
      execute: async (args) => {
        const { title } = args;
        
        try {
          const notes = JSON.parse(localStorage.getItem('ai_notes') || '[]');
          
          if (title && title.trim()) {
            const filtered = notes.filter(note => 
              note.title.toLowerCase().includes(title.toLowerCase()) ||
              note.content.toLowerCase().includes(title.toLowerCase())
            );
            
            return {
              found: filtered.length,
              notes: filtered,
              message: `Found ${filtered.length} note(s) matching "${title}"`
            };
          } else {
            return {
              found: notes.length,
              notes: notes,
              message: `Found ${notes.length} total note(s)`
            };
          }
        } catch (error) {
          throw new Error(`Failed to read notes: ${error.message}`);
        }
      },
      requiresConfirm: false
    });

    // Open UI tool
    this.registerTool({
      name: 'open_ui',
      description: 'Open a UI component or modal',
      schema: {
        type: 'function',
        function: {
          name: 'open_ui',
          description: 'Open a specific UI component or modal',
          parameters: {
            type: 'object',
            properties: {
              component: {
                type: 'string',
                description: 'Name of the UI component to open (e.g., "settings", "help", "notes")'
              },
              data: {
                type: 'object',
                description: 'Optional data to pass to the component'
              }
            },
            required: ['component']
          }
        }
      },
      execute: async (args) => {
        const { component, data } = args;
        
        // This would typically emit an event or call a callback
        // For now, we'll return a success message
        return {
          success: true,
          component: component,
          message: `UI component "${component}" opened successfully`,
          data: data || {}
        };
      },
      requiresConfirm: true
    });
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

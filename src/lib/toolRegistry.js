/* ROLE: toolRegistry — декларации/метаданни за инструменти (име, описание, вход/изход, политики). Без имплементация на UI; без странични ефекти. */

/**
 * ToolRegistry - Central registry for managing available AI tools with schemas and metadata.
 * Provides tool discovery, registration, and OpenAI-compatible format conversion.
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initializeDefaultTools();
  }

  initializeDefaultTools() {
    // Default tools
    this.registerTool({
      name: 'get_current_time',
      description: 'Get the current date and time',
      schema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['iso', 'human', 'timestamp'],
            description: 'Time format to return'
          }
        }
      }
    });

    this.registerTool({
      name: 'calculate',
      description: 'Perform mathematical calculations',
      schema: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Mathematical expression to evaluate'
          }
        },
        required: ['expression']
      }
    });

    this.registerTool({
      name: 'save_note',
      description: 'Save a note to local storage',
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Note title'
          },
          content: {
            type: 'string',
            description: 'Note content'
          }
        },
        required: ['title', 'content']
      }
    });

    this.registerTool({
      name: 'read_note',
      description: 'Read a note from local storage',
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Note title to read'
          }
        },
        required: ['title']
      }
    });

    this.registerTool({
      name: 'open_ui',
      description: 'Open a UI component or modal',
      schema: {
        type: 'object',
        properties: {
          component: {
            type: 'string',
            enum: ['settings', 'help', 'about'],
            description: 'UI component to open'
          }
        },
        required: ['component']
      }
    });
  }

  registerTool(toolDefinition) {
    const { name, description, schema } = toolDefinition;
    
    if (!name || !description || !schema) {
      throw new Error('Tool definition must include name, description, and schema');
    }

    this.tools.set(name, {
      name,
      description,
      schema,
      registeredAt: new Date().toISOString()
    });
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolNames() {
    return Array.from(this.tools.keys());
  }

  removeTool(name) {
    return this.tools.delete(name);
  }

  hasTool(name) {
    return this.tools.has(name);
  }

  getToolsForModel() {
    // Return tools in the format expected by OpenAI API
    return this.getAllTools().map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema
      }
    }));
  }
}

export default ToolRegistry;

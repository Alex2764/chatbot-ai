/* ROLE: toolValidators — проверка на аргументи по функция. */

/**
 * ToolValidators - Provides validation logic for tool arguments and execution policies.
 * Ensures tool calls are safe and arguments meet requirements before execution.
 */
class ToolValidators {
  constructor() {
    this.validators = new Map();
    this.initializeValidators();
  }

  initializeValidators() {
    // Get current time validator
    this.validators.set('get_current_time', (args) => {
      if (Object.keys(args).length > 0) {
        return { valid: false, error: 'get_current_time takes no arguments' };
      }
      return { valid: true };
    });

    // Calculate validator
    this.validators.set('calculate', (args) => {
      if (!args.expression || typeof args.expression !== 'string') {
        return { valid: false, error: 'expression must be a string' };
      }
      
      if (args.expression.length > 100) {
        return { valid: false, error: 'expression too long (max 100 characters)' };
      }
      
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/i,
        /Function\s*\(/i,
        /setTimeout\s*\(/i,
        /setInterval\s*\(/i,
        /document\./i,
        /window\./i,
        /localStorage\./i,
        /sessionStorage\./i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(args.expression)) {
          return { valid: false, error: 'expression contains forbidden patterns' };
        }
      }
      
      return { valid: true };
    });

    // Save note validator
    this.validators.set('save_note', (args) => {
      if (!args.title || typeof args.title !== 'string') {
        return { valid: false, error: 'title must be a string' };
      }
      
      if (!args.content || typeof args.content !== 'string') {
        return { valid: false, error: 'content must be a string' };
      }
      
      if (args.title.trim().length === 0) {
        return { valid: false, error: 'title cannot be empty' };
      }
      
      if (args.content.trim().length === 0) {
        return { valid: false, error: 'content cannot be empty' };
      }
      
      if (args.title.length > 200) {
        return { valid: false, error: 'title too long (max 200 characters)' };
      }
      
      if (args.content.length > 5000) {
        return { valid: false, error: 'content too long (max 5000 characters)' };
      }
      
      return { valid: true };
    });

    // Read note validator
    this.validators.set('read_note', (args) => {
      if (args.title !== undefined && typeof args.title !== 'string') {
        return { valid: false, error: 'title must be a string if provided' };
      }
      
      if (args.title && args.title.length > 200) {
        return { valid: false, error: 'title too long (max 200 characters)' };
      }
      
      return { valid: true };
    });

    // Open UI validator
    this.validators.set('open_ui', (args) => {
      if (!args.component || typeof args.component !== 'string') {
        return { valid: false, error: 'component must be a string' };
      }
      
      const allowedComponents = ['settings', 'help', 'notes', 'about'];
      if (!allowedComponents.includes(args.component)) {
        return { valid: false, error: `component must be one of: ${allowedComponents.join(', ')}` };
      }
      
      if (args.data !== undefined && typeof args.data !== 'object') {
        return { valid: false, error: 'data must be an object if provided' };
      }
      
      return { valid: true };
    });
  }

  registerValidator(toolName, validator) {
    this.validators.set(toolName, validator);
  }

  validateToolCall(toolName, args) {
    const validator = this.validators.get(toolName);
    
    if (!validator) {
      return { valid: false, error: `No validator found for tool: ${toolName}` };
    }
    
    try {
      return validator(args);
    } catch (error) {
      return { valid: false, error: `Validation error: ${error.message}` };
    }
  }

  validateBySchema(toolName, args, schema) {
    // Basic schema validation as fallback
    if (!schema || !schema.properties) {
      return { valid: true }; // No schema, assume valid
    }
    
    const required = schema.required || [];
    
    // Check required properties
    for (const prop of required) {
      if (args[prop] === undefined) {
        return { valid: false, error: `Missing required property: ${prop}` };
      }
    }
    
    // Check property types (basic validation)
    for (const [prop, value] of Object.entries(args)) {
      const propSchema = schema.properties[prop];
      if (propSchema && propSchema.type) {
        if (propSchema.type === 'string' && typeof value !== 'string') {
          return { valid: false, error: `Property ${prop} must be a string` };
        }
        if (propSchema.type === 'number' && typeof value !== 'number') {
          return { valid: false, error: `Property ${prop} must be a number` };
        }
        if (propSchema.type === 'boolean' && typeof value !== 'boolean') {
          return { valid: false, error: `Property ${prop} must be a boolean` };
        }
      }
    }
    
    return { valid: true };
  }

  getValidator(toolName) {
    return this.validators.get(toolName);
  }

  hasValidator(toolName) {
    return this.validators.has(toolName);
  }

  listValidators() {
    return Array.from(this.validators.keys());
  }
}

// Export singleton instance
export const toolValidators = new ToolValidators();
export default ToolValidators;

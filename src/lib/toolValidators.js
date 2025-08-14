/* ROLE: toolValidators — строга валидация на аргументи за всеки инструмент; връща контролируеми грешки и никога не изпълнява UI действия. */

/**
 * ToolValidators - Validates tool arguments using registered validators or schema validation.
 * Provides custom validation logic for each tool type with fallback schema validation.
 */
class ToolValidators {
  constructor() {
    this.validators = new Map();
  }

  // Register a validator for a specific tool
  registerValidator(toolName, validator) {
    this.validators.set(toolName, validator);
  }

  // Get validator for a specific tool
  getValidator(toolName) {
    return this.validators.get(toolName);
  }

  // Validate tool arguments using registered validator or schema
  validateToolCall(toolName, args) {
    const validator = this.getValidator(toolName);
    
    if (validator) {
      return validator(args);
    }

    // Fallback to schema validation
    return this.validateBySchema(toolName, args);
  }

  // Validate by schema (fallback method)
  validateBySchema(toolName, args) {
    // This would typically use a JSON schema validator
    // For now, we'll do basic validation
    try {
      if (typeof args !== 'object' || args === null) {
        return { isValid: false, errors: ['Arguments must be an object'] };
      }

      // Basic validation - in a real app, you'd use a proper schema validator
      return { isValid: true, errors: [] };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  // Custom validators for specific tools
  validateGetCurrentTime(args) {
    if (args.format && !['iso', 'human', 'timestamp'].includes(args.format)) {
      return { isValid: false, errors: ['Invalid format. Must be iso, human, or timestamp'] };
    }
    return { isValid: true, errors: [] };
  }

  validateCalculate(args) {
    if (!args.expression || typeof args.expression !== 'string') {
      return { isValid: false, errors: ['Expression must be a string'] };
    }
    
    // Basic expression validation
    const validChars = /^[0-9+\-*/().\s]+$/;
    if (!validChars.test(args.expression)) {
      return { isValid: false, errors: ['Expression contains invalid characters'] };
    }
    
    return { isValid: true, errors: [] };
  }

  validateSaveNote(args) {
    if (!args.title || typeof args.title !== 'string' || args.title.trim().length === 0) {
      return { isValid: false, errors: ['Title must be a non-empty string'] };
    }
    
    if (!args.content || typeof args.content !== 'string') {
      return { isValid: false, errors: ['Content must be a string'] };
    }
    
    return { isValid: true, errors: [] };
  }

  validateReadNote(args) {
    if (!args.title || typeof args.title !== 'string' || args.title.trim().length === 0) {
      return { isValid: false, errors: ['Title must be a non-empty string'] };
    }
    
    return { isValid: true, errors: [] };
  }

  validateOpenUI(args) {
    if (!args.component || !['settings', 'help', 'about'].includes(args.component)) {
      return { isValid: false, errors: ['Component must be settings, help, or about'] };
    }
    
    return { isValid: true, errors: [] };
  }

  // Initialize default validators
  initializeDefaultValidators() {
    this.registerValidator('get_current_time', this.validateGetCurrentTime.bind(this));
    this.registerValidator('calculate', this.validateCalculate.bind(this));
    this.registerValidator('save_note', this.validateSaveNote.bind(this));
    this.registerValidator('read_note', this.validateReadNote.bind(this));
    this.registerValidator('open_ui', this.validateOpenUI.bind(this));
  }
}

// Initialize default validators
const toolValidators = new ToolValidators();
toolValidators.initializeDefaultValidators();

export default toolValidators;

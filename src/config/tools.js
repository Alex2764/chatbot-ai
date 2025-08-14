/**
 * Tool configuration, permissions, and execution policies for AI-powered functionality.
 * Defines available tools, validation rules, and help documentation for user guidance.
 */
// Tool Configuration and Descriptions

// Tool Registry Configuration
export const TOOL_CONFIG = {
  // Time and Date Tools
  get_current_time: {
    name: 'get_current_time',
    description: 'Get the current date and time in various formats',
    shortDescription: 'Retrieves the current date and time',
    longDescription: 'This tool provides the current date and time information. It can return the time in different formats including human-readable text, ISO standard format, or Unix timestamp. Useful for time-sensitive operations, logging, or when users need to know the current time.',
    category: 'time',
    icon: '🕐',
    enabled: true,
    requiresConfirmation: false,
    expectedInputs: {
      format: {
        type: 'string',
        description: 'Time format preference (optional)',
        options: ['iso', 'human', 'timestamp'],
        default: 'human'
      }
    },
    expectedOutputs: {
      currentTime: {
        type: 'string',
        description: 'The current date and time in the requested format'
      },
      timestamp: {
        type: 'number',
        description: 'Unix timestamp for the current moment'
      }
    },
    examples: [
      'get_current_time() - Returns current time in human-readable format',
      'get_current_time({ format: "iso" }) - Returns ISO 8601 formatted time',
      'get_current_time({ format: "timestamp" }) - Returns Unix timestamp'
    ],
    rateLimit: {
      maxPerMinute: 60,
      maxPerHour: 1000
    }
  },

  // Mathematical Tools
  calculate: {
    name: 'calculate',
    description: 'Perform mathematical calculations and solve equations',
    shortDescription: 'Evaluates mathematical expressions and performs calculations',
    longDescription: 'This tool can solve mathematical expressions, perform arithmetic operations, and handle complex calculations. It supports basic operations (addition, subtraction, multiplication, division), parentheses for grouping, and can evaluate mathematical expressions safely. Useful for quick calculations, math homework help, or when users need computational assistance.',
    category: 'math',
    icon: '🧮',
    enabled: true,
    requiresConfirmation: false,
    expectedInputs: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate',
        required: true,
        constraints: 'Only numbers, operators (+, -, *, /), parentheses, and decimal points allowed'
      }
    },
    expectedOutputs: {
      result: {
        type: 'number',
        description: 'The calculated result of the mathematical expression'
      },
      expression: {
        type: 'string',
        description: 'The original expression that was evaluated'
      }
    },
    examples: [
      'calculate({ expression: "2 + 2" }) - Returns 4',
      'calculate({ expression: "(10 * 5) / 2" }) - Returns 25',
      'calculate({ expression: "100 - 25 * 2" }) - Returns 50 (respects order of operations)'
    ],
    rateLimit: {
      maxPerMinute: 30,
      maxPerHour: 500
    }
  },

  // Note Management Tools
  save_note: {
    name: 'save_note',
    description: 'Save a note with title and content to local storage',
    shortDescription: 'Saves a note with title and content to your personal storage',
    longDescription: 'This tool allows users to save personal notes, reminders, or any text content to their local browser storage. Notes are private and only accessible to the user. Useful for saving meeting notes, to-do lists, ideas, or any information users want to remember. Notes persist across browser sessions and can be retrieved later using the read_note tool.',
    category: 'notes',
    icon: '📝',
    enabled: true,
    requiresConfirmation: true,
    expectedInputs: {
      title: {
        type: 'string',
        description: 'Title or name for the note',
        required: true,
        constraints: 'Alphanumeric characters, spaces, hyphens, and underscores only'
      },
      content: {
        type: 'string',
        description: 'The note content or body text',
        required: true,
        constraints: 'Any text content up to 10,000 characters'
      }
    },
    expectedOutputs: {
      success: {
        type: 'boolean',
        description: 'Whether the note was saved successfully'
      },
      noteId: {
        type: 'string',
        description: 'Unique identifier for the saved note'
      },
      savedAt: {
        type: 'string',
        description: 'ISO timestamp when the note was saved'
      }
    },
    examples: [
      'save_note({ title: "Meeting Notes", content: "Discuss project timeline and milestones" })',
      'save_note({ title: "Shopping List", content: "1. Milk\n2. Bread\n3. Eggs" })',
      'save_note({ title: "Ideas", content: "Future feature: voice input support" })'
    ],
    rateLimit: {
      maxPerMinute: 10,
      maxPerHour: 100
    }
  },

  read_note: {
    name: 'read_note',
    description: 'Read a previously saved note from local storage',
    shortDescription: 'Retrieves a saved note by its title',
    longDescription: 'This tool retrieves previously saved notes from local browser storage. Users can search for notes by their exact title. If a note is found, it returns the full content along with metadata like when it was saved. Useful for reviewing meeting notes, checking to-do lists, or accessing any previously saved information.',
    category: 'notes',
    icon: '📖',
    enabled: true,
    requiresConfirmation: false,
    expectedInputs: {
      title: {
        type: 'string',
        description: 'Exact title of the note to retrieve',
        required: true,
        constraints: 'Must match the exact title used when saving'
      }
    },
    expectedOutputs: {
      found: {
        type: 'boolean',
        description: 'Whether the note was found'
      },
      note: {
        type: 'object',
        description: 'The note object with title, content, and metadata'
      },
      message: {
        type: 'string',
        description: 'Human-readable message about the result'
      }
    },
    examples: [
      'read_note({ title: "Meeting Notes" }) - Retrieves the meeting notes',
      'read_note({ title: "Shopping List" }) - Gets the shopping list',
      'read_note({ title: "Ideas" }) - Retrieves saved ideas'
    ],
    rateLimit: {
      maxPerMinute: 30,
      maxPerHour: 500
    }
  },

  open_ui: {
    name: 'open_ui',
    description: 'Open a specific UI component or modal',
    shortDescription: 'Opens UI components like settings, help, or about panels',
    longDescription: 'This tool allows the AI to open specific UI components or modals within the application. It can open settings panels, help documentation, about information, or other UI elements. This is useful when users need to access configuration options, get help, or view application information. The tool provides a way for the AI to guide users to relevant parts of the interface.',
    category: 'ui',
    icon: '🖥️',
    enabled: true,
    requiresConfirmation: false,
    expectedInputs: {
      component: {
        type: 'string',
        description: 'The UI component to open',
        required: true,
        options: ['settings', 'help', 'about'],
        constraints: 'Must be one of the predefined component types'
      }
    },
    expectedOutputs: {
      success: {
        type: 'boolean',
        description: 'Whether the UI component was opened successfully'
      },
      component: {
        type: 'string',
        description: 'The name of the component that was opened'
      },
      message: {
        type: 'string',
        description: 'Human-readable message about the action'
      }
    },
    examples: [
      'open_ui({ component: "settings" }) - Opens the settings panel',
      'open_ui({ component: "help" }) - Opens the help documentation',
      'open_ui({ component: "about" }) - Opens the about information panel'
    ],
    rateLimit: {
      maxPerMinute: 20,
      maxPerHour: 200
    }
  }
};

// Tool Categories
export const TOOL_CATEGORIES = {
  time: {
    name: 'Time & Date',
    description: 'Tools for working with time and dates',
    icon: '🕐',
    color: '#10b981'
  },
  math: {
    name: 'Mathematics',
    description: 'Tools for calculations and mathematical operations',
    icon: '🧮',
    color: '#3b82f6'
  },
  notes: {
    name: 'Notes & Storage',
    description: 'Tools for saving and retrieving personal notes',
    icon: '📝',
    color: '#f59e0b'
  },
  ui: {
    name: 'User Interface',
    description: 'Tools for controlling the user interface',
    icon: '🖥️',
    color: '#8b5cf6'
  }
};

// Tool Permissions
export const TOOL_PERMISSIONS = {
  get_current_time: {
    allowAnonymous: true,
    requireAuthentication: false,
    allowedRoles: ['user', 'admin'],
    restrictedEnvironments: []
  },
  calculate: {
    allowAnonymous: true,
    requireAuthentication: false,
    allowedRoles: ['user', 'admin'],
    restrictedEnvironments: []
  },
  save_note: {
    allowAnonymous: false,
    requireAuthentication: true,
    allowedRoles: ['user', 'admin'],
    restrictedEnvironments: ['public']
  },
  read_note: {
    allowAnonymous: false,
    requireAuthentication: true,
    allowedRoles: ['user', 'admin'],
    restrictedEnvironments: ['public']
  },
  open_ui: {
    allowAnonymous: true,
    requireAuthentication: false,
    allowedRoles: ['user', 'admin'],
    restrictedEnvironments: []
  }
};

// Tool Execution Policies
export const TOOL_EXECUTION_POLICIES = {
  default: {
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    requireConfirmation: false,
    logExecution: true,
    trackMetrics: false
  },
  get_current_time: {
    timeout: 5000,
    maxRetries: 1,
    retryDelay: 0,
    requireConfirmation: false,
    logExecution: false,
    trackMetrics: false
  },
  calculate: {
    timeout: 10000,
    maxRetries: 2,
    retryDelay: 500,
    requireConfirmation: false,
    logExecution: true,
    trackMetrics: false
  },
  save_note: {
    timeout: 15000,
    maxRetries: 3,
    retryDelay: 1000,
    requireConfirmation: true,
    logExecution: true,
    trackMetrics: true
  },
  read_note: {
    timeout: 10000,
    maxRetries: 2,
    retryDelay: 500,
    requireConfirmation: false,
    logExecution: true,
    trackMetrics: false
  },
  open_ui: {
    timeout: 5000,
    maxRetries: 1,
    retryDelay: 0,
    requireConfirmation: false,
    logExecution: false,
    trackMetrics: false
  }
};

// Tool Validation Rules
export const TOOL_VALIDATION_RULES = {
  get_current_time: {
    arguments: {
      format: {
        type: 'string',
        enum: ['iso', 'human', 'timestamp'],
        default: 'human',
        description: 'Time format to return'
      }
    }
  },
  calculate: {
    arguments: {
      expression: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 500,
        pattern: /^[0-9+\-*/().\s]+$/,
        description: 'Mathematical expression to evaluate'
      }
    }
  },
  save_note: {
    arguments: {
      title: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        description: 'Note title'
      },
      content: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 10000,
        description: 'Note content'
      }
    }
  },
  read_note: {
    arguments: {
      title: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
        description: 'Note title to read'
      }
    }
  },
  open_ui: {
    arguments: {
      component: {
        type: 'string',
        required: true,
        enum: ['settings', 'help', 'about'],
        description: 'UI component to open'
      }
    }
  }
};

// Tool Help Text
export const TOOL_HELP_TEXT = {
  get_current_time: {
    short: 'Get current time',
    long: 'Retrieves the current date and time. You can specify the format: "iso" for ISO format, "human" for readable format, or "timestamp" for Unix timestamp.',
    examples: [
      'get_current_time()',
      'get_current_time({ format: "iso" })',
      'get_current_time({ format: "human" })'
    ],
    inputs: 'Optional: format (string) - "iso", "human", or "timestamp"',
    outputs: 'currentTime (string), timestamp (number)',
    useCases: 'Time-sensitive operations, logging, scheduling, current time queries'
  },
  calculate: {
    short: 'Perform calculations',
    long: 'Evaluates mathematical expressions. Supports basic arithmetic operations, parentheses, and common mathematical functions.',
    examples: [
      'calculate({ expression: "2 + 2" })',
      'calculate({ expression: "(10 * 5) / 2" })',
      'calculate({ expression: "sqrt(16)" })'
    ],
    inputs: 'Required: expression (string) - Mathematical expression to evaluate',
    outputs: 'result (number), expression (string)',
    useCases: 'Quick calculations, math homework help, financial calculations, equation solving'
  },
  save_note: {
    short: 'Save a note',
    long: 'Saves a note with a title and content to your local storage. Notes are private and only accessible to you.',
    examples: [
      'save_note({ title: "Meeting Notes", content: "Discuss project timeline" })',
      'save_note({ title: "Todo", content: "1. Buy groceries\n2. Call dentist" })'
    ],
    inputs: 'Required: title (string), content (string)',
    outputs: 'success (boolean), noteId (string), savedAt (string)',
    useCases: 'Meeting notes, to-do lists, idea storage, personal reminders, information persistence'
  },
  read_note: {
    short: 'Read a note',
    long: 'Retrieves a previously saved note by its title. Returns the note content if found.',
    examples: [
      'read_note({ title: "Meeting Notes" })',
      'read_note({ title: "Todo" })'
    ],
    inputs: 'Required: title (string) - Exact title of the note to retrieve',
    outputs: 'found (boolean), note (object), message (string)',
    useCases: 'Retrieving saved information, accessing previous notes, reviewing stored content'
  },
  open_ui: {
    short: 'Open UI component',
    long: 'Opens a specific UI component like settings, help, or about panels.',
    examples: [
      'open_ui({ component: "settings" })',
      'open_ui({ component: "help" })',
      'open_ui({ component: "about" })'
    ],
    inputs: 'Required: component (string) - "settings", "help", or "about"',
    outputs: 'success (boolean), component (string), message (string)',
    useCases: 'Opening settings for configuration, displaying help documentation, showing about information'
  }
};

// Export all tool configurations
export const ALL_TOOLS = Object.keys(TOOL_CONFIG);
export const ENABLED_TOOLS = ALL_TOOLS.filter(tool => TOOL_CONFIG[tool].enabled);
export const TOOLS_BY_CATEGORY = Object.entries(TOOL_CATEGORIES).map(([key, category]) => ({
  ...category,
  tools: ENABLED_TOOLS.filter(tool => TOOL_CONFIG[tool].category === key)
}));

export default TOOL_CONFIG;

/**
 * Command bindings schema - source of truth for all commands
 * Settings UI reads this; components provide handlers
 */
import { defineSchema, createBindingsStore } from 'keybinds';

export const schema = defineSchema({
  // Selection
  deselect: {
    label: 'Deselect',
    category: 'Selection',
    keys: ['Escape']
  },
  selectAll: {
    label: 'Select all',
    category: 'Selection',
    keys: ['$mod+a']
  },

  // Edit
  delete: {
    label: 'Delete',
    category: 'Edit',
    keys: ['Backspace', 'Delete']
  },

  // Canvas
  pan: {
    label: 'Pan canvas',
    category: 'Canvas',
    mouse: ['MiddleClick']
  },

  // UI
  commandPalette: {
    label: 'Command palette',
    category: 'UI',
    keys: ['$mod+k']
  },
  settings: {
    label: 'Keyboard shortcuts',
    category: 'UI',
    keys: ['$mod+,']
  }
});

// Reactive bindings store
export const bindingsStore = createBindingsStore(schema, 'lotus:keybinds');

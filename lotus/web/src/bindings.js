/**
 * Command bindings schema - source of truth for all commands
 * Settings UI reads this; components provide handlers
 */
import { defineSchema, mergeBindings } from 'keybinds'

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
  }
})

// Load user overrides
function loadUserBindings() {
  try {
    return JSON.parse(localStorage.getItem('lotus:keybinds') || '{}')
  } catch {
    return {}
  }
}

// Save user overrides
export function saveUserBindings(overrides) {
  localStorage.setItem('lotus:keybinds', JSON.stringify(overrides))
}

// Merged bindings (schema + user overrides)
export const bindings = mergeBindings(schema, loadUserBindings())

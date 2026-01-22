/**
 * keybinds - Declarative contextual keybindings
 *
 * Commands as data, context as state, zero dependencies.
 * Supports keyboard and mouse bindings.
 */

/**
 * @typedef {Object} Modifiers
 * @property {boolean} ctrl
 * @property {boolean} alt
 * @property {boolean} shift
 * @property {boolean} meta
 */

/**
 * @typedef {Object} ParsedKey
 * @property {Modifiers} mods
 * @property {string} key
 */

/**
 * @typedef {Object} ParsedMouse
 * @property {Modifiers} mods
 * @property {number} button
 */

/**
 * @typedef {Object} Command
 * @property {string} id - Unique identifier
 * @property {string} label - Display name
 * @property {string | undefined} [category] - Group for command palette
 * @property {string[] | undefined} [keys] - Keyboard triggers
 * @property {string[] | undefined} [mouse] - Mouse triggers
 * @property {((ctx: Record<string, unknown>) => boolean) | undefined} [when] - Activation condition
 * @property {(ctx: Record<string, unknown>, event?: Event) => unknown} execute - Action
 * @property {boolean | undefined} [hidden] - Hide from search
 * @property {boolean | undefined} [captureInput] - Fire even in input fields
 */

/**
 * @typedef {Command & { active: boolean, score: number }} ScoredCommand
 */

/**
 * Detect Mac platform
 */
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/**
 * Parse modifiers from a binding string
 * @param {string[]} parts
 * @returns {{ mods: Modifiers, remaining: string[] }}
 */
function parseMods(parts) {
  const mods = { ctrl: false, alt: false, shift: false, meta: false }
  const remaining = []

  for (const part of parts) {
    if (part === 'ctrl' || part === 'control') mods.ctrl = true
    else if (part === 'alt' || part === 'option') mods.alt = true
    else if (part === 'shift') mods.shift = true
    else if (part === 'meta' || part === 'cmd' || part === 'command') mods.meta = true
    else if (part === '$mod') {
      if (isMac) mods.meta = true
      else mods.ctrl = true
    }
    else remaining.push(part)
  }

  return { mods, remaining }
}

// Valid key names (subset - common ones)
const VALID_KEYS = new Set([
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
  'escape', 'enter', 'tab', 'space', 'backspace', 'delete', 'insert',
  'home', 'end', 'pageup', 'pagedown',
  'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'up', 'down', 'left', 'right',
  '[', ']', '\\', ';', "'", ',', '.', '/', '`', '-', '=',
  'bracketleft', 'bracketright', 'backslash', 'semicolon', 'quote',
  'comma', 'period', 'slash', 'backquote', 'minus', 'equal'
])

const VALID_MOUSE = new Set([
  'click', 'leftclick', 'left',
  'rightclick', 'right',
  'middleclick', 'middle'
])

/**
 * Parse a key string like "Ctrl+Shift+K" into normalized form
 * @param {string} keyStr
 * @returns {ParsedKey}
 * @throws {Error} if key binding is invalid
 */
function parseKey(keyStr) {
  if (!keyStr || typeof keyStr !== 'string') {
    throw new Error(`Invalid key binding: ${keyStr}`)
  }

  const parts = keyStr.toLowerCase().split('+').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    throw new Error(`Empty key binding: "${keyStr}"`)
  }

  const { mods, remaining } = parseMods(parts)

  const key = remaining[0]
  if (key === undefined) {
    throw new Error(`Key binding has no key (only modifiers): "${keyStr}"`)
  }
  if (remaining.length > 1) {
    throw new Error(`Key binding has multiple keys: "${keyStr}" (got: ${remaining.join(', ')})`)
  }
  if (!VALID_KEYS.has(key)) {
    throw new Error(`Unknown key "${key}" in binding "${keyStr}"`)
  }

  return { mods, key }
}

/**
 * Parse a mouse binding like "$mod+Click" or "MiddleClick"
 * Supported: Click/LeftClick, RightClick, MiddleClick
 * @param {string} binding
 * @returns {ParsedMouse}
 * @throws {Error} if mouse binding is invalid
 */
function parseMouse(binding) {
  if (!binding || typeof binding !== 'string') {
    throw new Error(`Invalid mouse binding: ${binding}`)
  }

  const parts = binding.toLowerCase().split('+').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    throw new Error(`Empty mouse binding: "${binding}"`)
  }

  const { mods, remaining } = parseMods(parts)

  const btn = remaining[0]
  if (btn === undefined) {
    throw new Error(`Mouse binding has no button (only modifiers): "${binding}"`)
  }
  if (remaining.length > 1) {
    throw new Error(`Mouse binding has multiple buttons: "${binding}"`)
  }
  if (!VALID_MOUSE.has(btn)) {
    throw new Error(`Unknown mouse button "${btn}" in binding "${binding}". Valid: Click, RightClick, MiddleClick`)
  }

  let button = 0 // left
  if (btn === 'rightclick' || btn === 'right') button = 2
  else if (btn === 'middleclick' || btn === 'middle') button = 1

  return { mods, button }
}

const BUTTON_NAMES = ['click', 'middle', 'right']

/**
 * Normalize modifiers to canonical prefix (e.g., "ctrl+alt+")
 * @param {Modifiers} mods
 * @returns {string}
 */
function modsToPrefix(mods) {
  let s = ''
  if (mods.ctrl) s += 'ctrl+'
  if (mods.alt) s += 'alt+'
  if (mods.shift) s += 'shift+'
  if (mods.meta) s += 'meta+'
  return s
}

/**
 * Convert parsed key to lookup key (e.g., "ctrl+shift+k")
 * @param {ParsedKey} parsed
 * @returns {string}
 */
function keyToLookup(parsed) {
  return `${modsToPrefix(parsed.mods)}${parsed.key}`
}

/**
 * Convert keyboard event to lookup keys (returns multiple for key/code variants)
 * @param {KeyboardEvent} event
 * @returns {string[]}
 */
function eventToKeyLookups(event) {
  const prefix = modsToPrefix({
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey
  })
  const key = event.key.toLowerCase()
  const code = event.code.toLowerCase()
  const codeKey = code.startsWith('key') ? code.slice(3) : null

  const lookups = [`${prefix}${key}`]
  if (code !== key) lookups.push(`${prefix}${code}`)
  if (codeKey && codeKey !== key) lookups.push(`${prefix}${codeKey}`)
  return lookups
}

/**
 * Convert parsed mouse binding to lookup key (e.g., "ctrl+click", "middle")
 * @param {ParsedMouse} parsed
 * @returns {string}
 */
function mouseToLookup(parsed) {
  return `${modsToPrefix(parsed.mods)}${BUTTON_NAMES[parsed.button] || 'click'}`
}

/**
 * Convert mouse event to lookup key
 * @param {MouseEvent} event
 * @returns {string}
 */
function eventToMouseLookup(event) {
  const prefix = modsToPrefix({
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey
  })
  return `${prefix}${BUTTON_NAMES[event.button] || 'click'}`
}

/**
 * Build lookup tables for O(1) dispatch
 * @param {Command[]} commands
 * @returns {{ keys: Map<string, Command[]>, mouse: Map<string, Command[]> }}
 */
function buildLookupTables(commands) {
  /** @type {Map<string, Command[]>} */
  const keys = new Map()
  /** @type {Map<string, Command[]>} */
  const mouse = new Map()

  for (const cmd of commands) {
    if (cmd.keys) {
      for (const key of cmd.keys) {
        const lookup = keyToLookup(parseKey(key))
        const list = keys.get(lookup)
        if (list) list.push(cmd)
        else keys.set(lookup, [cmd])
      }
    }
    if (cmd.mouse) {
      for (const binding of cmd.mouse) {
        const lookup = mouseToLookup(parseMouse(binding))
        const list = mouse.get(lookup)
        if (list) list.push(cmd)
        else mouse.set(lookup, [cmd])
      }
    }
  }

  return { keys, mouse }
}

/**
 * Check if a command is active given current context
 * @param {Command} command
 * @param {Record<string, unknown>} context
 * @returns {boolean}
 */
function isActive(command, context) {
  if (!command.when) return true
  return command.when(context)
}

/**
 * Create keybind handler
 *
 * @param {Command[]} commands - Array of command definitions
 * @param {() => Record<string, unknown>} [getContext] - Returns current context state
 * @param {{ target?: EventTarget, onExecute?: (cmd: Command, ctx: Record<string, unknown>) => void }} [options] - Options
 *
 * Command shape:
 *   id: string           - unique identifier
 *   label: string        - display name
 *   category?: string    - group for command palette
 *   keys?: string[]      - keyboard triggers (e.g., ['$mod+k', 'Escape'])
 *   mouse?: string[]     - mouse triggers (e.g., ['$mod+Click', 'MiddleClick'])
 *   when?: ctx => bool   - activation condition
 *   execute: ctx => any  - action (return false to propagate)
 *   hidden?: bool        - hide from search
 *   captureInput?: bool  - fire even when in input fields
 *
 * @example
 * const cleanup = keybinds([
 *   {
 *     id: 'delete',
 *     label: 'Delete selected',
 *     category: 'Edit',
 *     keys: ['Backspace', 'Delete'],
 *     when: ctx => ctx.hasSelection && !ctx.isEditing,
 *     execute: () => deleteSelected()  // return false to propagate
 *   },
 *   {
 *     id: 'pan',
 *     label: 'Pan canvas',
 *     category: 'Canvas',
 *     mouse: ['MiddleClick'],
 *     execute: () => startPan()
 *   }
 * ], () => ({
 *   hasSelection: selectedId() !== null,
 *   isEditing: editingId() !== null
 * }))
 * @returns {() => void} Cleanup function
 */
export function keybinds(commands, getContext = () => ({}), options = {}) {
  const { target = window, onExecute } = options

  // Build lookup tables for O(1) dispatch
  const lookup = buildLookupTables(commands)

  /**
   * @param {Command} cmd
   * @param {Record<string, unknown>} context
   * @param {KeyboardEvent | MouseEvent} event
   * @returns {boolean}
   */
  function tryExecute(cmd, context, event) {
    const result = cmd.execute(context, event)
    // Return false from execute to propagate (not consume)
    if (result !== false) {
      event.preventDefault()
      event.stopPropagation()
      onExecute?.(cmd, context)
      return true
    }
    return false
  }

  /** @param {Event} e */
  function handleKeyDown(e) {
    const event = /** @type {KeyboardEvent} */ (e)
    const tgt = /** @type {Element | null} */ (event.target)
    // Don't capture when typing in inputs (unless command explicitly allows it)
    const inInput = tgt?.tagName === 'INPUT' ||
                    tgt?.tagName === 'TEXTAREA' ||
                    (tgt instanceof HTMLElement && tgt.isContentEditable)

    // O(1) lookup - try all key variants (key, code, codeKey)
    const lookups = eventToKeyLookups(event)
    /** @type {Command[] | undefined} */
    let candidates
    for (const l of lookups) {
      candidates = lookup.keys.get(l)
      if (candidates) break
    }
    if (!candidates) return

    const context = getContext()
    for (const cmd of candidates) {
      if (inInput && !cmd.captureInput) continue
      if (!isActive(cmd, context)) continue
      if (tryExecute(cmd, context, event)) return
    }
  }

  /** @param {Event} e */
  function handleMouseDown(e) {
    const event = /** @type {MouseEvent} */ (e)

    // O(1) lookup
    const candidates = lookup.mouse.get(eventToMouseLookup(event))
    if (!candidates) return

    const context = getContext()
    for (const cmd of candidates) {
      if (!isActive(cmd, context)) continue
      if (tryExecute(cmd, context, event)) return
    }
  }

  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('mousedown', handleMouseDown)

  // Return cleanup function
  return () => {
    target.removeEventListener('keydown', handleKeyDown)
    target.removeEventListener('mousedown', handleMouseDown)
  }
}

/**
 * Check if a command has any bindings
 * @param {Command} cmd
 * @returns {boolean}
 */
function hasBoundKeys(cmd) {
  return Boolean((cmd.keys && cmd.keys.length > 0) || (cmd.mouse && cmd.mouse.length > 0))
}

/**
 * Dedupe commands by ID (last wins - for registration order / inner scope)
 * @param {Command[]} commands
 * @returns {Command[]}
 */
function dedupeCommands(commands) {
  /** @type {Map<string, Command>} */
  const seen = new Map()
  for (const cmd of commands) {
    seen.set(cmd.id, cmd)  // last one wins
  }
  return Array.from(seen.values())
}

/**
 * Search commands for command palette
 *
 * - Dedupes by ID (last registration wins - inner scope shadows outer)
 * - Hides commands with no bindings (no keys and no mouse)
 *
 * @param {Command[]} commands - Array of command definitions
 * @param {string} query - Search query
 * @param {Record<string, unknown>} [context] - Current context
 * @returns {ScoredCommand[]} Matching commands sorted by relevance (active first, then by score)
 */
export function searchCommands(commands, query, context = {}) {
  const q = query.toLowerCase()
  const results = []

  for (const cmd of dedupeCommands(commands)) {
    if (cmd.hidden) continue
    if (!hasBoundKeys(cmd)) continue  // hide unbound

    const label = cmd.label.toLowerCase()
    const id = cmd.id.toLowerCase()
    const category = (cmd.category || '').toLowerCase()

    let score = 0
    if (label.startsWith(q)) score = 3
    else if (id.startsWith(q)) score = 2
    else if (category.startsWith(q)) score = 2
    else if (label.includes(q) || id.includes(q) || category.includes(q)) score = 1
    else continue

    results.push({
      ...cmd,
      active: isActive(cmd, context),
      score
    })
  }

  return results.sort((a, b) => {
    if (a.active !== b.active) return (b.active ? 1 : 0) - (a.active ? 1 : 0)
    return b.score - a.score
  })
}

/**
 * Group commands by category
 *
 * - Dedupes by ID (last registration wins)
 * - Hides commands with no bindings
 *
 * @param {Command[]} commands - Array of command definitions
 * @param {Record<string, unknown>} [context] - Current context (for active state)
 * @returns {Record<string, (Command & { active: boolean })[]>} Commands grouped by category
 */
export function groupByCategory(commands, context = {}) {
  /** @type {Record<string, (Command & { active: boolean })[]>} */
  const groups = {}

  for (const cmd of dedupeCommands(commands)) {
    if (cmd.hidden) continue
    if (!hasBoundKeys(cmd)) continue  // hide unbound
    const cat = cmd.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push({
      ...cmd,
      active: isActive(cmd, context)
    })
  }

  return groups
}

/**
 * Validate all commands upfront (call on init to catch typos early)
 * @param {Command[]} commands
 * @returns {true}
 * @throws {Error} if any binding is invalid
 */
export function validateCommands(commands) {
  for (const cmd of commands) {
    if (!cmd.id) {
      throw new Error('Command missing id')
    }
    if (cmd.keys) {
      for (const key of cmd.keys) {
        try {
          parseKey(key)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          throw new Error(`Command "${cmd.id}": ${msg}`)
        }
      }
    }
    if (cmd.mouse) {
      for (const binding of cmd.mouse) {
        try {
          parseMouse(binding)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          throw new Error(`Command "${cmd.id}": ${msg}`)
        }
      }
    }
  }
  return true
}

/**
 * Execute a command by id
 * @param {Command[]} commands
 * @param {string} id
 * @param {Record<string, unknown>} [context]
 * @returns {boolean}
 */
export function executeCommand(commands, id, context = {}) {
  const cmd = commands.find(c => c.id === id)
  if (cmd && isActive(cmd, context)) {
    cmd.execute(context)
    return true
  }
  return false
}

/**
 * Format key for display (e.g., "$mod+k" -> "⌘K" on Mac)
 * @param {string} key
 * @returns {string}
 */
export function formatKey(key) {
  return key
    .replace(/\$mod/gi, isMac ? '⌘' : 'Ctrl')
    .replace(/ctrl/gi, isMac ? '⌃' : 'Ctrl')
    .replace(/alt/gi, isMac ? '⌥' : 'Alt')
    .replace(/shift/gi, isMac ? '⇧' : 'Shift')
    .replace(/meta|cmd|command/gi, '⌘')
    .replace(/\+/g, '')
    .replace(/backspace/gi, '⌫')
    .replace(/delete/gi, '⌦')
    .replace(/escape/gi, 'Esc')
    .replace(/enter/gi, '↵')
    .toUpperCase()
}

/**
 * @typedef {Object} BindingSchema
 * @property {string} label - Display name
 * @property {string | undefined} [category] - Group for command palette
 * @property {string[] | undefined} [keys] - Default keyboard triggers
 * @property {string[] | undefined} [mouse] - Default mouse triggers
 * @property {boolean | undefined} [hidden] - Hide from search/settings
 */

/**
 * @typedef {Record<string, BindingSchema>} Schema
 */

/**
 * Define a binding schema (identity function for type inference/autocomplete)
 * @template {Schema} T
 * @param {T} schema
 * @returns {T}
 */
export function defineSchema(schema) {
  return schema
}

/**
 * @typedef {Record<string, { keys?: string[], mouse?: string[] }>} BindingOverrides
 */

/**
 * Merge schema with user overrides
 * @param {Schema} schema - Default bindings
 * @param {BindingOverrides} overrides - User customizations
 * @returns {Schema} Merged bindings
 */
export function mergeBindings(schema, overrides) {
  /** @type {Schema} */
  const result = {}
  for (const [id, binding] of Object.entries(schema)) {
    const override = overrides[id]
    result[id] = override
      ? { ...binding, keys: override.keys ?? binding.keys, mouse: override.mouse ?? binding.mouse }
      : binding
  }
  return result
}

/**
 * Create commands from bindings + handlers
 * Handlers only need to implement commands they care about
 *
 * @param {Schema} bindings - Binding definitions (from schema + overrides)
 * @param {Record<string, (ctx: Record<string, unknown>, event?: Event) => unknown>} handlers - Handler implementations
 * @param {Record<string, { when?: (ctx: Record<string, unknown>) => boolean, captureInput?: boolean }>} [options] - Per-command options
 * @returns {Command[]}
 */
export function fromBindings(bindings, handlers, options = {}) {
  /** @type {Command[]} */
  const commands = []

  for (const [id, handler] of Object.entries(handlers)) {
    const binding = bindings[id]
    if (!binding) {
      console.warn(`keybinds: handler "${id}" has no matching binding`)
      continue
    }

    commands.push({
      id,
      label: binding.label,
      category: binding.category,
      keys: binding.keys,
      mouse: binding.mouse,
      hidden: binding.hidden,
      execute: handler,
      ...options[id]
    })
  }

  return commands
}

/**
 * Get all bindings as a flat list (for settings UI)
 * @param {Schema} schema
 * @returns {Array<BindingSchema & { id: string }>}
 */
export function listBindings(schema) {
  return Object.entries(schema)
    .filter(([, b]) => !b.hidden)
    .map(([id, binding]) => ({ id, ...binding }))
}

/**
 * @template {Schema} T
 * @typedef {{ bindings: T, overrides: BindingOverrides }} BindingsChangeDetail
 */

/**
 * @template {Schema} T
 * @typedef {CustomEvent<BindingsChangeDetail<T>>} BindingsChangeEvent
 */

/**
 * @template {Schema} T
 * @typedef {Object} BindingsStore
 * @property {() => T} get - Get current bindings
 * @property {(overrides: BindingOverrides) => void} save - Save overrides and dispatch 'change' event
 * @property {() => BindingOverrides} getOverrides - Get current overrides only
 * @property {(type: 'change', listener: (ev: BindingsChangeEvent<T>) => void, options?: boolean | AddEventListenerOptions) => void} addEventListener
 * @property {(type: 'change', listener: (ev: BindingsChangeEvent<T>) => void, options?: boolean | EventListenerOptions) => void} removeEventListener
 * @property {(event: BindingsChangeEvent<T>) => boolean} dispatchEvent
 */

/**
 * Create a reactive bindings store with localStorage persistence
 *
 * @template {Schema} T
 * @param {T} schema - Default bindings schema
 * @param {string} storageKey - localStorage key
 * @returns {BindingsStore<T>}
 *
 * @example
 * const store = createBindingsStore(schema, 'myapp:keybinds')
 *
 * // Get current bindings (merged schema + overrides)
 * const bindings = store.get()
 *
 * // Subscribe to changes
 * store.addEventListener('change', (ev) => {
 *   console.log(ev.detail.bindings) // fully typed
 * })
 *
 * // Save new overrides (dispatches 'change' event)
 * store.save({ delete: { keys: ['$mod+d'] } })
 */
export function createBindingsStore(schema, storageKey) {
  const target = new EventTarget()

  /** @returns {BindingOverrides} */
  function loadOverrides() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
      return {}
    }
  }

  /** @type {BindingOverrides} */
  let overrides = loadOverrides()
  /** @type {T} */
  let bindings = /** @type {T} */ (mergeBindings(schema, overrides))

  return {
    get: () => bindings,
    getOverrides: () => overrides,
    addEventListener: /** @type {BindingsStore<T>['addEventListener']} */ (
      (type, listener, options) => target.addEventListener(type, /** @type {EventListener} */ (listener), options)
    ),
    removeEventListener: /** @type {BindingsStore<T>['removeEventListener']} */ (
      (type, listener, options) => target.removeEventListener(type, /** @type {EventListener} */ (listener), options)
    ),
    dispatchEvent: (event) => target.dispatchEvent(event),
    save(newOverrides) {
      overrides = newOverrides
      localStorage.setItem(storageKey, JSON.stringify(overrides))
      bindings = /** @type {T} */ (mergeBindings(schema, overrides))
      target.dispatchEvent(new CustomEvent('change', {
        detail: { bindings, overrides }
      }))
    }
  }
}

export default keybinds

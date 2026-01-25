/**
 * keybinds/components - Unstyled web components for keybind UI
 *
 * Framework-agnostic command palette and cheatsheet.
 * BEM classes for styling hooks - bring your own CSS.
 */

import { searchCommands, groupByCategory, formatKey, executeCommand } from './index.js'

/**
 * <command-palette> - Search-driven command execution
 *
 * Attributes:
 *   open         - Show/hide the palette
 *   auto-trigger - Enable default $mod+K trigger
 *
 * Properties:
 *   commands: Command[]     - Array of command definitions
 *   context: object         - Context for `when` checks
 *   open: boolean           - Show/hide the palette
 *
 * Events:
 *   execute - Fired when command is executed (detail: { command })
 *   close   - Fired when palette is dismissed
 *
 * BEM classes:
 *   .palette
 *   .palette__backdrop
 *   .palette__dialog
 *   .palette__input
 *   .palette__list
 *   .palette__item
 *   .palette__item--active
 *   .palette__item--disabled
 *   .palette__item-label
 *   .palette__item-category
 *   .palette__item-key
 *   .palette__empty
 */
export class CommandPalette extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'auto-trigger']
  }

  constructor() {
    super()
    /** @type {import('./index.js').Command[]} */
    this._commands = []
    /** @type {Record<string, unknown>} */
    this._context = {}
    /** @type {import('./index.js').ScoredCommand[]} */
    this._results = []
    /** @type {number} */
    this._activeIndex = 0
    /** @type {(() => void) | null} */
    this._cleanupTrigger = null

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; }
        :host([open]) { display: block; }
        * { box-sizing: border-box; }
      </style>
      <div class="palette" part="palette">
        <div class="palette__backdrop" part="backdrop"></div>
        <div class="palette__dialog" part="dialog" role="dialog" aria-modal="true">
          <input
            class="palette__input"
            part="input"
            type="text"
            placeholder="Type a command..."
            autocomplete="off"
            spellcheck="false"
          />
          <ul class="palette__list" part="list" role="listbox"></ul>
        </div>
      </div>
    `

    this._backdrop = this.shadowRoot.querySelector('.palette__backdrop')
    this._input = this.shadowRoot.querySelector('.palette__input')
    this._list = this.shadowRoot.querySelector('.palette__list')

    this._backdrop.addEventListener('click', () => this._close())
    this._input.addEventListener('input', () => this._search())
    this._input.addEventListener('keydown', (e) => this._handleKey(e))
  }

  get commands() { return this._commands }
  set commands(val) {
    this._commands = val || []
    if (this.open) this._search()
  }

  get context() { return this._context }
  set context(val) {
    this._context = val || {}
    if (this.open) this._search()
  }

  get open() { return this.hasAttribute('open') }
  set open(val) {
    if (val) this.setAttribute('open', '')
    else this.removeAttribute('open')
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open') {
      if (newVal !== null) this._onOpen()
      else this._onClose()
    } else if (name === 'auto-trigger') {
      this._setupAutoTrigger(newVal !== null)
    }
  }

  connectedCallback() {
    if (this.hasAttribute('auto-trigger')) {
      this._setupAutoTrigger(true)
    }
  }

  disconnectedCallback() {
    this._setupAutoTrigger(false)
  }

  /** @param {boolean} enable */
  _setupAutoTrigger(enable) {
    if (this._cleanupTrigger) {
      this._cleanupTrigger()
      this._cleanupTrigger = null
    }
    if (!enable) return

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform)

    /** @param {KeyboardEvent} e */
    const handler = (e) => {
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        this.open = !this.open
      }
    }

    window.addEventListener('keydown', handler)
    this._cleanupTrigger = () => window.removeEventListener('keydown', handler)
  }

  _onOpen() {
    this._input.value = ''
    this._activeIndex = 0
    this._search()
    requestAnimationFrame(() => this._input.focus())
  }

  _onClose() {
    this._input.blur()
  }

  _close() {
    this.open = false
    this.dispatchEvent(new CustomEvent('close'))
  }

  _search() {
    const query = this._input.value
    this._results = query
      ? searchCommands(this._commands, query, this._context)
      : this._getAllVisible()
    this._activeIndex = Math.min(this._activeIndex, Math.max(0, this._results.length - 1))
    this._render()
  }

  _getAllVisible() {
    // Show all non-hidden commands when no query
    return this._commands
      .filter(cmd => !cmd.hidden && ((cmd.keys && cmd.keys.length) || (cmd.mouse && cmd.mouse.length)))
      .map(cmd => ({
        ...cmd,
        active: !cmd.when || cmd.when(this._context),
        score: 0
      }))
  }

  _render() {
    this._list.innerHTML = ''
    if (this._results.length === 0) {
      const empty = document.createElement('li')
      empty.className = 'palette__empty'
      empty.setAttribute('part', 'empty')
      empty.textContent = 'No commands found'
      this._list.appendChild(empty)
      return
    }

    this._results.forEach((cmd, i) => {
      const li = document.createElement('li')
      li.className = 'palette__item'
      if (i === this._activeIndex) li.className += ' palette__item--active'
      if (!cmd.active) li.className += ' palette__item--disabled'
      li.setAttribute('part', `item${i === this._activeIndex ? ' item-active' : ''}${!cmd.active ? ' item-disabled' : ''}`)
      li.setAttribute('role', 'option')
      li.setAttribute('aria-selected', i === this._activeIndex ? 'true' : 'false')
      li.dataset.index = String(i)

      const label = document.createElement('span')
      label.className = 'palette__item-label'
      label.setAttribute('part', 'item-label')
      label.textContent = cmd.label

      li.appendChild(label)

      if (cmd.category) {
        const cat = document.createElement('span')
        cat.className = 'palette__item-category'
        cat.setAttribute('part', 'item-category')
        cat.textContent = cmd.category
        li.appendChild(cat)
      }

      if (cmd.keys && cmd.keys[0]) {
        const key = document.createElement('kbd')
        key.className = 'palette__item-key'
        key.setAttribute('part', 'item-key')
        key.textContent = formatKey(cmd.keys[0])
        li.appendChild(key)
      }

      li.addEventListener('click', () => this._execute(i))
      li.addEventListener('mouseenter', () => {
        this._activeIndex = i
        this._render()
      })

      this._list.appendChild(li)
    })
  }

  /** @param {KeyboardEvent} e */
  _handleKey(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        this._activeIndex = Math.min(this._activeIndex + 1, this._results.length - 1)
        this._render()
        this._scrollToActive()
        break
      case 'ArrowUp':
        e.preventDefault()
        this._activeIndex = Math.max(this._activeIndex - 1, 0)
        this._render()
        this._scrollToActive()
        break
      case 'Enter':
        e.preventDefault()
        this._execute(this._activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        this._close()
        break
    }
  }

  _scrollToActive() {
    const active = this._list.querySelector('.palette__item--active')
    if (active) active.scrollIntoView({ block: 'nearest' })
  }

  /** @param {number} index */
  _execute(index) {
    const cmd = this._results[index]
    if (!cmd || !cmd.active) return

    this._close()
    executeCommand(this._commands, cmd.id, this._context)
    this.dispatchEvent(new CustomEvent('execute', { detail: { command: cmd } }))
  }
}

/**
 * <keybind-cheatsheet> - Grouped display of available bindings
 *
 * Attributes:
 *   open         - Show/hide the cheatsheet
 *   auto-trigger - Enable hold-Control trigger (400ms delay)
 *
 * Properties:
 *   commands: Command[]     - Array of command definitions
 *   context: object         - Context for `when` checks (grays out inactive)
 *   open: boolean           - Show/hide the cheatsheet
 *
 * Events:
 *   close - Fired when cheatsheet is dismissed
 *
 * BEM classes:
 *   .cheatsheet
 *   .cheatsheet__backdrop
 *   .cheatsheet__dialog
 *   .cheatsheet__group
 *   .cheatsheet__group-title
 *   .cheatsheet__list
 *   .cheatsheet__item
 *   .cheatsheet__item--disabled
 *   .cheatsheet__item-label
 *   .cheatsheet__item-key
 */
export class KeybindCheatsheet extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'auto-trigger']
  }

  constructor() {
    super()
    /** @type {import('./index.js').Command[]} */
    this._commands = []
    /** @type {Record<string, unknown>} */
    this._context = {}
    /** @type {(() => void) | null} */
    this._cleanupTrigger = null

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: none; }
        :host([open]) { display: block; }
        * { box-sizing: border-box; }
      </style>
      <div class="cheatsheet" part="cheatsheet">
        <div class="cheatsheet__backdrop" part="backdrop"></div>
        <div class="cheatsheet__dialog" part="dialog" role="dialog" aria-modal="true"></div>
      </div>
    `

    this._backdrop = this.shadowRoot.querySelector('.cheatsheet__backdrop')
    this._dialog = this.shadowRoot.querySelector('.cheatsheet__dialog')

    this._backdrop.addEventListener('click', () => this._close())
  }

  get commands() { return this._commands }
  set commands(val) {
    this._commands = val || []
    if (this.open) this._render()
  }

  get context() { return this._context }
  set context(val) {
    this._context = val || {}
    if (this.open) this._render()
  }

  get open() { return this.hasAttribute('open') }
  set open(val) {
    if (val) this.setAttribute('open', '')
    else this.removeAttribute('open')
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'open' && newVal !== null) {
      this._render()
    } else if (name === 'auto-trigger') {
      this._setupAutoTrigger(newVal !== null)
    }
  }

  connectedCallback() {
    if (this.hasAttribute('auto-trigger')) {
      this._setupAutoTrigger(true)
    }
  }

  disconnectedCallback() {
    this._setupAutoTrigger(false)
  }

  /** @param {boolean} enable */
  _setupAutoTrigger(enable) {
    if (this._cleanupTrigger) {
      this._cleanupTrigger()
      this._cleanupTrigger = null
    }
    if (!enable) return

    this._cleanupTrigger = onModifierHold('Control', (held) => {
      this.open = held
    }, { delay: 400 })
  }

  _close() {
    this.open = false
    this.dispatchEvent(new CustomEvent('close'))
  }

  _render() {
    const groups = groupByCategory(this._commands, this._context)
    this._dialog.innerHTML = ''

    for (const [category, cmds] of Object.entries(groups)) {
      const group = document.createElement('div')
      group.className = 'cheatsheet__group'
      group.setAttribute('part', 'group')

      const title = document.createElement('div')
      title.className = 'cheatsheet__group-title'
      title.setAttribute('part', 'group-title')
      title.textContent = category
      group.appendChild(title)

      const list = document.createElement('ul')
      list.className = 'cheatsheet__list'
      list.setAttribute('part', 'list')

      for (const cmd of cmds) {
        const li = document.createElement('li')
        li.className = 'cheatsheet__item'
        if (!cmd.active) li.className += ' cheatsheet__item--disabled'
        li.setAttribute('part', `item${!cmd.active ? ' item-disabled' : ''}`)

        const label = document.createElement('span')
        label.className = 'cheatsheet__item-label'
        label.setAttribute('part', 'item-label')
        label.textContent = cmd.label
        li.appendChild(label)

        const keys = document.createElement('span')
        keys.className = 'cheatsheet__item-keys'
        keys.setAttribute('part', 'item-keys')

        // Show all key bindings
        if (cmd.keys) {
          for (const k of cmd.keys) {
            const kbd = document.createElement('kbd')
            kbd.className = 'cheatsheet__item-key'
            kbd.setAttribute('part', 'item-key')
            kbd.textContent = formatKey(k)
            keys.appendChild(kbd)
          }
        }
        // Show mouse bindings
        if (cmd.mouse) {
          for (const m of cmd.mouse) {
            const kbd = document.createElement('kbd')
            kbd.className = 'cheatsheet__item-key'
            kbd.setAttribute('part', 'item-key')
            kbd.textContent = formatMouse(m)
            keys.appendChild(kbd)
          }
        }

        li.appendChild(keys)
        list.appendChild(li)
      }

      group.appendChild(list)
      this._dialog.appendChild(group)
    }
  }
}

/**
 * Format mouse binding for display
 * @param {string} binding
 * @returns {string}
 */
function formatMouse(binding) {
  return binding
    .replace(/\$mod/gi, typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl')
    .replace(/ctrl/gi, typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌃' : 'Ctrl')
    .replace(/alt/gi, typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌥' : 'Alt')
    .replace(/shift/gi, typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⇧' : 'Shift')
    .replace(/\+/g, ' ')
    .replace(/click/gi, 'Click')
    .replace(/middle/gi, 'Middle Click')
    .replace(/right/gi, 'Right Click')
}

/**
 * Trigger callback when a modifier key is held
 *
 * @param {string | string[]} modifiers - Modifier(s) to listen for: 'Control', 'Alt', 'Shift', 'Meta'
 * @param {(held: boolean) => void} callback - Called with true on hold, false on release
 * @param {{ delay?: number, target?: EventTarget }} [options]
 * @returns {() => void} Cleanup function
 *
 * @example
 * const cleanup = onModifierHold('Control', (held) => {
 *   cheatsheet.open = held
 * }, { delay: 400 })
 */
export function onModifierHold(modifiers, callback, options = {}) {
  const { delay = 400, target = window } = options
  const mods = Array.isArray(modifiers) ? modifiers : [modifiers]
  const modSet = new Set(mods.map(m => m.toLowerCase()))

  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null
  let isHeld = false

  /** @param {Event} e */
  function handleKeyDown(e) {
    const event = /** @type {KeyboardEvent} */ (e)
    if (!modSet.has(event.key.toLowerCase())) return
    if (timer !== null) return // already waiting

    timer = setTimeout(() => {
      isHeld = true
      callback(true)
    }, delay)
  }

  /** @param {Event} e */
  function handleKeyUp(e) {
    const event = /** @type {KeyboardEvent} */ (e)
    if (!modSet.has(event.key.toLowerCase())) return

    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (isHeld) {
      isHeld = false
      callback(false)
    }
  }

  function handleBlur() {
    // Release if window loses focus
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (isHeld) {
      isHeld = false
      callback(false)
    }
  }

  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', handleBlur)

  return () => {
    target.removeEventListener('keydown', handleKeyDown)
    target.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', handleBlur)
    if (timer !== null) clearTimeout(timer)
  }
}

/**
 * Register all keybind components
 * Call this once to define the custom elements
 */
export function registerComponents() {
  if (!customElements.get('command-palette')) {
    customElements.define('command-palette', CommandPalette)
  }
  if (!customElements.get('keybind-cheatsheet')) {
    customElements.define('keybind-cheatsheet', KeybindCheatsheet)
  }
}

import { createSignal, For, Show } from 'solid-js';
import { listBindings, formatKey } from 'keybinds';
import { schema, bindingsStore } from './bindings';

/**
 * @typedef {{ keys?: string[], mouse?: string[] }} BindingOverride
 * @typedef {Record<string, BindingOverride>} Overrides
 * @typedef {{ id: string, type: string } | null} CaptureState
 */

/**
 * Settings modal for rebinding keys
 * @param {{ onClose: () => void }} props
 */
export default function Settings(props) {
  const allBindings = listBindings(schema);

  // Track overrides (only modified bindings)
  const [overrides, setOverrides] = createSignal(
    /** @type {Overrides} */ (bindingsStore.getOverrides())
  );
  const [capturing, setCapturing] = createSignal(/** @type {CaptureState} */ (null));

  /** @param {string} id */
  function getCurrentKeys(id) {
    const s = /** @type {Record<string, { keys?: string[], mouse?: string[] }>} */ (schema);
    return overrides()[id]?.keys ?? s[id]?.keys ?? [];
  }

  /** @param {string} id */
  function getCurrentMouse(id) {
    const s = /** @type {Record<string, { keys?: string[], mouse?: string[] }>} */ (schema);
    return overrides()[id]?.mouse ?? s[id]?.mouse ?? [];
  }

  /**
   * @param {string} id
   * @param {string} type
   */
  function startCapture(id, type) {
    setCapturing({ id, type });
  }

  /** @param {KeyboardEvent} e */
  function handleKeyCapture(e) {
    const cap = capturing();
    if (!cap) return;

    e.preventDefault();
    e.stopPropagation();

    // Build key string
    /** @type {string[]} */
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('$mod');
    else {
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.metaKey) parts.push('Meta');
    }
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    // Ignore if only modifier pressed
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    const keyStr = parts.join('+');

    const { id } = cap;
    setOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], keys: [keyStr] }
    }));
    setCapturing(null);
  }

  /**
   * @param {string} id
   * @param {'keys' | 'mouse'} type
   */
  function clearBinding(id, type) {
    setOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: [] }
    }));
  }

  /** @param {string} id */
  function resetBinding(id) {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleSave() {
    bindingsStore.save(overrides());
    props.onClose();
  }

  // Group by category
  const grouped = () => {
    /** @type {Record<string, Array<import('keybinds').BindingSchema & { id: string }>>} */
    const groups = {};
    for (const binding of allBindings) {
      const cat = binding.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(binding);
    }
    return groups;
  };

  return (
    <div
      class="settings-overlay"
      onClick={() => props.onClose()}
      onKeyDown={capturing() ? handleKeyCapture : undefined}
    >
      <div class="settings" onClick={e => e.stopPropagation()}>
        <div class="settings__header">
          <h2>Keyboard Shortcuts</h2>
          <button class="settings__close" onClick={() => props.onClose()}>×</button>
        </div>

        <div class="settings__content">
          <For each={Object.entries(grouped())}>
            {([category, bindings]) => (
              <div class="settings__group">
                <h3 class="settings__category">{category}</h3>
                <For each={bindings}>
                  {(binding) => (
                    <div class="settings__row">
                      <span class="settings__label">{binding.label}</span>
                      <div class="settings__keys">
                        <Show when={getCurrentKeys(binding.id).length > 0}>
                          <For each={getCurrentKeys(binding.id)}>
                            {(key) => (
                              <span class="settings__key">{formatKey(key)}</span>
                            )}
                          </For>
                        </Show>
                        <Show when={getCurrentMouse(binding.id).length > 0}>
                          <For each={getCurrentMouse(binding.id)}>
                            {(mouse) => (
                              <span class="settings__key settings__key--mouse">{mouse}</span>
                            )}
                          </For>
                        </Show>
                        <Show when={getCurrentKeys(binding.id).length === 0 && getCurrentMouse(binding.id).length === 0}>
                          <span class="settings__key settings__key--empty">Unbound</span>
                        </Show>
                      </div>
                      <div class="settings__actions">
                        <button
                          class="settings__btn"
                          classList={{ 'settings__btn--capturing': capturing()?.id === binding.id }}
                          onClick={() => startCapture(binding.id, 'keys')}
                        >
                          {capturing()?.id === binding.id ? 'Press key...' : 'Rebind'}
                        </button>
                        <button
                          class="settings__btn settings__btn--secondary"
                          onClick={() => clearBinding(binding.id, 'keys')}
                        >
                          Clear
                        </button>
                        <Show when={overrides()[binding.id]}>
                          <button
                            class="settings__btn settings__btn--secondary"
                            onClick={() => resetBinding(binding.id)}
                          >
                            Reset
                          </button>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>

        <div class="settings__footer">
          <button class="settings__btn settings__btn--secondary" onClick={() => props.onClose()}>
            Cancel
          </button>
          <button class="settings__btn settings__btn--primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

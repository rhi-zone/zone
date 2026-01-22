import { createSignal, onMount, onCleanup, For, Show } from 'solid-js';
import { keybinds, fromBindings, validateCommands } from 'keybinds';
import { bindingsStore } from './bindings';
import CommandPalette from './CommandPalette';
import Settings from './Settings';
import './App.css';

/**
 * @typedef {Object} ObjectData
 * @property {string} [type]
 * @property {string} [content]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} CanvasObject
 * @property {string} id
 * @property {ObjectData} [data]
 */

export default function App() {
  const [offset, setOffset] = createSignal(/** @type {{ x: number, y: number }} */ ({ x: 0, y: 0 }));
  const [scale, setScale] = createSignal(1);
  const [isPanning, setIsPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal(/** @type {{ x: number, y: number }} */ ({ x: 0, y: 0 }));

  const [objects, setObjects] = createSignal(/** @type {CanvasObject[]} */ ([]));
  const [selectedId, setSelectedId] = createSignal(/** @type {string | null} */ (null));
  const [editingId, setEditingId] = createSignal(/** @type {string | null} */ (null));
  const [draggedId, setDraggedId] = createSignal(/** @type {string | null} */ (null));
  const [dragOffset, setDragOffset] = createSignal(/** @type {{ x: number, y: number }} */ ({ x: 0, y: 0 }));
  const [paletteOpen, setPaletteOpen] = createSignal(false);
  const [settingsOpen, setSettingsOpen] = createSignal(false);

  // API helpers
  async function fetchObjects() {
    const res = await fetch('/api/objects');
    setObjects(/** @type {CanvasObject[]} */ (await res.json()));
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  async function createObject(x, y) {
    const canvasX = (x - offset().x) / scale();
    const canvasY = (y - offset().y) / scale();

    const res = await fetch('/api/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          type: 'note',
          content: '',
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 100
        }
      })
    });
    const obj = /** @type {CanvasObject} */ (await res.json());
    setObjects([...objects(), obj]);
    setEditingId(obj.id);
    return obj;
  }

  /**
   * @param {string} id
   * @param {ObjectData} data
   */
  async function updateObject(id, data) {
    await fetch(`/api/objects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    setObjects(objects().map(o => o.id === id ? { ...o, data } : o));
  }

  /** @param {string} id */
  async function deleteObject(id) {
    await fetch(`/api/objects/${id}`, { method: 'DELETE' });
    setObjects(objects().filter(o => o.id !== id));
    if (selectedId() === id) setSelectedId(null);
    if (editingId() === id) setEditingId(null);
  }

  // Event handlers
  /** @param {WheelEvent} e */
  function handleWheel(e) {
    e.preventDefault();

    // Scroll to zoom (toward cursor)
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale() * zoomFactor, 0.1), 5);

    const rect = /** @type {Element} */ (e.currentTarget).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setOffset({
      x: mouseX - (mouseX - offset().x) * (newScale / scale()),
      y: mouseY - (mouseY - offset().y) * (newScale / scale())
    });
    setScale(newScale);
  }

  /** @param {MouseEvent} e */
  function handleMouseDown(e) {
    const target = /** @type {Element} */ (e.target);
    if (target.closest('.object')) return;

    // Left click on empty space to pan
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset().x, y: e.clientY - offset().y });
    }
  }

  /** @param {MouseEvent} e */
  function handleMouseMove(e) {
    if (isPanning()) {
      setOffset({ x: e.clientX - panStart().x, y: e.clientY - panStart().y });
    } else {
      const id = draggedId();
      if (id) {
        const obj = objects().find(o => o.id === id);
        if (obj) {
          const newX = (e.clientX - offset().x) / scale() - dragOffset().x;
          const newY = (e.clientY - offset().y) / scale() - dragOffset().y;
          updateObject(id, { ...obj.data, x: newX, y: newY });
        }
      }
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
    setDraggedId(null);
  }

  /** @param {MouseEvent} e */
  function handleDoubleClick(e) {
    const target = /** @type {Element} */ (e.target);
    if (target.closest('.object')) return;
    const rect = /** @type {Element} */ (e.currentTarget).getBoundingClientRect();
    createObject(e.clientX - rect.left, e.clientY - rect.top);
  }

  /**
   * @param {MouseEvent} e
   * @param {CanvasObject} obj
   */
  function handleObjectMouseDown(e, obj) {
    e.stopPropagation();
    setSelectedId(obj.id);

    if (editingId() !== obj.id) {
      setDraggedId(obj.id);
      const objX = obj.data?.x || 0;
      const objY = obj.data?.y || 0;
      setDragOffset({
        x: (e.clientX - offset().x) / scale() - objX,
        y: (e.clientY - offset().y) / scale() - objY
      });
    }
  }

  /**
   * @param {MouseEvent} e
   * @param {CanvasObject} obj
   */
  function handleObjectDoubleClick(e, obj) {
    e.stopPropagation();
    setEditingId(obj.id);
  }

  /**
   * @param {FocusEvent} e
   * @param {CanvasObject} obj
   */
  function handleContentBlur(e, obj) {
    const target = /** @type {HTMLElement} */ (e.target);
    const newContent = target.innerText;
    updateObject(obj.id, { ...obj.data, content: newContent });
    setEditingId(null);
  }

  // Handlers - closures over local state
  const handlers = {
    deselect: () => {
      setEditingId(null);
      setSelectedId(null);
    },
    delete: () => { const id = selectedId(); if (id) deleteObject(id); },
    selectAll: () => {
      // TODO: implement multi-select
    },
    pan: (/** @type {Record<string, unknown>} */ _ctx, /** @type {Event | undefined} */ event) => {
      if (!event || !(event instanceof MouseEvent)) return;
      setIsPanning(true);
      setPanStart({ x: event.clientX - offset().x, y: event.clientY - offset().y });
    },
    commandPalette: () => {
      setPaletteOpen(true);
    },
    settings: () => {
      setSettingsOpen(true);
    }
  };

  // Build commands from bindings + handlers
  const commandOptions = {
    delete: { when: (/** @type {Record<string, unknown>} */ ctx) => Boolean(ctx['hasSelection']) && !ctx['isEditing'] },
    selectAll: { when: (/** @type {Record<string, unknown>} */ ctx) => !ctx['isEditing'] }
  };

  function buildCommands() {
    const cmds = fromBindings(bindingsStore.get(), handlers, commandOptions);
    validateCommands(cmds);
    return cmds;
  }

  let commands = buildCommands();

  // Context getter for keybinds
  const getContext = () => ({
    hasSelection: selectedId() !== null,
    isEditing: editingId() !== null
  });

  onMount(() => {
    fetchObjects();

    let cleanupKeybinds = keybinds(commands, getContext);

    // Re-register keybinds when bindings change
    const handleBindingsChange = () => {
      cleanupKeybinds();
      commands = buildCommands();
      cleanupKeybinds = keybinds(commands, getContext);
    };
    bindingsStore.addEventListener('change', handleBindingsChange);

    onCleanup(() => {
      cleanupKeybinds();
      bindingsStore.removeEventListener('change', handleBindingsChange);
    });
  });

  return (
    <div
      class="canvas"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDblClick={handleDoubleClick}
    >
      <div
        class="canvas__layer"
        style={`transform: translate(${offset().x}px, ${offset().y}px) scale(${scale()})`}
      >
        <For each={objects()}>
          {(obj) => {
            const x = () => obj.data?.x || 0;
            const y = () => obj.data?.y || 0;
            const width = () => obj.data?.width || 200;
            const height = () => obj.data?.height || 100;
            const content = () => obj.data?.content || '';

            return (
              <div
                class="object"
                classList={{
                  'object--selected': selectedId() === obj.id,
                  'object--editing': editingId() === obj.id
                }}
                style={`left: ${x()}px; top: ${y()}px; width: ${width()}px; min-height: ${height()}px`}
                onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                onDblClick={(e) => handleObjectDoubleClick(e, obj)}
              >
                <Show
                  when={editingId() === obj.id}
                  fallback={
                    <div class="object__content">
                      {content() || 'Double-click to edit'}
                    </div>
                  }
                >
                  <div
                    class="object__content object__content--editable"
                    contentEditable={true}
                    ref={(/** @type {HTMLElement} */ el) => {
                      el.textContent = content();
                      requestAnimationFrame(() => {
                        el.focus();
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        const sel = window.getSelection();
                        if (sel) {
                          sel.removeAllRanges();
                          sel.addRange(range);
                        }
                      });
                    }}
                    onBlur={(e) => handleContentBlur(e, obj)}
                  />
                </Show>
              </div>
            );
          }}
        </For>
      </div>

      <div class="canvas__info">
        <span>Objects: {objects().length}</span>
        <span>Zoom: {Math.round(scale() * 100)}%</span>
        <span>$mod+K for commands | Double-click to create | Scroll to zoom</span>
      </div>

      <Show when={paletteOpen()}>
        <CommandPalette
          commands={commands}
          context={getContext}
          onClose={() => setPaletteOpen(false)}
        />
      </Show>

      <Show when={settingsOpen()}>
        <Settings onClose={() => setSettingsOpen(false)} />
      </Show>
    </div>
  );
}

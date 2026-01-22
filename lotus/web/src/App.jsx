import { createSignal, onMount, For, Show } from 'solid-js';
import './App.css';

export default function App() {
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  const [scale, setScale] = createSignal(1);
  const [isPanning, setIsPanning] = createSignal(false);
  const [panStart, setPanStart] = createSignal({ x: 0, y: 0 });

  const [objects, setObjects] = createSignal([]);
  const [selectedId, setSelectedId] = createSignal(null);
  const [editingId, setEditingId] = createSignal(null);
  const [draggedId, setDraggedId] = createSignal(null);
  const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });

  // API helpers
  async function fetchObjects() {
    const res = await fetch('/api/objects');
    setObjects(await res.json());
  }

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
    const obj = await res.json();
    setObjects([...objects(), obj]);
    setEditingId(obj.id);
    return obj;
  }

  async function updateObject(id, data) {
    await fetch(`/api/objects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    setObjects(objects().map(o => o.id === id ? { ...o, data } : o));
  }

  async function deleteObject(id) {
    await fetch(`/api/objects/${id}`, { method: 'DELETE' });
    setObjects(objects().filter(o => o.id !== id));
    if (selectedId() === id) setSelectedId(null);
    if (editingId() === id) setEditingId(null);
  }

  // Event handlers
  function handleWheel(e) {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale() * zoomFactor, 0.1), 5);

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setOffset({
        x: mouseX - (mouseX - offset().x) * (newScale / scale()),
        y: mouseY - (mouseY - offset().y) * (newScale / scale())
      });
      setScale(newScale);
    } else {
      setOffset({
        x: offset().x - e.deltaX,
        y: offset().y - e.deltaY
      });
    }
  }

  function handleMouseDown(e) {
    if (e.target.closest('.object')) return;

    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset().x, y: e.clientY - offset().y });
    }
  }

  function handleMouseMove(e) {
    if (isPanning()) {
      setOffset({ x: e.clientX - panStart().x, y: e.clientY - panStart().y });
    } else if (draggedId()) {
      const obj = objects().find(o => o.id === draggedId());
      if (obj) {
        const newX = (e.clientX - offset().x) / scale() - dragOffset().x;
        const newY = (e.clientY - offset().y) / scale() - dragOffset().y;
        updateObject(draggedId(), { ...obj.data, x: newX, y: newY });
      }
    }
  }

  function handleMouseUp() {
    setIsPanning(false);
    setDraggedId(null);
  }

  function handleDoubleClick(e) {
    if (e.target.closest('.object')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    createObject(e.clientX - rect.left, e.clientY - rect.top);
  }

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

  function handleObjectDoubleClick(e, obj) {
    e.stopPropagation();
    setEditingId(obj.id);
  }

  function handleContentBlur(e, obj) {
    const newContent = e.target.innerText;
    updateObject(obj.id, { ...obj.data, content: newContent });
    setEditingId(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setEditingId(null);
      setSelectedId(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId() && editingId() !== selectedId()) {
        deleteObject(selectedId());
      }
    }
  }

  // Autofocus directive - defer to next frame so DOM is ready
  function autofocus(el) {
    requestAnimationFrame(() => {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }

  onMount(() => {
    fetchObjects();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
                    ref={(el) => {
                      el.textContent = content();
                      requestAnimationFrame(() => {
                        el.focus();
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
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
        <span>Double-click to create | Drag to move | Delete to remove</span>
      </div>
    </div>
  );
}

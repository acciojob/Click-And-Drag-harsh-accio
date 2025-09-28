document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  const cubes = Array.from(container.querySelectorAll('.item'));

  // configuration for initial grid
  const size = 100;   // cube width/height (must match CSS .cube width/height)
  const gap = 12;     // gap between cubes (matches CSS padding/gap logic)

  // place cubes in grid inside container
  function layoutGrid() {
    const style = getComputedStyle(container);
    const paddingLeft = parseInt(style.paddingLeft) || 0;
    const paddingTop = parseInt(style.paddingTop) || 0;
    const paddingRight = parseInt(style.paddingRight) || 0;

    // compute how many columns fit in the container's inner width
    const effectiveWidth = container.clientWidth - paddingLeft - paddingRight;
    const cols = Math.max(1, Math.floor((effectiveWidth + gap) / (size + gap)));

    cubes.forEach((cube, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const left = paddingLeft + col * (size + gap);
      const top = paddingTop + row * (size + gap);

      // apply position
      cube.style.left = `${left}px`;
      cube.style.top = `${top}px`;
      cube.style.width = `${size}px`;
      cube.style.height = `${size}px`;
    });
  }

  // call layout initially and on resize
  layoutGrid();
  window.addEventListener('resize', layoutGrid);

  // Dragging logic (pointer events)
  let active = null;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let origLeft = 0;
  let origTop = 0;
  let isDragging = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function onPointerDown(e) {
    // only left mouse button for mouse; pointer events unify touch/pointer/mouse
    if (typeof e.button !== 'undefined' && e.button !== 0) return;
    active = e.currentTarget;
    pointerId = e.pointerId;

    // prevent default to avoid text selection / native drag
    e.preventDefault();

    // capture pointer so we continue getting pointer events
    try { active.setPointerCapture(pointerId); } catch (err) {}

    const containerRect = container.getBoundingClientRect();
    const rect = active.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;

    // origLeft/top relative to container content box
    origLeft = rect.left - containerRect.left;
    origTop = rect.top - containerRect.top;

    isDragging = false;
    active.classList.add('dragging');
  }

  function onPointerMove(e) {
    if (!active) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // small threshold before we consider it "dragging"
    if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      isDragging = true;
    }

    // compute new position relative to container
    let newLeft = origLeft + dx;
    let newTop = origTop + dy;

    // clamp so cube stays inside container
    const maxLeft = container.clientWidth - active.offsetWidth;
    const maxTop = container.clientHeight - active.offsetHeight;

    newLeft = clamp(newLeft, 0, maxLeft);
    newTop = clamp(newTop, 0, maxTop);

    // apply position
    active.style.left = `${newLeft}px`;
    active.style.top = `${newTop}px`;
  }

  function onPointerUp(e) {
    if (!active) return;

    // release pointer capture
    try { active.releasePointerCapture && active.releasePointerCapture(pointerId); } catch (err) {}

    // if user never moved the pointer (click without drag), nothing changes
    // if user dragged, position already set and clamped during pointermove
    active.classList.remove('dragging');
    active = null;
    pointerId = null;
    isDragging = false;
  }

  // attach listeners
  cubes.forEach(cube => {
    cube.addEventListener('pointerdown', onPointerDown);
  });
  // pointermove/up on document so drag continues even if pointer leaves the cube
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

  // fallback for very old browsers: basic mouse events (optional)
  // (pointer events are widely supported; you can remove below if not needed)
  if (!window.PointerEvent) {
    cubes.forEach(cube => {
      cube.addEventListener('mousedown', (e) => onPointerDown(Object.assign(e, { pointerId: 'mouse' })));
    });
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
  }
});

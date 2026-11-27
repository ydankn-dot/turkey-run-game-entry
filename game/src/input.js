// Keyboard and mouse input for Gobble Dash. Keys are read as held sets and
// as edge-triggered presses that the game loop consumes once per step, so a
// single keypress never jumps twice. Clicks land in a queue with their
// canvas coordinates for the buttons on the title and end screens.
export function makeInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  const clicks = [];

  function codeToAction(code) {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') return 'jump';
    if (code === 'ArrowDown' || code === 'KeyS') return 'duck';
    if (code === 'KeyH') return 'hide';
    if (code === 'KeyR') return 'restart';
    if (code === 'KeyM') return 'mute';
    if (code === 'Enter') return 'confirm';
    return null;
  }

  function onKeyDown(event) {
    const action = codeToAction(event.code);
    if (action) {
      if (!held.has(action)) pressed.add(action);
      held.add(action);
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    const action = codeToAction(event.code);
    if (action) held.delete(action);
  }

  function onClick(event) {
    const rect = canvas.getBoundingClientRect();
    clicks.push({
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    });
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('click', onClick);

  return {
    /** True while the action's key is held down. */
    isHeld(action) {
      return held.has(action);
    },
    /** True once for a keypress since the last step; consumed on read. */
    wasPressed(action) {
      if (!pressed.has(action)) return false;
      pressed.delete(action);
      return true;
    },
    /** Clicks since the last step, as {x, y} in canvas pixels. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** Clear stale presses (used when the screen changes). */
    clear() {
      pressed.clear();
      clicks.length = 0;
    },
  };
}

import { store } from '../core/Store';
import { LayoutEngine } from '../layouts/LayoutEngine';

export const EditorCanvas = {
  render() {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return '<div class="no-slide">No slide selected</div>';

    // Determine transition class
    const transitionType = store.state.meta.transition || 'none';
    const transitionClass = transitionType !== 'none' ? `trans-${transitionType}` : '';

    // We pass 'true' for editable mode
    return `
      <div class="canvas-wrapper ${transitionClass}"> 
         ${LayoutEngine.render(activeSlide, true)}
      </div>
    `;
  },
  
  attachEvents(container) {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return;

    // Helper to checkpoint on blur
    const addCheckpointListener = (element) => {
      element.addEventListener('focus', () => {
         // store.saveHistory(); // Save BEFORE start? Or AFTER end?
         // Ideally we save before we start changing getting dirty, 
         // but simpler to just save the state *after* the change as a new history point?
         // Logic: User types -> Blur -> Save "New State". 
         // Undo -> Go back to state before "New State".
         // Use store.checkpoint() which saves CURRENT state.
         // So we should probably save history BEFORE editing starts if we want to undo TO that state?
         // Actually, Store.saveHistory() saves the CURRENT state to the history stack.
         // So if I call saveHistory() *after* I typed, I'm saving the *new* state.
         // This is wrong. I need to save the *old* state before I change it.
         // Correction: Store.saveHistory() pushes CURRENT state to stack.
         // So:
         // 1. User is at State A.
         // 2. User types (State A is mutated to A').
         // 3. User blurs.
         // 4. We call saveHistory(). State A' is pushed to history. 
         // 5. Undo -> Pops A'. Reverts to... wait. 
         // Standard Undo Stack: history contains PAST states.
         // Current state is LIVE.
         // So before I mutate, I must push State A to history.
         // Then I mutate to A'.
         // Undo -> Pop A from history, make it Live.
         // So `saveHistory` should be called ON FOCUS (before change).
         // BUT, if I focus and don't change, I pushed a duplicate.
         // Let's rely on the Store actions for structure.
         // For text, we'll call `store.saveHistory()` on FOCUS.
      });
    };

    // Title Editing
    const titleEl = container.querySelector('[data-editable="title"]');
    if (titleEl) {
      titleEl.addEventListener('focus', () => store.saveHistory());
      titleEl.addEventListener('blur', (e) => {
        store.updateSlideContent(activeSlide.id, { title: e.target.innerText });
      });
    }

    // Subtitle Editing
    const subtitleEl = container.querySelector('[data-editable="subtitle"]');
    if (subtitleEl) {
      subtitleEl.addEventListener('focus', () => store.saveHistory());
      subtitleEl.addEventListener('blur', (e) => {
        store.updateSlideContent(activeSlide.id, { subtitle: e.target.innerText });
      });
    }

    // Body Editing
    const bodyEl = container.querySelector('[data-editable="body"]');
    if (bodyEl) {
      bodyEl.addEventListener('focus', () => store.saveHistory());
      bodyEl.addEventListener('blur', (e) => {
        store.updateSlideContent(activeSlide.id, { body: e.target.innerHTML });
      });
    }
    
    // Notes Editing handled by NotesPanel now
    
    // Toggle Notes
    // Logic removed.

    // Element Drag & Drop & Resize
    let draggedElement = null;
    let resizingElement = null;
    let startX, startY, initialLeft, initialTop, initialWidth, initialHeight;
    const MIN_SIZE = 50;

    // Handle Image & Resize Mousedown
    container.querySelectorAll('.slide-element-wrapper').forEach((wrapper) => {
      const img = wrapper.querySelector('img');
      const handle = wrapper.querySelector('.resize-handle');
      const index = parseInt(wrapper.dataset.index);

      // Drag Move
      img.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        store.saveHistory();
        draggedElement = wrapper;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(wrapper.style.left || 0);
        initialTop = parseInt(wrapper.style.top || 0);
        
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
      });

      // Resize
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        store.saveHistory();
        resizingElement = wrapper;
        startX = e.clientX;
        startY = e.clientY;
        initialWidth = parseInt(img.style.width);
        initialHeight = parseInt(img.style.height);
        
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);
      });
    });

    // --- Drag Logic ---
    const onDragMove = (e) => {
      if (!draggedElement) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      draggedElement.style.left = `${initialLeft + dx}px`;
      draggedElement.style.top = `${initialTop + dy}px`;
    };

    const onDragEnd = (e) => {
      if (!draggedElement) return;
      const index = parseInt(draggedElement.dataset.index);
      
      store.updateElement(activeSlide.id, index, {
        x: parseInt(draggedElement.style.left),
        y: parseInt(draggedElement.style.top)
      });

      draggedElement = null;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    // --- Resize Logic ---
    const onResizeMove = (e) => {
      if (!resizingElement) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      const newWidth = Math.max(MIN_SIZE, initialWidth + dx);
      // Maintain Aspect Ratio? For now, free resize.
      // To lock aspect ratio: newHeight = newWidth * (initialHeight / initialWidth)
      const newHeight = Math.max(MIN_SIZE, initialHeight + dy);

      const img = resizingElement.querySelector('img');
      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    };

    const onResizeEnd = (e) => {
      if (!resizingElement) return;
      const index = parseInt(resizingElement.dataset.index);
      const img = resizingElement.querySelector('img');

      store.updateElement(activeSlide.id, index, {
        width: parseInt(img.style.width),
        height: parseInt(img.style.height)
      });

      resizingElement = null;
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    };
  }
};

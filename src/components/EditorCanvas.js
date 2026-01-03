import { store } from '../core/Store';
import { LayoutEngine } from '../layouts/LayoutEngine';

export const EditorCanvas = {
  render() {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return '<div class="no-slide">No slide selected</div>';

    // We pass 'true' for editable mode
    return `
      ${LayoutEngine.render(activeSlide, true)}
      <div class="presenter-notes-area" style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
         <label style="font-size: 0.8rem; color: #666;">Presenter Notes</label>
         <textarea class="notes-input" placeholder="Type your speaker notes here..." style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-top: 5px;">${activeSlide.content.notes || ''}</textarea>
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
    
    // Notes Editing
    const notesEl = container.querySelector('.notes-input');
    if (notesEl) {
       notesEl.addEventListener('focus', () => store.saveHistory());
       notesEl.addEventListener('blur', (e) => {
          store.updateNotes(activeSlide.id, e.target.value);
       });
    }

    // Element Drag & Drop
    let draggedElement = null;
    let startX, startY, initialLeft, initialTop;

    container.querySelectorAll('img[style*="position: absolute"]').forEach((el, index) => {
      // Add index to identify which element in the array it is
      el.dataset.elementIndex = index;
      
      el.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent native drag
        store.saveHistory(); // Save state before drag starts
        draggedElement = el;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(el.style.left || 0);
        initialTop = parseInt(el.style.top || 0);
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });

    const onMouseMove = (e) => {
      if (!draggedElement) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      draggedElement.style.left = `${initialLeft + dx}px`;
      draggedElement.style.top = `${initialTop + dy}px`;
    };

    const onMouseUp = (e) => {
      if (!draggedElement) return;
      
      // Update Store
      const index = parseInt(draggedElement.dataset.elementIndex);
      store.updateElement(activeSlide.id, index, {
        x: parseInt(draggedElement.style.left),
        y: parseInt(draggedElement.style.top)
      });

      draggedElement = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }
};

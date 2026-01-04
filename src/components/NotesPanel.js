import { store } from '../core/Store';

export const NotesPanel = {
  render() {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return '<div class="notes-panel">No slide selected</div>';

    return `
      <div class="notes-panel">
         <h3>Speaker Notes</h3>
         <p class="notes-hint" style="background:#f0f9ff; padding:8px; border-radius:4px; font-size:0.8rem; margin-bottom:10px; color:#0369a1; border:1px solid #bae6fd;">
            💡 <strong>Pro Tip:</strong> Press 'P' (or 'C') in Presentation Mode to open the Presenter Console with these notes, timer, and next slide preview!
         </p>
         <textarea id="notes-input" placeholder="Enter your speaker notes here...">${activeSlide.content.notes || ''}</textarea>
      </div>
    `;
  },

  attachEvents(container) {
    const textarea = container.querySelector('#notes-input');
    if (textarea) {
       // Save on blur
       textarea.addEventListener('blur', (e) => {
          if (store.activeSlide) {
             store.updateNotes(store.activeSlide.id, e.target.value);
          }
       });
       
       // Save history on focus
       textarea.addEventListener('focus', () => {
          store.saveHistory();
       });
    }
  }
};

import { store } from '../core/Store';
import { Icons } from '../utils/Icons';
import { HTMLGenerator } from '../utils/HTMLGenerator';

export const Library = {
  render() {
    const decks = store.state.libraryIndex || [];

    return `
      <div class="library-container">
        <header class="library-header">
           <h1>My Presentations</h1>
           <div class="header-actions" style="display:flex; gap:10px;">
             <input type="file" id="import-input" accept=".json" style="display:none" />
             <button id="import-btn" class="secondary-btn">Import</button>
             <button id="create-deck-btn" class="primary-btn">+ New Presentation</button>
           </div>
        </header>

        <div class="decks-grid">
           ${decks.length === 0 ? '<div class="empty-state">No presentations yet. Create one!</div>' : ''}
           
           ${decks.map(deck => `
             <div class="deck-card" data-id="${deck.id}">
                <div class="deck-preview theme-${deck.theme || 'default'}">
                   <div class="deck-preview-content">
                      <div class="mini-title">${deck.title}</div>
                   </div>
                </div>
                <div class="deck-info">
                   <span class="deck-title">${deck.title}</span>
                   <span class="deck-date">${new Date(deck.lastModified).toLocaleDateString()}</span>
                   <div class="card-actions">
                     <button class="export-deck-btn" data-id="${deck.id}" title="Export JSON">💾</button>
                     <button class="export-html-btn" data-id="${deck.id}" title="Export HTML">🌐</button>
                     <button class="delete-deck-btn" data-id="${deck.id}" title="Delete">${Icons.delete}</button>
                   </div>
                 </div>
              </div>
           `).join('')}
        </div>
      </div>
    `;
  },

  attachEvents(container) {
    // Create New
    const createBtn = container.querySelector('#create-deck-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        store.createPresentation();
      });
    }

    // Import
    const importBtn = container.querySelector('#import-btn');
    const importInput = container.querySelector('#import-input');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          store.importPresentation(evt.target.result);
          // Importing adds it to the list, notify happens, re-render happens.
        };
        reader.readAsText(file);
      });
    }

    // Open Deck (Click on Card)
    container.querySelectorAll('.deck-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return; // Ignore button clicks
        const id = card.dataset.id;
        store.loadPresentation(id);
      });
    });

    // Sub-actions
    container.querySelectorAll('.delete-deck-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        store.deletePresentation(id);
      });
    });

    container.querySelectorAll('.export-deck-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const json = store.exportPresentation(id);
        if (json) {
           // Trigger download
           const blob = new Blob([json], { type: 'application/json' });
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `presentation-${id.substring(0,8)}.json`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           URL.revokeObjectURL(url);
        }
      });
    });
    
    container.querySelectorAll('.export-html-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const jsonStr = store.exportPresentation(id);
        if (jsonStr) {
           const deck = JSON.parse(jsonStr);
           const html = HTMLGenerator.generateStandalone(deck);
           const blob = new Blob([html], { type: 'text/html' });
           const url = URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = `presentation-${id.substring(0,8)}.html`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
           URL.revokeObjectURL(url);
        }
      });
    });
  }
};

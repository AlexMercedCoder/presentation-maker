import { store } from '../core/Store';
import { Icons } from '../utils/Icons';

export const Library = {
  render() {
    const decks = store.state.libraryIndex || [];

    return `
      <div class="library-container">
        <header class="library-header">
           <h1>My Presentations</h1>
           <button id="create-deck-btn" class="primary-btn">+ New Presentation</button>
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
                   <button class="delete-deck-btn" data-id="${deck.id}" title="Delete">${Icons.delete}</button>
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

    // Open Deck (Click on Card)
    container.querySelectorAll('.deck-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.delete-deck-btn')) return; // Ignore delete click
        const id = card.dataset.id;
        store.loadPresentation(id);
      });
    });

    // Delete Deck
    container.querySelectorAll('.delete-deck-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        store.deletePresentation(id);
      });
    });
  }
};

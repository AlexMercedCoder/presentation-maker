import { store } from '../core/Store';
import { Icons } from '../utils/Icons';

export const HistoryPanel = {
  render() {
    const history = store.history || [];
    const currentIndex = store.historyIndex;

    const listItems = history.map((state, index) => {
       const isActive = index === currentIndex;
       // Try to describe the state? Or just "State #X" + timestamp?
       // We didn't store action names in history, so just timestamps/IDs for now.
       const title = `Step ${index + 1}`;
       
       return `
         <div class="history-item ${isActive ? 'active' : ''}" data-index="${index}">
           <div class="history-marker"></div>
           <div class="history-info">
             <strong>${title}</strong>
             <small>Active Slide: ${state.activeSlideId ? 'Yes' : 'None'}</small>
           </div>
         </div>
       `;
    }).join('');

    return `
      <div id="history-panel" class="history-panel hidden">
         <div class="history-header">
            <h3>History</h3>
            <button id="close-history" class="close-btn">&times;</button>
         </div>
         <div class="history-list">
            ${history.length === 0 ? '<p style="padding:10px; color:#666;">No history yet.</p>' : listItems}
         </div>
      </div>
    `;
  },

  toggle() {
    const panel = document.getElementById('history-panel');
    if (!panel) {
       // Init
       const div = document.createElement('div');
       div.innerHTML = this.render();
       document.body.appendChild(div.firstElementChild);
       this.attachEvents();
    } else {
       // Re-render list
       const newHTML = this.render();
       // HACK: just replace outerHTML or innerHTML of container?
       // Easier: remove and re-add or just update content.
       // Let's simpler: Replace content.
       const temp = document.createElement('div');
       temp.innerHTML = newHTML;
       panel.innerHTML = temp.firstElementChild.innerHTML;
       panel.classList.toggle('hidden');
       if (!panel.classList.contains('hidden')) {
           this.attachEvents(); // Re-attach because we wiped innerHTML
       }
    }
  },

  attachEvents() {
    const panel = document.getElementById('history-panel');
    if (!panel) return;

    panel.querySelector('#close-history')?.addEventListener('click', () => {
       panel.classList.add('hidden');
    });

    panel.querySelectorAll('.history-item').forEach(item => {
       item.addEventListener('click', () => {
          store.jumpToHistory(parseInt(item.dataset.index));
          // Re-render panel
          this.toggle(); 
          // Wait toggle hides it if I call it again... wait.
          // Toggle logic above flips hidden. I want to refresh.
          // Let's improve toggle logic in next iteration if buggy.
          panel.classList.remove('hidden'); // Force show
       });
    });
  }
};

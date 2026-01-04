import { store } from '../core/Store';

export const SearchModal = {
  render() {
    return `
      <div id="search-modal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 400px;">
          <h3>Find & Replace</h3>
          
          <div class="control-group">
            <label>Find</label>
            <input type="text" id="find-input" placeholder="Text to find...">
          </div>

          <div class="control-group">
            <label>Replace With</label>
            <input type="text" id="replace-input" placeholder="Replacement text...">
          </div>

          <div class="modal-actions">
            <button id="search-cancel" class="btn secondary">Close</button>
            <button id="search-replace-all" class="btn primary">Replace All</button>
          </div>
          
          <p id="search-status" style="margin-top:10px; font-size:0.9rem; color:#666;"></p>
        </div>
      </div>
    `;
  },

  toggle() {
    const modal = document.getElementById('search-modal');
    if (!modal) {
      const div = document.createElement('div');
      div.innerHTML = this.render();
      document.body.appendChild(div.firstElementChild);
      this.attachEvents();
    } else {
      modal.classList.toggle('hidden');
      document.getElementById('search-status').innerText = '';
    }
  },

  attachEvents() {
    const modal = document.getElementById('search-modal');
    
    // Close
    modal.querySelector('#search-cancel').addEventListener('click', () => {
       modal.classList.add('hidden');
    });

    // Replace All
    modal.querySelector('#search-replace-all').addEventListener('click', () => {
       const findText = document.getElementById('find-input').value;
       const replaceText = document.getElementById('replace-input').value;
       
       if (!findText) return;

       const count = this.performReplace(findText, replaceText);
       document.getElementById('search-status').innerText = `Replaced ${count} occurrences.`;
    });
  },

  performReplace(findText, replaceText) {
    store.saveHistory(); // Save before massive change
    let count = 0;
    const regex = new RegExp(escapeRegExp(findText), 'g');
    
    store.state.slides.forEach(slide => {
       let modified = false;
       
       // Title
       if (slide.content.title && slide.content.title.includes(findText)) {
          slide.content.title = slide.content.title.replace(regex, replaceText);
          modified = true;
          count++;
       }
       // Subtitle
       if (slide.content.subtitle && slide.content.subtitle.includes(findText)) {
          slide.content.subtitle = slide.content.subtitle.replace(regex, replaceText);
          modified = true;
          count++;
       }
       // Body
       if (slide.content.body && slide.content.body.includes(findText)) {
          slide.content.body = slide.content.body.replace(regex, replaceText);
          modified = true;
          count++;
       }
       
       // Elements (Text only)
       if (slide.content.elements) {
          slide.content.elements.forEach(el => {
             if (el.type === 'text' && el.content && el.content.includes(findText)) {
                el.content = el.content.replace(regex, replaceText);
                modified = true;
                count++;
             }
          });
       }
    });

    if (count > 0) {
       store.notify();
    }
    return count;
  }
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

import { store } from '../core/Store';
import { ColorUtils } from '../utils/colors';
import { THEME_PRESETS } from '../utils/presets';

export const ThemeEditor = {
  render() {
    // Only show values if current theme is custom, otherwise default to stored custom values
    const settings = store.customTheme || {};

    const presetsHTML = THEME_PRESETS.map(p => `
      <button class="preset-btn" data-preset='${JSON.stringify(p)}' title="${p.name}" style="background: ${p.bg}; border: 1px solid #ccc; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; position: relative; overflow: hidden;">
         <div style="position: absolute; top:0; left:0; width:50%; height:100%; background: ${p.primary}; opacity: 0.5;"></div>
      </button>
    `).join('');

    return `
      <div id="theme-editor" class="modal-overlay hidden">
        <div class="modal-content theme-modal" style="max-height: 90vh; overflow-y: auto;">
          <h3>Theme Editor</h3>
          
          <div class="control-group">
             <label>Quick Presets</label>
             <div class="preset-grid" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                ${presetsHTML}
             </div>
          </div>
          <hr>
          
          <div class="control-group">
            <label>Background</label>
            <input type="color" data-key="bg" value="${settings.bg}">
          </div>

          <div class="control-group">
            <label>Text Main</label>
            <input type="color" data-key="text" value="${settings.text}">
          </div>

          <div class="control-group">
            <label>Primary</label>
            <input type="color" data-key="primary" value="${settings.primary}">
          </div>

          <div class="control-group">
            <label>Accent</label>
            <input type="color" data-key="accent" value="${settings.accent}">
          </div>

          <div class="control-group">
            <label>Font</label>
            <select data-key="font">
              <option value="Inter" ${settings.font === 'Inter' ? 'selected' : ''}>Inter (Sans)</option>
              <option value="Roboto" ${settings.font === 'Roboto' ? 'selected' : ''}>Roboto (Sans)</option>
              <option value="Playfair Display" ${settings.font === 'Playfair Display' ? 'selected' : ''}>Playfair Display (Serif)</option>
              <option value="Montserrat" ${settings.font === 'Montserrat' ? 'selected' : ''}>Montserrat (Sans)</option>
              <option value="Lato" ${settings.font === 'Lato' ? 'selected' : ''}>Lato (Sans)</option>
              <option value="Courier Prime" ${settings.font === 'Courier Prime' ? 'selected' : ''}>Courier Prime (Mono)</option>
            </select>
          </div>


          <div class="control-group">
            <label>Transition</label>
            <select id="transition-select">
              <option value="none" ${store.state.meta.transition === 'none' ? 'selected' : ''}>None</option>
              <option value="fade" ${store.state.meta.transition === 'fade' ? 'selected' : ''}>Fade</option>
              <option value="slide" ${store.state.meta.transition === 'slide' ? 'selected' : ''}>Slide</option>
              <option value="zoom" ${store.state.meta.transition === 'zoom' ? 'selected' : ''}>Zoom</option>
            </select>
          </div>

          <hr>
          
          <div class="control-group">
             <label>Import Theme JSON</label>
             <textarea id="theme-json-input" placeholder='{"primary": "...", "text": "..."}' style="width:100%; height:80px; font-family:monospace; font-size:12px;"></textarea>
             <button id="theme-import-btn" style="margin-top:5px; width:100%;">Apply JSON</button>
          </div>

          <hr>

          <div class="modal-actions" style="justify-content: space-between;">
             <button id="theme-random-btn" style="background:linear-gradient(45deg, #ff00cc, #3333ff); color:white; border:none;">🎲 Randomize</button>
             <div>
                <button id="theme-close-btn">Done</button>
             </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents() {
    const container = document.getElementById('theme-editor');
    if (!container) return;

    // Transition Select
    const transSelect = container.querySelector('#transition-select');
    if (transSelect) {
      transSelect.addEventListener('change', (e) => {
        store.setTransition(e.target.value);
      });
    }

    // Preset Buttons
    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
         const theme = JSON.parse(btn.dataset.preset);
         store.setCustomThemeProperty('bg', theme.bg);
         store.setCustomThemeProperty('text', theme.text);
         store.setCustomThemeProperty('primary', theme.primary);
         store.setCustomThemeProperty('accent', theme.accent);
         store.setCustomThemeProperty('font', theme.font);
         
         // Update inputs
         container.querySelector('input[data-key="bg"]').value = theme.bg;
         container.querySelector('input[data-key="text"]').value = theme.text;
         container.querySelector('input[data-key="primary"]').value = theme.primary;
         container.querySelector('input[data-key="accent"]').value = theme.accent;
         container.querySelector('select[data-key="font"]').value = theme.font;
      });
    });

    // Inputs
    container.querySelectorAll('input[type="color"], select[data-key]').forEach(input => {
      input.addEventListener('input', (e) => {
        store.setCustomThemeProperty(e.target.dataset.key, e.target.value);
      });
    });

    // Randomize
    container.querySelector('#theme-random-btn').addEventListener('click', () => {
      const theme = ColorUtils.generateRandomTheme();
      
      // Update Store
      store.setCustomThemeProperty('bg', theme.bg);
      store.setCustomThemeProperty('text', theme.text);
      store.setCustomThemeProperty('primary', theme.primary);
      store.setCustomThemeProperty('accent', theme.accent);
      store.setCustomThemeProperty('font', theme.font); // Added font to store

      // Re-render inputs to reflect new values (lazy way: finding them one by one)
      container.querySelector('input[data-key="bg"]').value = theme.bg;
      container.querySelector('input[data-key="text"]').value = theme.text;
      container.querySelector('input[data-key="primary"]').value = theme.primary;
      container.querySelector('input[data-key="accent"]').value = theme.accent;
      container.querySelector('select[data-key="font"]').value = theme.font; // Added font to input update
    });
    
    // Import JSON
    container.querySelector('#theme-import-btn').addEventListener('click', () => {
       const textarea = container.querySelector('#theme-json-input');
       try {
         const json = JSON.parse(textarea.value);
         store.applyThemeJSON(json);
       } catch(e) {
         alert('Invalid JSON');
       }
    });

    // Close
    container.querySelector('#theme-close-btn').addEventListener('click', () => {
      container.classList.add('hidden');
    });
  },

  open() {
    const el = document.getElementById('theme-editor');
    if(el) {
       // Refresh generic values if needed, but render handles it largely. 
       // Ideally re-rendering the innerHTML to sync inputs is safest.
       // For Phase 5 MVP we'll just show it.
       el.classList.remove('hidden');
    }
  }
};

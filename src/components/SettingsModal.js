import { store } from '../core/Store';

export const SettingsModal = {
  render() {
    const config = store.getConfig();
    return `
      <div id="settings-modal" class="modal-overlay hidden">
        <div class="modal-content" style="width: 400px;">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
             <h3>Settings & API Keys</h3>
             <button id="settings-close" class="close-btn">&times;</button>
          </div>
          
          <div style="margin-bottom: 20px;">
             <p style="font-size: 0.9rem; color: #666; margin-bottom: 15px;">
               Enter your API keys to enable live search for Images and GIFs. Keys are saved locally in your browser.
             </p>
             
             <div style="margin-bottom: 15px;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">Unsplash Access Key (Images)</label>
                <input type="password" id="unsplash-key" value="${config.unsplashKey || ''}" placeholder="Enter Unsplash Access Key" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <small style="color:#888;"><a href="https://unsplash.com/developers" target="_blank">Get a key</a></small>
             </div>

             <div style="margin-bottom: 15px;">
                <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px;">GIPHY API Key (GIFs)</label>
                <input type="password" id="giphy-key" value="${config.giphyKey || ''}" placeholder="Enter GIPHY API Key" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <small style="color:#888;"><a href="https://developers.giphy.com/" target="_blank">Get a key</a></small>
             </div>
          </div>
          
          <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:10px;">
             <button id="settings-save-btn" style="background:var(--primary-color); color:white; padding:8px 16px; border:none; border-radius:4px; cursor:pointer;">Save Settings</button>
          </div>
        </div>
      </div>
    `;
  },

  toggle() {
    const existing = document.getElementById('settings-modal');
    if (existing) {
       existing.remove(); // Always re-render to get fresh state
    }
    
    const div = document.createElement('div');
    div.innerHTML = this.render();
    document.body.appendChild(div.firstElementChild);
    this.attachEvents();
    
    document.getElementById('settings-modal').classList.remove('hidden');
  },

  attachEvents() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    // Close
    modal.querySelector('#settings-close').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    
    // Save
    modal.querySelector('#settings-save-btn').addEventListener('click', () => {
       const unsplash = modal.querySelector('#unsplash-key').value.trim();
       const giphy = modal.querySelector('#giphy-key').value.trim();
       
       store.setConfig({
          unsplashKey: unsplash,
          giphyKey: giphy
       });
       
       alert('Settings Saved!');
       modal.classList.add('hidden');
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
       if (e.target === modal) modal.classList.add('hidden');
    });
  }
};

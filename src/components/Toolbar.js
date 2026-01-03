import { store } from '../core/Store';

export const Toolbar = {
  render() {
    return `
      <div class="toolbar">
        <div class="toolbar-group">
          <strong>PresoMaker</strong>
        </div>
        <div class="toolbar-group">
          <button id="add-slide-btn" class="tool-btn">+ Slide</button>
          <select id="layout-select" class="tool-select">
            <option value="title">Title Only</option>
            <option value="title-body">Title + Body</option>
          </select>
        </div>
        <div class="toolbar-group">
          <button id="qr-btn" class="tool-btn">QR Code</button>
          <button id="theme-toggle-btn" class="tool-btn">Theme: ${store.theme}</button>
          <button id="export-json-btn" class="tool-btn">Export JSON</button>
          <label class="tool-btn">
            Import JSON
            <input type="file" id="import-json-input" accept=".json" style="display: none;">
          </label>
          <button id="present-btn" class="tool-btn" style="background: #10b981; color: white;">▶ Present</button>
        </div>
      </div>
    `;
  },

  attachEvents(container) {
    // Add Slide
    container.querySelector('#add-slide-btn').addEventListener('click', () => {
      const layout = document.getElementById('layout-select').value;
      store.addSlide(layout);
    });

    // Theme Toggle
    container.querySelector('#theme-toggle-btn').addEventListener('click', () => {
      const themes = ['default', 'dark', 'ocean', 'sunset'];
      const currentIdx = themes.indexOf(store.theme);
      const nextTheme = themes[(currentIdx + 1) % themes.length];
      store.setTheme(nextTheme);
    });

    // QR Code
    container.querySelector('#qr-btn').addEventListener('click', () => {
      document.getElementById('qr-modal').classList.remove('hidden');
    });

    // Export JSON
    container.querySelector('#export-json-btn').addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.state));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "presentation.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });

    // Import JSON
    container.querySelector('#import-json-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          store.loadPresentation(json);
        } catch (err) {
          console.error('Invalid JSON', err);
          alert('Failed to load presentation. Invalid JSON.');
        }
      };
      reader.readAsText(file);
    });

    // Present Mode
    container.querySelector('#present-btn').addEventListener('click', () => {
      import('../core/PresentationController').then(m => m.PresentationController.enter());
    });
  }
};

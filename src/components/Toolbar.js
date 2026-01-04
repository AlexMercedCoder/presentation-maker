import { store } from '../core/Store';

export const Toolbar = {
  render() {
    return `
      <div class="toolbar">
        <div class="toolbar-group">
          <strong>MercedSlides</strong>
        </div>
        <div class="toolbar-group">
          <button id="home-btn" class="tool-btn" title="Back to Library">🏠</button>
          <button id="add-slide-btn" class="tool-btn">+ Slide</button>
          <select id="layout-select" class="tool-select">
            <option value="title">Title Only</option>
            <option value="title-body">Title + Body</option>
            <option value="hero">Hero (Full)</option>
            <option value="statement">Statement (Huge)</option>
            <option value="split-diagonal">Split Diagonal</option>
            <option value="photo-grid">Photo Grid (2x2)</option>
            <option value="stats">Statistics</option>
            <option value="timeline">Timeline</option>
            <option value="venn">Venn Diagram</option>
            <option value="funnel">Funnel</option>
            <option value="pyramid">Pyramid</option>
            <option value="swot">SWOT Matrix</option>
            <option value="team">Team</option>
            <option value="video">Video Placeholder</option>
            <option value="kanban">Kanban Board</option>
            <option value="agenda">Agenda</option>
            <option value="chart">Chart</option>
            <option value="quote">Quote</option>
            <option value="gallery">Gallery</option>
            <option value="code">Code Block</option>
            <option value="comparison">Comparison</option>
            <option value="big-list">Big List</option>
          </select>
        </div>
        <div class="toolbar-group">
          <label class="tool-btn">
             Image
             <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
          </label>
          <div class="toolbar-divider" style="width:1px; height:20px; background:#ddd; margin: 0 5px;"></div>
          <button id="undo-btn" class="tool-btn" title="Undo">↶</button>
          <button id="redo-btn" class="tool-btn" title="Redo">↷</button>
          <button id="qr-btn" class="tool-btn">QR Code</button>
          <button id="theme-toggle-btn" class="tool-btn">Preset: ${store.theme}</button>
          <button id="theme-random-toolbar-btn" class="tool-btn" title="Randomize Theme">🎲</button>
          <button id="theme-edit-btn" class="tool-btn">🎨 Customize</button>
          <button id="export-json-btn" class="tool-btn">Export JSON</button>
          <button id="export-pdf-btn" class="tool-btn">PDF</button>
          <button id="export-pptx-btn" class="tool-btn">PPTX</button>
          <label class="tool-btn">
            Import JSON
            <input type="file" id="import-json-input" accept=".json" style="display: none;">
          </label>
          <button id="present-btn" class="tool-btn" style="background: #10b981; color: white;" title="Start Presentation (Press 'P' for Console)">▶ Present</button>
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

    // Theme Randomizer (Magic Wand)
    container.querySelector('#theme-random-toolbar-btn').addEventListener('click', () => {
         import('../utils/colors').then(({ ColorUtils }) => {
            const theme = ColorUtils.generateRandomTheme();
            store.setCustomThemeProperty('bg', theme.bg);
            store.setCustomThemeProperty('text', theme.text);
            store.setCustomThemeProperty('primary', theme.primary);
            store.setCustomThemeProperty('accent', theme.accent);
            store.setCustomThemeProperty('font', theme.font);
         });
    });

    // Edit Theme
    container.querySelector('#theme-edit-btn').addEventListener('click', () => {
       document.getElementById('theme-editor').classList.remove('hidden');
    });

    // Image Upload
    container.querySelector('#image-upload-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target.result;
        const activeSlide = store.activeSlide;
        if (activeSlide) {
          store.addElementToSlide(activeSlide.id, {
            type: 'image',
            src: src,
            x: 100, // Default position
            y: 100,
            width: 200, // Default size
            height: 200
          });
        }
        e.target.value = ''; // Reset
      };
      reader.readAsDataURL(file);
    });

    // QR Code
    container.querySelector('#qr-btn').addEventListener('click', () => {
      document.getElementById('qr-modal').classList.remove('hidden');
    });

    // Undo/Redo
    container.querySelector('#undo-btn').addEventListener('click', () => store.undo());
    container.querySelector('#redo-btn').addEventListener('click', () => store.redo());

    // Home / Back to Library
    container.querySelector('#home-btn').addEventListener('click', () => {
       store.closePresentation();
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

    // Export PDF
    container.querySelector('#export-pdf-btn').addEventListener('click', async () => {
      const btn = container.querySelector('#export-pdf-btn');
      const originalText = btn.innerText;
      btn.innerText = '...';
      btn.disabled = true;
      document.body.style.cursor = 'wait';

      try {
        const { exportToPDF } = await import('../utils/pdfExport');
        await exportToPDF(store.slides, store.theme);
      } catch (e) {
        console.error(e);
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        document.body.style.cursor = 'default';
      }
    });

    // Export PPTX
    container.querySelector('#export-pptx-btn').addEventListener('click', async () => {
       const btn = container.querySelector('#export-pptx-btn');
       btn.innerText = '...';
       try {
         const { exportToPPTX } = await import('../utils/pptxExport');
         exportToPPTX(store.slides, store.theme);
       } catch(e) {
         console.error(e);
         alert('PPTX Export failed');
       } finally {
         btn.innerText = 'PPTX';
       }
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

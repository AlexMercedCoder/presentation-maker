import { store } from '../core/Store';

export const Toolbar = {
  render() {
    return `
      <div class="toolbar">
        <div class="toolbar-section left">
           <div class="brand">
              <strong>MercedSlides</strong>
           </div>
           
           <div class="tool-group">
             <button id="home-btn" class="tool-btn icon-btn" title="Back to Library">🏠</button>
             <div class="divider"></div>
             <button id="add-slide-btn" class="tool-btn primary-text">+ Slide</button>
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
        </div>

        <div class="toolbar-section center">
           <div class="tool-group">
             <button id="undo-btn" class="tool-btn icon-btn" title="Undo">↶</button>
             <button id="redo-btn" class="tool-btn icon-btn" title="Redo">↷</button>
             <button id="history-btn" class="tool-btn icon-btn" title="History">↺</button>
             <div class="divider"></div>
             <button id="asset-btn" class="tool-btn icon-btn" title="Insert Asset">➕</button>
             <button id="search-btn" class="tool-btn icon-btn" title="Find & Replace">🔍</button>
             <button id="theme-edit-btn" class="tool-btn icon-btn" title="Customize Theme">🎨</button>
             <button id="qr-btn" class="tool-btn icon-btn" title="QR Code">📱</button>
           </div>
        </div>

        <div class="toolbar-section right">
           <div class="tool-group">
             <div class="dropdown">
                <button class="tool-btn">📂 File ▾</button>
                <div class="dropdown-content">
                   <label class="dropdown-item">
                      Import JSON <input type="file" id="import-json-input" accept=".json" hidden>
                   </label>
                   <label class="dropdown-item">
                      Import MD <input type="file" id="import-md-input" accept=".md,.txt" hidden>
                   </label>
                   <button id="export-json-btn" class="dropdown-item">Export JSON</button>
                   <button id="export-pdf-btn" class="dropdown-item">Export PDF</button>
                   <button id="export-pptx-btn" class="dropdown-item">Export PPTX</button>
                   <label class="dropdown-item">
                      Upload Image <input type="file" id="image-upload-input" accept="image/*" hidden>
                   </label>
                </div>
             </div>
             
             <button id="theme-random-toolbar-btn" class="tool-btn icon-btn" title="Randomize Theme">🎲</button>
             <button id="help-btn" class="tool-btn icon-btn" title="Help">❓</button>
             <div class="divider"></div>
             <button id="present-btn" class="tool-btn present-btn">▶ Present</button>
           </div>
        </div>
        
        <!-- Hidden Toggles for logic that might be bound elsewhere or legacy -->
        <button id="theme-toggle-btn" style="display:none;"></button> 
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

    // Import MD
    container.querySelector('#import-md-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
         const { MarkdownImporter } = await import('../utils/MarkdownImporter');
         const slides = MarkdownImporter.parse(event.target.result);
         if (slides.length > 0) {
            // Append or replace? Let's append for now.
            // Actually, Users usually want to "Open" a file.
            // But for MD import, maybe appending to existing is better?
            // Let's ask Store to add them.
            // Store.addSlides(slides) doesn't exist, we loop addSlide?
            // Or we treat it as a new presentation? 
            // Let's replace ONLY if empty? 
            // User can delete if they want.
            // Loop add.
            slides.forEach(s => {
               // We need to properly add valid slides.
               store.addSlide(s.layout, s); // We need to handle this in Store.addSlide if it supports object?
            });
            // HACK: Store.addSlide takes (layout). logic creates new.
            // We need `store.importSlides(slides)`.
            // Let's implement that or hack it by manually pushing to state.
            store.importSlides(slides);
         }
      };
      reader.readAsText(file);
    });


    // Present Mode
    container.querySelector('#present-btn').addEventListener('click', () => {
      import('../core/PresentationController').then(m => m.PresentationController.enter());
    });
    // History
    container.querySelector('#history-btn').addEventListener('click', () => {
      import('../components/HistoryPanel').then(m => m.HistoryPanel.toggle());
    });
    
    // Search
    container.querySelector('#search-btn').addEventListener('click', () => {
      import('../components/SearchModal').then(m => m.SearchModal.toggle());
    });
    
    // Assets
    container.querySelector('#asset-btn').addEventListener('click', () => {
      import('../components/AssetModal').then(m => m.AssetModal.toggle());
    });
    // Help
    container.querySelector('#help-btn').addEventListener('click', () => {
      import('../components/HelpModal').then(m => m.HelpModal.toggle());
    });
  }
};

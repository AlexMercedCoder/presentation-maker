export const HelpModal = {
  render() {
    return `
      <div id="help-modal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
             <h2>MercedSlides Documentation 📘</h2>
             <button id="help-close" class="close-btn">&times;</button>
          </div>
          
          <div class="help-section">
             <h3>⌨️ Keyboard Shortcuts</h3>
             <ul class="help-list">
                <li><strong>Presentation Mode:</strong> Click 'Present' or press <code>P</code> (only if focused on body/canvas)</li>
                <li><strong>Presenter Console:</strong> Press <code>P</code> inside Presentation Mode or click 'Present'. Ideally use dual monitors.</li>
                <li><strong>Exit Presentation:</strong> Press <code>Esc</code>.</li>
             </ul>
          </div>

          <div class="help-section">
             <h3>📝 Markdown Import</h3>
             <p>Create slides instantly by importing a <code>.md</code> text file.</p>
             <pre style="background:#eee; padding:10px; border-radius:4px;">
# Slide Title
## Subtitle
- Bullet Point 1
- Bullet Point 2

---

# Next Slide
![Alt Text](https://image.url)
             </pre>
             <ul>
                <li><code>#</code> : New Slide Title</li>
                <li><code>---</code> : Force New Slide</li>
                <li><code>![alt](url)</code> : Insert Image</li>
             </ul>
          </div>

          <div class="help-section">
             <h3>🎨 Editor Features</h3>
             <ul class="help-list">
                <li><strong>Drag & Drop Slides:</strong> Reorder slides in the sidebar by dragging them.</li>
                <li><strong>Layering:</strong> Click an image/text element to see the Floating Toolbar. Use ⬆️/⬇️ to bring to front or send to back.</li>
                <li><strong>Snap-to-Grid:</strong> Elements snap to the center of the slide (cyan guides appear).</li>
                <li><strong>Google Fonts:</strong> Type any Google Font name (e.g., "Lobster", "Roboto Slab") in the Theme Editor > Font Family.</li>
             </ul>
          </div>
          
          <div class="help-section">
             <h3>🚀 Exporting</h3>
             <ul class="help-list">
                <li><strong>HTML:</strong> Exports a single file you can open in any browser (no internet needed).</li>
                <li><strong>JSON:</strong> Save your work to edit later.</li>
                <li><strong>PPTX:</strong> Basic PowerPoint export (text & images).</li>
             </ul>
          </div>

          <div style="text-align:center; margin-top:20px; color:#888;">
             <small>MercedSlides v1.0</small>
          </div>
        </div>
      </div>
    `;
  },

  toggle() {
    const modal = document.getElementById('help-modal');
    if (!modal) {
      const div = document.createElement('div');
      div.innerHTML = this.render();
      document.body.appendChild(div.firstElementChild);
      this.attachEvents();
    } else {
      modal.classList.toggle('hidden');
    }
  },

  attachEvents() {
    const modal = document.getElementById('help-modal');
    if (modal) {
       // Close Button
       modal.querySelector('#help-close').addEventListener('click', () => {
          modal.classList.add('hidden');
       });
       
       // Background Click
       modal.addEventListener('click', (e) => {
          if (e.target === modal) {
             modal.classList.add('hidden');
          }
       });
    }
  }
};

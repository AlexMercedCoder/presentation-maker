import './styles/style.css';
import './styles/modal.css';
import './styles/presentation.css';
import './styles/layouts.css';
import { store } from './core/Store';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { QRCodeModal } from './components/QRCodeModal';
import { ThemeEditor } from './components/ThemeEditor';
import { PresentationController } from './core/PresentationController';

// Init Controller
PresentationController.init();

const app = document.querySelector('#app');

function render() {
  // Apply theme
  if (store.theme === 'custom') {
    const custom = store.customTheme;
    document.body.className = ''; // Remove preset classes
    document.body.style.setProperty('--bg-color', custom.bg);
    document.body.style.setProperty('--surface-color', custom.surface || custom.bg);
    document.body.style.setProperty('--text-main', custom.text);
    document.body.style.setProperty('--text-accent', custom.accent);
    document.body.style.setProperty('--primary-color', custom.primary);
    document.body.style.setProperty('--secondary-color', custom.secondary || custom.accent);
    document.body.style.setProperty('--font-main', custom.font);
  } else {
    document.body.style = ''; // Reset inline styles
    document.body.className = `theme-${store.theme}`;
  }

  // Assemble the UI
  app.innerHTML = `
    ${Sidebar.render()}
    ${Toolbar.render()}
    <div class="slide-container-wrapper">
      <div class="slide-container">
        ${EditorCanvas.render()}
      </div>
    </div>
    ${QRCodeModal.render()} 
    ${ThemeEditor.render()}
  `;

  // Attach Component Events
  const sidebarEl = app.querySelector('.sidebar');
  if (sidebarEl) Sidebar.attachEvents(sidebarEl);

  const toolbarEl = app.querySelector('.toolbar');
  if (toolbarEl) Toolbar.attachEvents(toolbarEl);

  const canvasEl = app.querySelector('.slide-container');
  if (canvasEl) EditorCanvas.attachEvents(canvasEl);

  QRCodeModal.attachEvents();
  ThemeEditor.attachEvents();
}

// Initial Render
render();

// Subscribe to Store
store.subscribe(render);

// Load saved state
store.loadFromLocal();

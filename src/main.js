import './styles/style.css';
import './styles/modal.css';
import './styles/presentation.css';
import './styles/layouts.css';
import './styles/library.css';
import { store } from './core/Store';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { QRCodeModal } from './components/QRCodeModal';
import { ThemeEditor } from './components/ThemeEditor';
import { Library } from './components/Library';
import { PresentationController } from './core/PresentationController';
import { NotesPanel } from './components/NotesPanel';

// Init Controller
PresentationController.init();

const app = document.querySelector('#app');

function render() {
  // Manage Theme Classes carefully to preserve 'mode-presentation'
  const isPresentation = document.body.classList.contains('mode-presentation');
  
  // Reset ONLY theme classes (assuming single theme class or style override)
  // Actually, simplest is to reconstruction className
  let classList = [];
  if (isPresentation) classList.push('mode-presentation');

  // Apply theme only if in Editor mode
  if (store.state.view === 'editor') {
    if (store.theme === 'custom') {
      const custom = store.customTheme;
      document.body.className = classList.join(' '); 
      document.body.style.setProperty('--bg-color', custom.bg);
      document.body.style.setProperty('--surface-color', custom.surface || custom.bg);
      document.body.style.setProperty('--text-main', custom.text);
      document.body.style.setProperty('--text-accent', custom.accent);
      document.body.style.setProperty('--primary-color', custom.primary);
      document.body.style.setProperty('--secondary-color', custom.secondary || custom.accent);
      document.body.style.setProperty('--font-main', custom.font);
    } else {
      document.body.style = '';
      classList.push(`theme-${store.theme}`);
      document.body.className = classList.join(' ');
    }
  } else {
    // Library View Theme
    document.body.className = classList.join(' ');
    document.body.style = '';
  }

  // View Switching
  if (store.state.view === 'library') {
    app.innerHTML = Library.render();
    Library.attachEvents(app);
    return;
  }

  // Editor View
  app.innerHTML = `
    ${Sidebar.render()}
    ${Toolbar.render()}
    <div class="slide-container-wrapper">
      <div class="slide-container">
        ${EditorCanvas.render()}
      </div>
    </div>
    <div class="right-panel">
       ${NotesPanel.render()}
    </div>
    ${QRCodeModal.render()} 
    ${ThemeEditor.render()}
  `;

  // Attach Component Events
  const sidebarEl = app.querySelector('.sidebar');
  if (sidebarEl) Sidebar.attachEvents(sidebarEl);

  const toolbarEl = app.querySelector('.toolbar');
  if (toolbarEl) Toolbar.attachEvents(toolbarEl);
  
  const rightPanelEl = app.querySelector('.right-panel');
  if (rightPanelEl) NotesPanel.attachEvents(rightPanelEl);
  if (canvasEl) EditorCanvas.attachEvents(canvasEl);

  QRCodeModal.attachEvents();
  ThemeEditor.attachEvents();
}

// Initial Render
render();

// Subscribe to Store
store.subscribe(render);

// Load saved state
// Load saved state handled by Store constructor now

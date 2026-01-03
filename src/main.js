import './styles/style.css';
import './styles/modal.css';
import './styles/presentation.css';
import { store } from './core/Store';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { QRCodeModal } from './components/QRCodeModal';
import { PresentationController } from './core/PresentationController';

// Init Controller
PresentationController.init();

const app = document.querySelector('#app');

function render() {
  // Apply theme class globally
  document.body.className = `theme-${store.theme}`;

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
  `;

  // Attach Component Events
  const sidebarEl = app.querySelector('.sidebar');
  if (sidebarEl) Sidebar.attachEvents(sidebarEl);

  const toolbarEl = app.querySelector('.toolbar');
  if (toolbarEl) Toolbar.attachEvents(toolbarEl);

  const canvasEl = app.querySelector('.slide-container');
  if (canvasEl) EditorCanvas.attachEvents(canvasEl);

  QRCodeModal.attachEvents();
}

// Initial Render
render();

// Subscribe to Store
store.subscribe(render);

// Load saved state
store.loadFromLocal();

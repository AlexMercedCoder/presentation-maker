import './styles/style.css';
import { store } from './core/Store';
import { LayoutEngine } from './layouts/LayoutEngine';

const app = document.querySelector('#app');

function render() {
  const activeSlide = store.activeSlide;
  const currentTheme = store.theme;
  
  // Apply theme class to body
  document.body.className = `theme-${currentTheme}`;

  // Render Slide
  const slideHTML = LayoutEngine.render(activeSlide);
  
  app.innerHTML = `
    <div class="slide-container">
      ${slideHTML}
    </div>
    <div class="controls">
      <button id="add-slide">Add Slide</button>
      <button id="toggle-theme">Toggle Theme</button>
      <span style="align-self: center; margin-left: 10px;">Slide ${store.slides.findIndex(s => s.id === activeSlide?.id) + 1} / ${store.slides.length}</span>
    </div>
  `;

  // Attach Events (Simple delegation or direct attach for Phase 1)
  document.getElementById('add-slide').addEventListener('click', () => {
    store.addSlide('title-body');
  });

  document.getElementById('toggle-theme').addEventListener('click', () => {
    const themes = ['default', 'dark', 'ocean', 'sunset'];
    const currentIdx = themes.indexOf(store.theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    store.setTheme(nextTheme);
  });
}

// Initial Render
render();

// Subscribe to Store
store.subscribe(render);

// Load saved state (optional for now)
store.loadFromLocal();

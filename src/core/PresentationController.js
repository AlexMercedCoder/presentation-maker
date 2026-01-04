import { store } from './Store';
import { LayoutEngine } from '../layouts/LayoutEngine';

export const PresentationController = {
  channel: new BroadcastChannel('presentation_channel'),
  consoleWindow: null,
  timerInterval: null,
  startTime: null,

  enter() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  },

  exit() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  },

  init() {
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        document.body.classList.add('mode-presentation');
        this.attachControls();
      } else {
        // If console is open, we consider ourselves still in "Presentation Mode" even if windowed
        // (This happens when window.open steals focus and exits fullscreen)
        if (this.consoleWindow && !this.consoleWindow.closed) {
           // Ensure class stays if it was somehow removed, though usually it persists until we remove it
           document.body.classList.add('mode-presentation'); 
           return; 
        }

        document.body.classList.remove('mode-presentation');
        this.detachControls();
        if (this.consoleWindow) {
          this.consoleWindow.close();
          this.consoleWindow = null;
        }
      }
    });

    // Listen for commands from Console
    this.channel.onmessage = (event) => {
      const { action, payload } = event.data;
      if (action === 'GOTO') {
        store.setActiveSlide(payload);
      } else if (action === 'NEXT') {
        this.nextSlide();
      } else if (action === 'PREV') {
        this.prevSlide();
      } else if (action === 'EXIT') {
        this.exitPresentation();
      }
    };
    
    // Listen for Store changes to sync Console
    store.subscribe(() => {
       this.syncConsole();
    });
  },

  attachControls() {
    window.addEventListener('keydown', this.handleKeydownWrapper);
    window.addEventListener('click', this.handleClickWrapper);
  },

  detachControls() {
    window.removeEventListener('keydown', this.handleKeydownWrapper);
    window.removeEventListener('click', this.handleClickWrapper);
  },

  // Bound functions
  handleKeydownWrapper: (e) => PresentationController.handleKeydown(e),
  handleClickWrapper: (e) => PresentationController.handleClick(e),

  handleClick(e) {
    if (e.target.closest('button')) return; // Ignore button clicks
    this.nextSlide();
  },

  handleKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      this.nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      this.prevSlide();
    } else if (e.key === 'c' || e.key === 'p') {
      // Toggle Console
      if (!this.consoleWindow) {
        this.launchConsole();
      }
    } else if (e.key === 'Escape') {
      this.exitPresentation();
    }
  },
  
  exitPresentation() {
     if (document.fullscreenElement) {
        document.exitFullscreen();
     }
     // Force cleanup even if not in fullscreen (e.g. if we were windowed with console)
     document.body.classList.remove('mode-presentation');
     this.detachControls();
     if (this.consoleWindow) {
        this.consoleWindow.close();
        this.consoleWindow = null;
     }
  },

  nextSlide() {
    const slides = store.state.slides;
    const currentIndex = slides.findIndex(s => s.id === store.state.activeSlideId);
    if (currentIndex < slides.length - 1) {
      store.setActiveSlide(slides[currentIndex + 1].id);
    }
  },

  prevSlide() {
    const slides = store.state.slides;
    const currentIndex = slides.findIndex(s => s.id === store.state.activeSlideId);
    if (currentIndex > 0) {
      store.setActiveSlide(slides[currentIndex - 1].id);
    }
  },

  syncConsole() {
    if (!this.consoleWindow || this.consoleWindow.closed) return;
    
    const activeSlide = store.activeSlide;
    const slides = store.state.slides;
    const currentIndex = slides.findIndex(s => s.id === activeSlide.id);
    const nextSlide = slides[currentIndex + 1];
    
    // Send state to console
    this.consoleWindow.postMessage({
      type: 'SYNC',
      data: {
        currentSlideHTML: LayoutEngine.render(activeSlide, false), // Render read-only
        nextSlideHTML: nextSlide ? LayoutEngine.render(nextSlide, false) : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;">End of Deck</div>',
        notes: activeSlide.content.notes || 'No notes.',
        progress: `${currentIndex + 1} / ${slides.length}`
      }
    }, '*');
  },

  launchConsole() {
    this.consoleWindow = window.open('', 'PresenterConsole', 'width=800,height=600,menubar=no,toolbar=no');
    
    if (!this.consoleWindow) {
      alert("Popup blocked! Allow popups to use Presenter Console.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Presenter Console</title>
        <style>
          body { margin: 0; font-family: sans-serif; background: #222; color: white; display: grid; height: 100vh; grid-template-columns: 1fr 300px; grid-template-rows: 60px 1fr 1fr; grid-template-areas: "header header" "current next" "current notes"; gap: 10px; padding: 10px; }
          .header { grid-area: header; display: flex; justify-content: space-between; align-items: center; background: #333; padding: 0 20px; border-radius: 8px; }
          .timer { font-size: 2rem; font-weight: bold; color: #00ff00; }
          .current-view { grid-area: current; background: black; border: 2px solid #444; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; }
          .next-view { grid-area: next; background: #111; border: 1px solid #444; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
          .notes-view { grid-area: notes; background: #fff; color: #111; padding: 20px; font-size: 1.2rem; line-height: 1.5; overflow-y: auto; white-space: pre-wrap; border-radius: 4px; }
          
          /* Scaled Previews */
          .slide-preview { transform-origin: center; transform: scale(0.5); width: 100%; height: 100%; pointer-events: none; }
          
          /* Imported Layout Styles (Inlined roughly or linked?) */
          /* We need styles to make previews look right. We'll try to link the same CSS if possible, or inject it. */
        </style>
        <!-- Inject styles from parent -->
        ${Array.from(document.styleSheets).map(s => {
           try {
             if (s.href) return `<link rel="stylesheet" href="${s.href}">`;
             return `<style>${Array.from(s.cssRules).map(r => r.cssText).join('')}</style>`;
           } catch(e) { return ''; }
        }).join('')}
        <style>
          /* Override preview scaling */
          .current-view .slide-container-wrapper { transform: scale(0.6); transform-origin: top left; width: 100%; height: 100%; overflow: hidden;  }
          .next-view .slide-container-wrapper { transform: scale(0.3); transform-origin: top left; width: 100%; height: 100%; overflow: hidden; }
          
          .slide-container-wrapper { background: transparent !important; align-items: start !important; padding: 0 !important; }
        </style>
      </head>
      <body>
        <div class="header">
           <div class="timer" id="timer">00:00</div>
           <div id="clock" style="color:#aaa;">--:--</div>
           <div class="controls">
              <button onclick="opener.postMessage({action:'PREV'}, '*')">Prev</button>
              <button onclick="opener.postMessage({action:'NEXT'}, '*')">Next</button>
           </div>
        </div>
        <div class="current-view" id="currentSlide"></div>
        <div class="next-view" id="nextSlide"><span style="position:absolute; top:5px; left:5px; color: #777; font-size: 0.8rem;">NEXT</span></div>
        <div class="notes-view" id="notes"></div>

        <script>
           const startTime = Date.now();
           setInterval(() => {
              const diff = Math.floor((Date.now() - startTime) / 1000);
              const m = Math.floor(diff / 60).toString().padStart(2, '0');
              const s = (diff % 60).toString().padStart(2, '0');
              document.getElementById('timer').innerText = m + ':' + s;
              
              const now = new Date();
              document.getElementById('clock').innerText = now.toLocaleTimeString();
           }, 1000);

           // Comm
           const bc = new BroadcastChannel('presentation_channel');
           
           // We can use window.opener communication or BroadcastChannel. 
           // Since we opened it, window.opener is direct.
           // BroadcastChannel is good if connection is lost or cross-window.
           
           window.addEventListener('message', (e) => {
              if (e.data.type === 'SYNC') {
                 const d = e.data.data;
                 document.getElementById('currentSlide').innerHTML = '<div class="slide-container-wrapper"><div class="slide-container">' + d.currentSlideHTML + '</div></div>';
                 document.getElementById('nextSlide').innerHTML = '<span style="position:absolute; top:5px; left:5px; color: #777; font-size: 0.8rem; z-index:10;">NEXT</span><div class="slide-container-wrapper"><div class="slide-container">' + d.nextSlideHTML + '</div></div>';
                 document.getElementById('notes').innerText = d.notes;
              }
           });
           
           // Forward keys to opener
           window.addEventListener('keydown', (e) => {
              if(e.key === 'ArrowRight' || e.key === ' ') bc.postMessage({action: 'NEXT'});
              if(e.key === 'ArrowLeft') bc.postMessage({action: 'PREV'});
           });

           function send(action) {
             bc.postMessage({action});
           }
        </script>
      </body>
      </html>
    `;
    
    this.consoleWindow.document.write(html);
    this.consoleWindow.document.close();
    
    // Initial Sync
    setTimeout(() => this.syncConsole(), 500);
  }
};

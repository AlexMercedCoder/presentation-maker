import { store } from './Store';

export const PresentationController = {
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
        document.body.classList.remove('mode-presentation');
        this.detachControls();
      }
    });
  },

  attachControls() {
    window.addEventListener('keydown', this.handleKeydown);
  },

  detachControls() {
    window.removeEventListener('keydown', this.handleKeydown);
  },

  handleKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      store.moveSlideDown(store.activeSlideId);
      // Wait a tick then ensure active slide is current
      // Ideally Store should have nextSlide/prevSlide actions independent of ID
      // For now, let's rely on the Store's existing move logic or add better nav logic
      // Actually, moveSlideDown MOVES the slide. We want to CHANGE ACTIVE slide.
    } else if (e.key === 'ArrowLeft') {
      // store.prevSlide(); 
    }
  }
};

import { v4 as uuidv4 } from 'uuid';

class Store {
  constructor() {
    this.state = {
      meta: {
        title: 'New Presentation',
        theme: 'default'
      },
      slides: [
        {
          id: uuidv4(),
          layout: 'title',
          content: {
            title: 'Welcome to PresoMaker',
            subtitle: 'Click to edit'
          }
        }
      ],
      activeSlideId: null
    };

    // Initialize active slide
    this.state.activeSlideId = this.state.slides[0].id;

    this.listeners = [];
  }

  // --- Actions ---

  addSlide(layout = 'title-body') {
    const newSlide = {
      id: uuidv4(),
      layout,
      content: {
        title: 'New Slide',
        body: '<ul><li>Add content here</li></ul>',
        elements: []
      }
    };
    this.state.slides.push(newSlide);
    this.setActiveSlide(newSlide.id);
  }

  deleteSlide(id) {
    if (this.state.slides.length <= 1) return; // Prevent deleting last slide
    
    const index = this.state.slides.findIndex(s => s.id === id);
    if (index === -1) return;

    this.state.slides.splice(index, 1);
    
    // Reset active slide if we deleted the current one
    if (this.state.activeSlideId === id) {
      const newIndex = Math.max(0, index - 1);
      this.state.activeSlideId = this.state.slides[newIndex].id;
    }
    this.notify();
  }

  updateSlideContent(id, contentUpdates) {
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      slide.content = { ...slide.content, ...contentUpdates };
      this.notify();
    }
  }

  setActiveSlide(id) {
    this.state.activeSlideId = id;
    this.notify();
  }

  setTheme(themeName) {
    this.state.meta.theme = themeName;
    this.notify();
  }

  loadPresentation(data) {
    // Basic validation could go here
    this.state = data;
    this.notify();
  }

  // --- Getters ---

  get slides() { return this.state.slides; }
  get activeSlide() { 
    return this.state.slides.find(s => s.id === this.state.activeSlideId); 
  }
  get theme() { return this.state.meta.theme; }

  // --- Pub/Sub ---

  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    this.saveToLocal();
  }

  saveToLocal() {
    localStorage.setItem('preso-maker-state', JSON.stringify(this.state));
  }

  loadFromLocal() {
    const saved = localStorage.getItem('preso-maker-state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        this.notify();
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }
}

export const store = new Store();

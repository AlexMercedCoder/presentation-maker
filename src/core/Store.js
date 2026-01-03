import { v4 as uuidv4 } from 'uuid';

class Store {
  constructor() {
    this.state = {
      meta: {
        title: 'New Presentation',
        theme: 'default',
        customTheme: {
          bg: '#ffffff',
          text: '#333333',
          accent: '#666666',
          primary: '#3b82f6',
          font: 'Inter'
        }
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
    
    // Insert after active slide
    const activeIndex = this.state.slides.findIndex(s => s.id === this.state.activeSlideId);
    if (activeIndex !== -1) {
      this.state.slides.splice(activeIndex + 1, 0, newSlide);
    } else {
      this.state.slides.push(newSlide);
    }

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

  reorderSlide(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.state.slides.length || 
        toIndex < 0 || toIndex >= this.state.slides.length) return;

    const [movedSlide] = this.state.slides.splice(fromIndex, 1);
    this.state.slides.splice(toIndex, 0, movedSlide);
    this.notify();
  }

  moveSlideUp(id) {
    const index = this.state.slides.findIndex(s => s.id === id);
    if (index > 0) {
      this.reorderSlide(index, index - 1);
    }
  }

  moveSlideDown(id) {
    const index = this.state.slides.findIndex(s => s.id === id);
    if (index !== -1 && index < this.state.slides.length - 1) {
      this.reorderSlide(index, index + 1);
    }
  }

  updateSlideContent(id, contentUpdates) {
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      slide.content = { ...slide.content, ...contentUpdates };
      // Debounce notification or simple notify for now
      this.notify(); 
    }
  }

  addElementToSlide(id, elementData) {
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      if (!slide.content.elements) slide.content.elements = [];
      slide.content.elements.push(elementData);
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

  setCustomThemeProperty(key, value) {
    this.state.meta.theme = 'custom';
    this.state.meta.customTheme[key] = value;
    this.notify();
  }

  // --- Getters ---

  get slides() { return this.state.slides; }
  get activeSlide() { 
    return this.state.slides.find(s => s.id === this.state.activeSlideId); 
  }
  get theme() { return this.state.meta.theme; }
  get customTheme() { return this.state.meta.customTheme; }

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

import { v4 as uuidv4 } from 'uuid';

class Store {
  constructor() {
    this.state = {
      meta: {
        title: 'New Presentation',
        theme: 'default',
        customTheme: {
          bg: '#ffffff',
          surface: '#f5f5f5',
          text: '#333333',
          primary: '#953f8d',
          secondary: '#3fef7d',
          accent: '#18dcf3',
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
    this.saveHistory();
    
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

  // Replaced reorderSlide, moveSlideUp, moveSlideDown with a single moveSlide
  moveSlide(id, direction) {
    this.saveHistory();
    const index = this.state.slides.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [this.state.slides[index], this.state.slides[index - 1]] = 
      [this.state.slides[index - 1], this.state.slides[index]];
      this.notify();
    } else if (direction === 'down' && index < this.state.slides.length - 1) {
      [this.state.slides[index], this.state.slides[index + 1]] = 
      [this.state.slides[index + 1], this.state.slides[index]];
      this.notify();
    }
  }

  updateSlideContent(id, contentUpdates) {
    // Debouncing history save for text input could be good, but for MVP we'll save on every update 
    // or rely on 'change' events vs 'input'. To be safe/simple, we won't wrap granular text updates 
    // in history here to avoid 1000s of snapshots, OR we assume the caller handles debounce.
    // Ideally, "saveHistory" should be called on "focus" or "blur" of text fields? 
    // For now, let's NOT auto-save history on every keystroke. 
    // We will let the user explicitly checkpoint or we accept that text edits might be one big block.
    // Actually, distinct actions like "Add Slide" are clear checkpoints. 
    // Text editing is tricky. Let's only save history if it's NOT a rapid update?
    // User Decision: Let's simple-wrap it but note it might be chatty. 
    // Better: Helper "snapshot" method called by UI on blur. 
    // Current approach: Just update state.
    
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      slide.content = { ...slide.content, ...contentUpdates };
      // Debounce notification or simple notify for now
      this.notify(); 
    }
  }

  updateNotes(id, notes) {
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      if (!slide.content) slide.content = {};
      slide.content.notes = notes;
      this.notify();
    }
  }

  addElementToSlide(id, elementData) {
    this.saveHistory();
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      if (!slide.content.elements) slide.content.elements = [];
      slide.content.elements.push(elementData);
      this.notify();
    }
  }

  updateElement(slideId, elementIndex, updates) {
    // Only save history if it's a "commit" (handled by UI calling checkpoint or us checking a flag?)
    // Logic: move ends -> save history. 
    // We'll call saveHistory manually in the UI mousup handler for drag.
    const slide = this.state.slides.find(s => s.id === slideId);
    if (slide && slide.content.elements && slide.content.elements[elementIndex]) {
      Object.assign(slide.content.elements[elementIndex], updates);
      this.notify();
    }
  }

  setActiveSlide(id) {
    this.state.activeSlideId = id;
    this.notify();
  }

  setTheme(themeName) {
    this.saveHistory(); // Theme change is a significant action
    this.state.meta.theme = themeName;
    this.notify();
  }

  setCustomThemeProperty(key, value) {
    // Theme tweaking is high frequency. Let's not spam history?
    // Or maybe we do? 
    this.state.meta.theme = 'custom';
    this.state.meta.customTheme[key] = value;
    this.notify();
  }

  applyThemeJSON(json) {
    this.state.meta.theme = 'custom';
    const ct = this.state.meta.customTheme;
    // Map schema: primary, secondary, accent, background, surface, text
    if(json.primary) ct.primary = json.primary;
    if(json.secondary) ct.secondary = json.secondary;
    if(json.accent) ct.accent = json.accent;
    if(json.background) ct.bg = json.background;
    if(json.surface) ct.surface = json.surface;
    if(json.text) ct.text = json.text;
    
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

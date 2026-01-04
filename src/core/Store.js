import { v4 as uuidv4 } from 'uuid';

class Store {
  constructor() {
    this.listeners = [];
    this.state = {
      view: 'library', // 'library' or 'editor'
      libraryIndex: [], // Array of { id, title, lastModified, theme }
      // Current Presentation State
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
      slides: [],
      activeSlideId: null,
      history: [],
      historyIndex: -1
    };

    this._initLibrary();
  }

  _initLibrary() {
    const index = localStorage.getItem('presentation_index');
    if (index) {
      try {
        const parsed = JSON.parse(index);
        this.state.libraryIndex = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse library index', e);
        this.state.libraryIndex = [];
      }
    }

    // Migration Check: If we have 'presentation_store' (legacy single file) but no index
    // OR just to be safe, if we have legacy data, import it as a deck if not already done.
    // For simplicity, let's just create a new library entry if 'presentation_store' exists
    // and then maybe rename/clear it. 
    // Actually, let's strictly check for legacy key.
    const legacy = localStorage.getItem('presentation_store');
    if (legacy && this.state.libraryIndex.length === 0) {
      // Migrate legacy to first deck
      try {
        const data = JSON.parse(legacy);
        const id = uuidv4();
        const deck = {
          id: id,
          title: data.meta?.title || 'Migrated Presentation',
          lastModified: Date.now(),
          limit: 1 // unused
        };
        // Save full state
        localStorage.setItem(`presentation_${id}`, JSON.stringify(data));
        // Add to index
        this.state.libraryIndex.push(deck);
        localStorage.setItem('presentation_index', JSON.stringify(this.state.libraryIndex));
        // Remove legacy
        localStorage.removeItem('presentation_store');
      } catch (e) {
        console.error('Migration failed', e);
      }
    }
  }

  // --- Library Actions ---

  createPresentation() {
    const id = uuidv4();
    const newDeck = {
       meta: { 
         title: 'Untitled Deck', 
         theme: 'default', 
         customTheme: this.state.meta?.customTheme 
            ? JSON.parse(JSON.stringify(this.state.meta.customTheme))
            : {
              bg: '#ffffff',
              surface: '#f5f5f5',
              text: '#333333',
              primary: '#953f8d',
              secondary: '#3fef7d',
              accent: '#18dcf3',
              accent: '#18dcf3',
              font: 'Inter'
            },
         transition: 'none'
       },
       slides: [{
         id: uuidv4(),
         layout: 'title',
         content: { title: 'Title', body: 'Subtitle' }
       }],
       activeSlideId: null
    };
    newDeck.activeSlideId = newDeck.slides[0].id;
    
    // Save to storage
    localStorage.setItem(`presentation_${id}`, JSON.stringify(newDeck));
    
    // Update Index
    const entry = { id, title: newDeck.meta.title, lastModified: Date.now(), theme: 'default' };
    if (!this.state.libraryIndex) this.state.libraryIndex = [];
    this.state.libraryIndex.push(entry);
    this._saveIndex();
    
    // Load it
    this.loadPresentation(id);
  }

  loadPresentation(id) {
    const raw = localStorage.getItem(`presentation_${id}`);
    if (raw) {
      const data = JSON.parse(raw);
      
      // Ensure customTheme exists in loaded data
      if (!data.meta) data.meta = {};
      
      const defaultTheme = {
          bg: '#ffffff',
          surface: '#f5f5f5',
          text: '#333333',
          primary: '#953f8d',
          secondary: '#3fef7d',
          accent: '#18dcf3',
          font: 'Inter'
      };

      if (!data.meta.customTheme) {
        data.meta.customTheme = defaultTheme;
      } else {
        // Merge with defaults to ensure all keys exist
        data.meta.customTheme = { ...defaultTheme, ...data.meta.customTheme };
      }

      this.state = {
        ...this.state,
        view: 'editor',
        currentId: id, // Track which deck is open
        ...data,
        history: [], // Reset history for new session
        historyIndex: -1
      };
      this.notify();
    }
  }

  closePresentation() {
    this.saveCurrentDeck();
    this.state.view = 'library';
    this.state.currentId = null;
    this.notify();
  }

  deletePresentation(id) {
    if (confirm('Are you sure you want to delete this presentation?')) {
       localStorage.removeItem(`presentation_${id}`);
       this.state.libraryIndex = this.state.libraryIndex.filter(d => d.id !== id);
       this._saveIndex();
       this.notify();
    }
  }

  saveCurrentDeck() {
     if (!this.state.currentId) return;
     const deckState = {
       meta: this.state.meta,
       slides: this.state.slides,
       activeSlideId: this.state.activeSlideId
     };
     localStorage.setItem(`presentation_${this.state.currentId}`, JSON.stringify(deckState));
     
     // Update Index Metadata
     const entry = this.state.libraryIndex.find(d => d.id === this.state.currentId);
     if (entry) {
       entry.title = this.state.meta.title;
       entry.lastModified = Date.now();
       entry.theme = this.state.meta.theme; // Preview theme?
       this._saveIndex();
     }
  }

  _saveIndex() {
    localStorage.setItem('presentation_index', JSON.stringify(this.state.libraryIndex));
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

  // Move slide to specific index (for Drag & Drop)
  reorderSlide(id, newIndex) {
    this.saveHistory();
    const currentIndex = this.state.slides.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    // Remove from old position
    const [slide] = this.state.slides.splice(currentIndex, 1);
    // Insert at new position
    this.state.slides.splice(newIndex, 0, slide);
    
    this.notify();
  }

  moveSlide(id, direction) {
    this.saveHistory();
    const index = this.state.slides.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
       this.reorderSlide(id, index - 1);
    } else if (direction === 'down' && index < this.state.slides.length - 1) {
       this.reorderSlide(id, index + 1);
    }
  }

  updateSlideContent(id, contentUpdates) {
    const slide = this.state.slides.find(s => s.id === id);
    if (slide) {
      slide.content = { ...slide.content, ...contentUpdates };
      this.notify(); 
    }
  }
  
  // Element Layering (Z-Index via Array Order)
  reorderElement(slideId, elementId, action) {
     this.saveHistory();
     const slide = this.state.slides.find(s => s.id === slideId);
     if (!slide || !slide.content.elements) return;

     const elements = slide.content.elements;
     const index = elements.findIndex(e => e.id === elementId);
     if (index === -1) return;

     const [el] = elements.splice(index, 1);
     
     if (action === 'front') {
        elements.push(el);
     } else if (action === 'back') {
        elements.unshift(el);
     } else if (action === 'forward') {
        elements.splice(index + 1, 0, el);
     } else if (action === 'backward') {
        if (index > 0) elements.splice(index - 1, 0, el);
        else elements.unshift(el);
     }
     
     this.notify();
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
    if (!this.state.meta.customTheme) this.state.meta.customTheme = {
          bg: '#ffffff',
          surface: '#f5f5f5',
          text: '#333333',
          primary: '#953f8d',
          secondary: '#3fef7d',
          accent: '#18dcf3',
          font: 'Inter'
    };
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

  setTransition(type) {
    this.saveHistory();
    this.state.meta.transition = type; // 'none', 'fade', 'slide', 'zoom'
    this.notify();
  }

  // --- Import / Export ---

  exportPresentation(id) {
    const raw = localStorage.getItem(`presentation_${id}`);
    if (!raw) return null;
    return raw; // Already JSON string
  }

  importPresentation(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validation basics
      if (!data.meta || !data.slides) throw new Error("Invalid presentation format");

      const newId = uuidv4();
      
      // Sanitize / Re-ID
      data.id = newId; // Ensure internal ID matches storage key if we track it there
      // We don't strictly track ID inside the blob for consistency, but good practice.
      
      const newDeck = {
        ...data,
        activeSlideId: data.slides[0]?.id || null
      };

      // Save content
      localStorage.setItem(`presentation_${newId}`, JSON.stringify(newDeck));

      // Add to Index
      const entry = { 
        id: newId, 
        title: newDeck.meta.title || 'Imported Presentation', 
        lastModified: Date.now(), 
        theme: newDeck.meta.theme || 'default' 
      };
      
      this.state.libraryIndex.push(entry);
      this._saveIndex();
      
      return newId; // Return ID so UI can open it immediately if desired
    } catch (e) {
      console.error("Import failed", e);
      alert("Failed to import presentation. Invalid file.");
      return null;
    }
  }

  // --- Getters ---

  get slides() { return this.state.slides; }
  get activeSlide() { 
    return this.state.slides.find(s => s.id === this.state.activeSlideId); 
  }
  get theme() { return this.state.meta.theme; }
  get customTheme() { return this.state.meta.customTheme; }
  get history() { return this.state.history; }
  get historyIndex() { return this.state.historyIndex; }

  // --- History ---

  saveHistory() {
    // If we are in the middle of the stack (undone some moves), truncate the future
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
    }

    // Push current state snapshot (deep copy of relevant parts)
    const snapshot = JSON.parse(JSON.stringify({
      meta: this.state.meta,
      slides: this.state.slides,
      activeSlideId: this.state.activeSlideId
    }));

    this.state.history.push(snapshot);
    this.state.historyIndex++;
    
    // Limit history size to 50
    if (this.state.history.length > 50) {
      this.state.history.shift();
      this.state.historyIndex--;
    }
  }

  undo() {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      const snapshot = this.state.history[this.state.historyIndex];
      this._restoreSnapshot(snapshot);
    }
  }

  redo() {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      const snapshot = this.state.history[this.state.historyIndex];
      this._restoreSnapshot(snapshot);
    }
  }

  jumpToHistory(index) {
     if (index >= 0 && index < this.state.history.length) {
        this.state.historyIndex = index;
        this._restoreSnapshot(this.state.history[index]);
     }
  }

  _restoreSnapshot(snapshot) {
    this.state.meta = snapshot.meta;
    this.state.slides = snapshot.slides;
    this.state.activeSlideId = snapshot.activeSlideId;
    this.notify();
  }

  // --- Pub/Sub ---

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
    // Persist changes
    if (this.state.view === 'editor' && this.state.currentId) {
       this.saveCurrentDeck();
    }
  }
}

export const store = new Store();

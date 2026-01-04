export const FontLoader = {
  loadedFonts: new Set(),

  load(fontName) {
    if (!fontName) return;
    if (this.loadedFonts.has(fontName)) return;

    // Sanitize font name for URL (e.g. "Roboto Slab" -> "Roboto+Slab")
    const family = fontName.trim().replace(/\s+/g, '+');
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;700&display=swap`;

    // Check if link already exists in DOM (persisted across sessions?)
    if (document.querySelector(`link[href="${url}"]`)) {
      this.loadedFonts.add(fontName);
      return;
    }

    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.dataset.font = fontName;
    document.head.appendChild(link);
    
    this.loadedFonts.add(fontName);
  }
};

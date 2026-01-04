export const MarkdownImporter = {
  parse(text) {
    const lines = text.split('\n');
    const slides = [];
    let currentSlide = null;

    // Helper to finish current slide
    const finishSlide = () => {
      if (currentSlide) {
        // Convert list items to HTML ul/li
        if (currentSlide.bodyLines.length > 0) {
           currentSlide.content.body = this.processBody(currentSlide.bodyLines);
        }
        slides.push(currentSlide);
      }
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // New Slide Delimiter (---)
      if (trimmed === '---') {
        finishSlide();
        currentSlide = this.createSlide();
        return;
      }

      // Start first slide if none
      if (!currentSlide) {
         currentSlide = this.createSlide();
      }

      // Title (#)
      if (trimmed.startsWith('# ')) {
        // If slide already has significant content, maybe implied new slide? 
        // For simplicity: explicit delimiters or H1 starts new slide if previous has content?
        // Let's stick to: H1 sets title of current slide. 
        // If current slide already has title, maybe it IS a new slide? 
        if (currentSlide.content.title) {
           finishSlide();
           currentSlide = this.createSlide();
        }
        currentSlide.content.title = trimmed.substring(2).trim();
      } 
      // Subtitle (##)
      else if (trimmed.startsWith('## ')) {
        currentSlide.content.subtitle = trimmed.substring(3).trim();
      }
      // Image (![alt](src)) - Naive regex
      else if (trimmed.match(/^!\[(.*?)\]\((.*?)\)/)) {
        const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
        // Add as element
        currentSlide.content.elements.push({
           id: crypto.randomUUID(),
           type: 'image',
           src: match[2],
           x: 50, y: 150, width: 400, height: 300
        });
      }
      // Content
      else {
        if (trimmed.length > 0) {
           currentSlide.bodyLines.push(trimmed);
        }
      }
    });

    finishSlide();
    return slides;
  },

  createSlide() {
    return {
      id: crypto.randomUUID(),
      layout: 'title-body', // Default to generic
      theme: 'default', // Will inherit or override?
      transition: 'none',
      content: {
        title: '',
        subtitle: '',
        body: '',
        elements: []
      },
      bodyLines: [] // Temp storage for parsing
    };
  },

  processBody(lines) {
    // Check if lines look like a list
    const isList = lines.every(l => l.startsWith('- ') || l.startsWith('* '));
    if (isList) {
       return `<ul>${lines.map(l => `<li>${l.substring(2)}</li>`).join('')}</ul>`;
    }
    return lines.join('<br>');
  }
};

export const LayoutEngine = {
  render(slide) {
    if (!slide) return '<div class="slide-error">No slide selected</div>';

    const { layout, content } = slide;
    
    switch (layout) {
      case 'title':
        return `
          <div class="slide layout-title">
            <h1>${content.title || ''}</h1>
            <h2>${content.subtitle || ''}</h2>
          </div>
        `;
      
      case 'title-body':
        return `
          <div class="slide layout-title-body">
            <h1>${content.title || ''}</h1>
            <div class="slide-body">
              ${content.body || ''}
            </div>
          </div>
        `;

      default:
        return `<div class="slide">Unknown Layout: ${layout}</div>`;
    }
  }
};

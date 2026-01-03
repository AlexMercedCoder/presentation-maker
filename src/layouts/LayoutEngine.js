export const LayoutEngine = {
  render(slide, isEditable = false) {
    if (!slide) return '<div class="slide-error">No slide selected</div>';

    const { layout, content } = slide;
    const editAttr = (field) => isEditable ? `contenteditable="true" data-editable="${field}"` : '';
    
    // Render Elements Layer
    let elementsHTML = '';
    if (content.elements && content.elements.length > 0) {
      elementsHTML = content.elements.map(el => {
        if (el.type === 'image') {
          return `<img src="${el.src}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; cursor: move;" draggable="false" />`;
        }
        return '';
      }).join('');
    }

    const slideContent = (() => {
      switch (layout) {
        case 'title':
          return `
            <div class="slide layout-title">
              <h1 ${editAttr('title')}>${content.title || ''}</h1>
              <h2 ${editAttr('subtitle')}>${content.subtitle || ''}</h2>
            </div>
          `;
        
        case 'title-body':
          return `
            <div class="slide layout-title-body">
              <h1 ${editAttr('title')}>${content.title || ''}</h1>
              <div class="slide-body" ${editAttr('body')}>
                ${content.body || ''}
              </div>
            </div>
          `;
  
        default:
          return `<div class="slide">Unknown Layout: ${layout}</div>`;
      }
    })();

    return `
      ${slideContent}
      ${elementsHTML}
    `;
  }
};

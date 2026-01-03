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
        
        case 'hero':
          return `
            <div class="slide layout-hero">
              <h1 ${editAttr('title')}>${content.title || 'HERO TITLE'}</h1>
              <h2 ${editAttr('subtitle')}>${content.subtitle || 'Subtitle goes here'}</h2>
            </div>
          `;

        case 'split-diagonal':
          return `
            <div class="slide layout-split-diagonal">
              <div class="side-left">
                <h1 ${editAttr('title')}>${content.title || 'Left Side'}</h1>
              </div>
              <div class="side-right">
                <div ${editAttr('body')}>${content.body || 'Right side content...'}</div>
              </div>
            </div>
          `;

        case 'stats':
           return `
            <div class="slide layout-stats">
              <h2 ${editAttr('title')}>${content.title || 'Key Statistics'}</h2>
              <div class="stats-grid">
                 <div class="stat-item">
                    <div class="stat-number" ${editAttr('stat1')}>95%</div>
                    <div ${editAttr('label1')}>Growth</div>
                 </div>
                 <div class="stat-item">
                    <div class="stat-number" ${editAttr('stat2')}>1.2M</div>
                    <div ${editAttr('label2')}>Users</div>
                 </div>
                 <div class="stat-item">
                    <div class="stat-number" ${editAttr('stat3')}>#1</div>
                    <div ${editAttr('label3')}>Rank</div>
                 </div>
              </div>
            </div>
           `;

        case 'quote':
           return `
            <div class="slide layout-quote">
              <blockquote ${editAttr('quote')}>"Inspired Design is the heart of presentation."</blockquote>
              <cite ${editAttr('author')}>- Alex Merced</cite>
            </div>
           `;
           
        case 'gallery':
           // Placeholder gallery
           return `
            <div class="slide layout-gallery">
               <h2 ${editAttr('title')}>Gallery</h2>
               <div class="gallery-grid">
                 <div class="gallery-item" ${editAttr('img1')}>Image 1</div>
                 <div class="gallery-item" ${editAttr('img2')}>Image 2</div>
                 <div class="gallery-item" ${editAttr('img3')}>Image 3</div>
                 <div class="gallery-item" ${editAttr('img4')}>Image 4</div>
                 <div class="gallery-item" ${editAttr('img5')}>Image 5</div>
                 <div class="gallery-item" ${editAttr('img6')}>Image 6</div>
               </div>
            </div>
           `;
  
        case 'code':
          return `
            <div class="slide layout-code">
              <h1 ${editAttr('title')}>${content.title || 'Code Example'}</h1>
              <div class="code-wrapper" ${editAttr('body')}>
// Type your code here...
function hello() {
  console.log("Hello World");
}
              </div>
            </div>
          `;

        case 'comparison':
          return `
            <div class="slide layout-comparison">
               <h1 ${editAttr('title')}>${content.title || 'Comparison'}</h1>
               <div class="comparison-col">
                  <h2 ${editAttr('subtitle1')}>${content.subtitle1 || 'Option A'}</h2>
                  <div class="slide-body" ${editAttr('body1')}>
                     ${content.body1 || '<ul><li>Pros</li><li>Cons</li></ul>'}
                  </div>
               </div>
               <div class="comparison-col">
                  <h2 ${editAttr('subtitle2')}>${content.subtitle2 || 'Option B'}</h2>
                  <div class="slide-body" ${editAttr('body2')}>
                     ${content.body2 || '<ul><li>Pros</li><li>Cons</li></ul>'}
                  </div>
               </div>
            </div>
          `;

        case 'big-list':
          return `
            <div class="slide layout-big-list">
               <h1 ${editAttr('title')}>${content.title || 'Key Points'}</h1>
               <div class="slide-body" ${editAttr('body')}>
                 ${content.body || '<ul><li>Key Point 1</li><li>Key Point 2</li><li>Key Point 3</li></ul>'}
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

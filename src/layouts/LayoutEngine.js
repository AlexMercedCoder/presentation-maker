import hljs from 'highlight.js';

export const LayoutEngine = {
  render(slide, isEditable = false) {
    if (!slide) return '<div class="slide-error">No slide selected</div>';

    const { layout, content } = slide;
    const editAttr = (field) => isEditable ? `contenteditable="true" data-editable="${field}"` : '';
    
    // Render Elements Layer
    let elementsHTML = '';
    if (content.elements && content.elements.length > 0) {
      elementsHTML = content.elements.map((el, index) => {
        if (el.type === 'image') {
          // Wrapped for resize
          return `
            <div class="slide-element-wrapper" data-index="${index}" style="position: absolute; left: ${el.x}px; top: ${el.y}px;">
               <img src="${el.src}" style="width: ${el.width}px; height: ${el.height}px; cursor: move; display:block;" draggable="false" />
               ${isEditable ? '<div class="resize-handle"></div>' : ''}
            </div>
          `;
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
          // In Edit Mode, keep it raw. In Presentation Mode, highlight it.
          // Note: isEditable is true in EditorCanvas, false in PresentationController? 
          // Actually PresentationController renders HTML directly or via LayoutEngine?
          // PresentationController doesn't use LayoutEngine directly, it relies on what's in the DOM?
          // WAIT. Presentation Mode just makes the body fullscreen. The DOM matches EditorCanvas mostly.
          // BUT EditorCanvas calls LayoutEngine.render(..., true). 
          // The Preview in Library calls LayoutEngine.render(..., false).
          // We need a way to distinguish "Presentation Mode" vs "Editor Mode".
          // The CSS handles hiding UI. 
          // Problem: The code block is contenteditable in Editor.
          // We want it to be highlighted in Presentation.
          // Strategy: Render TWO versions. One hidden in edit, visible in presentation.
          // Or, since we only have CSS control, we can't easily swap DOM content based on mode purely with CSS 
          // unless we render both.
          
          let highlightedCode = '';
          try {
             // Simple safety check
             if (content.body && hljs) {
               highlightedCode = hljs.highlightAuto(content.body.replace(/<[^>]*>?/gm, '')).value;
             }
          } catch (e) { highlightedCode = content.body; }

          return `
            <div class="slide layout-code">
              <h1 ${editAttr('title')}>${content.title || 'Code Example'}</h1>
              
              <!-- Editor View (Editable) -->
              <div class="code-wrapper editor-only" ${editAttr('body')}>${content.body || '// Code here...'}</div>

              <!-- Presentation View (Highlighted) -->
              <div class="code-wrapper presentation-only">
                 <pre><code class="hljs">${highlightedCode || content.body || '// Code here...'}</code></pre>
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

        case 'statement':
          return `
             <div class="slide layout-statement">
                <h1 ${editAttr('title')}>${content.title || 'Make a Bold Statement.'}</h1>
             </div>
          `;

        case 'photo-grid':
          return `
            <div class="slide layout-photo-grid">
               <h1 ${editAttr('title')}>${content.title || 'Visual Journey'}</h1>
               <div class="photo-grid-container">
                  <div class="grid-photo" ${editAttr('img1')} style="background:#eee;">Photo 1</div>
                  <div class="grid-photo" ${editAttr('img2')} style="background:#ddd;">Photo 2</div>
                  <div class="grid-photo" ${editAttr('img3')} style="background:#ccc;">Photo 3</div>
                  <div class="grid-photo" ${editAttr('img4')} style="background:#bbb;">Photo 4</div>
               </div>
            </div>
          `;
        
        case 'timeline':
          return `
            <div class="slide layout-timeline">
               <h1 ${editAttr('title')}>${content.title || 'Project Timeline'}</h1>
               <div class="timeline-container">
                  <div class="timeline-item">
                     <div class="timeline-dot"></div>
                     <div class="timeline-content">
                        <h3 ${editAttr('h1')}>Phase 1</h3>
                        <p ${editAttr('p1')}>Planning</p>
                     </div>
                  </div>
                  <div class="timeline-item">
                     <div class="timeline-dot"></div>
                     <div class="timeline-content">
                        <h3 ${editAttr('h2')}>Phase 2</h3>
                        <p ${editAttr('p2')}>Design</p>
                     </div>
                  </div>
                  <div class="timeline-item">
                     <div class="timeline-dot"></div>
                     <div class="timeline-content">
                        <h3 ${editAttr('h3')}>Phase 3</h3>
                        <p ${editAttr('p3')}>Development</p>
                     </div>
                  </div>
                  <div class="timeline-item">
                     <div class="timeline-dot"></div>
                     <div class="timeline-content">
                        <h3 ${editAttr('h4')}>Phase 4</h3>
                        <p ${editAttr('p4')}>Launch</p>
                     </div>
                  </div>
               </div>
            </div>
          `;

        case 'venn':
           return `
            <div class="slide layout-venn">
               <h1 ${editAttr('title')}>${content.title || 'Intersection'}</h1>
               <div class="venn-container">
                  <div class="venn-circle c1"><span ${editAttr('l1')}>Left</span></div>
                  <div class="venn-circle c2"><span ${editAttr('l2')}>Right</span></div>
                  <div class="venn-center"><span ${editAttr('l3')}>Both</span></div>
               </div>
            </div>
           `;

        case 'funnel':
           return `
            <div class="slide layout-funnel">
               <h1 ${editAttr('title')}>${content.title || 'Sales Funnel'}</h1>
               <div class="funnel-container">
                  <div class="funnel-layer l1" ${editAttr('l1')}>Awareness</div>
                  <div class="funnel-layer l2" ${editAttr('l2')}>Interest</div>
                  <div class="funnel-layer l3" ${editAttr('l3')}>Decision</div>
                  <div class="funnel-layer l4" ${editAttr('l4')}>Action</div>
               </div>
            </div>
           `;
        
        case 'pyramid':
           return `
            <div class="slide layout-pyramid">
               <h1 ${editAttr('title')}>${content.title || 'Hierarchy'}</h1>
               <div class="pyramid-container">
                  <div class="pyramid-layer p1" ${editAttr('l1')}>Top</div>
                  <div class="pyramid-layer p2" ${editAttr('l2')}>Middle</div>
                  <div class="pyramid-layer p3" ${editAttr('l3')}>Base</div>
               </div>
            </div>
           `;

        case 'swot':
           return `
            <div class="slide layout-swot">
               <h1 ${editAttr('title')}>${content.title || 'SWOT Analysis'}</h1>
               <div class="swot-grid">
                  <div class="swot-box s-strengths">
                     <h3>Strengths</h3>
                     <div ${editAttr('s')}>- Point A<br>- Point B</div>
                  </div>
                  <div class="swot-box s-weaknesses">
                     <h3>Weaknesses</h3>
                     <div ${editAttr('w')}>- Point A<br>- Point B</div>
                  </div>
                  <div class="swot-box s-opportunities">
                     <h3>Opportunities</h3>
                     <div ${editAttr('o')}>- Point A<br>- Point B</div>
                  </div>
                  <div class="swot-box s-threats">
                     <h3>Threats</h3>
                     <div ${editAttr('t')}>- Point A<br>- Point B</div>
                  </div>
               </div>
            </div>
           `;

        case 'team':
           return `
            <div class="slide layout-team">
               <h1 ${editAttr('title')}>${content.title || 'Our Team'}</h1>
               <div class="team-grid">
                  <div class="team-member">
                     <div class="avatar" style="background:#ddd;">img</div>
                     <h3 ${editAttr('n1')}>Name</h3>
                     <p ${editAttr('r1')}>Role</p>
                  </div>
                  <div class="team-member">
                     <div class="avatar" style="background:#ccc;">img</div>
                     <h3 ${editAttr('n2')}>Name</h3>
                     <p ${editAttr('r2')}>Role</p>
                  </div>
                  <div class="team-member">
                     <div class="avatar" style="background:#bbb;">img</div>
                     <h3 ${editAttr('n3')}>Name</h3>
                     <p ${editAttr('r3')}>Role</p>
                  </div>
               </div>
            </div>
           `;
        
        case 'video':
           return `
            <div class="slide layout-video">
               <h1 ${editAttr('title')}>${content.title || 'Video Demo'}</h1>
               <div class="video-placeholder">
                  <div class="play-button">▶</div>
                  <p ${editAttr('cap')}>Video Placeholder (16:9)</p>
               </div>
            </div>
           `;

        case 'kanban':
           return `
            <div class="slide layout-kanban">
               <h1 ${editAttr('title')}>${content.title || 'Project Board'}</h1>
               <div class="kanban-board">
                  <div class="kanban-col">
                     <h3>To Do</h3>
                     <div class="card" ${editAttr('c1')}>Task 1</div>
                     <div class="card" ${editAttr('c2')}>Task 2</div>
                  </div>
                  <div class="kanban-col">
                     <h3>Doing</h3>
                     <div class="card" ${editAttr('c3')}>Task 3</div>
                  </div>
                  <div class="kanban-col">
                     <h3>Done</h3>
                     <div class="card" ${editAttr('c4')}>Task 4</div>
                  </div>
               </div>
            </div>
           `;

        case 'agenda':
           return `
            <div class="slide layout-agenda">
               <h1 ${editAttr('title')}>${content.title || 'Agenda'}</h1>
               <ul class="agenda-list">
                  <li><span class="time" ${editAttr('t1')}>09:00</span> <span ${editAttr('i1')}>Introduction</span></li>
                  <li><span class="time" ${editAttr('t2')}>10:00</span> <span ${editAttr('i2')}>Deep Dive</span></li>
                  <li><span class="time" ${editAttr('t3')}>12:00</span> <span ${editAttr('i3')}>Lunch</span></li>
                  <li><span class="time" ${editAttr('t4')}>01:00</span> <span ${editAttr('i4')}>Workshop</span></li>
                  <li><span class="time" ${editAttr('t5')}>04:00</span> <span ${editAttr('i5')}>Q&A</span></li>
               </ul>
            </div>
           `;

        case 'chart':
           return `
            <div class="slide layout-chart">
               <h1 ${editAttr('title')}>${content.title || 'Data Analysis'}</h1>
               <div class="chart-placeholder">
                  <div class="bar" style="height:40%"></div>
                  <div class="bar" style="height:70%"></div>
                  <div class="bar" style="height:50%"></div>
                  <div class="bar" style="height:90%"></div>
                  <div class="bar" style="height:60%"></div>
               </div>
               <p ${editAttr('cap')}>Annual Growth</p>
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

export const HTMLGenerator = {
  generateStandalone(deck) {
    // Get Styles
    // We try to grab the content of style tags or linked css.
    // In a build repo, CSS might be in assets. 
    // For runtime generation, fetching CSS content via fetch is robust if relative paths work,
    // but easier: iterate document.styleSheets and inline rules.
    
    const cssRules = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          console.warn('Could not read sheet', sheet.href);
          return '';
        }
      })
      .join('\n');

    const appScript = `
      const DECK = ${JSON.stringify(deck)};
      let activeSlideIndex = 0;

      function renderSlide(index) {
         const slide = DECK.slides[index];
         if (!slide) return;
         
         const container = document.getElementById('slide-container');
         // We need the LayoutEngine logic here or a simplified version.
         // Since we can't easily import the module source, we will inline a simplified renderer
         // OR we just rely on the server logic? No, this is standalone.
         // We must replicate the Render Logic. 
         
         container.innerHTML = getSlideHTML(slide);
         
         // Apply Theme
         applyTheme(DECK.meta.customTheme);
         
         // Apply Transition
         const trans = DECK.meta.transition || 'none';
         container.className = 'slide-container ' + (trans !== 'none' ? 'trans-' + trans : '');
      }

      function getSlideHTML(slide) {
         const content = slide.content;
         const layout = slide.layout;
         
         // Elements
         let elements = '';
         if (content.elements) {
           elements = content.elements.map(el => {
             if (el.type === 'image') return \`<img src="\${el.src}" style="position:absolute; left:\${el.x}px; top:\${el.y}px; width:\${el.width}px; height:\${el.height}px;">\`;
             return '';
           }).join('');
         }

         // Layouts (Simplified mapping from LayoutEngine)
         let body = '';
         if (layout === 'title') {
           body = \`<div class="slide layout-title"><h1>\${content.title}</h1><h2>\${content.subtitle||''}</h2></div>\`;
         } else if (layout === 'title-body') {
           body = \`<div class="slide layout-title-body"><h1>\${content.title}</h1><div class="slide-body">\${content.body}</div></div>\`;
         } else if (layout === 'hero') {
           body = \`<div class="slide layout-hero"><h1>\${content.title}</h1><h2>\${content.subtitle}</h2></div>\`;
         } else if (layout === 'code') {
           body = \`<div class="slide layout-code"><h1>\${content.title}</h1><div class="code-wrapper"><pre><code>\${content.body.replace(/<[^>]*>?/gm, '')}</code></pre></div></div>\`;
         } else {
           // Fallback for others - generic render
           body = \`<div class="slide layout-title-body"><h1>\${content.title||'Slide'}</h1><div class="slide-body">\${content.body||''}</div></div>\`;
         }
         
         return body + elements;
      }

      function applyTheme(theme) {
         if (!theme) return;
         const root = document.documentElement;
         root.style.setProperty('--bg-color', theme.bg);
         root.style.setProperty('--text-main', theme.text);
         root.style.setProperty('--primary-color', theme.primary);
         root.style.setProperty('--secondary-color', theme.secondary);
         root.style.setProperty('--text-accent', theme.accent);
         root.style.setProperty('--font-main', theme.font);
      }

      document.addEventListener('keydown', (e) => {
         if (e.key === 'ArrowRight' || e.key === ' ') {
            if (activeSlideIndex < DECK.slides.length - 1) {
               activeSlideIndex++;
               renderSlide(activeSlideIndex);
            }
         } else if (e.key === 'ArrowLeft') {
            if (activeSlideIndex > 0) {
               activeSlideIndex--;
               renderSlide(activeSlideIndex);
            }
         }
      });

      // Init
      renderSlide(0);
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deck.meta.title}</title>
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 0; overflow: hidden; background: black; font-family: sans-serif; height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; }
    
    /* Inlined App CSS */
    ${cssRules}

    /* Overrides */
    .slide-container {
       width: 960px; height: 540px; 
       background: var(--bg-color); 
       overflow: hidden; 
       position: relative;
       transform: scale(1.5); /* Scale for full screen approx */
    }
  </style>
</head>
<body>
  <div id="slide-container" class="slide-container"></div>
  <script>
    ${appScript}
  </script>
</body>
</html>
    `;
  }
};

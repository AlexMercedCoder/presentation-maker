import { store } from '../core/Store';

export const AssetModal = {
  activeTab: 'images',
  
  mockImages: [
     'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80', // Coding
     'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=400&q=80', // Nature
     'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80', // Tech
     'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80', // Library
     'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80', // Dog
     'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=400&q=80', // Person
  ],

  // Common SVGs (roughly Lucide style)
  mockIcons: [
     { name: 'arrow-right', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' },
     { name: 'check', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' },
     { name: 'user', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
     { name: 'star', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
     { name: 'heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
  ],

  mockGifs: [
     'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXg4dGx4anJ4bXg4dGx4anJ4bXg4dGx4anJ4bXg4dGx4anJ4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tP3M3i03qgDge5q/giphy.gif', // Placeholder 1
     'https://media.giphy.com/media/l0HlHJGHe3yAMhdQY/giphy.gif', // Placeholder 2 (Success?)
  ],

  render() {
    return `
      <div id="asset-modal" class="modal-overlay hidden">
        <div class="modal-content asset-modal-body">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
             <h3>Insert Content</h3>
             <button id="asset-close" class="close-btn">&times;</button>
          </div>
          
          <div class="asset-tabs">
             <button class="asset-tab-btn ${this.activeTab === 'images' ? 'active' : ''}" data-tab="images">Unsplash</button>
             <button class="asset-tab-btn ${this.activeTab === 'icons' ? 'active' : ''}" data-tab="icons">Icons</button>
             <button class="asset-tab-btn ${this.activeTab === 'gifs' ? 'active' : ''}" data-tab="gifs">GIPHY</button>
          </div>
          
          <div class="asset-search-container">
             <input type="text" id="asset-search" class="asset-search-input" placeholder="Search curated assets...">
             <button id="asset-search-btn" class="asset-search-btn">Search</button>
          </div>
          
          <div id="asset-grid" class="asset-grid">
             ${this.renderGrid()}
          </div>
          
          <div style="font-size:0.8rem; color:#9ca3af; margin-top:10px; text-align:center;">
             * Demo Mode: Showing curated results. Connect API keys for full search.
          </div>
        </div>
      </div>
    `;
  },
  
  renderGrid() {
      if (this.activeTab === 'images') {
         return this.mockImages.map(url => `
            <div class="asset-card" data-type="image" data-src="${url}">
               <img src="${url}" loading="lazy" />
               <div class="asset-overlay">
                  <div class="asset-add-icon">+</div>
               </div>
            </div>
         `).join('');
      } else if (this.activeTab === 'icons') {
         return this.mockIcons.map(icon => `
            <div class="asset-card" data-type="icon" data-content="${encodeURIComponent(icon.svg)}">
               <div class="asset-card-icon">
                  ${icon.svg.replace('width="24"', 'width="100%"').replace('height="24"', 'height="100%"')}
               </div>
               <div class="asset-overlay">
                  <div class="asset-add-icon">+</div>
               </div>
            </div>
         `).join('');
      } else if (this.activeTab === 'gifs') {
         return this.mockGifs.map(url => `
            <div class="asset-card" data-type="image" data-src="${url}">
               <img src="${url}" loading="lazy" />
               <div class="asset-overlay">
                  <div class="asset-add-icon">GIF</div>
               </div>
            </div>
         `).join('');
      }
  },

  toggle(tab = 'images') {
    this.activeTab = tab;
    const modal = document.getElementById('asset-modal');
    if (!modal) {
      const div = document.createElement('div');
      div.innerHTML = this.render();
      document.body.appendChild(div.firstElementChild);
      this.attachEvents();
    } else {
       // Just update tabs logic or re-render?
       // Let's re-render inner to be safe
       const temp = document.createElement('div');
       temp.innerHTML = this.render();
       modal.innerHTML = temp.firstElementChild.innerHTML;
       modal.classList.remove('hidden');
       this.attachEvents();
    }
  },

  attachEvents() {
    const modal = document.getElementById('asset-modal');
    if(!modal) return;
    
    // Close
    modal.querySelector('#asset-close').addEventListener('click', () => {
       modal.classList.add('hidden');
    });

    // Tabs
    modal.querySelectorAll('.tab-btn').forEach(btn => {
       btn.addEventListener('click', () => {
          this.toggle(btn.dataset.tab);
       });
    });

    // Search
    modal.querySelector('#asset-search-btn').addEventListener('click', async () => {
       const term = modal.querySelector('#asset-search').value;
       const config = store.getConfig();
       const grid = modal.querySelector('#asset-grid');

       if (this.activeTab === 'images') {
           if (config.unsplashKey) {
               grid.innerHTML = '<div style="padding:20px; text-align:center;">Loading Unsplash...</div>';
               try {
                   // Using Unsplash API
                   const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=12&client_id=${config.unsplashKey}`);
                   const data = await res.json();
                   
                   if (data.results) {
                       this.mockImages = data.results.map(img => img.urls.regular); 
                       // Render
                       const html = data.results.map(img => `
                        <div class="asset-card" data-type="image" data-src="${img.urls.regular}">
                           <img src="${img.urls.small}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" />
                           <div class="asset-overlay">
                              <div class="asset-add-icon">+</div>
                           </div>
                           <div style="font-size:10px; position:absolute; bottom:2px; left:2px; color:white; text-shadow:0 1px 2px black;">${img.user.name}</div>
                        </div>
                       `).join('');
                       grid.innerHTML = html;
                   }
               } catch (e) {
                   console.error(e);
                   alert('Unsplash Error: Check API Key.');
               }
           } else {
               alert('Please configure Unsplash API Key in Settings > File Menu.');
           }
       } else if (this.activeTab === 'gifs') {
           if (config.giphyKey) {
                grid.innerHTML = '<div style="padding:20px; text-align:center;">Loading GIPHY...</div>';
                try {
                    const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${config.giphyKey}&q=${encodeURIComponent(term)}&limit=12&rating=g`);
                    const data = await res.json();
                    
                    if (data.data) {
                        this.mockGifs = data.data.map(g => g.images.original.url);
                        const html = data.data.map(g => `
                            <div class="asset-card" data-type="image" data-src="${g.images.original.url}">
                               <img src="${g.images.fixed_height.url}" loading="lazy" />
                               <div class="asset-overlay">
                                  <div class="asset-add-icon">GIF</div>
                               </div>
                            </div>
                         `).join('');
                        grid.innerHTML = html;
                    }
                } catch(e) {
                    console.error(e);
                    alert('GIPHY Error: Check API Key.');
                }
           } else {
               alert('Please configure GIPHY API Key in Settings > File Menu.');
           }
       } else {
           // Icons - Mock Search
           alert(`Searching icons for "${term}"... (Not fully implemented, showing fallback)`);
       }
    });
    
    // Selection
    const grid = modal.querySelector('#asset-grid');
    grid.addEventListener('click', (e) => {
       const item = e.target.closest('.asset-item');
       if (item) {
          const type = item.dataset.type;
          
          if (type === 'image') {
             store.addElementToSlide(store.activeSlide.id, {
                id: crypto.randomUUID(),
                type: 'image',
                src: item.dataset.src,
                x: 100, y: 100, width: 300, height: 200
             });
          } else if (type === 'icon') {
             // For Icons, we insert as HTML/SVG or image?
             // Our system supports 'text' and 'image'.
             // Let's support 'element' with html content? 
             // Or 'text' with SVG content?
             // Since we have a 'box' layout engine for elements...
             store.addElementToSlide(store.activeSlide.id, {
                id: crypto.randomUUID(),
                type: 'text', // Using text type to render HTML/SVG for now
                content: decodeURIComponent(item.dataset.content),
                x: 100, y: 100, width: 100, height: 100,
                style: 'svg-icon'
             });
          }
          
          modal.classList.add('hidden');
       }
    });
  }
};

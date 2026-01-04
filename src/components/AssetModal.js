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
        <div class="modal-content" style="max-width: 600px; height: 500px; display:flex; flex-direction:column;">
          <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center;">
             <h3>Insert Content</h3>
             <button id="asset-close" class="close-btn">&times;</button>
          </div>
          
          <div class="tabs" style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid #ddd; padding-bottom:10px;">
             <button class="tab-btn ${this.activeTab === 'images' ? 'active' : ''}" data-tab="images">Unsplash</button>
             <button class="tab-btn ${this.activeTab === 'icons' ? 'active' : ''}" data-tab="icons">Icons</button>
             <button class="tab-btn ${this.activeTab === 'gifs' ? 'active' : ''}" data-tab="gifs">GIPHY</button>
          </div>
          
          <div class="search-bar" style="display:flex; gap:5px; margin-bottom:15px;">
             <input type="text" id="asset-search" placeholder="Search..." style="flex:1;">
             <button id="asset-search-btn">Search</button>
          </div>
          
          <div id="asset-grid" class="asset-grid" style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
             ${this.renderGrid()}
          </div>
          
          <div style="font-size:0.8rem; color:#888; margin-top:10px;">
             * Demo Mode: Showing curated results.
          </div>
        </div>
      </div>
    `;
  },
  
  renderGrid() {
      if (this.activeTab === 'images') {
         return this.mockImages.map(url => `
            <div class="asset-item" data-type="image" data-src="${url}" style="cursor:pointer; border:1px solid #ddd; border-radius:4px; overflow:hidden; height:100px;">
               <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
            </div>
         `).join('');
      } else if (this.activeTab === 'icons') {
         return this.mockIcons.map(icon => `
            <div class="asset-item" data-type="icon" data-content="${encodeURIComponent(icon.svg)}" style="cursor:pointer; border:1px solid #ddd; border-radius:4px; display:flex; align-items:center; justify-content:center; height:100px; font-size: 2rem;">
               <div style="width:48px; height:48px;">${icon.svg.replace('width="24"', 'width="100%"').replace('height="24"', 'height="100%"')}</div>
            </div>
         `).join('');
      } else if (this.activeTab === 'gifs') {
         return this.mockGifs.map(url => `
            <div class="asset-item" data-type="image" data-src="${url}" style="cursor:pointer; border:1px solid #ddd; border-radius:4px; overflow:hidden; height:100px;">
               <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
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

    // Search (Mock)
    modal.querySelector('#asset-search-btn').addEventListener('click', () => {
       const term = modal.querySelector('#asset-search').value;
       alert(`Demo search for "${term}": No API key configured. Showing default results.`);
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

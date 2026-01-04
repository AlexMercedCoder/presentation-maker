
export const FloatingToolbar = {
  render() {
    return `
      <div id="floating-toolbar" class="floating-toolbar hidden">
        <!-- Text Controls -->
        <div class="ft-section ft-text">
          <button data-cmd="bold" title="Bold"><b>B</b></button>
          <button data-cmd="italic" title="Italic"><i>I</i></button>
          <button data-cmd="underline" title="Underline"><u>U</u></button>
          <div class="separator"></div>
          <button data-cmd="justifyLeft" title="Align Left">⬅️</button>
          <button data-cmd="justifyCenter" title="Align Center">↔️</button>
          <button data-cmd="justifyRight" title="Align Right">➡️</button>
        </div>
        
        <!-- Element Controls -->
        <div class="ft-section ft-element hidden">
           <button data-action="layer-front" title="Bring to Front">⬆️</button>
           <button data-action="layer-back" title="Send to Back">⬇️</button>
           <button data-action="layer-forward" title="Move Forward">↑</button>
           <button data-action="layer-backward" title="Move Backward">↓</button>
           <div class="separator"></div>
           <button data-action="delete" title="Delete Element" style="color:red;">🗑️</button>
        </div>
      </div>
    `;
  },

  init() {
    // Append to body if not exists
    if (!document.getElementById('floating-toolbar')) {
      const div = document.createElement('div');
      div.innerHTML = this.render();
      document.body.appendChild(div.firstElementChild);
      this.attachEvents();
    }
  },

  attachEvents() {
    const toolbar = document.getElementById('floating-toolbar');
    let selectedElementIndex = null;
    
    // Command handling (Text)
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault(); 
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.dataset.cmd) {
         document.execCommand(btn.dataset.cmd, false, null);
      } else if (btn.dataset.action) {
         // Element Action
         import('../core/Store').then(({ store }) => {
            const slideId = store.activeSlide.id;
            // We need element ID. 
            // Warning: Store uses element ID for reorderElement, but we passed Index in event.
            // Let's get the element ID from the store using the index? 
            // Or change reorderElement to use index? Store has reorderElement(slideId, elementId, action).
            // Let's resolve ID from index.
            const element = store.activeSlide.content.elements[selectedElementIndex];
            if (element) {
               if (btn.dataset.action === 'delete') {
                  // store.deleteElement? We probably need to implement deleteElement too.
                  // For now, let's stick to layers. Delete is a bonus in plan.
                  // Wait, deleting elements is useful.
                  // Let's use reorder logic or implement delete.
                  // Assuming reorder for now.
               } else {
                  store.reorderElement(slideId, element.id, btn.dataset.action.replace('layer-', ''));
               }
            }
         });
      }
    });

    // Text Selection
    document.addEventListener('selectionchange', () => {
      // Priority: Element Selection > Text Selection? 
      // Actually usually mutually exclusive if we deselect element on text select.
      // But text inside element? 
      this.updatePosition();
    });
    
    document.addEventListener('mouseup', () => {
       setTimeout(() => this.updatePosition(), 10);
    });

    // Element Selection
    document.addEventListener('element-selected', (e) => {
       selectedElementIndex = e.detail.index;
       this.showElementToolbar(e.detail.index);
    });

    document.addEventListener('element-deselected', () => {
       selectedElementIndex = null;
       this.hideElementToolbar();
    });
  },

  showElementToolbar(index) {
     const toolbar = document.getElementById('floating-toolbar');
     const textSection = toolbar.querySelector('.ft-text');
     const elSection = toolbar.querySelector('.ft-element');
     
     textSection.classList.add('hidden');
     elSection.classList.remove('hidden');
     toolbar.classList.remove('hidden');
     
     // Position near element
     // We need to query the DOM element again to get rect?
     // Or pass rect in event?
     // Let's find it.
     const el = document.querySelector(`.slide-element-wrapper[data-index="${index}"]`);
     if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY - 50;
        const left = rect.left + window.scrollX + (rect.width/2) - (toolbar.offsetWidth/2);
        
        toolbar.style.top = `${Math.max(10, top)}px`;
        toolbar.style.left = `${Math.max(10, left)}px`;
     }
  },

  hideElementToolbar() {
     const toolbar = document.getElementById('floating-toolbar');
     const elSection = toolbar.querySelector('.ft-element');
     elSection.classList.add('hidden');
     toolbar.classList.add('hidden');
  },

  updatePosition() {
    const toolbar = document.getElementById('floating-toolbar');
    // If element toolbar is showing, don't override with text selection logic unless explicit?
    if (!toolbar.querySelector('.ft-element').classList.contains('hidden')) return;

    const selection = window.getSelection();

    if (selection.rangeCount === 0 || selection.isCollapsed) {
      toolbar.classList.add('hidden');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Only show if selection is inside an editable area
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === 3) parent = parent.parentNode;
    if (!parent.closest('[contenteditable="true"]')) {
       toolbar.classList.add('hidden');
       return;
    }
    
    const textSection = toolbar.querySelector('.ft-text');
    textSection.classList.remove('hidden');
    toolbar.classList.remove('hidden');
    
    // Position above text
    const toolbarHeight = 40;
    const top = rect.top + window.scrollY - toolbarHeight - 10;
    const left = rect.left + window.scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2);

    toolbar.style.top = `${Math.max(10, top)}px`;
    toolbar.style.left = `${Math.max(10, left)}px`;
  }
};

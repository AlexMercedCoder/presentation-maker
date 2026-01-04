
export const FloatingToolbar = {
  render() {
    return `
      <div id="floating-toolbar" class="floating-toolbar hidden">
        <button data-cmd="bold" title="Bold"><b>B</b></button>
        <button data-cmd="italic" title="Italic"><i>I</i></button>
        <button data-cmd="underline" title="Underline"><u>U</u></button>
        <div class="separator"></div>
        <button data-cmd="justifyLeft" title="Align Left">⬅️</button>
        <button data-cmd="justifyCenter" title="Align Center">↔️</button>
        <button data-cmd="justifyRight" title="Align Right">➡️</button>
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
    
    // Command handling
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent losing selection
      const btn = e.target.closest('button');
      if (btn) {
        const cmd = btn.dataset.cmd;
        document.execCommand(cmd, false, null);
      }
    });

    // Selection monitoring
    document.addEventListener('selectionchange', () => {
      this.updatePosition();
    });
    
    // Also update on mouseup to be sure
    document.addEventListener('mouseup', () => {
       setTimeout(() => this.updatePosition(), 10);
    });
  },

  updatePosition() {
    const toolbar = document.getElementById('floating-toolbar');
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

    toolbar.classList.remove('hidden');
    
    // Position above text
    const toolbarHeight = 40;
    const top = rect.top + window.scrollY - toolbarHeight - 10;
    const left = rect.left + window.scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2);

    toolbar.style.top = `${Math.max(10, top)}px`;
    toolbar.style.left = `${Math.max(10, left)}px`;
  }
};

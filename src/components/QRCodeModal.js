import QRCode from 'qrcode';
import { store } from '../core/Store';

export const QRCodeModal = {
  render() {
    return `
      <div id="qr-modal" class="modal-overlay hidden">
        <div class="modal-content">
          <h3>Insert QR Code</h3>
          <input type="text" id="qr-input" placeholder="Enter URL or Text" />
          <div class="modal-actions">
            <button id="qr-cancel">Cancel</button>
            <button id="qr-generate">Insert</button>
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(container) {
    const modal = document.getElementById('qr-modal');
    const input = document.getElementById('qr-input');
    const cancelBtn = document.getElementById('qr-cancel');
    const generateBtn = document.getElementById('qr-generate');

    const closeModal = () => {
      modal.classList.add('hidden');
      input.value = '';
    };

    cancelBtn.addEventListener('click', closeModal);

    generateBtn.addEventListener('click', async () => {
      const text = input.value;
      if (!text) return;

      try {
        const url = await QRCode.toDataURL(text, { color: { dark: '#000000', light: '#00000000' } });
        const activeSlide = store.activeSlide;
        if (activeSlide) {
          store.addElementToSlide(activeSlide.id, {
            type: 'image',
            src: url,
            x: 50,
            y: 50,
            width: 150,
            height: 150
          });
        }
        closeModal();
      } catch (err) {
        console.error(err);
        alert('Failed to generate QR Code');
      }
    });
  },

  open() {
    document.getElementById('qr-modal').classList.remove('hidden');
  }
};

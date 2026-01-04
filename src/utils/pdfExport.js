import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { LayoutEngine } from '../layouts/LayoutEngine';

export async function exportToPDF(slides, theme) {
  if (!slides || slides.length === 0) return;

  // Use fixed 16:9 resolution for capture
  const width = 1280; 
  const height = 720;
  
  // Initialize jsPDF in Landscape
  // unit: 'px' matches canvas pixels
  // hotfixes: 'px_scaling' ensures 1px = 1px in PDF logic regardless of device pixel ratio
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling']
  });

  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'fixed'; // Fixed prevents scroll interference
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  container.style.zIndex = '-1';
  
  // Wrapper for Theme Scope
  const wrapper = document.createElement('div');
  wrapper.className = `theme-${theme}`; // Scope theme
  
  const slideContainer = document.createElement('div');
  slideContainer.className = 'slide-container';
  slideContainer.style.width = width + 'px'; // Explicit pixels
  slideContainer.style.height = height + 'px';
  slideContainer.style.transform = 'none';
  slideContainer.style.border = 'none'; // Ensure no border offsets
  
  wrapper.appendChild(slideContainer);
  container.appendChild(wrapper);
  document.body.appendChild(container);

  try {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Render slide HTML
      slideContainer.innerHTML = LayoutEngine.render(slide, false);
      
      // Wait for DOM & Images
      // A slightly longer delay helps high-res images load/paint
      await new Promise(resolve => setTimeout(resolve, 150));

      // Capture with html2canvas
      // scale: 1 is fine if we set width/height to HD (1280x720)
      // Increasing scale adds quality but file size. 1.5 is a good balance.
      const canvas = await html2canvas(slideContainer, {
        scale: 1.5,
        width: width,
        height: height,
        useCORS: true,
        logging: false,
        backgroundColor: null // Transparent capture, relies on CSS background
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (i > 0) doc.addPage([width, height], 'landscape');
      
      // Explicitly fit image to page dimensions
      doc.addImage(imgData, 'JPEG', 0, 0, width, height);
    }

    doc.save('presentation.pdf');

  } catch (err) {
    console.error('PDF Export Failed:', err);
    alert('Failed to export PDF');
  } finally {
    document.body.removeChild(container);
  }
}

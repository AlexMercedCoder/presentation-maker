import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { LayoutEngine } from '../layouts/LayoutEngine';

export async function exportToPDF(slides, theme) {
  if (!slides || slides.length === 0) return;

  const width = 960;
  const height = 540;
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [width, height]
  });

  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  // Important: Apply the theme class to the container or a wrapper
  // We'll mimic the app structure: body.theme-X -> .slide-container
  const wrapper = document.createElement('div');
  wrapper.className = `theme-${theme}`; // Simulate theme scope
  
  // We need the CSS variables to apply. Since they are on 'body.theme-X', 
  // and we appended to body, if we give the wrapper the class, variables should inherit 
  // IF the wrapper is attached to body. But variables are commonly on 'body.theme-X'.
  // Best bet: Temporarily force the body theme, or rely on the fact that we append to document.body 
  // which ALREADY has the theme class if the user didn't change it.
  // SAFE WAY: Explicitly set the variables on the container if needed, OR just trust global styles
  // since we append to document.body.
  
  // Actually, styles rely on `var(--bg-color)` etc.
  // The rendering logic LayoutEngine returns HTML that assumes it's inside a .slide.
  // And .slide-container sets the background.
  
  const slideContainer = document.createElement('div');
  slideContainer.className = 'slide-container';
  slideContainer.style.width = '100%';
  slideContainer.style.height = '100%';
  slideContainer.style.transform = 'none'; // Ensure no scale
  
  wrapper.appendChild(slideContainer);
  container.appendChild(wrapper);
  document.body.appendChild(container);

  try {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Render slide HTML
      slideContainer.innerHTML = LayoutEngine.render(slide, false); // false = not editable
      
      // Wait for DOM
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture
      const canvas = await html2canvas(slideContainer, {
        scale: 2, // Higher res
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      if (i > 0) doc.addPage([width, height]);
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

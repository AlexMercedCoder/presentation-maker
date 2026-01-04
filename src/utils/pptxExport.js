import PptxGenJS from 'pptxgenjs';

export function exportToPPTX(slides, theme) {
  const pptx = new PptxGenJS();
  
  // Set Metadata
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.title = 'Presentation';

  // Define Theme Colors (Approximate)
  // We can't easily parse CSS variables here without computed style
  // So we'll map known themes or default to black/white if custom
  // Ideally we inspect DOM or store custom values.
  // Let's assume passed 'theme' string or we look at store.customTheme if standard.
  
  // Basic colors
  let bgColor = 'FFFFFF';
  let textColor = '000000';
  let titleColor = '000000';
  
  // Mapping
  if (theme === 'dark') { bgColor = '111111'; textColor = 'ffffff'; titleColor = 'ff00cc'; }
  if (theme === 'ocean') { bgColor = '0f172a'; textColor = 'e2e8f0'; titleColor = '38bdf8'; }
  if (theme === 'sunset') { bgColor = '4a0404'; textColor = 'ffe4e6'; titleColor = 'fbbf24'; }
  
  // If custom logic is needed, we'd need to pass explicit colors.
  // For MVP, we stick to defaults or simple mapping.

  slides.forEach(slide => {
    const s = pptx.addSlide();
    s.background = { color: bgColor };
    s.color = textColor;

    const { layout, content } = slide;

    // Helper for inches
    const W = 10;
    const H = 5.625;

    // --- Content Mapping ---
    if (layout === 'title') {
      s.addText(content.title || 'Title', { x:0.5, y:1.5, w:9, h:1.5, fontSize:48, align:'center', color: titleColor });
      s.addText(content.subtitle || '', { x:0.5, y:3.2, w:9, h:1, fontSize:24, align:'center', color: textColor });
    }
    else if (layout === 'title-body') {
      s.addText(content.title || 'Title', { x:0.5, y:0.5, w:9, h:1, fontSize:36, align:'left', color: titleColor, border:{pt:0, color:titleColor, type:'none', bottom:true} });
      // Strip HTML for body? PptxGenJS supports some HTML but it's tricky.
      // Better to strip tags for MVP safety
      const cleanBody = (content.body || '').replace(/<[^>]*>?/gm, '\n');
      s.addText(cleanBody, { x:0.5, y:1.8, w:9, h:3.5, fontSize:18, align:'left', color: textColor, valign:'top' });
    }
    else if (layout === 'hero') {
       s.background = { color: titleColor }; // Use primary color as background
       s.addText(content.title || 'HERO', { x:0.5, y:1.5, w:9, h:2, fontSize:60, align:'center', color: 'FFFFFF' });
       s.addText(content.subtitle || '', { x:0.5, y:3.5, w:9, h:1, fontSize:24, align:'center', color: 'FFFFFF' });
    }
    else if (layout === 'statement') {
       s.addText(content.title || 'Statement', { x:0.5, y:0.5, w:9, h:4.6, fontSize:64, align:'center', color: titleColor, valign:'middle' });
    }
    else if (layout === 'split-diagonal') {
       // Manual split simulation
       s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:W/2, h:H, fill:'eeeeee' });
       s.addText(content.title || 'Left', { x:0.5, y:2, w:4, h:2, fontSize:44, align:'right', color: titleColor });
       
       const cleanBody = (content.body || '').replace(/<[^>]*>?/gm, '\n');
       s.addText(cleanBody, { x:5.5, y:1, w:4, h:4, fontSize:18, align:'left', color: textColor });
    }
    else if (layout === 'photo-grid') {
       s.addText(content.title || 'Photo Grid', { x:0, y:0.2, w:W, h:0.8, fontSize:24, align:'center', color: titleColor });
       
       // Placeholders (Gray Rects)
       s.addShape(pptx.ShapeType.rect, { x:0.5, y:1.2, w:4.4, h:2, fill:'cccccc' });
       s.addShape(pptx.ShapeType.rect, { x:5.1, y:1.2, w:4.4, h:2, fill:'cccccc' });
       s.addShape(pptx.ShapeType.rect, { x:0.5, y:3.4, w:4.4, h:2, fill:'cccccc' });
       s.addShape(pptx.ShapeType.rect, { x:5.1, y:3.4, w:4.4, h:2, fill:'cccccc' });
       
       s.addText("Photo 1", { x:0.5, y:1.2, w:4.4, h:2, align:'center', valign:'middle' });
       s.addText("Photo 2", { x:5.1, y:1.2, w:4.4, h:2, align:'center', valign:'middle' });
    }
    // New Layouts
    else if (['timeline', 'venn', 'funnel', 'pyramid', 'swot', 'team', 'video', 'kanban', 'agenda', 'chart'].includes(layout)) {
       // Generic Fallback with Title for now to ensure export allows text editing of Title
       // Complex shapes in PPTX are hard to map 1:1 without extensive logic
       s.addText(content.title || (layout.charAt(0).toUpperCase() + layout.slice(1)), { x:0.5, y:0.5, w:9, h:1, fontSize:32, color: titleColor, align:'center' });
       s.addText("[Complex Layout - Please Rebuild in PowerPoint using SmartArt]", { x:0.5, y:2.5, w:9, h:1, fontSize:14, color: '#888888', align:'center' });
       
       // Map specific editable fields if they exist as simple text boxes approx
       if (layout === 'agenda') {
          s.addText("09:00 - Introduction\n10:00 - Deep Dive\n12:00 - Lunch", { x:1, y:1.5, w:8, h:4, fontSize:18, color: textColor });
       }
       if (layout === 'swot') {
          s.addText("Strengths", { x:0.5, y:1.5, w:4, h:0.5, fontSize:14, color: titleColor });
          s.addText("Weaknesses", { x:5.5, y:1.5, w:4, h:0.5, fontSize:14, color: titleColor });
          s.addText("Opportunities", { x:0.5, y:3.5, w:4, h:0.5, fontSize:14, color: titleColor });
          s.addText("Threats", { x:5.5, y:3.5, w:4, h:0.5, fontSize:14, color: titleColor });
       }
    }
    else {
      // Generic fallback
       s.addText(content.title || 'Slide', { x:0.5, y:0.5, w:9, h:1, fontSize:32, color: titleColor });
       const cleanBody = (content.body || '').replace(/<[^>]*>?/gm, '\n');
       s.addText(cleanBody, { x:0.5, y:1.5, w:9, h:3.5, fontSize:18, color: textColor });
    }

    // --- Elements Layer (Images) ---
    if (content.elements) {
      content.elements.forEach(el => {
        if (el.type === 'image') {
           // Conversion: px to inches.
           // Base Assumption: Screen is 960px wide -> 10 inches.
           // Factor: 96
           const f = 96;
           s.addImage({
             data: el.src,
             x: el.x / f,
             y: el.y / f,
             w: el.width / f,
             h: el.height / f
           });
        }
      });
    }

    // Notes
    if (content.notes) {
      s.addNotes(content.notes);
    }
  });

  pptx.writeFile({ fileName: 'presentation.pptx' });
}

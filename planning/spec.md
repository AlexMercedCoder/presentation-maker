# Project Specification: Client-Side Presentation Maker

## 1. Project Overview
A lightweight, client-side only web application for creating, editing, and presenting slide decks. The application will operate entirely in the browser without a backend, utilizing local file handling (JSON) for saving/loading and browser APIs for presentation features.

## 2. Technical Stack
- **Build Tool**: Vite (Vanilla JS template)
- **Core Languages**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Storage**: In-memory state + LocalStorage (auto-save) + File System Access API (Export/Import)
- **Libraries**:
  - `jspdf`: For PDF export
  - `html2canvas` (or similar, e.g., `dom-to-image`): For rasterizing slides for PDF and `jspdf`.
  - `qrcode` (or `qrcode.js`): For client-side QR code generation.
  - `marked` (optional): If markdown support for slides is desired later.

## 3. Core Features

### 3.1 Slide Management
- **Add Slide**: Create new slides.
- **Delete Slide**: Remove slides.
- **Reorder**: Move slides up/down (or drag-and-drop).
- **Layouts**:
  - `Title Only`: Centered large text.
  - `Title + Body`: Header with bulleted list area.
  - `Split Content`: Two columns (Text/Text, Text/Image, etc.).
  - `Image Full`: Full background or centered image.

### 3.2 Themes & Styling
- **Premade Color Themes**:
  - Implementation: CSS Variables defined in classes (e.g., `.theme-dark`, `.theme-ocean`, `.theme-sunset`).
  - Variables: `--bg-color`, `--text-main`, `--text-accent`, `--primary-color`, `--font-main`.
- **Slide Layouts**: CSS Grid/Flexbox based templates.

### 3.3 QR Code Generator
- **Built-in Tool**: Input field for URL/Text.
- **Styling**: Option to colorize QR code pixels using the current theme's `--primary-color`.
- **Insertion**: Renders as an image element draggable/placeable on the slide.

### 3.4 Presentation Mode
- **Fullscreen**: Toggle `requestFullscreen()`.
- **Navigation**: Arrow keys (Left/Right), Click to advance.
- **Hidden Controls**: Edit controls hidden in this mode.

### 3.5 Data Persistence (Import/Export)
- **JSON Export**:
  - Downloads a `.json` file containing the presentation state (metadata + slides array).
- **JSON Import**:
  - File input to load a `.json` file and restore state.
- **Schema**:
  ```json
  {
    "meta": {
      "title": "My Presentation",
      "themeId": "ocean",
      "aspectRatio": "16:9"
    },
    "slides": [
      {
        "id": "uuid-1",
        "layout": "title-body",
        "content": {
          "title": "Welcome",
          "body": "<ul><li>Point 1</li></ul>",
          "elements": [] 
        }
      }
    ]
  }
  ```

### 3.6 PDF Export
- Generates a PDF where each slide is a page.
- Mechanism:
  1. Iterate through slides.
  2. Clone DOM node (hidden).
  3. Render to Canvas (`html2canvas`).
  4. Add image to PDF (`jspdf`).
  5. Save.

## 4. UI/UX Design

### 4.1 View Modes
1.  **Editor View**:
    -   **Sidebar**: Slide thumbnails/list for navigation and reordering.
    -   **Canvas**: WYSIWYG editor for the active slide.
    -   **Toolbar**: Formatting tools, Theme selector, QR generator button, Export actions.
2.  **Presentation View**:
    -   Fullscreen, minimal UI (hover-only controls), focus on content.

### 4.2 Aesthetics
-   **Modern/Premium**: Glassmorphism effects on toolbars, smooth transitions between slides.
-   **Response**: Visual feedback on hover/focus.

## 5. Development Phases

### Phase 1: Foundation
-   Setup Vite project.
-   Implement state management (simple Store pattern).
-   Create basic Layout engine and render a hardcoded slide.

### Phase 2: Editor Core
-   Implement Slide Add/Delete/Nav.
-   Build text editing capabilities (contenteditable or inputs).
-   Implement Theme switching logic.

### Phase 3: Advanced Features
-   QR Code component integration.
-   JSON Export/Import logic.
-   Presentation Mode (Fullscreen API).

### Phase 4: Polish & PDF
-   Implement PDF generation (most complex client-side task).
-   UI Polish (animations, icons).
-   Testing & Debugging.

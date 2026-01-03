# Project Specification: Client-Side Presentation Maker (v2)

## 1. Project Overview
A lightweight, client-side only web application for creating, editing, and presenting slide decks. Version 2 extends the core foundation with advanced theming, professional layouts, and rich media capabilities.

## 2. Technical Stack
-   **Build Tool**: Vite (Vanilla JS)
-   **Core**: HTML5, CSS3 (Variables + Grid), JS (ES6+)
-   **State**: Custom Store + LocalStorage
-   **Libraries**: `jspdf`, `html2canvas`, `qrcode`, `uuid`

## 3. Core Features (Existing)
-   Slide Management (Add/Delete/Reorder)
-   Basic Layouts (Title, Title+Body)
-   Basic Theming (Presets)
-   QR Code Generation
-   Presentation Mode
-   JSON Import/Export
-   PDF Export

## 4. Extended Features (Phases 5-8)

### 4.1 Advanced Theming (Phase 5)
-   **Theme Editor**:
    -   Interface to manually select colors for `--bg-color`, `--text-main`, `--primary-color`, etc.
    -   Live preview of changes.
-   **Font Selector**:
    -   Dropdown to switch global font family.
    -   Support for: Inter, Roboto, Playfair Display, Montserrat, Lato.
    -   Implementation: Dynamic `@import` or pre-loaded fonts.
-   **Randomizer**:
    -   "I'm Feeling Lucky" button.
    -   Algorithm: Generate random HSL hues with fixed saturation/lightness constraints to ensure harmony and contrast.

### 4.2 Professional Layouts (Phase 6)
-   **Grid Engine Upgrade**:
    -   Move from simple Flexbox to robust CSS Grid layouts.
    -   Support overlapping elements (z-index) for "Magazine" style looks.
-   **New Layouts**:
    -   `Hero`: Full bleed background image with centered overlay text.
    -   `Split Diagonal`: 50/50 split with a diagonal clip-path separator.
    -   `Stats`: Three columns highlighting large numbers.
    -   `Quote`: Large serif typography for quotes.
    -   `Gallery`: Grid of images.

### 4.3 Rich Media (Phase 7)
-   **Image Upload**:
    -   File Input -> FileReader (DataURI) -> Store in JSON.
    -   *Constraint*: Warn on large file sizes (LocalStorage limits).
-   **Draggable Elements**:
    -   Generalize the QR Code drag logic to all "Added Elements".
    -   Add resize handles.

### 4.4 Data Persistence & Undo (Phase 8)
-   **History**: Stack of state snapshots.
-   **Undo/Redo**: Actions to traverse the stack.

## 5. UI/UX Design (v2)
-   **Editor**:
    -   Add "Design" tab/panel for Theme & Fonts.
    -   Improve "Add Slide" to show visual previews of layouts.

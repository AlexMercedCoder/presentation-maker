export const ColorUtils = {
  // Simple random range
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // HSL string to Hex conversion helper (simplified or use inline HSL in CSS)
  // For this app, we store Hex in state to play nice with <input type="color">
  // Implementing a robust HSL->Hex converter:
  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },

  generateRandomTheme() {
    const hue = Math.floor(Math.random() * 360);
    const primary = this.hslToHex(hue, 70, 50);
    const secondary = this.hslToHex((hue + 180) % 360, 60, 60); // Complementary
    const accent = this.hslToHex((hue + 90) % 360, 80, 50); // Triadic
    
    // Background - usually light or very dark
    const isDark = Math.random() > 0.5;
    const bg = isDark ? '#1a1a1a' : '#ffffff';
    const surface = isDark ? '#2a2a2a' : '#f5f5f5';
    const text = isDark ? '#ffffff' : '#333333';

    // Random Font
    const fonts = ['Inter', 'Roboto', 'Playfair+Display', 'Montserrat', 'Lato', 'Courier+Prime'];
    const font = fonts[Math.floor(Math.random() * fonts.length)]; // URL encoded names
    const fontName = font.replace('+', ' ');

    return {
      primary,
      secondary,
      accent,
      bg,
      surface,
      text,
      font: fontName
    };
  }
};

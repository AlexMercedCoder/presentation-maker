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
    const hue = this.random(0, 360);
    
    // Complementary or Analogous logic could go here. 
    // We'll stick to a simple monochromatic + contrast strategy for safety.
    
    // Primary: The main hue
    const primary = this.hslToHex(hue, 70, 50);
    
    // Background: Very light version of a complimentary or same hue
    // Let's use a very light tint of the hue
    const bg = this.hslToHex(hue, 10, 97);
    
    // Text: Very dark version of the hue
    const text = this.hslToHex(hue, 30, 15);
    
    // Accent: Complementary
    const accentHue = (hue + 180) % 360;
    const accent = this.hslToHex(accentHue, 60, 50);

    return {
      bg,
      text,
      primary,
      accent,
      font: 'Inter' // Keep font default or randomize if we wanted
    };
  }
};

// theme.js
export const defaultTheme = {
    primary: '#0A2463',
    secondary: '#3E92CC',
    background: '#FFFAFF',
    accent: '#D8315B',
    dark: '#1E1B18',
  };
  
  export const generateNeumorphicStyles = (color) => ({
    backgroundColor: color,
    boxShadow: `4px 4px 6.5px ${adjustColor(color, -15)},
                 -4px -4px 6.5px ${adjustColor(color, 15)}`,
  });
  
  // Utility function to darken/lighten colors
  function adjustColor(color, amount) {
    const clamp = (val) => Math.min(Math.max(val, 0), 255);
    
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Adjust each channel
    const adjustR = clamp(r + amount);
    const adjustG = clamp(g + amount);
    const adjustB = clamp(b + amount);
    
    // Convert back to hex
    return '#' + ((1 << 24) + (adjustR << 16) + (adjustG << 8) + adjustB).toString(16).slice(1);
  }
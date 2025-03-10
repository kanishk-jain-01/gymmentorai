// This script will be executed on the client side to ensure the theme is applied correctly
export function applyTheme(): void {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Get the stored theme from localStorage
      const storedTheme = localStorage.getItem('gymmentor-theme');
      
      // Get the system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine which theme to use
      const shouldUseDarkTheme = 
        storedTheme === 'dark' || 
        (storedTheme === 'system' && systemPrefersDark) ||
        (!storedTheme && systemPrefersDark);
      
      // Apply the theme
      if (shouldUseDarkTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Log for debugging
      console.log('Theme script executed:', {
        storedTheme,
        systemPrefersDark,
        shouldUseDarkTheme,
        classList: document.documentElement.classList.toString()
      });
    }
  } catch (error) {
    console.error('Error applying theme:', error);
  }
} 
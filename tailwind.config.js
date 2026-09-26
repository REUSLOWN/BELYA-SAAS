/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      /*
       * Palette « Magenta profond ».
       * Contrastes mesurés (WCAG) :
       *   magenta sur crème ......... 5,4:1  AA
       *   crème sur magenta ......... 5,4:1  AA
       *   aubergine sur crème ...... 15,0:1  AAA
       *   encre sur crème .......... 16,8:1  AAA
       *   magenta sur encre ......... 3,1:1  gros titres seulement
       *   magenta-clair sur encre ... 4,8:1  AA  ← à utiliser sur fond sombre
       */
      colors: {
        creme: '#FAF6F4',
        aubergine: '#2B1B2E',
        encre: '#1A1420',
        magenta: {
          DEFAULT: '#C2185B',
          clair: '#E8447F',
        },
      },
      fontFamily: {
        titre: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        drama: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      /*
       * À -0,04 / -0,055 em, les mots en gras se collaient sur mobile
       * (« J'aiunsalon »). Resserré, mais les espaces restent lisibles.
       */
      letterSpacing: {
        serre: '-0.02em',
        tresserre: '-0.03em',
      },
    },
  },
  plugins: [],
}

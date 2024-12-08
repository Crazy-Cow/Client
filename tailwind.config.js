/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: [
        { accentColor: '#FC504D' },
        { 'xmas-green': '#228B22' },
        { 'xmas-red': '#D64045' },
        { 'xmas-gold': '#FFB84C' },
        { 'purple-light': '#A084DC' },
        { 'purple-deep': '#583C87' },
        { 'pinkish-ivory': '#FFF4E6' },
      ],
      keyframes: {
        twinkle: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.3',
            transform: 'scale(0.7)',
          },
        },
        'shooting-star': {
          '0%': {
            transform: 'translate(0, 0) rotate(-45deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate(300px, 300px) rotate(-45deg)',
            opacity: '0',
          },
        },
        'key-shine': {
          '0%, 100%': {
            opacity: '0.8',
            transform: 'scale(1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          },
        },
        'timer-scale': {
          '0%, 100%': {
            transform: 'translate(-50%) scale(1)',
          },
          '50%': {
            transform: 'translate(-50%) scale(1.5)',
          },
        },
        fall: {
          '0%': {
            transform: 'translateY(-10vh) translateX(-10px)',
          },
          '100%': {
            transform: 'translateY(100vh) translateX(10px)',
          },
        },
        appear: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.5) translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        twinkle: 'twinkle linear infinite',
        'shooting-star': 'shooting-star 2s linear forwards',
        'key-shine': 'key-shine 2s ease-in-out infinite',
        'timer-scale': 'timer-scale 1s ease-in-out infinite',
        fall: 'fall linear infinite',
        appear: 'appear 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        'damage-flash': 'damage-flash 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};

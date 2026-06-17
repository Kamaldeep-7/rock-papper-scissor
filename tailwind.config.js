/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Press Start 2P"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '20%': { transform: 'translateY(-25px) rotate(-15deg)' },
          '40%': { transform: 'translateY(0) rotate(0deg)' },
          '60%': { transform: 'translateY(-25px) rotate(15deg)' },
          '80%': { transform: 'translateY(0) rotate(0deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 60px rgba(236, 72, 153, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        shake: 'shake 0.9s ease-in-out',
        pop: 'pop 0.4s ease-out',
        glow: 'glow 2.5s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

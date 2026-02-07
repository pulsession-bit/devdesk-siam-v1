/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"Noto Sans Arabic"', 'sans-serif'],
                serif: ['"Cormorant Garamond"', 'serif'],
            },
            colors: {
                brand: {
                    navy: '#051229',
                    'navy-light': '#0F264A',
                    royal: '#0F264A',
                    gold: '#FF9F1C',
                    amber: '#FF9F1C',
                    platinum: '#F3F4F6',
                    light: '#FFFFFF',
                    slate: '#F8FAFC',
                }
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2600&auto=format&fit=crop')",
                'hero-dtv': "url('https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2600&auto=format&fit=crop')",
                'gradient-executive': 'radial-gradient(circle at center, #0F264A 0%, #051229 100%)',
                'gradient-gold': 'linear-gradient(135deg, #FF9F1C 0%, #FFB84D 100%)',
            },
            // animation: {
            //     'fade-in': 'fadeIn 0.5s ease-out',
            //     'fade-in-fast': 'fadeIn 0.2s ease-out',
            //     'zoom-in': 'zoomIn 0.5s ease-out',
            //     'slide-up': 'slideUp 0.5s ease-out',
            //     'slide-down': 'slideDown 0.5s ease-out',
            //     'slide-right': 'slideRight 0.5s ease-out',
            //     'slide-left': 'slideLeft 0.3s ease-out',
            //     'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            //     'bounce-gentle': 'bounceGentle 2s infinite',
            //     'spin-slow': 'spin 3s linear infinite',
            // },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                zoomIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(1rem)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-1rem)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-2rem)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideLeft: {
                    '0%': { opacity: '0', transform: 'translateX(2rem)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                bounceGentle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            boxShadow: {
                'gold': '0 4px 14px 0 rgba(255, 159, 28, 0.3)',
                'gold-lg': '0 10px 40px -10px rgba(255, 159, 28, 0.5)',
                'navy': '0 4px 14px 0 rgba(5, 18, 41, 0.3)',
                'navy-lg': '0 10px 40px -10px rgba(5, 18, 41, 0.5)',
                'inner-gold': 'inset 0 2px 4px 0 rgba(255, 159, 28, 0.1)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '3rem',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            transitionDuration: {
                '400': '400ms',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}

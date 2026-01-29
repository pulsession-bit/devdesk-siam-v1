/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
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
                    royal: '#0F264A',
                    gold: '#FF9F1C',
                    amber: '#FF9F1C',
                    platinum: '#F3F4F6',
                    light: '#FFFFFF',
                }
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2600&auto=format&fit=crop')",
            }
        },
    },
    plugins: [],
}

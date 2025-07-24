/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Màu chính: đỏ cam hiện đại, bắt mắt (nút, highlight) bg-primary
                primary: '#FF4C29',
                primary1: '#FF684C',
                // Màu phụ: xanh navy sang trọng (link, icon, nút phụ) bg-secondary
                secondary: '#1D3557',

                // Nền sáng hiện đại bg-background
                background: '#F5F5F5',

                // Chữ chính: đen đậm hiện đại text-text
                text: '#111827',

                // Nút hover / border tinh tế border-accent
                accent: '#E5E7EB',

                // Màu nền card / block nhẹ bg-surface
                surface: '#FFFFFF',
                fo: '#1E1E1E',
                fo1: '#EFEFEF ',
                fo2: '#F5F5F5',
                fo3: '#FAFAFA',
                hero: '#F5DEB3  ',
                herotext: '#F9FAFB',
                herttextp1: '##FFE5E5',
                herttextp2: '#FFE5E5',
                herttextp3: '#FFEBEB',
                textnhan1: '#FFD6D6',
                textnhan2: '#FFF0F0',
            },
            borderRadius: {
                none: '0px',
                sm: '4px',
                DEFAULT: '8px',
                md: '12px',
                lg: '16px',
                xl: '20px',
                '2xl': '24px',
                '3xl': '32px',
                full: '9999px',
                button: '8px',
            },
            fontFamily: {
                pacifico: ['Pacifico', 'cursive'],
                montserrat: ['Montserrat', 'sans-serif'],
            },
            animation: {
                fadeIn: 'fadeIn 0.2s ease-in-out',
                'cursor-blink': 'blink 1s step-end infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                blink: {
                    '0%, 100%': { borderColor: 'transparent' },
                    '50%': { borderColor: '#3B82F6' }, // blue-500
                },
            },
        },
        plugins: [require('@tailwindcss/line-clamp')],
    },
};

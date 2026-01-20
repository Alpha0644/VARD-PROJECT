import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './features/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // ========================================
            // VARD Design System Colors
            // Inspired by Uber, adapted for security
            // ========================================
            colors: {
                // Primary - Bleu Nuit (Security, Trust)
                'vard-dark': {
                    DEFAULT: '#0A1628',
                    50: '#1E3A5F',
                    100: '#1A3354',
                    200: '#162C49',
                    300: '#12253E',
                    400: '#0E1E33',
                    500: '#0A1628',
                    600: '#080F1C',
                    700: '#050A12',
                    800: '#030508',
                    900: '#000000',
                },
                // Accent - Orange Vif (Urgency, Action)
                'vard-accent': {
                    DEFAULT: '#FF6B35',
                    50: '#FFF0EB',
                    100: '#FFE1D6',
                    200: '#FFC3AD',
                    300: '#FFA685',
                    400: '#FF885C',
                    500: '#FF6B35',
                    600: '#FF4500',
                    700: '#CC3700',
                    800: '#992900',
                    900: '#661C00',
                },
                // Secondary - Bleu Sécurité (Links, Agent theme)
                'vard-blue': {
                    DEFAULT: '#3B82F6',
                    50: '#EBF2FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                // Neutrals
                'vard-gray': {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
            },
            // ========================================
            // Typography
            // ========================================
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            fontSize: {
                'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
                'hero-mobile': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
                'section-title': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
                'section-title-mobile': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
            },
            // ========================================
            // Spacing & Layout
            // ========================================
            maxWidth: {
                'landing': '1280px',
            },
            // ========================================
            // Animations
            // ========================================
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
                'slide-in-right': 'slideInRight 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'counter': 'counter 2s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            // ========================================
            // Transitions
            // ========================================
            transitionDuration: {
                '400': '400ms',
            },
            // ========================================
            // Box Shadows (Premium feel)
            // ========================================
            boxShadow: {
                'vard': '0 4px 14px 0 rgba(10, 22, 40, 0.08)',
                'vard-lg': '0 10px 40px 0 rgba(10, 22, 40, 0.12)',
                'vard-hover': '0 14px 44px 0 rgba(10, 22, 40, 0.16)',
                'vard-accent': '0 4px 14px 0 rgba(255, 107, 53, 0.3)',
            },
        },
    },
    plugins: [],
}

export default config

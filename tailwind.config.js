/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /(bg|text|border)-subj-(maths|science|english|history|computer)/ },
    { pattern: /(bg|text|border)-subjInk-(maths|science|english|history|computer)/ },
  ],
  theme: {
    extend: {
      colors: {
        // Warm off-white paper
        paper: {
          DEFAULT: '#FAF8F3',
          warm: '#F3EEE3',
          card: '#FFFFFF',
        },
        // Deep ink-blue primary
        ink: {
          DEFAULT: '#2B4C7E',
          50: '#EEF3FA',
          100: '#D6E2F0',
          200: '#AFC5E1',
          300: '#7E9DCD',
          400: '#5277B0',
          500: '#2B4C7E',
          600: '#233E66',
          700: '#1B3050',
          800: '#13223A',
          900: '#0C1628',
        },
        // Soft green success
        leaf: {
          50: '#EDF7F1',
          100: '#D4EBDD',
          500: '#4C9F70',
          600: '#3E8559',
          700: '#316B48',
        },
        // Amber upcoming
        amber: {
          50: '#FBF1DD',
          100: '#F4DDB0',
          500: '#E0A030',
          600: '#C28820',
        },
        // Soft red overdue
        clay: {
          50: '#FBEDEF',
          100: '#F2C9CE',
          500: '#D1495B',
          600: '#B23A49',
        },
        // Subject pastel colors
        subj: {
          maths: '#DCE7F7',
          science: '#DCEFE0',
          english: '#FCE6CF',
          history: '#E4DAF0',
          computer: '#F8DAE6',
        },
        subjInk: {
          maths: '#2B4C7E',
          science: '#4C9F70',
          english: '#C97A2B',
          history: '#6E4C9F',
          computer: '#C04C7E',
        },
      },
      fontFamily: {
        heading: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43, 76, 126, 0.04), 0 4px 12px rgba(43, 76, 126, 0.06)',
        card: '0 2px 4px rgba(43, 76, 126, 0.05), 0 8px 20px rgba(43, 76, 126, 0.07)',
        pop: '0 6px 24px rgba(43, 76, 126, 0.12)',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
      extend: {
        colors: {
          // Theme palette inspired by templatemo_595_3d_coverflow
          brand: {
            50:  "#fff1f2",
            100: "#ffe4e6",
            200: "#fecdd3",
            300: "#fda4af",
            400: "#fb7185",
            500: "#f43f5e",   // pink/red hero tone
            600: "#e11d48",
            700: "#be123c",
            800: "#9f1239",
            900: "#881337"
          },
          ink: {
            50: "#f7f7f8",
            100:"#efeff1",
            200:"#dcdcde",
            300:"#c6c6ca",
            400:"#9e9ea3",
            500:"#6b6b70",
            600:"#4d4d52",
            700:"#3b3b3f",
            800:"#2b2b2f",
            900:"#1b1b1f"   // dark backgrounds
          }
        },
        boxShadow: {
          soft: "0 10px 30px rgba(0,0,0,0.12)"
        }
      },
    },
    plugins: [],
  };
  
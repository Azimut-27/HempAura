/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7f1e7",
        porcelain: "#fffaf1",
        forest: "#17382c",
        moss: "#61735b",
        sage: "#dfe5d6",
        gold: "#b99552",
        clay: "#b86f52",
        ink: "#1c211d",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 24px 70px rgba(28, 33, 29, 0.12)",
        glow: "0 18px 45px rgba(185, 149, 82, 0.18)",
      },
      backgroundImage: {
        "soft-radial":
          "radial-gradient(circle at 12% 15%, rgba(223,229,214,.9), transparent 30%), radial-gradient(circle at 84% 22%, rgba(184,111,82,.18), transparent 28%), linear-gradient(135deg, #fffaf1 0%, #f7f1e7 48%, #e8eddc 100%)",
      },
    },
  },
  plugins: [],
};

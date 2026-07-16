import { Outlet } from "react-router-dom";
import CartDrawer from "./CartDrawer.jsx";
import CartNotice from "./CartNotice.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import { useScrollRestoration } from "../hooks/useScrollRestoration.js";

export default function AppLayout() {
  useScrollRestoration();

  return (
    <div className="site-shell min-h-screen text-ink">
      <a className="skip-link" href="#main-content">
        Preskoči na vsebino
      </a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <CartNotice />
    </div>
  );
}

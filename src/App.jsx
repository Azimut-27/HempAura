import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ProductsPage = lazy(() => import("./pages/ProductsPage.jsx"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage.jsx"));
const CheckoutCancelPage = lazy(() => import("./pages/CheckoutCancelPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const FaqPage = lazy(() => import("./pages/FaqPage.jsx"));
const QualityPage = lazy(() => import("./pages/QualityPage.jsx"));
const LabReportsPage = lazy(() => import("./pages/LabReportsPage.jsx"));
const PolicyPage = lazy(() => import("./pages/PolicyPage.jsx"));
const ResponsibleUsePage = lazy(() => import("./pages/ResponsibleUsePage.jsx"));
const NewsletterStatusPage = lazy(() => import("./pages/NewsletterStatusPage.jsx"));
const NewsletterUnsubscribePage = lazy(
  () => import("./pages/NewsletterUnsubscribePage.jsx")
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function PageLoader() {
  return (
    <div className="grid min-h-[55vh] place-items-center" role="status">
      <span className="text-sm font-semibold text-forest">Nalaganje vsebine ...</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="lab-reports" element={<LabReportsPage />} />
          <Route
            path="shipping-and-returns"
            element={<PolicyPage type="shipping" />}
          />
          <Route path="privacy" element={<PolicyPage type="privacy" />} />
          <Route path="terms" element={<PolicyPage type="terms" />} />
          <Route path="cookies" element={<PolicyPage type="cookies" />} />
          <Route path="responsible-use" element={<ResponsibleUsePage />} />
          <Route path="newsletter/confirm" element={<NewsletterStatusPage />} />
          <Route
            path="newsletter/unsubscribe"
            element={<NewsletterUnsubscribePage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

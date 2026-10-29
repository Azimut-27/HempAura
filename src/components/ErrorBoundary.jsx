import React from "react";
import { RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // If it's a dynamic chunk loading error after deployment, try auto-reloading once
    if (
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed")
    ) {
      const reloadedKey = "hempaura_chunk_reload";
      const lastReload = sessionStorage.getItem(reloadedKey);
      if (!lastReload || Date.now() - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadedKey, String(Date.now()));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-cream px-5 py-16 text-center text-ink">
          <div className="w-full max-w-md border border-forest/10 bg-white p-8 shadow-md rounded-2xl">
            <h1 className="font-display text-2xl font-bold text-forest">
              Prišlo je do napake pri nalaganju strani
            </h1>
            <p className="mt-3 text-sm text-forest/75 leading-relaxed">
              Trgovina je bila morda pravkar posodobljena. Poskusite osvežiti stran.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 rounded bg-red-50 p-2 text-xs font-mono text-red-700 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-forest/90 transition-colors"
              >
                <RefreshCw size={14} /> Osveži stran
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Seo from "../components/Seo.jsx";
import { labReports } from "../data/labReports.js";
import { products } from "../data/products.js";

export default function LabReportsPage() {
  const [productId, setProductId] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      labReports.filter((report) => {
        const matchesProduct = productId === "all" || report.productId === productId;
        const haystack = `${report.batchNumber} ${report.laboratoryName}`.toLowerCase();
        return matchesProduct && haystack.includes(query.toLowerCase().trim());
      }),
    [productId, query]
  );

  return (
    <>
      <Seo
        title="Laboratorijska poročila"
        description="Poišči pristna laboratorijska poročila HempAura po izdelku in seriji."
        path="/lab-reports"
      />
      <section className="bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-clay">Dokumenti</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            Laboratorijska poročila
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-forest/70">
            Tukaj bodo objavljeni samo resnični dokumenti za navedeni izdelek in serijo.
          </p>
          <div className="mt-8 grid gap-4 bg-white p-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-forest" htmlFor="report-product">
                Izdelek
              </label>
              <select
                id="report-product"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="mt-2 min-h-12 w-full border border-forest/20 bg-porcelain px-3"
              >
                <option value="all">Vsi izdelki</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-forest" htmlFor="report-search">
                Serija ali laboratorij
              </label>
              <div className="relative mt-2">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/45"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  id="report-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-h-12 w-full border border-forest/20 bg-porcelain pl-11 pr-4"
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            {filtered.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white text-left text-sm">
                  <thead className="bg-forest text-porcelain">
                    <tr>
                      <th className="p-4">Izdelek</th>
                      <th className="p-4">Serija</th>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Dokument</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((report) => (
                      <tr key={report.id} className="border-b border-forest/10">
                        <td className="p-4">
                          {products.find((product) => product.id === report.productId)?.name}
                        </td>
                        <td className="p-4">{report.batchNumber}</td>
                        <td className="p-4">{report.testedAt}</td>
                        <td className="p-4">
                          {report.documentUrl ? (
                            <a className="font-bold underline" href={report.documentUrl}>
                              Odpri poročilo
                            </a>
                          ) : (
                            "Poročilo še ni na voljo"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-forest/10 bg-white p-8">
                <h2 className="font-display text-3xl font-semibold text-forest">
                  Poročilo še ni na voljo
                </h2>
                <p className="mt-3 text-sm leading-7 text-forest/68">
                  Lastnik še ni dodal preverljivega dokumenta. Noben rezultat ali
                  laboratorij ni bil izmišljen.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import { activeProducts } from "../data/products.js";

export default function ProductsPage() {
  return (
    <>
      <Seo
        title="Izdelki"
        description="Oglej si HempAura konopljine izdelke in preveri razpoložljivost, sestavo ter dokumentacijo."
        path="/products"
      />
      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-clay">Katalog</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest sm:text-6xl">
            HempAura izdelki
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-forest/70">
            Vsi izdelki so trenutno označeni kot v pripravi, dokler lastnik ne
            potrdi cen, zaloge, deklaracij, opozoril in prodajnih pogojev.
          </p>
          {activeProducts.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 border border-forest/10 bg-white p-8 text-forest">
              Trenutno ni objavljenih izdelkov.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

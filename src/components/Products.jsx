import React from "react";
import ProductCard from "./ProductCard.jsx";

const products = [
  {
    name: "CBD olje 5%",
    short: "5%",
    tag: "Polni spekter",
    price: "od 29 EUR",
    description:
      "Nežen uvod v vsakdanji wellness ritual z izbranim konopljinim ekstraktom, jasnimi sestavinami in premium občutkom uporabe.",
  },
  {
    name: "CBD olje 10%",
    short: "10%",
    tag: "Široki spekter",
    price: "od 45 EUR",
    description:
      "Bolj koncentrirana izbira za uporabnike, ki cenijo premišljeno formulo, transparentno poreklo in dosledno kakovost.",
  },
  {
    name: "CBD balzam",
    short: "Balm",
    tag: "Brez THC",
    price: "od 24 EUR",
    description:
      "Bogata tekstura s konopljinimi sestavinami za ritual nege kože, oblikovana za čutno in urejeno dnevno rutino.",
  },
];

export default function Products() {
  return (
    <section id="izdelki" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-clay">
            Izbrana kolekcija
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">
            Premium izdelki za rutine, ki ostanejo preproste
          </h2>
          <p className="mt-5 text-base leading-8 text-forest/68">
            Vsak izdelek je zasnovan z mislijo na čiste sestavine, jasno
            predstavitev in zaupanje pri vsakem naročilu.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

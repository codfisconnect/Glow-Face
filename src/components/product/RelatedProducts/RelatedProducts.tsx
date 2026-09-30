import React from "react";
import { Product } from "../../../types";
import { ProductGrid } from "../ProductGrid/ProductGrid";
import "./RelatedProducts.css";

export interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  title = "YOU MAY ALSO LOVE"
}) => {
  if (products.length === 0) return null;

  return (
    <section className="gf-related-products" aria-label="Related Products">
      <div className="gf-related-products__header">
        <span className="gf-related-products__sub">Curated Skincare</span>
        <h2 className="gf-related-products__title">{title}</h2>
      </div>
      <ProductGrid products={products.slice(0, 4)} columns={4} />
    </section>
  );
};

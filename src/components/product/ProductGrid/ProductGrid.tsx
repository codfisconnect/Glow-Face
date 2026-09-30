import React from "react";
import { Product } from "../../../types";
import { ProductCard } from "../ProductCard";
import "./ProductGrid.css";

export interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 4,
  className = ""
}) => {
  return (
    <div
      className={`gf-product-grid gf-product-grid--cols-${columns} ${className}`.trim()}
    >
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

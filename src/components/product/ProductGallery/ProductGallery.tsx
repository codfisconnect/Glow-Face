import React, { useState } from "react";
import "./ProductGallery.css";

export interface ProductGalleryProps {
  images: string[];
  productName: string;
  discountBadge?: number;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  discountBadge
}) => {
  const validImages = images.length > 0 ? images : ["/assets/cream-hero.jpg"];
  const [selectedImage, setSelectedImage] = useState<string>(validImages[0]);

  // Sync if images change
  React.useEffect(() => {
    if (validImages.length > 0 && !validImages.includes(selectedImage)) {
      setSelectedImage(validImages[0]);
    }
  }, [images]);

  return (
    <div className="gf-gallery">
      <div className="gf-gallery__main">
        <img
          src={selectedImage}
          alt={productName}
          className="gf-gallery__img"
        />
        {discountBadge && discountBadge > 0 ? (
          <span className="gf-gallery__badge">{discountBadge}% OFF</span>
        ) : null}
      </div>

      {validImages.length > 1 && (
        <div className="gf-gallery__thumbs" role="tablist" aria-label="Product thumbnails">
          {validImages.map((img, idx) => {
            const isSelected = selectedImage === img;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`gf-gallery__thumb-btn ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
                aria-label={`View ${productName} image ${idx + 1}`}
              >
                <img src={img} alt="" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

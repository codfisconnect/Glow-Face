import React, { useState } from "react";
import { X } from "lucide-react";
import "./AnnouncementBar.css";

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside className="gf-announcement" aria-label="Store Announcement">
      <div className="gf-announcement__content">
        <span>FREE SHIPPING ON ALL PREPAID ORDERS ACROSS INDIA</span>
        <span className="gf-announcement__divider">•</span>
        <span>
          USE CODE <strong className="gf-announcement__code">GLOW10</strong> FOR 10% OFF
        </span>
      </div>
      <button
        type="button"
        className="gf-announcement__close"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </aside>
  );
};
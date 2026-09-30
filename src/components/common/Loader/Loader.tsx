import React from "react";
import "./Loader.css";

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullPage = false
}) => {
  const content = (
    <div className={`gf-loader-container gf-loader--${size}`}>
      <div className="gf-spinner-ring" />
      {text && <p className="gf-loader-text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="gf-loader-fullpage">{content}</div>;
  }

  return content;
};

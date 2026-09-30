import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { AppRoutes } from "./routes/AppRoutes";
import "./App.css";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

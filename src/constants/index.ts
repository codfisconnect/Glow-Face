/**
 * Official Brand Configuration & Details for Glow Face
 * Centralized constant values used across the customer storefront and admin portal.
 */
export const BRAND = {
  name: "Glow Face",
  tagline: "Botanical Skincare Essentials",
  email: "glowface.kl@gmail.com",
  phone: "+91 87785 48891",
  whatsapp: "+918778548891",
  whatsappFormatted: "+91 87785 48891",
  whatsappUrl:
    "https://wa.me/918778548891?text=Hi%20Glow%20Face%2C%20I%20have%20an%20inquiry%20about%20your%20skincare%20products",
  instagram: {
    handle: "@glowface.kl",
    url: "https://www.instagram.com/glowface.kl/"
  },

  shipping: {
    freeThreshold: 499,

    standardFee: 49,
    policyText: "Free shipping on all prepaid orders across India",
    dispatchWindow: "24 - 48 business hours",
    deliveryWindow: "3 - 5 business days"
  },
  returnPolicyDays: 7
} as const;

export type BrandConfig = typeof BRAND;

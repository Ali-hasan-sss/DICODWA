export type Locale = "en" | "ar";

export type LocalizedString = {
  en: string;
  ar: string;
};

export type ArtworkStatus = "available" | "sold";

export type MediaType = "image" | "video";

export type ArtworkMedia = {
  type: MediaType;
  src: string;
  /** Optional poster/thumbnail for videos */
  poster?: string;
};

export type Artwork = {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  price: number;
  currency: string;
  /** Cover image used in grids and cards */
  image: string;
  /** Gallery media (images & videos). Falls back to `image` when empty. */
  media?: ArtworkMedia[];
  medium: LocalizedString;
  dimensions: string;
  year: number;
  status: ArtworkStatus;
  featured: boolean;
  createdAt: string;
};

export type Order = {
  id: string;
  artworkId: string;
  artworkTitle: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  stripeSessionId: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  paidAt?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

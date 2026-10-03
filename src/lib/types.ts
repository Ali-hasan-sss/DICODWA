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

export type HeroButton = {
  label: LocalizedString;
  href: string;
};

export type HeroSlide = {
  id: string;
  video: string;
  poster: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  buttons: HeroButton[];
};

export type SectionId = "hero" | "about" | "homeGallery" | "contact" | "gallery";

export type SectionBackground = {
  id: SectionId;
  /** Looping background video. Empty keeps the still image. */
  video: string;
  image: string;
  poster: string;
  /** Hex color of the tint over the background. */
  overlayColor: string;
  /** Tint strength from 0 to 100. */
  overlayOpacity: number;
};

export type SiteSettings = {
  heroSlides: HeroSlide[];
  backgrounds: SectionBackground[];
};

export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type LocaleCopy = {
  en: MessageTree;
  ar: MessageTree;
};

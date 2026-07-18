export type SocialLink = {
  id: "instagram" | "facebook" | "tiktok" | "x";
  href: string;
  label: string;
};

/** Public social profiles — override via NEXT_PUBLIC_* env vars. */
export const socialLinks: SocialLink[] = [
  {
    id: "instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/",
    label: "Instagram",
  },
  {
    id: "facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/",
    label: "Facebook",
  },
  {
    id: "tiktok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/",
    label: "TikTok",
  },
  {
    id: "x",
    href: process.env.NEXT_PUBLIC_X_URL || "https://x.com/",
    label: "X",
  },
];

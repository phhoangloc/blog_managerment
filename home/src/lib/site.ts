// Contact details come from .env.local; an empty value hides that link
export const site = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "",
  github: process.env.NEXT_PUBLIC_GITHUB_URL?.trim() ?? "",
};

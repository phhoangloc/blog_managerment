export interface Blog {
  id: number;
  title: string;
  slug: string;
  detail: string;
  category: string;
  draft: boolean;
  coverId: number | null;
  coverUrl: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  username: string;
  email: string;
  avatarId?: number | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type User = Account;

export interface Blog {
  id: number;
  title: string;
  slug: string;
  detail: string;
  category: string;
  draft: boolean;
  coverId: number | null;
  coverUrl: string | null;
  authorRole: string;
  authorId: number;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileItem {
  id: number;
  name: string;
  detail: string;
  filename: string;
  userId: number | null;
  userName: string | null;
  createdAt?: string;
  url: string;
}

// a comment on a published blog; hidden ones are visible to admins only
export interface BlogComment {
  id: number;
  userId: number;
  blogId: number;
  content: string;
  hidden: boolean;
  createdAt?: string;
  updatedAt?: string;
  userName: string;
  avatarUrl: string | null;
  blogTitle: string;
  blogSlug: string;
}

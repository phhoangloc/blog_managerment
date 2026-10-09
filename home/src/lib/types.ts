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
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// a visible comment on a published blog
export interface BlogComment {
  id: number;
  userId: number;
  blogId: number;
  content: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
  userName: string;
  avatarUrl: string | null;
}

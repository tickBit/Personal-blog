export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
}
export interface NewPost {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImage?: string;
}
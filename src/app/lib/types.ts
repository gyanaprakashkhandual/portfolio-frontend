export interface IComment {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMusic {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  musicUrl: string;
  duration: number;
  coverImageUrl: string;
  lyrics?: string;
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total: number;
  page: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Shared ────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Music ─────────────────────────────────────────────────────────────────────
export interface IComment {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMusic {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  musicUrl: string;
  duration: number;
  coverImageUrl: string;
  lyrics?: string;
  likes: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
}

// ── Skills ────────────────────────────────────────────────────────────────────
export interface ISkill {
  skillName: string;
  category?: string;
  subcategory?: string;
  level?: string;
  icon?: string;
  description?: string;
}

// ── Blogs ─────────────────────────────────────────────────────────────────────
export interface IBlogMeta {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string | null;
}

export interface IBlog extends IBlogMeta {
  content: string;
}

// ── Experience ────────────────────────────────────────────────────────────────
export interface IExperience {
  slug: string;
  role: string;
  company: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

// ── Education ─────────────────────────────────────────────────────────────────
export interface IEducation {
  title: string;
  institution: string;
  stream: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────
export interface IProject {
  projectSlug: string;
  title: string;
  description?: string;
  techStack?: string[];
  liveUrl?: string;
  repoUrl?: string;
  coverImage?: string | null;
  category?: string;
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface IContactPayload {
  name: string;
  email: string;
  message: string;
}

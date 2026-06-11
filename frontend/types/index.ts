// File Path: types/index.ts

// ─── Auth & User ──────────────────────────────────────────────────────────────
export type UserRole = 'Reader' | 'Author' | 'Admin';

export interface User {
  id: number;
  phoneNumber: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthorProfile {
  userId: number;
  bio: string | null;
  profileImage: string | null;
  socialLinks: string | null;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Book & Genre ─────────────────────────────────────────────────────────────
export type BookStatus = 'Draft' | 'Published' | 'Archived';

export interface Genre {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  authorId: number;
  authorName: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
  chaptersCount: number;
  likesCount: number;
  averageRating: number;
}

// ─── Chapter ──────────────────────────────────────────────────────────────────
export type ChapterStatus = 'Draft' | 'Published';

export interface Chapter {
  id: number;
  bookId: number;
  title: string;
  sequenceNumber: number;
  price: number;
  isFree: boolean;
  status: ChapterStatus;
  createdAt: string;
  isPurchased: boolean;
  content?: string | null;
}

// ─── Reviews & Comments ───────────────────────────────────────────────────────
export interface Review {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  chapterId: number | null;
  parentCommentId: number | null;
  content: string;
  createdAt: string;
  replies: Comment[];
}

// ─── Wallet & Transactions ────────────────────────────────────────────────────
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Purchase' | 'Revenue' | 'Refund';

export interface Wallet {
  userId: number;
  balance: number;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: TransactionType;
  description: string | null;
  createdAt: string;
}

export interface CoinPackage {
  id: number;
  name: string;
  coins: number;
  price: number;
  isActive: boolean;
}

// ─── Reading Progress ─────────────────────────────────────────────────────────
export interface ReadingProgress {
  id: number;
  userId: number;
  bookId: number;
  bookTitle: string;
  lastReadChapterId: number | null;
  lastReadChapterTitle: string | null;
  lastReadPosition: number;
  lastReadAt: string;
}

export interface Bookmark {
  id: number;
  userId: number;
  chapterId: number;
  chapterTitle: string;
  bookId: number;
  bookTitle: string;
  position: number;
  note: string | null;
  createdAt: string;
}

export interface Highlight {
  id: number;
  userId: number;
  chapterId: number;
  chapterTitle: string;
  bookId: number;
  bookTitle: string;
  startChar: number;
  endChar: number;
  color: string;
  textContent: string;
  note: string | null;
  createdAt: string;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string | null;
  isActive: boolean;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

// ─── Author Studio ────────────────────────────────────────────────────────────
export interface AuthorStats {
  totalBooks: number;
  totalChapters: number;
  totalCoinsEarned: number;
  totalPurchases: number;
  totalLikes: number;
  totalReviews: number;
  averageRating: number;
}

export interface StudioAsset {
  id: number;
  authorId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

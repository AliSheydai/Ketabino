import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthorStudioPage from '../page';
import { useAuth } from '@/context/AuthContext';
import { useAuthorStudio } from '@/hooks/useAuthorStudio';

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock useAuthorStudio
jest.mock('@/hooks/useAuthorStudio', () => ({
  useAuthorStudio: jest.fn(),
}));

// Mock next-view-transitions
jest.mock('next-view-transitions', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('AuthorStudioPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /home if not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    (useAuthorStudio as jest.Mock).mockReturnValue({
      books: [],
      stats: null,
      isLoading: false,
    });

    render(<AuthorStudioPage />);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('redirects to /home if authenticated but role is Reader', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'امین', role: 'Reader' },
      isAuthenticated: true,
      isLoading: false,
    });
    (useAuthorStudio as jest.Mock).mockReturnValue({
      books: [],
      stats: null,
      isLoading: false,
    });

    render(<AuthorStudioPage />);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('renders stats and book list for Author', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'صادق هدایت', role: 'Author' },
      isAuthenticated: true,
      isLoading: false,
    });
    (useAuthorStudio as jest.Mock).mockReturnValue({
      books: [
        {
          id: 1,
          title: 'بوف کور',
          status: 'Published',
          coverImage: 'image.jpg',
          chaptersCount: 3,
          likesCount: 10,
          averageRating: 4.5,
        },
      ],
      stats: {
        totalBooks: 1,
        totalPurchases: 25,
        averageRating: 4.5,
        totalLikes: 10,
        totalCoinsEarned: 500,
      },
      isLoading: false,
    });

    render(<AuthorStudioPage />);

    expect(screen.getByText('استودیوی نویسنده')).toBeInTheDocument();
    expect(screen.getByText('خوش آمدید، صادق هدایت')).toBeInTheDocument();
    expect(screen.getByText('کتاب‌ها')).toBeInTheDocument();
    expect(screen.getByText('درآمد کل')).toBeInTheDocument();
    expect(screen.getByText('بوف کور')).toBeInTheDocument();
    expect(screen.getByText('منتشر شده')).toBeInTheDocument();
  });
});

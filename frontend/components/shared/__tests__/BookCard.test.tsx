import React from 'react';
import { render, screen } from '@testing-library/react';
import { BookCard } from '../BookCard';
import type { Book } from '@/types';

// Mock next-view-transitions since it expects router context
jest.mock('next-view-transitions', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('BookCard component', () => {
  const mockBook: Book = {
    id: 1,
    authorId: 2,
    authorName: 'صادق هدایت',
    title: 'بوف کور',
    description: 'بوف کور شناخته‌شده‌ترین اثر صادق هدایت است.',
    coverImage: 'https://picsum.photos/400/600',
    status: 'Published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    genres: [{ id: 1, name: 'داستانی' }],
    chaptersCount: 3,
    likesCount: 12,
    averageRating: 4.8
  };

  it('renders book info correctly', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('بوف کور')).toBeInTheDocument();
    expect(screen.getByText('صادق هدایت')).toBeInTheDocument();
    expect(screen.getByText('بوف کور شناخته‌شده‌ترین اثر صادق هدایت است.')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('داستانی')).toBeInTheDocument();
    expect(screen.getByText('3 فصل')).toBeInTheDocument();
  });
});

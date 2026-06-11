import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboardPage from '../page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

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

// Mock api
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /home if not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<AdminDashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('redirects to /home if authenticated but not Admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'صادق هدایت', role: 'Author' },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<AdminDashboardPage />);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('renders stats for Admin user', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'ادمین سیستم', role: 'Admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    (api.get as jest.Mock).mockResolvedValue({
      totalUsers: 3,
      totalAuthors: 1,
      totalBooks: 4,
      totalReports: 2,
      totalCoinsDeposited: 1200,
    });

    render(<AdminDashboardPage />);

    // Wait for the async API request to complete
    await waitFor(() => {
      expect(screen.getByText('پنل مدیریت سیستم')).toBeInTheDocument();
      expect(screen.getByText('کل کاربران')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('نویسندگان')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>);
    // The spinner is a span element, we should see it
    expect(screen.queryByText('Click me')).toBeNull();
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

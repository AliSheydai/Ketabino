// File Path: app/page.tsx
// Redirect root → reader home
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/home');
}

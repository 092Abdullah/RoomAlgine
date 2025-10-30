
import { redirect } from 'next/navigation';

// This page is now obsolete since there are no user accounts.
// Redirect any traffic from here to the public gallery.
export default function MyDesignsPage() {
  redirect('/gallery');
}

import { redirect } from 'next/navigation';

// Redirect /admin to /studio for authentication
export default function AdminRedirect() {
  redirect('/studio');
}



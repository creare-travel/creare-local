import { redirect } from 'next/navigation';

// Homepage has moved to / — redirect any direct /home visits
export default function HomeRedirect() {
  redirect('/');
}

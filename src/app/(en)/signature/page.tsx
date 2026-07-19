import { redirect } from 'next/navigation';

// Duplicate route — canonical is /experiences/signature
export default function SignatureRedirect() {
  redirect('/experiences/signature');
}

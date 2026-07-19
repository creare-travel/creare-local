import { permanentRedirect } from 'next/navigation';

export default function LegacyPrivateLifeOfIstanbulRedirectPage() {
  permanentRedirect('/insights/private-life-of-istanbul');
}


import ExteriorAIGineClient from '@/components/exterior-ai-gine-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export default async function ExteriorPage() {
  // The user object is no longer needed.
  return <ExteriorAIGineClient user={null} />;
}

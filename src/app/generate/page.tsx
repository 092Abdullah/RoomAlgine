
import RoomAIGineClient from '@/components/room-ai-gine-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export default async function GeneratePage() {
    // The user object is no longer needed.
    return <RoomAIGineClient user={null} />;
}

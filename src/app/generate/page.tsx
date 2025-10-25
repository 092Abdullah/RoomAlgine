
import RoomAIGineClient from '@/components/room-ai-gine-client';

export default async function GeneratePage() {
    // The user object is no longer needed.
    return <RoomAIGineClient user={null} />;
}

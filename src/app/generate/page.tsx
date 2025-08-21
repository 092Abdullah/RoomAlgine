
import RoomAIGineClient from '@/components/room-ai-gine-client';
import { Suspense } from 'react';

function GeneratePageContent() {
    return <RoomAIGineClient />;
}

export default function GeneratePage() {
  return (
    <Suspense>
        <GeneratePageContent />
    </Suspense>
  );
}

    
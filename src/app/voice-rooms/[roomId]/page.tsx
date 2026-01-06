import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice Room | KlarText',
  description: 'Join live German language practice sessions'
};

export default async function VoiceRoomPage({
  params
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  
  return (
    <div className="container mx-auto py-8">
      <h1>Voice Room: {roomId}</h1>
      <p>Voice room feature coming soon...</p>
    </div>
  );
}

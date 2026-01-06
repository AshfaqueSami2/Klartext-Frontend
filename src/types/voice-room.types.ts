// Voice Room Types

export type UserRole = 'HOST' | 'SPEAKER' | 'LISTENER';

export type RoomStatus = 'active' | 'closed';

export interface VoiceRoomParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  level: string;
  photo?: string;
}

export interface VoiceRoom {
  _id: string;
  roomId: string;
  title: string;
  description?: string;
  topic: string;
  language: string;
  host: VoiceRoomParticipant;
  participants: Array<{
    user: VoiceRoomParticipant;
    role: UserRole;
    isMuted: boolean;
    joinedAt: Date;
  }>;
  maxSpeakers: number;
  currentSpeakers: number;
  isPublic: boolean;
  status: RoomStatus;
  createdAt: Date;
  agoraChannelName?: string;
}

export interface CreateVoiceRoomData {
  title: string;
  description?: string;
  topic: string;
  language: string;
  maxSpeakers?: number;
  isPublic?: boolean;
}

export interface VoiceRoomJoinResponse {
  room: VoiceRoom;
  agoraToken: string;
  agoraUid: number;
  role: UserRole;
  channelName: string;
}

export interface SpeakerRequest {
  _id: string;
  user: VoiceRoomParticipant;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

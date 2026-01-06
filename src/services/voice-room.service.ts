import api from '@/lib/axios';
import { 
  VoiceRoom, 
  CreateVoiceRoomData, 
  VoiceRoomJoinResponse 
} from '@/types/voice-room.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Create a new voice room
 */
export const createVoiceRoom = async (data: CreateVoiceRoomData): Promise<VoiceRoomJoinResponse> => {
  const response = await api.post<ApiResponse<VoiceRoomJoinResponse>>(
    '/voice-rooms/create',
    data
  );
  return response.data.data;
};

/**
 * Get all active voice rooms
 */
export const getActiveRooms = async (language?: string): Promise<VoiceRoom[]> => {
  const params = language ? { language } : {};
  const response = await api.get<ApiResponse<VoiceRoom[]>>('/voice-rooms', { params });
  return response.data.data;
};

/**
 * Get a specific voice room by ID
 */
export const getVoiceRoom = async (roomId: string): Promise<VoiceRoom> => {
  const response = await api.get<ApiResponse<VoiceRoom>>(`/voice-rooms/${roomId}`);
  return response.data.data;
};

/**
 * Get user's active room if any
 */
export const getMyActiveRoom = async (): Promise<VoiceRoom | null> => {
  try {
    const response = await api.get<ApiResponse<VoiceRoom>>('/voice-rooms/my-active-room');
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Join a voice room
 */
export const joinVoiceRoom = async (roomId: string): Promise<VoiceRoomJoinResponse> => {
  const response = await api.post<ApiResponse<VoiceRoomJoinResponse>>(
    `/voice-rooms/${roomId}/join`
  );
  console.log('🔍 Raw axios response:', response);
  console.log('🔍 response.data:', response.data);
  console.log('🔍 response.data.data:', response.data.data);
  console.log('🔍 channelName from response.data.data:', response.data.data?.channelName);
  return response.data.data;
};

/**
 * Leave a voice room
 */
export const leaveVoiceRoom = async (roomId: string): Promise<void> => {
  await api.post(`/voice-rooms/${roomId}/leave`);
};

/**
 * End a voice room (host only)
 */
export const endVoiceRoom = async (roomId: string): Promise<void> => {
  await api.delete(`/voice-rooms/${roomId}`);
};

/**
 * Refresh Agora token
 */
export const refreshAgoraToken = async (roomId: string): Promise<{ token: string; uid: number }> => {
  const response = await api.get<ApiResponse<{ token: string; uid: number }>>(
    `/voice-rooms/${roomId}/token`
  );
  return response.data.data;
};

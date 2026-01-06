import { useEffect, useState, useCallback, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { UserRole } from '@/types/voice-room.types';
import { toast } from 'sonner';

interface UseAgoraOptions {
  appId: string;
  onTokenExpired?: () => void;
  onUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onUserLeft?: (user: IAgoraRTCRemoteUser) => void;
  onVolumeIndicator?: (volumes: Array<{ uid: UID; level: number }>) => void;
}

interface AgoraState {
  isJoined: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  remoteUsers: Map<UID, IAgoraRTCRemoteUser>;
  localAudioTrack: IMicrophoneAudioTrack | null;
}

/**
 * Agora Hook - Handles audio streaming ONLY
 * Permissions are controlled by backend
 */
export const useAgora = (options: UseAgoraOptions) => {
  const { appId, onTokenExpired, onUserJoined, onUserLeft, onVolumeIndicator } = options;

  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
  );

  const [state, setState] = useState<AgoraState>({
    isJoined: false,
    isConnecting: false,
    isMuted: false,
    remoteUsers: new Map(),
    localAudioTrack: null,
  });

  const currentRoomRef = useRef<string | null>(null);
  const currentRoleRef = useRef<UserRole | null>(null);

  // Initialize Agora event listeners
  useEffect(() => {
    // Remote user published audio
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'audio') {
        await client.subscribe(user, mediaType);
        user.audioTrack?.play();
        
        setState((prev) => {
          const newRemoteUsers = new Map(prev.remoteUsers);
          newRemoteUsers.set(user.uid, user);
          return { ...prev, remoteUsers: newRemoteUsers };
        });

        onUserJoined?.(user);
      }
    };

    // Remote user unpublished audio
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'audio') {
        setState((prev) => {
          const newRemoteUsers = new Map(prev.remoteUsers);
          newRemoteUsers.delete(user.uid);
          return { ...prev, remoteUsers: newRemoteUsers };
        });
      }
    };

    // User left channel
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setState((prev) => {
        const newRemoteUsers = new Map(prev.remoteUsers);
        newRemoteUsers.delete(user.uid);
        return { ...prev, remoteUsers: newRemoteUsers };
      });
      
      onUserLeft?.(user);
    };

    // Token expiring
    const handleTokenPrivilegeWillExpire = () => {
      console.warn('Agora token will expire in 30 seconds');
      onTokenExpired?.();
    };

    // Token expired
    const handleTokenPrivilegeDidExpire = () => {
      console.error('Agora token expired');
      onTokenExpired?.();
    };

    // Volume indicator
    const handleVolumeIndicator = (volumes: Array<{ uid: UID; level: number }>) => {
      onVolumeIndicator?.(volumes);
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);
    client.on('token-privilege-will-expire', handleTokenPrivilegeWillExpire);
    client.on('token-privilege-did-expire', handleTokenPrivilegeDidExpire);
    client.on('volume-indicator', handleVolumeIndicator);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      client.off('token-privilege-will-expire', handleTokenPrivilegeWillExpire);
      client.off('token-privilege-did-expire', handleTokenPrivilegeDidExpire);
      client.off('volume-indicator', handleVolumeIndicator);
    };
  }, [client, onTokenExpired, onUserJoined, onUserLeft, onVolumeIndicator]);

  /**
   * Join Agora channel
   * Backend controls permissions via token role
   */
  const join = useCallback(
    async (channelName: string, token: string | null, uid: number, role: UserRole) => {
      if (state.isJoined || state.isConnecting) {
        console.warn('Already joined or connecting');
        return;
      }

      setState((prev) => ({ ...prev, isConnecting: true }));

      try {
        // Join channel
        await client.join(appId, channelName, token, uid);
        currentRoomRef.current = channelName;
        currentRoleRef.current = role;

        // Create microphone track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'high_quality_stereo',
          AEC: true, // Echo cancellation
          AGC: true, // Auto gain control
          ANS: true, // Noise suppression
        });

        // Only publish if backend approved (HOST or SPEAKER)
        if (role === 'HOST' || role === 'SPEAKER') {
          await client.publish([audioTrack]);
          console.log('✅ Published audio as', role);
        } else {
          console.log('🔇 Joined as LISTENER - microphone disabled');
        }

        // Enable volume indicator
        client.enableAudioVolumeIndicator();

        setState((prev) => ({
          ...prev,
          isJoined: true,
          isConnecting: false,
          localAudioTrack: audioTrack,
        }));

        toast.success('Connected to voice room');
      } catch (error: any) {
        console.error('Failed to join Agora channel:', error);
        setState((prev) => ({ ...prev, isConnecting: false }));
        toast.error('Failed to connect to voice room');
        throw error;
      }
    },
    [appId, client, state.isJoined, state.isConnecting]
  );

  /**
   * Leave Agora channel
   */
  const leave = useCallback(async () => {
    if (!state.isJoined) return;

    try {
      // Stop and close local track
      if (state.localAudioTrack) {
        state.localAudioTrack.stop();
        state.localAudioTrack.close();
      }

      // Leave channel
      await client.leave();

      setState({
        isJoined: false,
        isConnecting: false,
        isMuted: false,
        remoteUsers: new Map(),
        localAudioTrack: null,
      });

      currentRoomRef.current = null;
      currentRoleRef.current = null;

      toast.info('Left voice room');
    } catch (error: any) {
      console.error('Failed to leave Agora channel:', error);
    }
  }, [client, state.isJoined, state.localAudioTrack]);

  /**
   * Renew token (before expiration)
   */
  const renewToken = useCallback(
    async (newToken: string) => {
      try {
        await client.renewToken(newToken);
        console.log('✅ Agora token renewed');
      } catch (error: any) {
        console.error('Failed to renew token:', error);
        throw error;
      }
    },
    [client]
  );

  /**
   * Toggle mute/unmute
   */
  const toggleMute = useCallback(() => {
    if (state.localAudioTrack) {
      const newMutedState = !state.isMuted;
      state.localAudioTrack.setEnabled(!newMutedState);
      setState((prev) => ({ ...prev, isMuted: newMutedState }));
      return newMutedState;
    }
    return state.isMuted;
  }, [state.localAudioTrack, state.isMuted]);

  /**
   * Switch role - Must leave and rejoin with new token
   * This is called after backend approves role change
   */
  const switchRole = useCallback(
    async (newToken: string, newRole: UserRole) => {
      if (!currentRoomRef.current) return;

      try {
        // Store current UID
        const currentUid = typeof client.uid === 'number' ? client.uid : parseInt(client.uid as string, 10);
        
        // Leave current session
        await leave();

        // Rejoin with new token and role
        await join(currentRoomRef.current, newToken, currentUid, newRole);
        
        console.log('✅ Role switched to', newRole);
      } catch (error: any) {
        console.error('Failed to switch role:', error);
        toast.error('Failed to update permissions');
        throw error;
      }
    },
    [client, join, leave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.localAudioTrack) {
        state.localAudioTrack.stop();
        state.localAudioTrack.close();
      }
      if (state.isJoined) {
        client.leave().catch(console.error);
      }
    };
  }, []);

  return {
    ...state,
    join,
    leave,
    renewToken,
    toggleMute,
    switchRole,
  };
};

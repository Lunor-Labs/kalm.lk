import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  MessageCircle, 
  Settings,
  Monitor,
  MonitorOff
} from 'lucide-react';
import DailyIframe from '@daily-co/daily-js';
import { Session } from '../../types/session';
import toast from 'react-hot-toast';

interface VideoCallInterfaceProps {
  session: Session;
  token: string;
  onEndCall: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

type ConnectionState = 'new' | 'joining' | 'joined' | 'left' | 'error';

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  session,
  token,
  onEndCall,
  onToggleChat,
  isChatOpen
}) => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(session.sessionType === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateParticipants = useCallback((call: any) => {
    try {
      const participants = call.participants();
      setParticipants(Object.values(participants));
    } catch (error) {
      console.warn('Error updating participants:', error);
    }
  }, []);

  const toggleMute = async () => {
    if (!callObjectRef.current || connectionState !== 'joined') return;
    
    try {
      const newMutedState = !isMuted;
      await callObjectRef.current.setLocalAudio(!newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    if (!callObjectRef.current || connectionState !== 'joined' || session.sessionType === 'audio') return;
    
    try {
      const newVideoState = !isVideoOff;
      await callObjectRef.current.setLocalVideo(!newVideoState);
      setIsVideoOff(newVideoState);
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast.error('Failed to toggle camera');
    }
  };

  const toggleScreenShare = async () => {
    if (!callObjectRef.current || connectionState !== 'joined' || session.sessionType === 'audio') return;
    
    try {
      if (isScreenSharing) {
        await callObjectRef.current.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await callObjectRef.current.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const leaveCall = async () => {
    if (!callObjectRef.current) return;
    
    try {
      await callObjectRef.current.leave();
    } catch (error) {
      console.error('Failed to leave call:', error);
    } finally {
      onEndCall();
    }
  };

  useEffect(() => {
    if (!session.dailyRoomUrl || !callFrameRef.current || callObjectRef.current) return;

    const initializeCall = async () => {
      try {
        setConnectionState('joining');
        setError(null);
        
        // Test media permissions first
        try {
          const mediaConstraints = {
            video: session.sessionType === 'video',
            audio: true
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          stream.getTracks().forEach(track => track.stop());
        } catch (mediaError: any) {
          let errorMessage = 'Please allow camera and microphone access';
          if (mediaError.name === 'NotAllowedError') {
            errorMessage = 'Camera/microphone access was denied. Please check your browser permissions.';
          }
          throw new Error(errorMessage);
        }

        // Create call object
        const call = DailyIframe.createCallObject({
          showLeaveButton: false,
          showFullscreenButton: true,
          theme: {
            colors: {
              accent: '#00BFA5',
              accentText: '#FFFFFF',
              background: '#202020',
              backgroundAccent: '#464440',
              baseText: '#FFFFFF',
              border: '#464440',
              mainAreaBg: '#202020',
              mainAreaBgAccent: '#464440',
              mainAreaText: '#FFFFFF',
              supportiveText: '#B3B0A9'
            }
          }
        });

        callObjectRef.current = call;

        // Set up event listeners
        call.on('joining-meeting', () => setConnectionState('joining'));
        call.on('joined-meeting', () => {
          setConnectionState('joined');
          updateParticipants(call);
        });
        call.on('left-meeting', () => {
          setConnectionState('left');
          onEndCall();
        });
        call.on('participant-joined', () => updateParticipants(call));
        call.on('participant-left', () => updateParticipants(call));
        call.on('participant-updated', () => updateParticipants(call));
        call.on('error', (e: any) => {
          console.error('Daily.co error:', e);
          setError(e.errorMsg || 'Connection error');
          setConnectionState('error');
          toast.error(e.errorMsg || 'Connection error');
        });

        // Join the room
        await call.join({
          url: session.dailyRoomUrl,
          token: token,
          startVideoOff: session.sessionType === 'audio',
          startAudioOff: false
        });

        // Embed the call in the container
        if (callFrameRef.current) {
          callFrameRef.current.innerHTML = '';
          const iframe = call.iframe();
          
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '16px';
            callFrameRef.current.appendChild(iframe);
          } else {
            throw new Error('Failed to initialize video interface');
          }
        }

      } catch (error: any) {
        console.error('Failed to initialize call:', error);
        setError(error.message || 'Failed to join session');
        setConnectionState('error');
        toast.error(error.message || 'Failed to join session');
      }
    };

    initializeCall();

    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave().catch(console.error);
        callObjectRef.current.destroy();
        callObjectRef.current = null;
      }
    };
  }, [session.dailyRoomUrl, token, session.sessionType, onEndCall, updateParticipants]);

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Video Container */}
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
        <div ref={callFrameRef} className="w-full h-full" />
        
        {/* Connection Status */}
        {connectionState === 'joining' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Connecting to session...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
              <p className="text-neutral-300 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (callObjectRef.current) {
                    callObjectRef.current.leave().catch(console.error);
                    callObjectRef.current.destroy();
                    callObjectRef.current = null;
                  }
                }}
                className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Session Info Overlay */}
        {connectionState === 'joined' && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-2 z-20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-white font-medium text-sm">
                  {session.sessionType === 'video' ? 'Video Session' : 'Audio Session'}
                </p>
                <p className="text-neutral-300 text-xs">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Toggle (Mobile) */}
        <button
          onClick={onToggleChat}
          className={`absolute top-4 right-4 md:hidden w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 z-20 ${
            isChatOpen ? 'bg-primary-500' : 'bg-black/70'
          }`}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 bg-neutral-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            disabled={connectionState !== 'joined'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-700 hover:bg-neutral-600'
            } ${connectionState !== 'joined' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle (only for video sessions) */}
          {session.sessionType === 'video' && (
            <button
              onClick={toggleVideo}
              disabled={connectionState !== 'joined'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-700 hover:bg-neutral-600'
              } ${connectionState !== 'joined' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Screen Share (only for video sessions) */}
          {session.sessionType === 'video' && (
            <button
              onClick={toggleScreenShare}
              disabled={connectionState !== 'joined'}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-neutral-700 hover:bg-neutral-600'
              } ${connectionState !== 'joined' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Chat Toggle (Desktop) */}
          <button
            onClick={onToggleChat}
            className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center transition-colors duration-200 ${
              isChatOpen ? 'bg-primary-500 hover:bg-primary-600' : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
            title="Toggle chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* Settings */}
          <button 
            disabled={connectionState !== 'joined'}
            className="w-12 h-12 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={leaveCall}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors duration-200"
            title="End call"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="text-center mt-2">
          <p className="text-neutral-400 text-sm">
            {connectionState === 'joined' ? (
              <span className="text-green-500">● Connected</span>
            ) : connectionState === 'joining' ? (
              <span className="text-yellow-500">● Connecting...</span>
            ) : connectionState === 'error' ? (
              <span className="text-red-400">● Connection failed</span>
            ) : (
              <span className="text-neutral-400">● Not connected</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;
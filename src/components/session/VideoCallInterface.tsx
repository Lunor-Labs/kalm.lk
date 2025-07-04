import React, { useEffect, useRef, useState } from 'react';
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

interface VideoCallInterfaceProps {
  session: Session;
  token: string;
  onEndCall: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  session,
  token,
  onEndCall,
  onToggleChat,
  isChatOpen
}) => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(session.sessionType === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!session.dailyRoomUrl || !callFrameRef.current || isInitializing) return;

    const initializeCall = async () => {
      try {
        setIsInitializing(true);
        
        // Clean up any existing call object first
        if (callObjectRef.current) {
          try {
            await callObjectRef.current.destroy();
          } catch (error) {
            console.warn('Error destroying previous call object:', error);
          }
          callObjectRef.current = null;
        }

        // Create new call object
        const call = DailyIframe.createCallObject({
          showLeaveButton: false,
          showFullscreenButton: true,
          showLocalVideo: session.sessionType === 'video',
          showParticipantsBar: false,
        });

        callObjectRef.current = call;

        // Set up event listeners
        call.on('joined-meeting', () => {
          console.log('Joined meeting');
          setIsConnected(true);
          updateParticipants(call);
        });

        call.on('left-meeting', () => {
          console.log('Left meeting');
          setIsConnected(false);
          onEndCall();
        });

        call.on('participant-joined', (event: any) => {
          console.log('Participant joined:', event.participant);
          updateParticipants(call);
        });

        call.on('participant-left', (event: any) => {
          console.log('Participant left:', event.participant);
          updateParticipants(call);
        });

        call.on('participant-updated', (event: any) => {
          console.log('Participant updated:', event.participant);
          updateParticipants(call);
        });

        call.on('error', (event: any) => {
          console.error('Daily.co error:', event);
        });

        // Join the room
        await call.join({
          url: session.dailyRoomUrl,
          token: token,
          userName: 'User', // This should be the actual user name
        });

        // Set initial audio/video state
        if (session.sessionType === 'audio') {
          await call.setLocalVideo(false);
          setIsVideoOff(true);
        }

      } catch (error) {
        console.error('Failed to initialize call:', error);
        setIsInitializing(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      if (callObjectRef.current) {
        try {
          callObjectRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying call object on cleanup:', error);
        }
        callObjectRef.current = null;
      }
    };
  }, [session.dailyRoomUrl, token, session.sessionType]);

  const updateParticipants = (call: any) => {
    try {
      const participants = call.participants();
      setParticipants(Object.values(participants));
    } catch (error) {
      console.warn('Error updating participants:', error);
    }
  };

  const toggleMute = async () => {
    if (!callObjectRef.current) return;
    
    try {
      await callObjectRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const toggleVideo = async () => {
    if (!callObjectRef.current || session.sessionType === 'audio') return;
    
    try {
      await callObjectRef.current.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (!callObjectRef.current || session.sessionType === 'audio') return;
    
    try {
      if (isScreenSharing) {
        await callObjectRef.current.stopScreenShare();
      } else {
        await callObjectRef.current.startScreenShare();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const leaveCall = async () => {
    if (!callObjectRef.current) return;
    
    try {
      await callObjectRef.current.leave();
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Video Container */}
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
        <div ref={callFrameRef} className="w-full h-full" />
        
        {/* Connection Status */}
        {(!isConnected || isInitializing) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">
                {isInitializing ? 'Initializing session...' : 'Connecting to session...'}
              </p>
            </div>
          </div>
        )}

        {/* Session Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent-green' : 'bg-accent-orange'}`}></div>
            <div>
              <p className="text-white font-medium text-sm">
                {session.sessionType === 'video' ? 'Video Session' : 'Audio Session'}
              </p>
              <p className="text-neutral-300 text-xs">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Toggle (Mobile) */}
        <button
          onClick={onToggleChat}
          className="absolute top-4 right-4 md:hidden w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors duration-200"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-6 bg-neutral-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
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
              disabled={!isConnected}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isVideoOff 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
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
              disabled={!isConnected}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isScreenSharing 
                  ? 'bg-primary-500 hover:bg-primary-600' 
                  : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
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
              isChatOpen 
                ? 'bg-primary-500 hover:bg-primary-600' 
                : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* Settings */}
          <button 
            disabled={!isConnected}
            className="w-12 h-12 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={leaveCall}
            disabled={!isConnected}
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;
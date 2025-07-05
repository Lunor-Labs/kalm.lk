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
  const [error, setError] = useState<string | null>(null);

  // Move updateParticipants outside useEffect to make it stable
  const updateParticipants = (call: any) => {
    try {
      const participants = call.participants();
      setParticipants(Object.values(participants));
      console.log('Updated participants:', Object.keys(participants).length);
    } catch (error) {
      console.warn('Error updating participants:', error);
    }
  };

  useEffect(() => {
    if (!session.dailyRoomUrl || !callFrameRef.current || isInitializing || callObjectRef.current) return;
    
    // Track if this effect is still active
    let isActive = true;

    const initializeCall = async () => {
      try {
        if (!isActive) return;
        setIsInitializing(true);
        setError(null);
        
        console.log('Initializing Daily.co call with:', {
          roomUrl: session.dailyRoomUrl,
          sessionType: session.sessionType,
          hasToken: !!token
        });

        // Create call object with proper configuration
        const call = DailyIframe.createCallObject();

        callObjectRef.current = call;

        // Set up event listeners
        call.on('joined-meeting', (event: any) => {
          if (!isActive) return;
          console.log('Successfully joined meeting:', event);
          setIsConnected(true);
          updateParticipants(call);
        });

        call.on('left-meeting', (event: any) => {
          if (!isActive) return;
          console.log('Left meeting:', event);
          setIsConnected(false);
          onEndCall();
        });

        call.on('participant-joined', (event: any) => {
          if (!isActive) return;
          console.log('Participant joined:', event.participant);
          updateParticipants(call);
        });

        call.on('participant-left', (event: any) => {
          if (!isActive) return;
          console.log('Participant left:', event.participant);
          updateParticipants(call);
        });

        call.on('participant-updated', (event: any) => {
          if (!isActive) return;
          console.log('Participant updated:', event.participant);
          updateParticipants(call);
        });

        call.on('camera-error', (event: any) => {
          if (!isActive) return;
          console.error('Camera error:', event);
          setError('Camera access denied or unavailable');
        });

        call.on('error', (event: any) => {
          if (!isActive) return;
          console.error('Daily.co error:', event);
          setError(`Connection error: ${event.errorMsg || 'Unknown error'}`);
        });

        call.on('loading', (event: any) => {
          console.log('Loading state:', event);
        });

        call.on('loaded', (event: any) => {
          console.log('Call loaded:', event);
        });

        // Request media permissions first
        try {
          const mediaConstraints = {
            video: session.sessionType === 'video',
            audio: true
          };
          
          console.log('Requesting media permissions:', mediaConstraints);
          const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          console.log('Media permissions granted');
          
          // Stop the test stream immediately as Daily.co will handle media
          stream.getTracks().forEach(track => track.stop());
        } catch (mediaError) {
          console.error('Media permission error:', mediaError);
          
          if (mediaError.name === 'NotAllowedError' || mediaError.message === 'Permission denied') {
            setError('Camera and microphone access denied. Please allow permissions and refresh the page to join the session.');
          } else if (mediaError.name === 'NotFoundError') {
            setError('No camera or microphone found. Please check your devices and try again.');
          } else if (mediaError.name === 'NotReadableError') {
            setError('Camera or microphone is already in use by another application.');
          } else {
            setError(`Media access error: ${mediaError.message}. Please check your camera and microphone settings.`);
          }
          if (!isActive) return;
          setIsInitializing(false);
          return;
        }

        // Join the room with proper configuration
        const joinConfig: any = {
          url: session.dailyRoomUrl,
          userName: 'User',
          startVideoOff: session.sessionType === 'audio',
          startAudioOff: false
        };

        // Add token if available
        if (token && token.trim()) {
          joinConfig.token = token;
        }

        console.log('Joining with config:', joinConfig);
        await call.join(joinConfig);

        if (!isActive) return;

        // Embed the call in the container
        if (callFrameRef.current) {
          call.iframe().style.width = '100%';
          call.iframe().style.height = '100%';
          call.iframe().style.border = 'none';
          call.iframe().style.borderRadius = '16px';
          
          // Clear container and append iframe
          callFrameRef.current.innerHTML = '';
          callFrameRef.current.appendChild(call.iframe());
        }

        console.log('Call initialization completed');

      } catch (error: any) {
        if (!isActive) return;
        console.error('Failed to initialize call:', error);
        setError(`Failed to join session: ${error.message || 'Unknown error'}`);
      } finally {
        if (!isActive) return;
        setIsInitializing(false);
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      isActive = false;
      if (callObjectRef.current) {
        try {
          callObjectRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying call object on cleanup:', error);
        }
        callObjectRef.current = null;
      }
    };
  }, [session.dailyRoomUrl, token, session.sessionType, updateParticipants]);

  const toggleMute = async () => {
    if (!callObjectRef.current || !isConnected) return;
    
    try {
      const newMutedState = !isMuted;
      await callObjectRef.current.setLocalAudio(!newMutedState);
      setIsMuted(newMutedState);
      console.log('Audio toggled:', newMutedState ? 'muted' : 'unmuted');
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const toggleVideo = async () => {
    if (!callObjectRef.current || !isConnected || session.sessionType === 'audio') return;
    
    try {
      const newVideoState = !isVideoOff;
      await callObjectRef.current.setLocalVideo(!newVideoState);
      setIsVideoOff(newVideoState);
      console.log('Video toggled:', newVideoState ? 'off' : 'on');
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (!callObjectRef.current || !isConnected || session.sessionType === 'audio') return;
    
    try {
      if (isScreenSharing) {
        await callObjectRef.current.stopScreenShare();
        setIsScreenSharing(false);
        console.log('Screen sharing stopped');
      } else {
        await callObjectRef.current.startScreenShare();
        setIsScreenSharing(true);
        console.log('Screen sharing started');
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  const leaveCall = async () => {
    if (!callObjectRef.current) return;
    
    try {
      console.log('Leaving call...');
      await callObjectRef.current.leave();
    } catch (error) {
      console.error('Failed to leave call:', error);
      // Force end call even if leave fails
      onEndCall();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Video Container */}
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
        <div ref={callFrameRef} className="w-full h-full" />
        
        {/* Connection Status */}
        {(!isConnected || isInitializing) && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg mb-2">
                {isInitializing ? 'Initializing session...' : 'Connecting to session...'}
              </p>
              <p className="text-neutral-300 text-sm">
                Please allow camera and microphone access when prompted
              </p>
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
              <div className="space-y-3">
                {error.includes('denied') && (
                  <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-2xl p-4 mb-4">
                    <h4 className="text-accent-yellow font-medium text-sm mb-2">How to enable permissions:</h4>
                    <ul className="text-neutral-300 text-xs space-y-1 text-left">
                      <li>• Look for a camera/microphone icon in your browser's address bar (usually with a red X or slash)</li>
                      <li>• Select "Allow" for both camera and microphone</li>
                      <li>• If no icon appears, check your browser settings under Privacy & Security</li>
                      <li>• Make sure this website is not blocked from accessing your camera/microphone</li>
                      <li>• Click "Try Again" below after granting permissions</li>
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => {
                    setError(null);
                    setIsInitializing(false);
                    window.location.reload();
                  }}
                  className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
                >
                  Refresh & Try Again
                </button>
                <button
                  onClick={onEndCall}
                  className="w-full bg-neutral-700 text-white py-3 rounded-2xl hover:bg-neutral-600 transition-colors duration-200"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Info Overlay */}
        {isConnected && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-2 z-20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-accent-green"></div>
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
          className="absolute top-4 right-4 md:hidden w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors duration-200 z-20"
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
              disabled={!isConnected}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isVideoOff 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
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
              disabled={!isConnected}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isScreenSharing 
                  ? 'bg-primary-500 hover:bg-primary-600' 
                  : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
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
              isChatOpen 
                ? 'bg-primary-500 hover:bg-primary-600' 
                : 'bg-neutral-700 hover:bg-neutral-600'
            }`}
            title="Toggle chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* Settings */}
          <button 
            disabled={!isConnected}
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
        <div className="text-center mt-4">
          <p className="text-neutral-400 text-sm">
            {isConnected ? (
              <span className="text-accent-green">● Connected</span>
            ) : isInitializing ? (
              <span className="text-accent-yellow">● Connecting...</span>
            ) : error ? (
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
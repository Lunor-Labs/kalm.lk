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
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
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
  const callObjectRef = useRef<DailyCall | null>(null);
  // Track if leave was user-initiated
  const userInitiatedLeave = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(session.sessionType === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]); // Could use DailyParticipant[] if you import types
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Robust async cleanup to prevent duplicate DailyIframe errors ---
  const cleanupPromiseRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;
    let cancelled = false;
    const callInstanceId = Symbol('callInstanceId');
    (callObjectRef as any).currentInstanceId = callInstanceId;

    const cleanupCallObject = async () => {
      if (callObjectRef.current) {
        try {
          userInitiatedLeave.current = false;
          if (callObjectRef.current.meetingState() !== 'left-meeting') {
            await callObjectRef.current.leave();
          }
          callObjectRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying previous Daily call object:', e);
        }
        callObjectRef.current = null;
      }
    };

    const initializeCall = async () => {
      setIsInitializing(true);
      setError(null);
      // Await any previous cleanup before creating a new call object
      await cleanupPromiseRef.current;
      const cleanupPromise = cleanupCallObject();
      cleanupPromiseRef.current = cleanupPromise;
      await cleanupPromise;

      if (!isMounted || !session.dailyRoomUrl || !callFrameRef.current) {
        setIsInitializing(false);
        return;
      }

      let call: DailyCall | null = null;
      try {
        console.log('Initializing Daily.co call with:', {
          roomUrl: session.dailyRoomUrl,
          sessionType: session.sessionType,
          hasToken: !!token
        });

        call = DailyIframe.createCallObject({
          showLeaveButton: false,
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
        (callObjectRef as any).currentInstanceId = callInstanceId;

        const isCurrentCall = () => (callObjectRef.current === call && (callObjectRef as any).currentInstanceId === callInstanceId && !cancelled);

        // ...existing event listeners and logic...

        call.on('joined-meeting', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Successfully joined meeting:', event);
          setIsConnected(true);
          updateParticipants(call!);
        });
        call.on('left-meeting', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Left meeting:', event);
          setIsConnected(false);
          if (userInitiatedLeave.current) {
            onEndCall();
          }
        });
        call.on('participant-joined', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Participant joined:', event.participant);
          updateParticipants(call!);
        });
        call.on('participant-left', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Participant left:', event.participant);
          updateParticipants(call!);
        });
        call.on('participant-updated', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Participant updated:', event.participant);
          updateParticipants(call!);
        });
        call.on('camera-error', (event: any) => {
          if (!isCurrentCall()) return;
          console.error('Camera error:', event);
          setError('Camera access denied or unavailable');
        });
        call.on('error', (event: any) => {
          if (!isCurrentCall()) return;
          console.error('Daily.co error:', event);
          setError(`Connection error: ${event.errorMsg || 'Unknown error'}`);
        });
        call.on('loading', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Loading state:', event);
        });
        call.on('loaded', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Call loaded:', event);
        });

        // Request media permissions first
        try {
          const mediaConstraints = {
            video: session.sessionType === 'video',
            audio: true
          };
          console.log('Requesting media permissions:', mediaConstraints);
          await navigator.mediaDevices.getUserMedia(mediaConstraints);
          if (!isCurrentCall()) {
            if (call) {
              call.destroy();
              if (callObjectRef.current === call) callObjectRef.current = null;
            }
            setIsInitializing(false);
            return;
          }
          console.log('Media permissions granted');
        } catch (mediaError) {
          console.warn('Media permission error:', mediaError);
          setError('Please allow camera and microphone access to join the session');
          if (call) {
            call.destroy();
            if (callObjectRef.current === call) callObjectRef.current = null;
          }
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

        if (token && token.trim()) {
          joinConfig.token = token;
        }

        console.log('Joining with config:', joinConfig);
        await call.join(joinConfig);
        if (!isCurrentCall()) {
          if (call) {
            call.destroy();
            if (callObjectRef.current === call) callObjectRef.current = null;
          }
          setIsInitializing(false);
          return;
        }

        // Embed the call in the container
        const iframe = call.iframe();
        if (callFrameRef.current) {
          callFrameRef.current.innerHTML = '';
          if (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '16px';
            callFrameRef.current.appendChild(iframe);
          } else {
            setError('Failed to load video call interface. Please try again.');
          }
        }

        console.log('Call initialization completed');

      } catch (error: any) {
        if (callObjectRef.current === call && !cancelled) {
          console.error('Failed to initialize call:', error);
          setError(`Failed to join session: ${error.message || 'Unknown error'}`);
        }
      } finally {
        if (callObjectRef.current === call && !cancelled) setIsInitializing(false);
      }
    };

    // Only allow one initialization at a time, and always await previous cleanup
    const initPromise = initializeCall();
    cleanupPromiseRef.current = initPromise;

    // Cleanup function
    return () => {
      isMounted = false;
      cancelled = true;
      cleanupPromiseRef.current = cleanupPromiseRef.current.then(() => cleanupCallObject());
    };
  }, [session.dailyRoomUrl, token, session.sessionType]);

  const updateParticipants = (call: DailyCall) => {
    try {
      const participantsObj = call.participants();
      setParticipants(Object.values(participantsObj));
      console.log('Updated participants:', Object.keys(participantsObj).length);
    } catch (error) {
      console.warn('Error updating participants:', error);
    }
  };

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
    userInitiatedLeave.current = true;
    try {
      console.log('Leaving call...');
      await callObjectRef.current.leave();
    } catch (error) {
      console.error('Failed to leave call:', error);
      // Force end call even if leave fails
      onEndCall();
    } finally {
      // Reset after leave attempt
      userInitiatedLeave.current = false;
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
                <button
                  onClick={async () => {
                    setError(null);
                    setIsInitializing(false);
                    // Trigger re-initialization
                    if (callObjectRef.current) {
                      try {
                        if (callObjectRef.current.meetingState() !== 'left-meeting') {
                          await callObjectRef.current.leave();
                        }
                        if (callObjectRef.current) {
                          callObjectRef.current.destroy();
                        }
                      } catch (e) {
                        console.warn('Error destroying call object on retry:', e);
                      }
                      callObjectRef.current = null;
                    }
                  }}
                  className="w-full bg-primary-500 text-white py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
                >
                  Try Again
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
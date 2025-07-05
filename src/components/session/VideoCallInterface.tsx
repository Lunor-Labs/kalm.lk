import React, { useEffect, useRef, useState } from 'react';
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
  // onToggleChat,
  // isChatOpen
}) => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<DailyCall | null>(null);
  const userInitiatedLeave = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Robust async cleanup to prevent duplicate DailyIframe errors
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

        // Create Daily.co iframe with default UI
        call = DailyIframe.createFrame(callFrameRef.current!, {
          // Use Daily.co's default UI - remove custom theme
          showLeaveButton: true,
          showFullscreenButton: true,
          showLocalVideo: true,
          showParticipantsBar: true,
          // You can still customize some colors if needed
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

        // Set up event listeners
        call.on('joined-meeting', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Successfully joined meeting:', event);
          setIsConnected(true);
          setIsInitializing(false);
        });

        call.on('left-meeting', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Left meeting:', event);
          setIsConnected(false);
          // Always call onEndCall when leaving, regardless of who initiated
          onEndCall();
        });

        call.on('camera-error', (event: any) => {
          if (!isCurrentCall()) return;
          console.error('Camera error:', event);
          setError('Camera access denied or unavailable');
          setIsInitializing(false);
        });

        call.on('error', (event: any) => {
          if (!isCurrentCall()) return;
          console.error('Daily.co error:', event);
          setError(`Connection error: ${event.errorMsg || 'Unknown error'}`);
          setIsInitializing(false);
        });

        call.on('loading', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Loading state:', event);
        });

        call.on('loaded', (event: any) => {
          if (!isCurrentCall()) return;
          console.log('Call loaded:', event);
        });

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

        console.log('Call initialization completed');

      } catch (error: any) {
        if (callObjectRef.current === call && !cancelled) {
          console.error('Failed to initialize call:', error);
          setError(`Failed to join session: ${error.message || 'Unknown error'}`);
          setIsInitializing(false);
        }
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
  }, [session.dailyRoomUrl, token, session.sessionType, onEndCall]);

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Daily.co Default UI Container */}
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">
        <div ref={callFrameRef} className="w-full h-full" />
        
        {/* Loading State */}
        {/* {isInitializing && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg mb-2">Initializing session...</p>
              <p className="text-neutral-300 text-sm">
                Please allow camera and microphone access when prompted
              </p>
            </div>
          </div>
        )} */}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 text-red-500">⚠️</div>
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
      </div>

      {/* Optional: Connection Status Footer */}
      <div className="p-4 bg-neutral-800/50 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-neutral-400 text-sm">
            {isConnected ? (
              <span className="text-accent-green">● Connected - Using Daily.co interface</span>
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
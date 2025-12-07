import React, { useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Session } from '../../types/session';

interface VideoCallInterfaceProps {
  session: Session;
  token: string;
  onEndCall: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onLeftCall?: () => void; // Called when user leaves but doesn't end session
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  session,
  token,
  onEndCall,
  onLeftCall,
}) => {
  const callFrameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<DailyCall | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUnmountingRef = useRef(false); // Track if component is unmounting (navigation away)

  // 🔥 Forces iframe + Daily object to recreate
  const [reloadKey, setReloadKey] = useState(Date.now());

  // ------------------------------------------------------------
  // 🧹 CLEANUP (safe, never double-destroy, avoids postMessage error)
  // ------------------------------------------------------------
  const safeCleanup = async () => {
    try {
      if (callObjectRef.current) {
        const call = callObjectRef.current;

        const state = call.meetingState();
        if (state !== "left-meeting" && state !== "new") {
          try {
            await call.leave();
          } catch (e) {
            console.warn("Error leaving call:", e);
          }
        }

        try {
          call.destroy();
        } catch (e) {
          console.warn("Error destroying call:", e);
        }
      }
    } catch (e) {
      console.warn("Cleanup failed:", e);
    }

    callObjectRef.current = null;

    // Clear the iframe container
    if (callFrameRef.current) {
      callFrameRef.current.innerHTML = '';
    }
  };

  // ------------------------------------------------------------
  // 🔄 INIT + JOIN MEETING
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const startCall = async () => {
      setIsInitializing(true);
      setIsConnected(false);
      setError(null);

      // ensure previous call is fully cleaned
      await safeCleanup();

      // Small delay to ensure DOM is ready and cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!callFrameRef.current || cancelled) {
        setIsInitializing(false);
        return;
      }

      // Ensure the container is empty
      if (callFrameRef.current.innerHTML) {
        callFrameRef.current.innerHTML = '';
      }

      // Create fresh frame
      const call = DailyIframe.createFrame(callFrameRef.current, {
        showLeaveButton: true,
        showParticipantsBar: true,
        showFullscreenButton: true,
      });

      callObjectRef.current = call;

      // Events
      call.on("joined-meeting", () => {
        if (cancelled) return;
        setIsConnected(true);
        setIsInitializing(false);
      });

      call.on("left-meeting", () => {
        if (cancelled) return;
        setIsConnected(false);

        // 🔥 force fresh Daily instance next time
        setReloadKey(Date.now());

        // Only end session if user explicitly ended it, not if they just navigated away
        // If component is unmounting (navigation), just notify parent but don't end session
        // This allows users to rejoin the same session after navigating away
        if (isUnmountingRef.current) {
          // User navigated away - just leave the call, don't end the session
          // Session remains active and they can rejoin
          onLeftCall?.();
        } else {
          // User explicitly left via Daily.co UI leave button - end the session
          onEndCall();
        }
      });

      call.on("error", (event: any) => {
        if (cancelled) return;
        console.error("Daily error:", event);
        setError(event.errorMsg || "Unknown error");
        setIsInitializing(false);
      });

      // Join with config
      try {
        await call.join({
          url: session.dailyRoomUrl,
          userName: "User",
          token: token || undefined,
          startVideoOff: session.sessionType === "audio",
          startAudioOff: false,
        });
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "Failed to join session");
        setIsInitializing(false);
      }
    };

    startCall();

    return () => {
      cancelled = true;
      isUnmountingRef.current = true; // Mark that component is unmounting
      safeCleanup(); // only once
    };
  }, [
    session.dailyRoomUrl,
    token,
    session.sessionType,
    reloadKey, // 🔥 ensures full re-init
    onEndCall,
    onLeftCall,
  ]);

  // Reset unmounting flag and state when component remounts (user rejoins)
  useEffect(() => {
    isUnmountingRef.current = false;
    setIsConnected(false);
    setIsInitializing(false);
    setError(null);
  }, [session.dailyRoomUrl]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">

        {/* 🔥 key={reloadKey} forces full iframe remount */}
        <div key={reloadKey} ref={callFrameRef} className="w-full h-full" />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center max-w-md mx-auto p-6">
              <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
              <p className="text-neutral-300 mb-6">{error}</p>

              <button
                onClick={() => {
                  setError(null);
                  setReloadKey(Date.now()); // 🔥 retry
                }}
                className="w-full bg-primary-500 text-white py-3 rounded-2xl"
              >
                Try Again
              </button>

              <button
                onClick={onEndCall}
                className="w-full mt-3 bg-neutral-700 text-white py-3 rounded-2xl"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-800/50">
        <p className="text-center text-neutral-400 text-sm">
          {isConnected
            ? "● Connected"
            : isInitializing
            ? "● Connecting..."
            : error
            ? "● Error"
            : "● Not Connected"}
        </p>
      </div>
    </div>
  );
};

export default VideoCallInterface;

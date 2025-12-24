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
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
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

      // Create fresh frame - hide Daily.co's leave button, we'll use our own with confirmation
      const call = DailyIframe.createFrame(callFrameRef.current, {
        showLeaveButton: false, // Hide Daily.co's leave button
        showParticipantsBar: true,
        showFullscreenButton: true,
          // 🔥 Audio-only enforcement
        videoSource: session.sessionType === "audio" ? false : true
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
        setShowEndCallConfirm(false); // Hide confirmation dialog

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
          // User explicitly left via our custom end call button - end the session
          onEndCall();
        }
      });

      call.on("error", (event: unknown) => {
        if (cancelled) return;
        console.error("Daily error:", event);
        const errorMessage = event && typeof event === 'object' && 'errorMsg' in event
          ? String((event as { errorMsg?: unknown }).errorMsg || "Unknown error")
          : "Unknown error";
        setError(errorMessage);
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
      } catch (err: unknown) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to join session";
        setError(errorMessage);
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
    setShowEndCallConfirm(false);
  }, [session.dailyRoomUrl]);

  // Handle end call with confirmation
  const handleEndCallClick = () => {
    setShowEndCallConfirm(true);
  };

  const handleConfirmEndCall = async () => {
    if (callObjectRef.current) {
      try {
        await callObjectRef.current.leave();
      } catch (err) {
        console.error("Error leaving call:", err);
        setError("Failed to end call. Please try again.");
        setShowEndCallConfirm(false);
      }
    }
  };

  const handleCancelEndCall = () => {
    setShowEndCallConfirm(false);
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden">

        {/* 🔥 key={reloadKey} forces full iframe remount */}
        <div key={reloadKey} ref={callFrameRef} className="w-full h-full" />

        {/* End Call Confirmation Dialog */}
        {showEndCallConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
            <div className="bg-neutral-800 rounded-2xl p-6 max-w-md mx-4 border border-neutral-700">
              <h3 className="text-xl font-bold text-white mb-2">End Session?</h3>
              <p className="text-neutral-300 mb-6">
                Are you sure you want to end this session? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelEndCall}
                  className="flex-1 bg-neutral-700 text-white py-3 rounded-xl hover:bg-neutral-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEndCall}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors duration-200"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && !showEndCallConfirm && (
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

        {/* Custom End Call Button */}
        {isConnected && !error && !showEndCallConfirm && (
          <div className="absolute bottom-1 left-[40%] transform -translate-x-1/2 z-40">
            <button
              onClick={handleEndCallClick}
              className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-medium">End Call</span>
            </button>
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

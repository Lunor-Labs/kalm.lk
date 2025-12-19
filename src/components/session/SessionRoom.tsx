import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Video, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Session } from '../../types/session';
import { getSession, generateMeetingToken, startSession, endSession } from '../../lib/sessions';
import VideoCallInterface from './VideoCallInterface';
import ChatInterface from './ChatInterface';
import toast from 'react-hot-toast';

const SessionRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [meetingToken, setMeetingToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const userExplicitlyEndedRef = useRef(false); // Track if user explicitly ended session

  useEffect(() => {
    if (!sessionId || !user) return;

    const initializeSession = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get session details
        const sessionData = await getSession(sessionId);
        if (!sessionData) {
          throw new Error('Session not found');
        }

        // Check if user is authorized for this session
        const isAuthorized = sessionData.therapistId === user.uid || sessionData.clientId === user.uid;
        if (!isAuthorized) {
          throw new Error('You are not authorized to join this session');
        }

        // Check if session is still joinable (active or scheduled)
        if (sessionData.status === 'completed' || sessionData.status === 'cancelled') {
          throw new Error('This session has already ended');
        }

        setSession(sessionData);

        // Generate meeting token for video/audio sessions
        if (sessionData.sessionType === 'video' || sessionData.sessionType === 'audio') {
          const token = await generateMeetingToken(
            sessionId,
            user.uid,
            user.displayName || 'User',
            user.role === 'therapist'
          );
          setMeetingToken(token);
        }

        // Start session if it's scheduled and not already started
        if (sessionData.status === 'scheduled') {
          await startSession(sessionId);
          setSession(prev => prev ? { ...prev, status: 'active' } : null);
        }

        setIsInitialized(true);
      } catch (err: any) {
        console.error('Failed to initialize session:', err);
        setError(err.message || 'Failed to load session');
        toast.error(err.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // Cleanup function - reset initialization state when sessionId or user changes
    return () => {
      setIsInitialized(false);
      userExplicitlyEndedRef.current = false; // Reset when session changes
    };
  }, [sessionId, user]);

  // Add beforeunload warning to prevent accidental navigation away
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if session is active
      if (session.status === 'active') {
        e.preventDefault();
        e.returnValue = 'You are in an active session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  const handleEndSession = async () => {
    if (!session) return;

    userExplicitlyEndedRef.current = true; // Mark that user explicitly ended session

    try {
      // End session without notes for now
      await endSession(session.id);
      toast.success('Session ended successfully');
      
      // Navigate back based on user role
      if (user?.role === 'therapist') {
        navigate('/therapist/sessions');
      } else {
        navigate('/client/sessions');
      }
    } catch (error: any) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end session');
    }
  };

  const handleLeftCall = () => {
    // User navigated away from call but didn't end session
    // Just navigate back - session remains active and they can rejoin
    if (user?.role === 'therapist') {
      navigate('/therapist/sessions');
    } else {
      navigate('/client/sessions');
    }
  };

  const handleBackClick = () => {
    if (user?.role === 'therapist') {
      navigate('/therapist/sessions');
    } else {
      navigate('/client/sessions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Error</h1>
          <p className="text-neutral-300 mb-6">{error}</p>
          <button
            onClick={handleBackClick}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl hover:bg-primary-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Chat-only session
  if (session.sessionType === 'chat') {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Sessions</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/50 rounded-2xl px-4 py-2">
                <MessageCircle className="w-5 h-5 text-primary-500" />
                <span className="text-white font-medium">Chat Session</span>
              </div>
              
              <button
                onClick={handleEndSession}
                className="bg-red-500 text-white px-4 py-2 rounded-2xl hover:bg-red-600 transition-colors duration-200"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-[calc(100vh-120px)]">
            <ChatInterface sessionId={session.id} isFullScreen={true} />
          </div>
        </div>
      </div>
    );
  }

  // Video/Audio session
  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="h-screen flex flex-col lg:flex-row">
        {/* Main Video Area */}
        <div className={`flex-1 flex flex-col ${isChatOpen ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-neutral-800/50 backdrop-blur-sm">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Sessions</span>
            </button>
            
            {/* <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/50 rounded-2xl px-4 py-2">
                <Video className="w-5 h-5 text-primary-500" />
                <span className="text-white font-medium hidden sm:inline">
                  {session.sessionType === 'video' ? 'Video Session' : 'Audio Session'}
                </span>
              </div>
              
              <button
                onClick={handleEndSession}
                className="bg-red-500 text-white px-4 py-2 rounded-2xl hover:bg-red-600 transition-colors duration-200"
              >
                End
              </button>
            </div> */}
          </div>

          {/* Video Interface */}
          <div className="flex-1">
            {isInitialized && meetingToken && (
              <VideoCallInterface
                session={session}
                token={meetingToken}
                onEndCall={handleEndSession}
                onLeftCall={handleLeftCall}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                isChatOpen={isChatOpen}
              />
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="lg:w-1/3 border-l border-neutral-700">
            <ChatInterface 
              sessionId={session.id} 
              onClose={() => setIsChatOpen(false)}
              isFullScreen={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionRoom;
# Kalm Mental Wellness Platform

A comprehensive mental health platform connecting users with licensed therapists in Sri Lanka.

## Features

- **Multiple Account Types**: Regular accounts with email or anonymous accounts for privacy
- **Session Types**: Video, audio, and chat therapy sessions
- **Secure Payments**: PayHere integration for local payment methods
- **Real-time Communication**: Video calls powered by Daily.co
- **Admin Dashboard**: Complete platform management
- **Therapist Portal**: Schedule and availability management
- **Client Portal**: Book sessions and manage appointments

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Functions**: Firebase Functions
- **Video Calls**: Daily.co
- **Payments**: PayHere (Sri Lanka)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── features/           # Feature-specific components
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── lib/                # Utility libraries and services
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── data/               # Static data and mock data

functions/
├── src/                # Firebase Functions source
├── lib/                # Compiled JavaScript (auto-generated)
└── package.json        # Functions dependencies
```

## Environment Setup

1. Copy `.env.example` to `.env` and configure your environment variables
2. Set up Firebase project and update configuration
3. Configure PayHere merchant credentials
4. Set up Daily.co for video calling

## Development

```bash
# Install dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install && cd ..

# Start development server
npm run dev

# Start Firebase emulators (optional)
firebase emulators:start
```

## Firebase Functions

The project includes automated background functions:

### **Email Reminders**
- **Hourly Check**: Runs every hour to check for upcoming sessions
- **1-Hour Reminder**: Sends email reminders 1 hour before sessions
- **Therapist Notifications**: Notifies therapists of upcoming appointments

### **Email Processing**
- **Queue Processing**: Processes pending email notifications every 5 minutes
- **Retry Logic**: Automatic retry for failed emails (up to 3 attempts)
- **Status Tracking**: Tracks sent, pending, and failed email statuses

### **Manual Triggers**
- **Test Functions**: HTTP endpoints for testing email functionality
- **Admin Tools**: Manual triggers for debugging and testing

## Deployment

### **Frontend**
```bash
npm run build
# Deploy to your hosting provider
```

### **Firebase Functions**
```bash
cd functions
npm run deploy
```

### **Firebase Rules**
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Configuration Files

- **Environment Variables**: Multiple environment files for dev/uat/prod
- **Firebase Config**: `firebase.json` with emulator settings
- **Firestore Rules**: Security rules for data access
- **Storage Rules**: File upload permissions
- **Function Indexes**: Optimized database queries

## Key Features

### **Authentication**
- Email/password authentication
- Anonymous accounts for privacy
- Google OAuth integration
- Role-based access control (client, therapist, admin)

### **Booking System**
- Multi-step booking flow
- Real-time availability checking
- PayHere payment integration
- Session type selection (video/audio/chat)

### **Session Management**
- Daily.co video integration
- Real-time chat messaging
- Session recording capabilities
- Automated session lifecycle

### **Admin Features**
- User management and role assignment
- Therapist onboarding and management
- Payment reports and analytics
- System monitoring and alerts

## Security

- End-to-end encryption for communications
- Secure payment processing via PayHere
- Firebase security rules
- Role-based access control
- Data privacy compliance

## Support

For technical support or questions:
- Email: support@kalm.lk
- Phone: +94 (76) 633 0360
- Documentation: [Internal Wiki]

---

**Kalm.lk** - For the thoughts you've never told anyone.
# Google Calendar OAuth Integration Setup Guide

## 🚀 Complete OAuth Flow Implementation

The Google Calendar OAuth integration has been implemented with the following components:

### ✅ What's Been Added

1. **OAuth Component** (`components/auth/GoogleCalendarOAuth.tsx`):
   - Complete OAuth flow UI
   - Connection status display
   - Token refresh functionality
   - Disconnect capability
   - Error handling and user feedback

2. **API Endpoints**:
   - `/api/google-calendar/auth` - Initiate OAuth flow
   - `/api/google-calendar/callback` - Handle OAuth callback
   - `/api/google-calendar/status` - Check connection status
   - `/api/google-calendar/refresh` - Refresh expired tokens
   - `/api/google-calendar/disconnect` - Disconnect and revoke tokens

3. **Enhanced Google Calendar Service** (already exists):
   - OAuth 2.0 integration
   - Token management
   - Calendar event synchronization
   - Error handling and fallbacks

### 🔧 Setup Instructions

#### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/google-calendar/callback` (development)
     - `https://yourdomain.com/api/google-calendar/callback` (production)

4. **Get Your Credentials**:
   - Copy the Client ID and Client Secret
   - You'll need these for environment variables

#### Step 2: Environment Variables

Add these to your `.env.local` file:

```bash
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth Redirect URI
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

#### Step 3: Database Schema (Optional)

If you want to store OAuth tokens securely, add this to your database:

```sql
-- Google Calendar OAuth Tokens
CREATE TABLE google_calendar_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  scope TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  user_email VARCHAR(255),
  calendar_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

#### Step 4: Integration in Your App

Add the OAuth component to your dashboard or settings page:

```tsx
import GoogleCalendarOAuth from '@/components/auth/GoogleCalendarOAuth'

// In your component
<GoogleCalendarOAuth
  onSuccess={() => {
    console.log('Google Calendar connected successfully!')
    // Refresh your calendar data or show success message
  }}
  onError={(error) => {
    console.error('Google Calendar connection failed:', error)
    // Show error message to user
  }}
/>
```

### 🎯 Features

#### OAuth Flow
- **Secure Authorization**: Uses OAuth 2.0 with PKCE for security
- **State Parameter**: Prevents CSRF attacks
- **Token Management**: Handles access and refresh tokens
- **Automatic Refresh**: Refreshes expired tokens automatically

#### User Experience
- **Connection Status**: Shows current connection state
- **Error Handling**: Clear error messages and recovery options
- **Loading States**: Visual feedback during OAuth process
- **Privacy Notice**: Transparent about data usage

#### Security
- **Token Storage**: Secure token storage (implement in production)
- **Token Revocation**: Proper cleanup when disconnecting
- **Scope Limitation**: Only requests necessary calendar permissions
- **HTTPS Required**: OAuth only works over HTTPS in production

### 🧪 Testing

#### Development Testing
1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test OAuth flow**:
   - Navigate to the page with GoogleCalendarOAuth component
   - Click "Connect Google Calendar"
   - Complete the OAuth flow
   - Verify connection status

3. **Test token refresh**:
   - Wait for token to expire (or manually expire it)
   - Click "Refresh Connection"
   - Verify new token is obtained

#### Production Testing
1. **Update redirect URIs** in Google Cloud Console
2. **Set production environment variables**
3. **Test OAuth flow** on production domain
4. **Verify HTTPS** is working correctly

### 🔒 Security Considerations

#### Production Checklist
- [ ] Use HTTPS in production
- [ ] Store tokens securely in database
- [ ] Implement proper token encryption
- [ ] Add rate limiting to OAuth endpoints
- [ ] Log OAuth events for monitoring
- [ ] Implement token rotation
- [ ] Add CSRF protection
- [ ] Validate all OAuth parameters

#### Token Storage
```typescript
// Example secure token storage
interface StoredTokens {
  userId: string
  accessToken: string // Encrypted
  refreshToken: string // Encrypted
  expiresAt: Date
  scope: string
  userEmail: string
}

// Store tokens securely
async function storeTokens(tokens: StoredTokens) {
  // Encrypt tokens before storing
  const encryptedTokens = {
    ...tokens,
    accessToken: encrypt(tokens.accessToken),
    refreshToken: encrypt(tokens.refreshToken)
  }
  
  // Store in secure database
  await database.tokens.create(encryptedTokens)
}
```

### 🚨 Troubleshooting

#### Common Issues

1. **"Invalid redirect URI"**:
   - Check redirect URIs in Google Cloud Console
   - Ensure exact match with your domain

2. **"Access blocked"**:
   - Verify OAuth consent screen is configured
   - Check if app is in testing mode

3. **"Token expired"**:
   - Implement token refresh logic
   - Check token expiration handling

4. **"Scope not granted"**:
   - Verify requested scopes in OAuth flow
   - Check user consent for calendar access

#### Debug Mode
Enable debug logging by adding to your environment:
```bash
DEBUG=google-calendar-oauth
```

### 🎉 You're All Set!

The Google Calendar OAuth integration provides:
- ✅ Complete OAuth 2.0 flow
- ✅ Secure token management
- ✅ User-friendly interface
- ✅ Error handling and recovery
- ✅ Token refresh capability
- ✅ Disconnect functionality
- ✅ Privacy and security compliance

Your users can now securely connect their Google Calendar and enjoy seamless integration with the Learning Path Optimization features!

# Authentication and Navigation Security

This document describes the authentication system and navigation security measures implemented in ScamShield Analyzer.

## Problem Addressed

The original issue was that authenticated users could:
1. Navigate back using browser back button without any warning
2. Navigate forward again to access protected content without re-authentication
3. Keep sessions active indefinitely with JWT tokens

## Solution Implemented

### 1. Navigation Guard Hook (`hooks/use-navigation-guard.ts`)

A custom hook that provides:
- **Browser navigation monitoring**: Detects back/forward button usage
- **Page visibility tracking**: Validates session when user returns to tab
- **Session validation**: Checks session validity on focus events
- **Warning dialogs**: Shows confirmation before leaving protected areas

**Key Features:**
```typescript
useNavigationGuard({
  enabled: true,
  message: "Custom warning message",
  onBeforeUnload: () => void,
  onSessionInvalid: () => void
})
```

### 2. Protected Page Wrapper (`components/protected-page-wrapper.tsx`)

A higher-order component that:
- Wraps protected pages with navigation security
- Handles authentication validation
- Provides loading states during session checks
- Redirects unauthenticated users

**Usage:**
```tsx
<ProtectedPageWrapper requireAuth={true} redirectTo="/auth/signin">
  <YourProtectedContent />
</ProtectedPageWrapper>
```

### 3. Session Configuration Improvements

Enhanced NextAuth configuration with:
- **Shorter session duration**: 1 hour maximum
- **Token refresh**: Every 15 minutes
- **JWT validation**: Timestamps for token expiry tracking

```typescript
session: {
  strategy: "jwt",
  maxAge: 60 * 60, // 1 hour
  updateAge: 15 * 60, // 15 minutes
}
```

### 4. Development Tools

**Session Monitor (`components/session-monitor.tsx`)**:
- Real-time session status display
- Navigation event logging
- Session validation counter

**Navigation Test (`components/navigation-test.tsx`)**:
- Test buttons for different navigation scenarios
- Expected behavior documentation
- Results tracking

## Security Features

### Browser Navigation Protection
- **Back Button**: Shows confirmation dialog when navigating back from protected pages
- **Forward Button**: Validates session when returning to protected content
- **Page Refresh**: Browser shows standard "leave page" confirmation

### Session Management
- **Automatic Expiry**: Sessions expire after 1 hour of inactivity
- **Token Refresh**: Tokens refresh every 15 minutes to maintain security
- **Visibility Validation**: Session checked when user returns to tab

### User Experience
- **Warning Messages**: Clear messaging about security implications
- **Graceful Redirects**: Automatic redirect to login with callback URL
- **Loading States**: Proper loading indicators during authentication

## Expected Behavior

When a user is on a protected page:

1. **Navigate Away (internal)**: Show warning dialog about leaving secure area
2. **Browser Back**: Show confirmation dialog, offer to stay or leave
3. **Page Refresh**: Browser shows "leave page" confirmation
4. **Tab Switch**: Session validated when returning to tab
5. **Session Expiry**: Automatic redirect to login page

## Implementation Notes

### Pages Protected
- `/dashboard` - Main application interface
- `/protected` - Test protected page
- Any route matching middleware patterns

### Pages Public
- `/` - Home page
- `/auth/signin` - Login page
- `/auth/signup` - Registration page
- `/auth/error` - Authentication error page

### Environment Variables Required
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Middleware Configuration
The middleware (`middleware.ts`) handles:
- Route protection based on path patterns
- JWT token validation
- Automatic redirects for unauthenticated users

## Testing the Implementation

1. **Login** to the application
2. **Navigate to dashboard** - should work normally
3. **Use browser back button** - should show confirmation dialog
4. **Switch tabs** and return - should validate session
5. **Try to refresh** - should show browser confirmation
6. **Wait for session expiry** - should redirect to login

### Development Mode Features

In development mode, you'll see:
- Session monitor in bottom-right corner
- Navigation test panel on dashboard
- Console logs for debugging

## Security Considerations

1. **JWT Security**: Tokens have timestamps and expiry validation
2. **HTTPS Required**: In production, ensure HTTPS for secure cookies
3. **CSRF Protection**: NextAuth provides built-in CSRF protection
4. **Session Storage**: Sessions stored securely in HTTP-only cookies

## Future Enhancements

Potential improvements:
1. **Rate Limiting**: Implement login attempt rate limiting
2. **Device Tracking**: Track and limit concurrent sessions
3. **Activity Logging**: Log user navigation and authentication events
4. **Two-Factor Auth**: Add 2FA for enhanced security
5. **Session Analytics**: Monitor session patterns for security insights

## Troubleshooting

### Common Issues

**Session not persisting:**
- Check NEXTAUTH_SECRET is set
- Verify cookie settings for your domain

**Navigation guard not working:**
- Ensure component is wrapped with ProtectedPageWrapper
- Check browser console for JavaScript errors

**Redirects not working:**
- Verify middleware configuration
- Check route patterns in middleware matcher

### Debug Tools

Use the development tools to debug:
- Session Monitor: Check session status and events
- Navigation Test: Test different navigation scenarios
- Browser DevTools: Check network requests and console logs

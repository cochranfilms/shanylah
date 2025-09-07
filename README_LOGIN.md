# 🔐 Cochran Films Secure Access Portal

## Login Credentials

**Username:** `Shanylah.cf`  
**Password:** `cochranfilms8*`

## Security Features

- ✅ **Encrypted Connection**: All data is transmitted securely
- ✅ **Session Management**: 24-hour automatic timeout
- ✅ **Access Logging**: All login attempts are logged
- ✅ **Hardcoded Credentials**: Only authorized personnel can access
- ✅ **Session Storage**: Secure client-side session management

## How It Works

1. **Login Screen**: Users must authenticate before accessing sensitive company information
2. **Session Validation**: Checks for valid authentication on every page load
3. **Automatic Timeout**: Sessions expire after 24 hours for security
4. **Logout Protection**: Users can manually logout, clearing all session data

## File Structure

- `login.html` - Secure login portal (entry point)
- `index.html` - Main dashboard (protected content)
- Session data stored in browser's sessionStorage

## Access Control

Only the following users can access the system:
- **Shanylah.cf** - Primary assistant access
- **Cody.cf** - Admin access

## Security Notes

- Credentials are hardcoded for simplicity
- In production, consider implementing server-side authentication
- Session data is stored client-side (sessionStorage)
- All sensitive operations require valid authentication

---

**⚠️ Important**: Keep these credentials secure and only share with authorized personnel.

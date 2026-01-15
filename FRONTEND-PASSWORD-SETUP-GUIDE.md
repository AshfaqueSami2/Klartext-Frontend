# Frontend Password Setup Guide

## Overview
The backend implements a password management system that differentiates between **manual signup users** and **Google OAuth users**.

---

## Login Response

Every login returns a `needsPasswordChange` flag:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "needsPasswordChange": true  // or false
}
```

### Logic:
- **Manual Email/Password Signup** → `needsPasswordChange: false` (already has password)
- **Google Sign-in** → `needsPasswordChange: true` (needs to set password)

---

## Frontend Implementation

### 1. Check After Login
```javascript
const response = await loginAPI(credentials);

if (response.needsPasswordChange === true) {
  // Show modal prompting user to set password
  showSetPasswordModal();
}
```

### 2. Modal Behavior
- **Google Users** (`needsPasswordChange: true`): 
  - Show modal on first login
  - Modal can be dismissible or forced (your choice)
  - Ask for: **New Password** only

- **Manual Users**: 
  - Don't show modal on login
  - Provide "Change Password" option in Profile/Settings
  - Ask for: **Current Password** + **New Password**

---

## API Endpoints

### Set Password (Google Users - First Time)
**Endpoint:** `POST /api/auth/set-password`

**Headers:**
```json
{
  "Authorization": "Bearer <accessToken>"
}
```

**Body:**
```json
{
  "newPassword": "SecurePassword123!"
}
```

**Use when:** `needsPasswordChange === true`

---

### Change Password (Existing Password Users)
**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```json
{
  "Authorization": "Bearer <accessToken>"
}
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456!"
}
```

**Use when:** User wants to update their existing password

---

## Example Flow

```javascript
// After successful login
if (loginResponse.needsPasswordChange) {
  // Google user - first time
  const modal = showModal({
    title: "Set Your Password",
    description: "Set a password to also login with email/password",
    fields: ["newPassword"],
    onSubmit: async (data) => {
      await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: data.newPassword })
      });
    }
  });
}

// In Profile/Settings page
function ChangePasswordForm() {
  return (
    <form onSubmit={handleChangePassword}>
      <input name="currentPassword" placeholder="Current Password" />
      <input name="newPassword" placeholder="New Password" />
      <button>Update Password</button>
    </form>
  );
}
```

---

## Success Response
Both endpoints return:
```json
{
  "message": "Password set/changed successfully!"
}
```

After success, update the user state to set `needsPasswordChange: false`.

---

## Error Handling
- **Wrong current password:** "Current password is incorrect"
- **Google user trying to change:** "You signed up with Google. Please use 'Set Password' instead."
- **Manual user trying to set:** "You signed up with email/password. Please use 'Change Password' instead."

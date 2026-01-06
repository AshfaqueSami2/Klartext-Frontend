# Profile Update Quick Reference

## 🎯 How to Use Profile Update Feature

### For End Users

#### Dashboard Profile (/dashboard/profile)
1. Click **"Edit Profile"** button
2. Update any field:
   - Click avatar to change profile picture
   - Edit name in text field
   - Edit bio in textarea
3. Click **"Save Changes"**
4. Wait for success notification

#### Admin Profile (/admin/profile)
Same process as Dashboard Profile

---

## 👨‍💻 For Developers

### Using the Profile Service

```typescript
import { 
  updateUserProfile, 
  validateProfileImage,
  createImagePreview 
} from '@/services/profile.service';

// Validate image before upload
const error = validateProfileImage(file);
if (error) {
  toast.error(error);
  return;
}

// Create preview
const preview = await createImagePreview(file);
setImagePreview(preview);

// Update profile
try {
  const updatedProfile = await updateUserProfile({
    name: 'New Name',
    bio: 'New bio',
    profileImage: file
  });
  toast.success('Profile updated!');
} catch (error) {
  toast.error('Update failed');
}
```

### Profile Update API

```typescript
// Endpoint
PUT /api/v1/users/update-profile

// Headers
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

// Body (FormData)
{
  name: string (optional)
  bio: string (optional)
  profileImage: File (optional)
}
```

### Image Validation Rules

```typescript
const VALIDATION = {
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize: 5 * 1024 * 1024, // 5MB
};
```

### TypeScript Types

```typescript
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  bio?: string;
  currentLevel?: string;
  totalCoins?: number;
  lessonsCompleted?: number;
  streak?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  profileImage?: File;
}
```

---

## 🔧 Customization

### Change Max Image Size

In [profile.service.ts](src/services/profile.service.ts):
```typescript
const maxSize = 10 * 1024 * 1024; // Change to 10MB
```

### Add More Image Types

In [profile.service.ts](src/services/profile.service.ts):
```typescript
const validTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif', // Add GIF support
  'image/svg+xml' // Add SVG support
];
```

### Customize Avatar Display

In ProfileClient.tsx or AdminProfileClient.tsx:
```tsx
{profile.profileImage || imagePreview ? (
  <img 
    src={imagePreview || profile.profileImage} 
    alt={profile.name}
    className="h-24 w-24 rounded-full object-cover border-4 border-blue-200" // Customize
  />
) : (
  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"> 
    {/* Custom gradient */}
    {profile.name?.[0]?.toUpperCase() || "U"}
  </div>
)}
```

---

## 🐛 Troubleshooting

### Image Not Uploading
1. Check file size < 5MB
2. Check file type (JPG, PNG, WEBP)
3. Check network tab for API errors
4. Verify JWT token is valid

### Profile Not Updating
1. Check console for errors
2. Verify backend endpoint is running
3. Check NEXT_PUBLIC_API_URL in .env
4. Verify user is authenticated

### Preview Not Showing
1. Check FileReader browser support
2. Verify file is selected
3. Check console for errors

---

## 📚 Related Files

- [ProfileClient.tsx](src/app/dashboard/profile/ProfileClient.tsx) - Dashboard profile
- [AdminProfileClient.tsx](src/app/admin/profile/AdminProfileClient.tsx) - Admin profile
- [profile.service.ts](src/services/profile.service.ts) - Profile utilities
- [axios.ts](src/lib/axios.ts) - API configuration

---

## 🎨 UI Components Used

- `Button` - Action buttons
- `Input` - Text input fields
- `Textarea` - Bio field
- `Label` - Form labels
- `Card` - Container components
- `Badge` - Role/level badges
- Icons from `lucide-react`

---

## ✅ Feature Checklist

- [x] Profile image upload
- [x] Image preview before upload
- [x] Image validation (type & size)
- [x] Bio field
- [x] Name editing
- [x] Loading states
- [x] Error handling
- [x] Success notifications
- [x] Works for email/password users
- [x] Works for OAuth users
- [x] Works for admin users
- [x] Responsive design
- [x] TypeScript types
- [x] Reusable service layer

---

**Quick Start:** Just click "Edit Profile" → Make changes → Click "Save Changes" 🎉

# Profile Update Flow Diagram

## 📊 Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │  Dashboard Profile   │      │    Admin Profile     │       │
│  │   ProfileClient.tsx  │      │AdminProfileClient.tsx│       │
│  └──────────┬───────────┘      └──────────┬───────────┘       │
│             │                               │                   │
│             │  Uses                         │  Uses             │
│             ▼                               ▼                   │
│  ┌──────────────────────────────────────────────────┐         │
│  │          Profile Service Layer                    │         │
│  │           profile.service.ts                      │         │
│  │  ┌─────────────────────────────────────────┐    │         │
│  │  │ • validateProfileImage()                 │    │         │
│  │  │ • fetchUserProfile()                     │    │         │
│  │  │ • updateUserProfile()                    │    │         │
│  │  │ • createImagePreview()                   │    │         │
│  │  └─────────────────────────────────────────┘    │         │
│  └──────────┬───────────────────────────────────────┘         │
│             │                                                   │
│             │  Uses                                             │
│             ▼                                                   │
│  ┌──────────────────────────────────────────────────┐         │
│  │         Axios HTTP Client (axios.ts)             │         │
│  │  ┌─────────────────────────────────────────┐    │         │
│  │  │ • Request Interceptor (adds JWT)        │    │         │
│  │  │ • Response Interceptor (handles 401)    │    │         │
│  │  │ • FormData handler (removes Content-Type)│   │         │
│  │  │ • Token refresh logic                    │    │         │
│  │  └─────────────────────────────────────────┘    │         │
│  └──────────┬───────────────────────────────────────┘         │
└─────────────┼───────────────────────────────────────────────────┘
              │
              │  HTTP Request
              │  PUT /api/v1/users/update-profile
              │  FormData: {name, bio, profileImage}
              │  Headers: Authorization: Bearer <token>
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                │
│                  (Express + MongoDB)                            │
│                                                                 │
│  Endpoint: PUT /api/v1/users/update-profile                   │
│  • Validates JWT token                                         │
│  • Processes multipart/form-data                              │
│  • Uploads image to Cloudinary                                │
│  • Updates User collection                                     │
│  • Updates Student/Admin collection                            │
│  • Returns updated profile                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 User Interaction Flow

```
┌──────────────┐
│ User clicks  │
│"Edit Profile"│
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Edit mode activated  │
│ • Name field editable│
│ • Bio field editable │
│ • Avatar clickable   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User selects image   │
│ (optional)           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Validation runs      │
│ • Check file type    │
│ • Check file size    │
└──────┬───────────────┘
       │
       │ Valid ✓
       ▼
┌──────────────────────┐
│ Preview generated    │
│ using FileReader     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User clicks          │
│ "Save Changes"       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ FormData created     │
│ • name               │
│ • bio                │
│ • profileImage       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ API request sent     │
│ Loading spinner shows│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Backend processes    │
│ • Uploads to         │
│   Cloudinary         │
│ • Updates DB         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response received    │
└──────┬───────────────┘
       │
       ├─── Success ────►┌──────────────────┐
       │                 │ • Update UI      │
       │                 │ • Show toast     │
       │                 │ • Exit edit mode │
       │                 └──────────────────┘
       │
       └─── Error ──────►┌──────────────────┐
                         │ • Show error msg │
                         │ • Stay in edit   │
                         └──────────────────┘
```

## 🎯 Component Structure

```
ProfileClient.tsx / AdminProfileClient.tsx
│
├── State Management
│   ├── profile: UserProfile | null
│   ├── loading: boolean
│   ├── editing: boolean
│   ├── updateLoading: boolean
│   ├── name: string
│   ├── bio: string
│   ├── selectedImage: File | null
│   ├── imagePreview: string | null
│   └── fileInputRef: RefObject
│
├── Functions
│   ├── fetchProfile()
│   ├── handleImageChange(e)
│   ├── handleRemoveImage()
│   └── handleUpdateProfile()
│
└── UI Components
    ├── Avatar (with hover effect)
    ├── Image Upload Button
    ├── Name Input
    ├── Email Display (read-only)
    ├── Bio Textarea
    ├── Role/Level Badges
    ├── Stats Cards (Dashboard only)
    └── Action Buttons
        ├── Edit Profile
        ├── Save Changes
        └── Cancel
```

## 📦 Data Flow

```
┌─────────────┐
│   Browser   │
│             │
│  User       │
│  selects    │
│  image      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  FileReader     │ ──► Creates Base64 preview
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  State Update   │
│  imagePreview   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Display        │
│  Preview        │
└─────────────────┘

When saving:

┌─────────────┐
│  FormData   │
│             │
│  Append:    │
│  • name     │
│  • bio      │
│  • File     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Axios          │
│  PUT request    │
│  multipart/form │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Backend        │
│  Cloudinary     │
│  MongoDB        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Response       │
│  Updated profile│
│  with new image │
│  URL            │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  State Update   │
│  Display new    │
│  profile        │
└─────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────────┐
│ User Profile │
│   Request    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Axios Interceptor│
│ Adds JWT token   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Backend validates│
│ JWT token        │
└──────┬───────────┘
       │
       ├─── Valid ────►┌──────────────┐
       │                │ Process      │
       │                │ request      │
       │                └──────────────┘
       │
       └─── Invalid ───►┌──────────────┐
                         │ Return 401   │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Axios tries  │
                         │ token refresh│
                         └──────┬───────┘
                                │
                                ├─── Success ──►┌───────────┐
                                │                │ Retry     │
                                │                │ request   │
                                │                └───────────┘
                                │
                                └─── Fail ──────►┌───────────┐
                                                 │ Redirect  │
                                                 │ to login  │
                                                 └───────────┘
```

## 🎨 UI States

```
┌─────────────────────────────────────────┐
│          VIEW MODE (Default)            │
│                                         │
│  ┌───────┐                              │
│  │ Avatar│  Name                        │
│  │       │  Email                       │
│  └───────┘  Bio                         │
│                                         │
│  [Edit Profile]                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          EDIT MODE                       │
│                                         │
│  ┌───────┐                              │
│  │ 📷    │  [Choose Image] [Remove]     │
│  │Avatar │                              │
│  └───────┘  Supported: JPG, PNG, WEBP   │
│                                         │
│  [Name Input Field]                     │
│  Email (read-only)                      │
│  [Bio Textarea]                         │
│                                         │
│  [💾 Save Changes] [Cancel]             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        LOADING STATE                     │
│                                         │
│  ┌───────┐                              │
│  │ Avatar│  Name                        │
│  └───────┘  Email                       │
│             Bio                         │
│                                         │
│  [🔄 Updating...] (disabled)            │
└─────────────────────────────────────────┘
```

---

**This diagram shows the complete implementation architecture from UI to backend integration.**

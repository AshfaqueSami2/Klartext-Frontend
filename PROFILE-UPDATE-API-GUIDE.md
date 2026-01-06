# Profile Update API Guide

## Overview
Your backend now fully supports profile image updates for **both email/password users and Google OAuth users**. Any authenticated user can update their profile manually from the frontend.

---

## 🔐 Authentication Required
All profile update requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📍 API Endpoint

### **PUT** `/api/v1/users/update-profile`

**Description:** Update authenticated user's profile (name, bio, profile image)

**Authentication:** Required (ADMIN or STUDENT role)

**Content-Type:** `multipart/form-data`

---

## 📤 Request Examples

### **Example 1: Update Profile Image Only**

```javascript
const formData = new FormData();
formData.append('profileImage', imageFile); // File object from input[type="file"]

const response = await fetch('http://localhost:5000/api/v1/users/update-profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

### **Example 2: Update Name and Profile Image**

```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('profileImage', imageFile);

const response = await fetch('http://localhost:5000/api/v1/users/update-profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### **Example 3: Update Name Only (No Image)**

```javascript
const formData = new FormData();
formData.append('name', 'Jane Smith');

const response = await fetch('http://localhost:5000/api/v1/users/update-profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### **Example 4: Update Bio**

```javascript
const formData = new FormData();
formData.append('bio', 'Passionate German language learner 🇩🇪');

const response = await fetch('http://localhost:5000/api/v1/users/update-profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

---

## ✅ Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "_id": "676c1234abcd5678ef901234",
    "user": {
      "_id": "676c1234abcd5678ef901235",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "profileImage": "https://cloudinary.com/...",
      "googleId": "123456789" // Only present for Google OAuth users
    },
    "id": "S-2026-0001",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://cloudinary.com/...",
    "currentLevel": "B1",
    "coins": 150,
    "bio": "Passionate German language learner 🇩🇪",
    "createdAt": "2026-01-05T10:30:00.000Z",
    "updatedAt": "2026-01-05T14:45:00.000Z"
  }
}
```

---

## ❌ Error Responses

### Unauthorized (No Token)
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### Image Upload Failed
```json
{
  "success": false,
  "message": "Failed to upload profile image"
}
```

---

## 🖼️ Image Upload Requirements

- **Supported Formats:** JPG, JPEG, PNG, WEBP
- **Max File Size:** 5MB (recommended)
- **Storage:** Cloudinary (automatic optimization)
- **Field Name:** `profileImage`

---

## 🎯 Use Cases

### ✅ Works for Both Authentication Methods:

1. **Email/Password Users:**
   - Can update profile image anytime
   - Can update name and bio
   
2. **Google OAuth Users:**
   - Can override their Google profile image
   - Can update name independently from Google account
   - Can add/update bio

---

## 🔄 Frontend Integration Example (React)

```jsx
import { useState } from 'react';

function ProfileUpdateForm() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (image) formData.append('profileImage', image);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/v1/users/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Profile updated successfully!');
        // Update UI with result.data
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <label>Profile Image:</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

---

## 🚀 Testing with Postman

1. **Set Authorization:**
   - Type: Bearer Token
   - Token: `<your-jwt-token>`

2. **Set Body:**
   - Type: `form-data`
   - Add fields:
     - `name` (Text): "John Doe"
     - `profileImage` (File): Select image file
     - `bio` (Text): "Your bio here"

3. **Send Request:**
   - Method: PUT
   - URL: `http://localhost:5000/api/v1/users/update-profile`

---

## 📝 Notes

- ✅ Works for both **email/password** and **Google OAuth** users
- ✅ Profile images are uploaded to **Cloudinary**
- ✅ Updates are **atomic** (using MongoDB transactions)
- ✅ Both **User** and **Student/Admin** collections are updated
- ✅ Old profile images remain in Cloudinary (consider cleanup strategy)
- ⚠️ Frontend should validate image size/type before upload
- ⚠️ Consider adding rate limiting for profile updates

---

## 🎉 Summary

Your backend is **fully compatible** with profile image updates for users who logged in via:
- ✅ Email/Password authentication
- ✅ Google OAuth authentication

Users can manually update their profile image from the frontend using the **`PUT /api/v1/users/update-profile`** endpoint! 🚀

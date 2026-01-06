import api from '@/lib/axios';

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  profileImage?: File;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  currentLevel?: string;
  totalCoins?: number;
  lessonsCompleted?: number;
  streak?: number;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  bio?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Validates an image file for profile upload
 * @param file - The file to validate
 * @returns Error message if invalid, null if valid
 */
export const validateProfileImage = (file: File): string | null => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Please select a valid image file (JPG, PNG, or WEBP)';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
};

/**
 * Fetches the current user's profile
 * @returns Promise with user profile data
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<ApiResponse<UserProfile>>('/user/me');
  return response.data.data;
};

/**
 * Updates the user's profile with optional fields
 * @param data - The profile data to update (name, bio, profileImage)
 * @returns Promise with updated user profile data
 */
export const updateUserProfile = async (data: ProfileUpdateData): Promise<UserProfile> => {
  const formData = new FormData();

  if (data.name) {
    formData.append('name', data.name);
  }

  if (data.bio) {
    formData.append('bio', data.bio);
  }

  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }

  const response = await api.put<ApiResponse<UserProfile>>(
    '/user/update-profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
};

/**
 * Creates a preview URL for an image file
 * @param file - The image file to preview
 * @returns Promise with the preview URL
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

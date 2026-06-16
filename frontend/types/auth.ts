export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type RegisterResponse = UserProfile;

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

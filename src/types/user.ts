export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  error: string | null;
  // add any other user fields you need
}
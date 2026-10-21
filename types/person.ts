export interface Person {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  initials: string;
  color: string;
  online?: boolean;
}

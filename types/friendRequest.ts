import type { Person } from "./Person";

export interface FriendRequest {
  person: Person;
  id: string;
  time: string;
}

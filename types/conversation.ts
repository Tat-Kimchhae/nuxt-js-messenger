export interface Conversation { 
    id: string; 
    title: string; 
    kind: 'direct' | 'group'; 
    members: Person[]; 
    preview: string; 
    time: string; 
    unread: number; 
    accent: string 
};

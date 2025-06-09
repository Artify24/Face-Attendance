export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    branch: string;
    avatar?: string; // Optional avatar URL
    markedAt: string; // ISO date string when the student was marked present
}
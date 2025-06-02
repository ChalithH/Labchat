export type DiscussionType = {
    id: number;
    labId: number;
    name: string;
    description?: string;
    _count?: {
        posts: number;
    };
}; 
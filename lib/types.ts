export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id">;
        Update: Partial<Omit<Category, "id">>;
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, "id" | "created_at">;
        Update: Partial<Omit<Listing, "id" | "created_at">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at">;
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  banned: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  city: string | null;
  photos: string[] | null;
  status: "active" | "sold" | "deleted";
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Extended types with joins
export interface ListingWithDetails extends Listing {
  categories: Category | null;
  profiles: Pick<Profile, "id" | "name" | "city"> | null;
}

export interface ConversationWithDetails extends Conversation {
  listings: Pick<Listing, "id" | "title" | "photos"> | null;
  buyer: Pick<Profile, "id" | "name"> | null;
  seller: Pick<Profile, "id" | "name"> | null;
  last_message?: Message | null;
}

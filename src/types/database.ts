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
      shows: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          cover_image_url: string | null;
          original_url: string | null;
          rss_feed_url: string | null;
          hosting_provided_by: string | null;
          show_categories: string[] | null;
          tags: string[] | null; // New field
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          cover_image_url?: string | null;
          original_url?: string | null;
          rss_feed_url?: string | null;
          hosting_provided_by?: string | null;
          show_categories?: string[] | null;
          tags?: string[] | null; // New field
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          cover_image_url?: string | null;
          original_url?: string | null;
          rss_feed_url?: string | null;
          hosting_provided_by?: string | null;
          show_categories?: string[] | null;
          tags?: string[] | null; // New field
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      hosts: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      show_hosts: {
        Row: {
          show_id: string;
          host_id: string;
          role: string;
        };
        Insert: {
          show_id: string;
          host_id: string;
          role?: string;
        };
        Update: {
          show_id?: string;
          host_id?: string;
          role?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          show_id: string;
          title: string;
          slug: string;
          description: string | null;
          published_at: string | null;
          original_url: string;
          ai_summary: string | null;
          ai_sponsorship: string | null;
          duration_seconds: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          episode_id: string | null;
          audio_file_url: string | null;
          srt_file_url: string | null;
          reflection: string | null;
          processed_at: string | null;
          transcript: string | null;
          show_slug: string | null;
        };
        Insert: {
          id?: string;
          show_id: string;
          title: string;
          slug: string;
          description?: string | null;
          published_at?: string | null;
          original_url: string;
          ai_summary?: string | null;
          ai_sponsorship?: string | null;
          duration_seconds?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          episode_id?: string | null;
          audio_file_url?: string | null;
          srt_file_url?: string | null;
          reflection?: string | null;
          processed_at?: string | null;
          transcript?: string | null;
          show_slug?: string | null;
        };
        Update: {
          id?: string;
          show_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          published_at?: string | null;
          original_url?: string;
          ai_summary?: string | null;
          ai_sponsorship?: string | null;
          duration_seconds?: number | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          episode_id?: string | null;
          audio_file_url?: string | null;
          srt_file_url?: string | null;
          reflection?: string | null;
          processed_at?: string | null;
          transcript?: string | null;
          show_slug?: string | null;
        };
      };

      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      episode_tags: {
        Row: {
          episode_id: string;
          tag_id: string;
        };
        Insert: {
          episode_id: string;
          tag_id: string;
        };
        Update: {
          episode_id?: string;
          tag_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          episode_id: string;
          user_id: string;
          content: string;
          status: "pending" | "approved" | "hidden" | "spam";
          spam_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          episode_id: string;
          user_id: string;
          content: string;
          status?: "pending" | "approved" | "hidden" | "spam";
          spam_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          episode_id?: string;
          user_id?: string;
          content?: string;
          status?: "pending" | "approved" | "hidden" | "spam";
          spam_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      library_items: {
        Row: {
          id: string;
          user_id: string;
          show_id: string;
          position: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          show_id: string;
          position?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          show_id?: string;
          position?: number;
          added_at?: string;
        };
      };
      affiliate_contents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          target_url: string;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          target_url: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          target_url?: string;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      episode_affiliates: {
        Row: {
          episode_id: string;
          affiliate_id: string;
          position: number;
        };
        Insert: {
          episode_id: string;
          affiliate_id: string;
          position?: number;
        };
        Update: {
          episode_id?: string;
          affiliate_id?: string;
          position?: number;
        };
      };
      episode_library_items: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          episode_id: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          episode_id?: string;
          added_at?: string;
        };
      };
      affiliate_clicks: {
        Row: {
          id: string;
          affiliate_id: string;
          episode_id: string | null;
          user_id: string | null;
          clicked_at: string;
          user_agent: string | null;
          referer: string | null;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          episode_id?: string | null;
          user_id?: string | null;
          clicked_at?: string;
          user_agent?: string | null;
          referer?: string | null;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          episode_id?: string | null;
          user_id?: string | null;
          clicked_at?: string;
          user_agent?: string | null;
          referer?: string | null;
        };
      };
    };
  };
}

// Convenience type aliases
export type Show = Database["public"]["Tables"]["shows"]["Row"];
export type Host = Database["public"]["Tables"]["hosts"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type LibraryItem = Database["public"]["Tables"]["library_items"]["Row"];
export type AffiliateContent = Database["public"]["Tables"]["affiliate_contents"]["Row"];
export type EpisodeLibraryItem = Database["public"]["Tables"]["episode_library_items"]["Row"];
export type EpisodeLibraryItemWithEpisode = EpisodeLibraryItem & {
  episode: Episode & { show: Pick<Show, "name" | "slug" | "cover_image_url"> };
};

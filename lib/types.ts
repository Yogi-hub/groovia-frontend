// Shared TypeScript types for app data shapes returned by the backend / Supabase.

export interface Mentor {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  expertise_country_codes: string[];
  expertise_categories: string[];
  languages: string[];
  professional_domains: string[];
  years_lived_experience: number | null;
  booking_url: string | null;
  session_duration_minutes?: number;
  /** True when the mentor has a live Nylas calendar connection. Never contains the grant_id itself. */
  has_calendar?: boolean;
}

export interface AvailabilitySlot {
  start_time: number;
  end_time: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

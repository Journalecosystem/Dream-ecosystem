export type CaptureMethod = "text" | "voice" | "handwritten";

export type Dream = {
  id: string;
  user_id: string;
  title: string | null;
  narrative: string;
  dream_date: string;
  capture_method: CaptureMethod;
  emotional_state: string | null;
  clarity_level: number | null;
  confidence_in_memory: number | null;
  dream_type: string | null;
  created_at: string;
  updated_at: string;
};

export type DreamExamination = {
  id: string;
  dream_id: string;
  sleep_preparation: string[] | null;
  last_engagement: string[] | null;
  sleep_quality: number | null;
  was_recurring: boolean;
  was_interrupted: boolean;
  waking_emotional_state: string | null;
  created_at: string;
};

export type DreamPerson = {
  id: string;
  dream_id: string;
  name: string | null;
  known_person: boolean | null;
  relationship_to_dreamer: string | null;
  personal_significance: string | null;
  appeared_before: boolean;
};

export type DreamSymbol = {
  id: string;
  dream_id: string;
  category: string | null;
  value: string;
  notes: string | null;
};

export type DreamProcessing = {
  id: string;
  dream_id: string;
  unique_impressions: string | null;
  scriptures_that_come_to_mind: string | null;
  personal_experiences_connected: string | null;
  current_circumstances_relevant: string | null;
  follow_up_actions: string[] | null;
};

export type Database = {
  public: {
    Tables: {
      dreams: {
        Row: Dream;
        Insert: Partial<Dream> &
          Pick<Dream, "narrative" | "dream_date" | "user_id">;
        Update: Partial<Dream>;
      };
      dream_examinations: {
        Row: DreamExamination;
        Insert: Partial<DreamExamination> &
          Pick<DreamExamination, "dream_id">;
        Update: Partial<DreamExamination>;
      };
      dream_people: {
        Row: DreamPerson;
        Insert: Partial<DreamPerson> & Pick<DreamPerson, "dream_id">;
        Update: Partial<DreamPerson>;
      };
      dream_symbols: {
        Row: DreamSymbol;
        Insert: Partial<DreamSymbol> &
          Pick<DreamSymbol, "dream_id" | "value">;
        Update: Partial<DreamSymbol>;
      };
      dream_processing: {
        Row: DreamProcessing;
        Insert: Partial<DreamProcessing> & Pick<DreamProcessing, "dream_id">;
        Update: Partial<DreamProcessing>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

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

export type DreamInterpretation = {
  id: string;
  dream_id: string;
  version: number;
  possible_meaning: string | null;
  confidence_level: number | null;
  evidence_for: string | null;
  evidence_against: string | null;
  unresolved_questions: string | null;
  created_at: string;
};

export type PersonalSymbolMeaning = {
  id: string;
  user_id: string;
  symbol: string;
  personal_meaning: string | null;
  updated_at: string;
};

export type SourceTestingResponse = {
  id: string;
  interpretation_id: string;
  christ_alignment: string | null;
  scriptural_alignment: string | null;
  character_alignment: string | null;
  fruit: string | null;
  peace_and_wisdom: string | null;
  evidence: string | null;
  personal_context: string | null;
  repetition: string | null;
  confirmation: string | null;
  timing: string | null;
  outcome: string | null;
  created_at: string;
};

export type FulfillmentStatus =
  | "possible_confirmation"
  | "possible_fulfillment"
  | "confirmed"
  | "unfulfilled";

export type FulfillmentRecord = {
  id: string;
  dream_id: string;
  interpretation_id: string | null;
  event_description: string | null;
  event_date: string | null;
  correspondence_notes: string | null;
  status: FulfillmentStatus | null;
  created_at: string;
};

export type Testimony = {
  id: string;
  user_id: string;
  dream_id: string;
  interpretation_id: string | null;
  fulfillment_id: string | null;
  summary: string | null;
  similarities: string | null;
  differences: string | null;
  lessons_learned: string | null;
  is_private: boolean;
  share_token: string;
  created_at: string;
};

export type VaultCategory =
  | "biblical_dream_library"
  | "symbol_library"
  | "interpretation_framework"
  | "case_studies"
  | "scripture_library"
  | "prayer_resources"
  | "teaching_library";

export type VaultContent = {
  id: string;
  category: VaultCategory;
  title: string;
  body: string;
  scripture_references: string[] | null;
  published: boolean;
  created_at: string;
};

export type Circle = {
  id: string;
  title: string;
  description: string | null;
  facilitator_id: string | null;
  guidelines_version: number;
  created_at: string;
};

export type CircleMembership = {
  id: string;
  circle_id: string;
  user_id: string;
  guidelines_accepted_version: number | null;
  joined_at: string;
};

export type SharedDream = {
  id: string;
  circle_id: string;
  dream_id: string;
  shared_by: string;
  shared_at: string;
};

export type CircleResponse = {
  id: string;
  shared_dream_id: string;
  responder_id: string;
  response_type: "question" | "observation";
  body: string;
  created_at: string;
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
      dream_interpretations: {
        Row: DreamInterpretation;
        Insert: Partial<DreamInterpretation> &
          Pick<DreamInterpretation, "dream_id">;
        Update: Partial<DreamInterpretation>;
      };
      personal_symbol_meanings: {
        Row: PersonalSymbolMeaning;
        Insert: Partial<PersonalSymbolMeaning> &
          Pick<PersonalSymbolMeaning, "user_id" | "symbol">;
        Update: Partial<PersonalSymbolMeaning>;
      };
      source_testing_responses: {
        Row: SourceTestingResponse;
        Insert: Partial<SourceTestingResponse> &
          Pick<SourceTestingResponse, "interpretation_id">;
        Update: Partial<SourceTestingResponse>;
      };
      fulfillment_records: {
        Row: FulfillmentRecord;
        Insert: Partial<FulfillmentRecord> & Pick<FulfillmentRecord, "dream_id">;
        Update: Partial<FulfillmentRecord>;
      };
      testimonies: {
        Row: Testimony;
        Insert: Partial<Testimony> & Pick<Testimony, "user_id" | "dream_id">;
        Update: Partial<Testimony>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

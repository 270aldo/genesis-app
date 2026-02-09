export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type BaseTable<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Array<{
    foreignKeyName: string;
    columns: string[];
    referencedRelation: string;
    referencedColumns: string[];
  }>;
};

export type Database = {
  public: {
    Tables: {
      profiles: BaseTable<
        {
          id: string;
          full_name: string | null;
          age: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          goal: 'strength' | 'endurance' | 'aesthetics' | 'longevity' | null;
          experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          goal?: 'strength' | 'endurance' | 'aesthetics' | 'longevity' | null;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          full_name?: string | null;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          goal?: 'strength' | 'endurance' | 'aesthetics' | 'longevity' | null;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          timezone?: string | null;
          updated_at?: string;
        }
      >;
      coach_assignments: BaseTable<
        {
          id: string;
          coach_id: string;
          user_id: string;
          status: 'active' | 'paused' | 'ended';
          mode: 'hybrid' | 'ascend';
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          coach_id: string;
          user_id: string;
          status?: 'active' | 'paused' | 'ended';
          mode?: 'hybrid' | 'ascend';
          created_at?: string;
          updated_at?: string;
        },
        {
          status?: 'active' | 'paused' | 'ended';
          mode?: 'hybrid' | 'ascend';
          updated_at?: string;
        }
      >;
      seasons: BaseTable<
        {
          id: string;
          user_id: string;
          name: string;
          goal: 'build' | 'cut' | 'maintain' | 'peak';
          start_date: string;
          end_date: string;
          status: 'planned' | 'active' | 'completed';
          created_by: 'coach' | 'ai' | 'hybrid';
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          name: string;
          goal: 'build' | 'cut' | 'maintain' | 'peak';
          start_date: string;
          end_date: string;
          status?: 'planned' | 'active' | 'completed';
          created_by?: 'coach' | 'ai' | 'hybrid';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          name?: string;
          goal?: 'build' | 'cut' | 'maintain' | 'peak';
          start_date?: string;
          end_date?: string;
          status?: 'planned' | 'active' | 'completed';
          created_by?: 'coach' | 'ai' | 'hybrid';
          notes?: string | null;
          updated_at?: string;
        }
      >;
      phases: BaseTable<
        {
          id: string;
          season_id: string;
          name: string;
          focus: 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload';
          order_index: number;
          start_date: string;
          end_date: string;
          created_at: string;
        },
        {
          id?: string;
          season_id: string;
          name: string;
          focus: 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload';
          order_index: number;
          start_date: string;
          end_date: string;
          created_at?: string;
        },
        {
          name?: string;
          focus?: 'hypertrophy' | 'strength' | 'power' | 'endurance' | 'deload';
          order_index?: number;
          start_date?: string;
          end_date?: string;
        }
      >;
      weeks: BaseTable<
        {
          id: string;
          phase_id: string;
          week_number: number;
          focus: string;
          deload: boolean;
          created_at: string;
        },
        {
          id?: string;
          phase_id: string;
          week_number: number;
          focus: string;
          deload?: boolean;
          created_at?: string;
        },
        {
          week_number?: number;
          focus?: string;
          deload?: boolean;
        }
      >;
      sessions: BaseTable<
        {
          id: string;
          week_id: string;
          user_id: string;
          type: 'strength' | 'cardio' | 'mobility' | 'recovery';
          scheduled_date: string;
          completed_at: string | null;
          source: 'ai' | 'coach' | 'user';
          rating: number | null;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          week_id: string;
          user_id: string;
          type: 'strength' | 'cardio' | 'mobility' | 'recovery';
          scheduled_date: string;
          completed_at?: string | null;
          source?: 'ai' | 'coach' | 'user';
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
        },
        {
          type?: 'strength' | 'cardio' | 'mobility' | 'recovery';
          scheduled_date?: string;
          completed_at?: string | null;
          source?: 'ai' | 'coach' | 'user';
          rating?: number | null;
          notes?: string | null;
        }
      >;
      exercises: BaseTable<
        {
          id: string;
          name: string;
          category: 'compound' | 'isolation' | 'cardio' | 'mobility' | 'plyometric';
          muscle_groups: string[];
          equipment: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          video_url: string | null;
          instructions: string;
          cues: string[];
          created_at: string;
        },
        {
          id?: string;
          name: string;
          category: 'compound' | 'isolation' | 'cardio' | 'mobility' | 'plyometric';
          muscle_groups: string[];
          equipment: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          video_url?: string | null;
          instructions: string;
          cues: string[];
          created_at?: string;
        },
        {
          name?: string;
          category?: 'compound' | 'isolation' | 'cardio' | 'mobility' | 'plyometric';
          muscle_groups?: string[];
          equipment?: string[];
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          video_url?: string | null;
          instructions?: string;
          cues?: string[];
        }
      >;
      exercise_logs: BaseTable<
        {
          id: string;
          session_id: string;
          exercise_id: string;
          sets: Json;
          rpe: number;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          session_id: string;
          exercise_id: string;
          sets: Json;
          rpe: number;
          notes?: string | null;
          created_at?: string;
        },
        {
          sets?: Json;
          rpe?: number;
          notes?: string | null;
        }
      >;
      conversations: BaseTable<
        {
          id: string;
          user_id: string;
          agent_id: 'genesis' | 'train' | 'fuel' | 'mind' | 'track' | 'vision' | 'coach_bridge';
          messages: Json;
          session_context: Json | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          agent_id: 'genesis' | 'train' | 'fuel' | 'mind' | 'track' | 'vision' | 'coach_bridge';
          messages: Json;
          session_context?: Json | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          messages?: Json;
          session_context?: Json | null;
          updated_at?: string;
        }
      >;
      check_ins: BaseTable<
        {
          id: string;
          user_id: string;
          date: string;
          sleep_hours: number;
          sleep_quality: number;
          energy: number;
          mood: number;
          stress: number;
          soreness: number;
          nutrition_quality: number | null;
          hydration: number | null;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          date: string;
          sleep_hours: number;
          sleep_quality: number;
          energy: number;
          mood: number;
          stress: number;
          soreness: number;
          nutrition_quality?: number | null;
          hydration?: number | null;
          notes?: string | null;
          created_at?: string;
        },
        {
          sleep_hours?: number;
          sleep_quality?: number;
          energy?: number;
          mood?: number;
          stress?: number;
          soreness?: number;
          nutrition_quality?: number | null;
          hydration?: number | null;
          notes?: string | null;
        }
      >;
      meals: BaseTable<
        {
          id: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_items: Json;
          total_macros: Json;
          logged_at: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_items: Json;
          total_macros: Json;
          logged_at?: string;
          created_at?: string;
        },
        {
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_items?: Json;
          total_macros?: Json;
          logged_at?: string;
        }
      >;
      widget_states: BaseTable<
        {
          id: string;
          user_id: string;
          widget_type: string;
          widget_data: Json;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          widget_type: string;
          widget_data: Json;
          updated_at?: string;
        },
        {
          widget_type?: string;
          widget_data?: Json;
          updated_at?: string;
        }
      >;
      biomarkers: BaseTable<
        {
          id: string;
          user_id: string;
          date: string;
          type: 'weight' | 'body_fat' | 'hrv' | 'resting_hr' | 'blood_pressure' | 'vo2max';
          value: number;
          unit: string;
          source: 'manual' | 'wearable';
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          date: string;
          type: 'weight' | 'body_fat' | 'hrv' | 'resting_hr' | 'blood_pressure' | 'vo2max';
          value: number;
          unit: string;
          source: 'manual' | 'wearable';
          created_at?: string;
        },
        {
          value?: number;
          unit?: string;
          source?: 'manual' | 'wearable';
        }
      >;
      personal_records: BaseTable<
        {
          id: string;
          user_id: string;
          exercise_id: string;
          type: 'weight' | 'reps' | 'time' | 'distance';
          value: number;
          achieved_at: string;
          session_id: string | null;
          previous_value: number | null;
        },
        {
          id?: string;
          user_id: string;
          exercise_id: string;
          type: 'weight' | 'reps' | 'time' | 'distance';
          value: number;
          achieved_at?: string;
          session_id?: string | null;
          previous_value?: number | null;
        },
        {
          value?: number;
          achieved_at?: string;
          session_id?: string | null;
          previous_value?: number | null;
        }
      >;
      weekly_plans: BaseTable<
        {
          id: string;
          phase_id: string;
          day_of_week: number;
          name: string;
          muscle_groups: string[];
          exercises: Json;
          estimated_duration: number;
          created_at: string;
        },
        {
          id?: string;
          phase_id: string;
          day_of_week: number;
          name: string;
          muscle_groups: string[];
          exercises: Json;
          estimated_duration?: number;
          created_at?: string;
        },
        {
          day_of_week?: number;
          name?: string;
          muscle_groups?: string[];
          exercises?: Json;
          estimated_duration?: number;
        }
      >;
      water_logs: BaseTable<
        {
          id: string;
          user_id: string;
          date: string;
          glasses: number;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          date: string;
          glasses?: number;
          created_at?: string;
        },
        {
          glasses?: number;
        }
      >;
      education_content: BaseTable<
        {
          id: string;
          title: string;
          subtitle: string | null;
          category: 'training' | 'nutrition' | 'recovery' | 'mindset';
          body_md: string;
          image_url: string | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration_min: number;
          phase_tags: string[];
          created_at: string;
        },
        {
          id?: string;
          title: string;
          subtitle?: string | null;
          category: 'training' | 'nutrition' | 'recovery' | 'mindset';
          body_md?: string;
          image_url?: string | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          duration_min?: number;
          phase_tags?: string[];
          created_at?: string;
        },
        {
          title?: string;
          subtitle?: string | null;
          category?: 'training' | 'nutrition' | 'recovery' | 'mindset';
          body_md?: string;
          image_url?: string | null;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          duration_min?: number;
          phase_tags?: string[];
        }
      >;
      notification_settings: BaseTable<
        {
          id: string;
          user_id: string;
          channel: 'push' | 'email' | 'sms';
          category: 'training' | 'nutrition' | 'check_in' | 'coach' | 'system';
          enabled: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          channel: 'push' | 'email' | 'sms';
          category: 'training' | 'nutrition' | 'check_in' | 'coach' | 'system';
          enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          updated_at?: string;
        },
        {
          enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          updated_at?: string;
        }
      >;
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

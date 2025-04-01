export interface Module {
  id: string                // UUID, primary key
  title: string             // text, not null
  course_id: string         // text, not null
  order: number             // integer, not null
  type: string              // text, not null (default: 'mixed')
  description: string | null  // text, nullable
  created_at: string        // timestamp with time zone, not null
  updated_at: string        
  }
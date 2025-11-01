export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          student_id: string
          department: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          student_id: string
          department?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          student_id?: string
          department?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          owner_id: string
          title: string
          author: string
          isbn: string | null
          description: string | null
          condition: string
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          author: string
          isbn?: string | null
          description?: string | null
          condition?: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          author?: string
          isbn?: string | null
          description?: string | null
          condition?: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      borrow_requests: {
        Row: {
          id: string
          book_id: string
          borrower_id: string
          owner_id: string
          status: string
          requested_at: string
          approved_at: string | null
          returned_at: string | null
          due_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          book_id: string
          borrower_id: string
          owner_id: string
          status?: string
          requested_at?: string
          approved_at?: string | null
          returned_at?: string | null
          due_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          book_id?: string
          borrower_id?: string
          owner_id?: string
          status?: string
          requested_at?: string
          approved_at?: string | null
          returned_at?: string | null
          due_date?: string | null
          notes?: string | null
        }
      }
    }
  }
}

/*
  # Book Lending System Schema

  ## Overview
  Creates a complete database schema for a college book borrowing and lending system.
  This migration sets up tables for user profiles, books, and borrowing transactions with
  proper security policies.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text, not null)
  - `student_id` (text, unique, not null)
  - `department` (text)
  - `phone` (text)
  - `created_at` (timestamptz, defaults to now)
  - `updated_at` (timestamptz, defaults to now)
  
  ### `books`
  - `id` (uuid, primary key)
  - `owner_id` (uuid, references profiles, not null)
  - `title` (text, not null)
  - `author` (text, not null)
  - `isbn` (text)
  - `description` (text)
  - `address` (text, not null)       -- <<< ADDED
  - `phone` (text, not null)         -- <<< ADDED
  - `image_url` (text)
  - `status` (text, not null, defaults to 'available')
  - `created_at` (timestamptz, defaults to now)
  - `updated_at` (timestamptz, defaults to now)
  
  ### `borrow_requests`
  - `id` (uuid, primary key)
  - `book_id` (uuid, references books, not null)
  - `borrower_id` (uuid, references profiles, not null)
  - `owner_id` (uuid, references profiles, not null)
  - `status` (text, not null, defaults to 'pending')
  - `requested_at` (timestamfptz, defaults to now)
  - `approved_at` (timestamptz)
  - `returned_at` (timestamptz)
  - `due_date` (timestamptz)
  - `notes` (text)

  ## 2. Security
  
  ### Profiles Table
  - Enable RLS
  - Users can read all profiles (for discovering book owners)
  - Users can update only their own profile
  - Users can insert their own profile
  
  ### Books Table
  - Enable RLS
  - Anyone can view available books
  - Only book owners can update their own books
  - Only authenticated users can add books
  - Only book owners can delete their books
  
  ### Borrow Requests Table
  - Enable RLS
  - Users can view requests where they are borrower or owner
  - Authenticated users can create borrow requests
  - Only borrowers can update their own pending requests
  - Only owners can approve/reject requests
  
  ## 3. Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - Book status: 'available', 'borrowed', 'unavailable'
  - Borrow request status: 'pending', 'approved', 'rejected', 'returned'
  - Foreign keys ensure referential integrity
  - Indexes added for performance on common queries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  department text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  isbn text,
  description text,
  address text NOT NULL, 
  phone text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('available', 'borrowed', 'unavailable'))
  -- <<< REMOVED valid_condition constraint
);

-- Create borrow_requests table
CREATE TABLE IF NOT EXISTS borrow_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamfptz DEFAULT now(),
  approved_at timestamptz,
  returned_at timestamptz,
  due_date timestamptz,
  notes text,
  CONSTRAINT valid_borrow_status CHECK (status IN ('pending', 'approved', 'rejected', 'returned'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_owner_id ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_book_id ON borrow_requests(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_borrower_id ON borrow_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_owner_id ON borrow_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON borrow_requests(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Books policies
CREATE POLICY "Anyone can view available books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their books"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their books"
  ON books FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Borrow requests policies
CREATE POLICY "Users can view their own borrow requests"
  ON borrow_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = borrower_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create borrow requests"
  ON borrow_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Borrowers can update their pending requests"
  ON borrow_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = borrower_id AND status = 'pending')
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Owners can update requests for their books"
  ON borrow_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
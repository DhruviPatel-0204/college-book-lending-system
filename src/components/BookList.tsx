import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BookCard from './BookCard';
import { Search, Plus } from 'lucide-react';
import EditBookModal from './EditBookModal';

interface Book {
  id: string;
  title: string;
  author: string;
  address: string;    
  phone: string;      
  status: string;
  description: string | null;
  image_url: string | null;
  owner_id: string;
}

interface BookWithOwner extends Book {
  profiles?: {
    full_name: string;
  };
}

interface BookListProps {
  onAddBook: () => void;
  onBorrowBook: (bookId: string) => void;
  mode: 'browse' | 'my-books'; 
}


export default function BookList({ onAddBook, onBorrowBook, mode }: BookListProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBook, setEditingBook] = useState<BookWithOwner | null>(null); 

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [mode, user]); 

  const loadBooks = async () => {
    if (!user) return;
    
    setLoading(true);

    if (mode === 'browse') {
      // "Browse" mode: Load all books (except your own, optional)
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        // Optional: Hide your own books from the "Browse" tab
        // .not('owner_id', 'eq', user.id) 
        .order('created_at', { ascending: false });

      if (data) {
        setBooks(data);
      }
    } else {
      // "My Books" mode: Load books I own OR books I'm borrowing

      // 1. Books I own that are 'available'
      const { data: myOwnedBooks, error: ownedError } = await supabase
        .from('books')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'available');

      // 2. Books I've borrowed and not returned (status is 'approved')
      const { data: myBorrowedRequests, error: borrowedError } = await supabase
        .from('borrow_requests')
        .select(`
          books (
            *,
            profiles (
              full_name
            )
          )
        `)
        .eq('borrower_id', user.id)
        .eq('status', 'approved'); // 'approved' means it's borrowed

      if (ownedError) console.error("Error fetching owned books:", ownedError);
      if (borrowedError) console.error("Error fetching borrowed books:", borrowedError);

      // Combine the two lists
      const owned = myOwnedBooks || [];
      const borrowed = myBorrowedRequests?.map(req => req.books).filter(Boolean) as BookWithOwner[] || [];

      // Use a Map to ensure no duplicates
      const allMyBooksMap = new Map<string, BookWithOwner>();
      owned.forEach(book => allMyBooksMap.set(book.id, book));
      borrowed.forEach(book => allMyBooksMap.set(book.id, book));

      setBooks(Array.from(allMyBooksMap.values()));
    }

    setLoading(false);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (!error) {
      // Use loadBooks() to refresh the list correctly for the current mode
      loadBooks(); 
    }
  };

  const handleEdit = (bookId: string) => {
    const bookToEdit = books.find(book => book.id === bookId);
    if (bookToEdit) {
      setEditingBook(bookToEdit);
    }
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
    loadBooks(); 
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
         {/* ... (search and add book button code remains the same) ... */}
         <div className="flex-1 relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
           <input
             type="text"
             placeholder="Search books by title or author..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
           />
         </div>
         <button
           onClick={onAddBook}
           className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
         >
           <Plus className="w-5 h-5" />
           Add Book
         </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          {/* --- UPDATED Empty State Message --- */}
          <p className="text-slate-600 text-lg">
            {mode === 'browse' ? 'No books found' : 'You have no books in this list'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              ownerName={book.profiles?.full_name}
              isOwner={book.owner_id === user?.id}
              onBorrow={onBorrowBook}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
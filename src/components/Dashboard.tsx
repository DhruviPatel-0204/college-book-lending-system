// src/components/Dashboard.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, LogOut, Inbox, Send, BookMarked } from 'lucide-react';
import BookList from './BookList';
import AddBookModal from './AddBookModal';
import BorrowRequestModal from './BorrowRequestModal';
import RequestsList from './RequestsList';

type Tab = 'browse' | 'my-books' | 'requests';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string; ownerId: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBorrowRequest = (bookId: string) => {
    supabase
      .from('books')
      .select('id, title, owner_id')
      .eq('id', bookId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedBook({ id: data.id, title: data.title, ownerId: data.owner_id });
          setShowBorrowModal(true);
        }
      });
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md border-b border-slate-200">
        {/* ... (header code remains the same) ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                 <BookOpen className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-slate-900">CampusReads</h1>
                 <p className="text-sm text-slate-600">Welcome, {profile?.full_name}</p>
               </div>
             </div>
             <button
               onClick={() => signOut()}
               className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
             >
               <LogOut className="w-4 h-4" />
               <span className="font-medium">Sign Out</span>
             </button>
           </div>
         </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8">
          {/* ... (tab buttons remain the same) ... */}
          <button
             onClick={() => setActiveTab('browse')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
               activeTab === 'browse'
                 ? 'bg-slate-900 text-white shadow-lg'
                 : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md'
             }`}
           >
             <BookOpen className="w-5 h-5" />
             Browse Books
           </button>
           <button
             onClick={() => setActiveTab('my-books')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
               activeTab === 'my-books'
                 ? 'bg-slate-900 text-white shadow-lg'
                 : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md'
             }`}
           >
             <BookMarked className="w-5 h-5" />
             My Books
           </button>
           <button
             onClick={() => setActiveTab('requests')}
             className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
               activeTab === 'requests'
                 ? 'bg-slate-900 text-white shadow-lg'
                 : 'bg-white text-slate-700 hover:bg-slate-100 shadow-md'
             }`}
           >
             <Inbox className="w-5 h-5" />
             Requests
           </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {activeTab === 'browse' && (
            <BookList
              key={`browse-${refreshKey}`}
              onAddBook={() => setShowAddBookModal(true)}
              onBorrowBook={handleBorrowRequest}
              mode="browse" // --- ADDED THIS PROP ---
            />
          )}

          {activeTab === 'my-books' && (
            <BookList
              key={`my-books-${refreshKey}`}
              onAddBook={() => setShowAddBookModal(true)}
              onBorrowBook={handleBorrowRequest}
              mode="my-books" // --- ADDED THIS PROP ---
            />
          )}

          {activeTab === 'requests' && (
            <RequestsList key={`requests-${refreshKey}`} onUpdate={handleRefresh} />
          )}
        </div>
      </div>

      {/* ... (modals remain the same) ... */}
       {showAddBookModal && (
         <AddBookModal
           onClose={() => setShowAddBookModal(false)}
           onSuccess={handleRefresh}
         />
       )}
 
       {showBorrowModal && selectedBook && (
         <BorrowRequestModal
           bookId={selectedBook.id}
           bookTitle={selectedBook.title}
           ownerId={selectedBook.ownerId}
           onClose={() => {
             setShowBorrowModal(false);
             setSelectedBook(null);
           }}
           onSuccess={handleRefresh}
         />
       )}
    </div>
  );
}
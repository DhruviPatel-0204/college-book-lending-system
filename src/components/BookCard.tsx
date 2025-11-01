import { Book, User, MapPin, Phone } from 'lucide-react';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    status: string;
    description: string | null;
    image_url: string | null;
    owner_id: string;
    address: string; 
    phone: string;
  };
  ownerName?: string;
  isOwner: boolean;
  onBorrow?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
  onDelete?: (bookId: string) => void;
}

export default function BookCard({ book, ownerName, isOwner, onBorrow, onEdit, onDelete }: BookCardProps) {
  // Removed getConditionColor function

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'borrowed':
        return 'bg-orange-100 text-orange-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200">
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        {book.image_url ? (
          <img src={book.image_url} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <Book className="w-16 h-16 text-slate-400" />
        )}
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
            {book.status}
          </span>
          {/* Removed Condition Span */}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-slate-600 mb-3">by {book.author}</p>

        {book.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{book.description}</p>
        )}

        {ownerName && (
          <div className="flex items-center text-sm text-slate-500 mb-2">
            <User className="w-4 h-4 mr-1.5" />
            <span>{ownerName}</span>
          </div>
        )}

        {/* --- Added Address/Bhawan --- */}
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="line-clamp-1">{book.address}</span>
        </div>

        {/* --- Added Phone Number --- */}
        <div className="flex items-center text-sm text-slate-500 mb-4">
          <Phone className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>{book.phone}</span>
        </div>

        <div className="flex gap-2">
          {!isOwner && book.status === 'available' && onBorrow && (
            <button
              onClick={() => onBorrow(book.id)}
              className="flex-1 bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              Request Borrow
            </button>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => onEdit?.(book.id)}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-200 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(book.id)}
                className="flex-1 bg-red-50 text-red-600 py-2.5 px-4 rounded-lg font-medium hover:bg-red-100 transition-all"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
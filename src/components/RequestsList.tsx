import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Request {
  id: string;
  status: string;
  requested_at: string;
  due_date: string | null;
  notes: string | null;
  books: {
    title: string;
    author: string;
  };
  borrower?: {
    full_name: string;
    student_id: string;
  };
  owner?: {
    full_name: string;
    student_id: string;
  };
}

export default function RequestsList({ onUpdate }: { onUpdate: () => void }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('all');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    let query = supabase
      .from('borrow_requests')
      .select(`
        *,
        books (
          title,
          author
        ),
        borrower:profiles!borrow_requests_borrower_id_fkey (
          full_name,
          student_id
        ),
        owner:profiles!borrow_requests_owner_id_fkey (
          full_name,
          student_id
        )
      `)
      .order('requested_at', { ascending: false });

    if (filter === 'received') {
      query = query.eq('owner_id', user!.id);
    } else if (filter === 'sent') {
      query = query.eq('borrower_id', user!.id);
    }

    const { data, error } = await query;

    if (data) {
      setRequests(data as any);
    }
    setLoading(false);
  };

  const handleApprove = async (requestId: string, bookId: string) => {
    const { error: requestError } = await supabase
      .from('borrow_requests')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', requestId);

    const { error: bookError } = await supabase
      .from('books')
      .update({ status: 'borrowed' })
      .eq('id', bookId);

    if (!requestError && !bookError) {
      loadRequests();
      onUpdate();
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from('borrow_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) {
      loadRequests();
      onUpdate();
    }
  };

  const handleMarkReturned = async (requestId: string, bookId: string) => {
    const { error: requestError } = await supabase
      .from('borrow_requests')
      .update({ status: 'returned', returned_at: new Date().toISOString() })
      .eq('id', requestId);

    const { error: bookError } = await supabase
      .from('books')
      .update({ status: 'available' })
      .eq('id', bookId);

    if (!requestError && !bookError) {
      loadRequests();
      onUpdate();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3" />
            Returned
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Requests
        </button>
        <button
          onClick={() => setFilter('received')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'received'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Received
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'sent'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Sent
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 text-lg">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{request.books.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">by {request.books.author}</p>
                  {request.borrower && (
                    <p className="text-sm text-slate-600">
                      Borrower: {request.borrower.full_name} ({request.borrower.student_id})
                    </p>
                  )}
                  {request.owner && (
                    <p className="text-sm text-slate-600">
                      Owner: {request.owner.full_name} ({request.owner.student_id})
                    </p>
                  )}
                </div>
                {getStatusBadge(request.status)}
              </div>

              {request.notes && (
                <div className="bg-white rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700">{request.notes}</p>
                </div>
              )}

              <div className="text-xs text-slate-500 mb-3">
                Requested: {new Date(request.requested_at).toLocaleDateString()}
                {request.due_date && ` • Due: ${new Date(request.due_date).toLocaleDateString()}`}
              </div>

              {request.status === 'pending' && request.owner_id === user?.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id, request.book_id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {request.status === 'approved' && request.owner_id === user?.id && (
                <button
                  onClick={() => handleMarkReturned(request.id, request.book_id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark as Returned
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

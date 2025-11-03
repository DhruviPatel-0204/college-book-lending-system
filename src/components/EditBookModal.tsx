import { useState, useEffect } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

interface EditBookModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBookModal({ book, onClose, onSuccess }: EditBookModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // This form state holds all text/select fields
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    address: book.address,
    phone: book.phone,
    description: book.description || '',
    image_url: book.image_url || '', // This tracks the *current* image URL
    status: book.status,
  });

  // This state is just for the new file (if any)
  const [imageFile, setImageFile] = useState<File | null>(null);
  // This state is for the <img /> preview
  const [imagePreview, setImagePreview] = useState<string | null>(book.image_url);

  // This syncs the form if the book prop changes (e.g., you edit one book, then another)
  useEffect(() => {
    setFormData({
      title: book.title,
      author: book.author,
      address: book.address,
      phone: book.phone,
      description: book.description || '',
      image_url: book.image_url || '',
      status: book.status,
    });
    setImagePreview(book.image_url); // Reset preview to the book's current image
    setImageFile(null); // Clear any staged file
  }, [book]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a local preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let imageUrlToSave = formData.image_url; // Start with the existing URL

      // 1. If a new file was selected, upload it
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, imageFile); // You could also use .update() if you store the path

        if (uploadError) throw uploadError;

        // Get the new public URL
        const { data: urlData } = supabase.storage
          .from('book-covers')
          .getPublicUrl(filePath);
        
        imageUrlToSave = urlData.publicUrl;
      }

      // 2. Update the book record in the database
      const { error } = await supabase
        .from('books')
        .update({
          // Update all text fields from formData
          title: formData.title,
          author: formData.author,
          address: formData.address,
          phone: formData.phone,
          status: formData.status,
          description: formData.description,
          // Update the image URL to the new one (or the original if unchanged)
          image_url: imageUrlToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', book.id); // Specify which book to update

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Book</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- ALL FORM FIELDS ARE HERE --- */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Author *
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address / Bhawan Name *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* --- Image Upload Field --- */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Book Cover
            </label>
            <input
              type="file"
              id="book-cover-edit"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="book-cover-edit"
              className="w-full h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Book preview" className="h-full w-full object-contain rounded-lg p-1" />
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-700">
                    Click to upload image
                  </span>
                  <span className="text-xs text-slate-500">PNG, JPG, or WEBP</span>
                </>
              )}
            </label>
          </div>
          {/* --------------------------- */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>.
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
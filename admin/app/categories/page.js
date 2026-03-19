"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Tag, Info, Upload } from 'lucide-react';
import api, { getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory, uploadImage, getImageUrl } from '@/utils/api';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '', status: 'Active' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setFormData({ name: cat.name, icon: cat.icon || '', status: cat.status || 'Active' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', icon: '', status: 'Active' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const response = await uploadImage(data);
      const imagePath = response.data;
      setFormData({ ...formData, icon: getImageUrl(imagePath) });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const extractImageUrl = (url) => {
    if (!url) return url;
    try {
      if (url.includes('google.com/imgres')) {
        const urlObj = new URL(url);
        const imgurl = urlObj.searchParams.get('imgurl');
        if (imgurl) return imgurl;
      }
    } catch (e) {
      // ignore
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, icon: extractImageUrl(formData.icon) };
      if (editId) {
        await updateAdminCategory(editId, payload);
      } else {
        await createAdminCategory(payload);
      }
      handleCancelEdit();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All products in this category will become uncategorized.')) {
      try {
        await deleteAdminCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat._id?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your products into categories for easier browsing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">{filteredCategories.length} Categories</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-gray-50/50">
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Category Info</th>
                  <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400">Loading categories...</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan="3" className="py-8 text-center text-gray-400">No categories found.</td></tr>
                ) : filteredCategories.map(cat => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl border border-blue-100 shadow-sm shrink-0 overflow-hidden">
                        {cat.icon?.startsWith('http') ? <img src={cat.icon.replace('http://', 'https://')} alt="Icon" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} /> : (cat.icon || '📦')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {cat._id?.substring(0,8)}...</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cat.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Add/Edit Form */}
        <div className="space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
               <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Category' : 'Add New Category'}</h2>
               {editId && (
                 <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
                   <X size={20} />
                 </button>
               )}
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Category Name</label>
                 <div className="relative">
                   <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="e.g. Beverages" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Icon (Emoji or URL or Upload)</label>
                 <div className="flex items-center gap-2">
                   <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">✨</span>
                     <input 
                      type="text" 
                      placeholder="e.g. 🥤 or https://..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                     />
                   </div>
                   <label className={`cursor-pointer shrink-0 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                     <Upload size={16} />
                     {isUploading ? 'Uploading...' : 'Upload'}
                     <input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       onChange={handleFileUpload}
                     />
                   </label>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Status</label>
                 <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                 >
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                 </select>
               </div>

               <button 
                type="submit" 
                className={`w-full py-3 rounded-2xl font-bold transition mt-4 shadow-lg shadow-blue-100 ${
                  editId ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100' : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                }`}
               >
                 {editId ? 'Update Category' : 'Save Category'}
               </button>
             </form>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
             <Info className="text-[#2563EB] shrink-0" size={20} />
             <p className="text-xs text-blue-700 leading-relaxed">
               Categories are used to group products. Using descriptive names and distinct icons helps customers find items faster.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

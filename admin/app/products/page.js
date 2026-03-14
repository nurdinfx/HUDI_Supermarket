"use client";
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical, ExternalLink, X, Image as ImageIcon, Tag, Hash, DollarSign, Package } from 'lucide-react';
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, getAdminCategories } from '@/utils/api';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    countInStock: '',
    category: '',
    image: '',
    description: '',
    brand: '',
    variants: []
  });
  const [newVariant, setNewVariant] = useState({ sizeType: 'alphabetical', sizeLabel: '', color: '', stock: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const [{ data: prodData }, { data: catData }] = await Promise.all([
        getAdminProducts(),
        getAdminCategories()
      ]);
      setProducts(prodData.products || []);
      setCategories(catData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        countInStock: product.countInStock || '',
        category: product.category?._id || product.category || '',
        image: product.images?.[0] || '',
        description: product.description || '',
        brand: product.brand || '',
        variants: product.variants || []
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        name: '',
        price: '',
        countInStock: '',
        category: '',
        image: '',
        description: '',
        brand: '',
        variants: []
      });
    }
    setNewVariant({ sizeType: 'alphabetical', sizeLabel: '', color: '', stock: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteAdminProduct(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
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
    // Check for empty variants
    if (!formData.variants || formData.variants.length === 0) {
      alert('Please add at least one variant before saving the product.');
      return;
    }

    try {
      const calculatedStock = formData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
      const payload = { 
        ...formData, 
        image: extractImageUrl(formData.image),
        countInStock: calculatedStock,
        price: Number(formData.price),
        discount: Number(formData.discount || 0)
      };

      if (currentProduct) {
        await updateAdminProduct(currentProduct._id, payload);
      } else {
        await createAdminProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      const message = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Error saving product: ${message}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p._id.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory, pricing, and product details.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products by name or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg outline-none focus:border-[#2563EB] cursor-pointer w-full sm:w-auto text-sm">
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Product Name</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Category</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Price</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Stock</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-gray-200">
                        <img src={(product.images?.[0] || '/placeholder.svg').replace('http://', 'https://')} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">ID: {product._id.substring(0,8)}...</span>
                          <span className="text-yellow-500 text-xs font-bold flex items-center gap-0.5">★ {product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-sm font-medium">{product.category?.name || 'Uncategorized'}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">${product.price.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-bold ${product.countInStock <= 15 && product.countInStock > 0 ? 'text-[#F97316]' : product.countInStock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {product.countInStock}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      product.countInStock > 15 ? 'bg-green-100 text-green-700' : 
                      product.countInStock > 0 ? 'bg-orange-100 text-[#F97316]' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.countInStock > 15 ? 'In Stock' : product.countInStock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition" title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-xs text-gray-500 mt-1">{currentProduct ? `ID: ${currentProduct._id}` : 'Fill in the information below'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Product Name</label>
                    <div className="relative">
                       <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                        type="text" 
                        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Organic Bananas"
                        required
                       />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Price ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Total Stock</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="number" 
                          className="w-full bg-gray-100 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed text-gray-500" 
                          value={formData.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)}
                          readOnly
                          title="Computed automatically from variants"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                    <textarea 
                      rows="4"
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Variants Section */}
                <div className="md:col-span-2 mt-4 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">Product Variants</h3>
                  
                  {formData.variants.length > 0 && (
                    <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 font-semibold text-gray-600">Size</th>
                            <th className="py-2 px-4 font-semibold text-gray-600">Color</th>
                            <th className="py-2 px-4 font-semibold text-gray-600">Stock</th>
                            <th className="py-2 px-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {formData.variants.map((v, idx) => (
                            <tr key={idx} className="hover:bg-white transition">
                              <td className="py-2 px-4 font-medium">{v.sizeLabel}</td>
                              <td className="py-2 px-4">{v.color}</td>
                              <td className="py-2 px-4">{v.stock}</td>
                              <td className="py-2 px-4 text-right">
                                <button type="button" onClick={() => {
                                  const newV = [...formData.variants];
                                  newV.splice(idx, 1);
                                  setFormData({...formData, variants: newV});
                                }} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                      <div className="sm:col-span-1">
                         <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                         <select className="w-full border py-2 px-2 rounded-lg text-sm bg-white outline-none" value={newVariant.sizeType} onChange={(e) => setNewVariant({...newVariant, sizeType: e.target.value, sizeLabel: ''})}>
                           <option value="alphabetical">Alpha</option>
                           <option value="numeric">Numeric</option>
                         </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Size</label>
                        {newVariant.sizeType === 'alphabetical' ? (
                          <select className="w-full border py-2 px-2 rounded-lg text-sm bg-white outline-none" value={newVariant.sizeLabel} onChange={(e) => setNewVariant({...newVariant, sizeLabel: e.target.value})}>
                            <option value="">Select</option>
                            {['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '7XL', '8XL'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <input type="number" min="1" max="80" className="w-full border py-2 px-2 rounded-lg text-sm bg-white outline-none" placeholder="1-80" value={newVariant.sizeLabel} onChange={(e) => setNewVariant({...newVariant, sizeLabel: e.target.value})} />
                        )}
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Color</label>
                        <select className="w-full border py-2 px-2 rounded-lg text-sm bg-white outline-none" value={newVariant.color} onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}>
                            <option value="">Select</option>
                            {['cadaan', 'madow', 'casaan', 'buluug', 'cagaar', 'buni', 'buluug-maari', 'huruud', 'liimi', 'casuus'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stock</label>
                        <input type="number" min="0" className="w-full border py-2 px-2 rounded-lg text-sm bg-white outline-none" placeholder="Qty" value={newVariant.stock} onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})} />
                      </div>
                      <div className="sm:col-span-1">
                        <button type="button" onClick={() => {
                          if(!newVariant.sizeLabel || !newVariant.color || newVariant.stock === '') return alert('Fill all variant fields');
                          setFormData({...formData, variants: [...formData.variants, {sizeLabel: newVariant.sizeLabel, color: newVariant.color, stock: Number(newVariant.stock)}]});
                          setNewVariant({...newVariant, sizeLabel: '', color: '', stock: ''});
                        }} className="w-full bg-[#2563EB] text-white hover:bg-blue-700 font-bold py-2 rounded-lg text-sm transition focus:outline-none shadow-sm">
                          Add Variant
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-2 bg-[#2563EB] text-white py-3 px-12 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                >
                  {currentProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

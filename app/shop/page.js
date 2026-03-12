import ProductCard from '@/components/ProductCard';
import { Filter, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';

async function getData(resolvedParams) {
  try {
    const queryString = new URLSearchParams(resolvedParams || {}).toString();
    const [prodRes, catRes] = await Promise.all([
      fetch(`${API_URL}/products${queryString ? `?${queryString}` : ''}`, { cache: 'no-store' }),
      fetch(`${API_URL}/categories`, { cache: 'no-store' })
    ]);

    const prodData = prodRes.ok ? await prodRes.json() : { products: [] };
    const catData = catRes.ok ? await catRes.json() : [];

    return {
      products: prodData.products || prodData || [],
      categories: catData || []
    };
  } catch (error) {
    console.error('Error fetching shop data:', error.message);
    return { products: [], categories: [] };
  }
}

export default async function ShopPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const { products, categories: apiCategories } = await getData(resolvedParams);
  const currentCategory = resolvedParams.category || 'All Categories';
  const currentKeyword = resolvedParams.keyword || '';

  const buildUrl = (newParams) => {
    const params = new URLSearchParams(resolvedParams);
    Object.keys(newParams).forEach(key => {
      if (newParams[key]) {
        params.set(key, newParams[key]);
      } else {
        params.delete(key);
      }
    });
    return `/shop?${params.toString()}`;
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} className="text-[#F97316]"/> Filters
          </h2>
          
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
              <ul className="space-y-1">
                <li key="all">
                  <Link 
                    href={buildUrl({ category: null })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      currentCategory === 'All Categories' ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {apiCategories.map((cat) => (
                  <li key={cat._id}>
                    <Link 
                      href={buildUrl({ category: cat.name })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                        currentCategory === cat.name ? 'bg-blue-50 text-[#2563EB]' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-gray-100" />

            {/* Price Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
              <ul className="space-y-2">
                {['Any Price', 'Under $25', '$25 to $50', '$50 to $100', 'Over $100'].map((price, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="price" className="accent-[#2563EB] w-4 h-4 cursor-pointer" defaultChecked={i===0} />
                      <span className="text-sm text-gray-600 group-hover:text-[#2563EB] transition-colors">{price}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-3">
                <input type="number" placeholder="Min" className="w-1/2 p-1 border border-gray-200 rounded text-sm focus:outline-[#2563EB]" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="Max" className="w-1/2 p-1 border border-gray-200 rounded text-sm focus:outline-[#2563EB]" />
                <button className="bg-gray-100 p-1.5 rounded hover:bg-gray-200"><ChevronRight size={16}/></button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Rating Filter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer Reviews</h3>
              <ul className="space-y-2">
                {[4, 3, 2, 1].map((rating, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="flex text-yellow-400">
                        {Array(5).fill(0).map((_, j) => (
                          <Star key={j} size={16} className={j < rating ? "fill-yellow-400" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-[#2563EB] transition-colors">& Up</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">
              {currentKeyword ? `Search results for "${currentKeyword}"` : currentCategory}
            </h1>
            {currentKeyword && currentCategory !== 'All Categories' && (
               <span className="bg-blue-100 text-[#2563EB] text-xs font-bold px-2 py-1 rounded-md ml-2">{currentCategory}</span>
            )}
            <span className="text-sm text-gray-400 mx-2">|</span>
            <p className="text-sm text-gray-600">Showing <span className="font-bold text-gray-900">{products.length}</span> results</p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <span className="text-sm text-gray-600">Sort:</span>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm outline-none focus:border-[#2563EB] cursor-pointer">
              <option>Default</option>
              <option>Low Price</option>
              <option>High Price</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">🔍</span>
            <h3 className="text-lg font-bold text-gray-900">No results found</h3>
            <p>Try adjusting your category or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

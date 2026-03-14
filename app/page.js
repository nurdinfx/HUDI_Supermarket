import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Tag, ShieldCheck, Truck, CreditCard } from 'lucide-react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';

async function getData() {
  try {
    const [prodRes, catRes] = await Promise.all([
      fetch(`${API_URL}/products`, { cache: 'no-store' }),
      fetch(`${API_URL}/categories`, { cache: 'no-store' }),
    ]);

    const prodData = prodRes.ok ? await prodRes.json() : { products: [] };
    const catData = catRes.ok ? await catRes.json() : [];

    return {
      products: prodData.products || [],
      categories: Array.isArray(catData) ? catData : [],
    };
  } catch (error) {
    console.error('Error fetching data:', error.message || error);
    return { products: [], categories: [] };
  }
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { products } = await getData();

  const heroImage = "/images/hudi_hero_banner.png";
  
  const heroTiles = [
    {
      title: "Fresh Groceries Essentials",
      image: "/images/fresh_groceries_grid.png",
      link: "/shop?category=Groceries",
      linkText: "Shop fresh food",
      items: ["Fruits", "Vegetables", "Bakery", "Dairy"]
    },
    {
      title: "Home & Garden Refresh",
      image: "/images/home_garden_grid.png",
      link: "/shop?category=Kitchen",
      linkText: "Discover more",
      items: ["Kitchen", "Garden", "Decor", "Tools"]
    },
    {
      title: "Health & Beauty Care",
      image: "/images/health_beauty_grid.png",
      link: "/shop?category=Cosmetics",
      linkText: "See more",
      items: ["Skincare", "Haircare", "Grooming", "Fragrance"]
    },
    {
      title: "Top Electronics Deals",
      image: "/images/electronics_deals.png",
      link: "/shop?category=Electronics",
      linkText: "Explore tech",
      items: ["Audio", "Wearables", "Accessories", "Laptops"]
    }
  ];

  return (
    <div className="bg-[#eaeded] min-h-screen pb-12 font-sans">
      
      {/* Hero Section - Amazon Layered Style */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[600px] w-full">
          {/* Main Hero Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#eaeded] z-10" />
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover object-top"
          />
          
          <div className="absolute top-[60px] left-8 z-20 max-w-2xl px-4 lg:px-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f1111] leading-tight mb-2">
              Hudi-Supermarket
            </h1>
            <p className="text-xl md:text-2xl font-bold text-[#0f1111] mb-6">
              Everything you need, all in one place.
            </p>
            <p className="text-sm md:text-base font-medium text-[#565959] mb-8 max-w-md">
              Fast delivery to your doorstep in Mogadishu. Shop the best deals on groceries, electronics, and home essentials.
            </p>
            <Link href="/shop" className="bg-[#febd69] hover:bg-[#f3a847] text-gray-900 border border-[#a88734] px-8 py-3 rounded-md font-bold transition shadow-sm inline-block text-sm md:text-base">
              Explore Our Shop
            </Link>
          </div>
        </div>

        {/* Overlapping Quick Cards Grid */}
        <div className="max-w-[1500px] mx-auto px-4 -mt-[320px] relative z-30 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {heroTiles.map((tile, idx) => (
              <div key={idx} className="bg-white p-5 shadow-md flex flex-col h-full rounded-sm">
                <h3 className="text-[21px] font-bold mb-4 text-[#0f1111] h-14 leading-tight">{tile.title}</h3>
                
                {/* Image Container */}
                <div className="flex-1 overflow-hidden relative group">
                  <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                    <img 
                      src={tile.image} 
                      alt={tile.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Grid Labels */}
                  <div className="grid grid-cols-2 mt-4 gap-x-2 gap-y-2">
                     {tile.items.map((item, i) => (
                       <div key={i} className="flex flex-col">
                          <span className="text-[12px] font-normal text-[#0f1111]">{item}</span>
                       </div>
                     ))}
                  </div>
                </div>

                <Link 
                  href={tile.link} 
                  className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline mt-6 block font-medium"
                >
                  {tile.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page Content */}
      <div className="max-w-[1500px] mx-auto px-4 mt-8 space-y-10">
        
        {/* Horizontal Scroll Sections */}
        <section className="bg-white p-6 shadow-sm rounded-sm">
          <h2 className="text-[21px] font-bold mb-5 text-[#0f1111]">Best Sellers in Groceries</h2>
          <div className="flex overflow-x-auto gap-8 pb-4 no-scrollbar scroll-smooth">
             {products.filter(p => p.category === 'Groceries' || p.category?._name === 'Groceries').slice(0, 12).map((product, i) => (
                <div key={i} className="min-w-[160px] max-w-[160px] cursor-pointer group">
                  <Link href={`/product/${product._id}`}>
                    <div className="h-40 bg-white flex items-center justify-center overflow-hidden mb-3">
                       <img src={(product.images?.[0] || '/placeholder.svg').replace('http://', 'https://')} alt={product.name} className="h-full object-contain group-hover:scale-105 transition duration-500" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }} />
                    </div>
                    <div className="text-[14px] line-clamp-2 leading-tight text-[#007185] group-hover:text-[#C7511F] mb-1 font-medium">{product.name}</div>
                    <div className="flex items-center text-orange-400 text-xs mb-1">
                       ★★★★★ <span className="text-blue-600 ml-1 font-normal">(890)</span>
                    </div>
                    <p className="font-bold text-[17px] text-[#0f1111]">${product.price}</p>
                  </Link>
                </div>
             ))}
          </div>
        </section>

        {/* Feature Grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
           {[
             { title: 'Home Improvement', img: '/images/home_garden_grid.png' },
             { title: 'Spring New Arrivals', img: '/images/fresh_groceries_grid.png' },
             { title: 'Beauty Bundles', img: '/images/health_beauty_grid.png' },
             { title: 'Daily Tech Deals', img: '/images/electronics_deals.png' }
           ].map((box, i) => (
             <div key={i} className="bg-white p-5 shadow-sm rounded-sm">
                <h3 className="text-[21px] font-bold mb-4 text-[#0f1111] h-14">{box.title}</h3>
                <div className="aspect-square bg-white mb-3 overflow-hidden">
                   <img src={box.img} className="w-full h-full object-contain hover:scale-105 transition duration-700" />
                </div>
                <Link href="/shop" className="text-[13px] text-[#007185] hover:text-[#C7511F] hover:underline font-medium">Shop more</Link>
             </div>
           ))}
        </div>

        {/* All Products Grid */}
        <section className="bg-white p-6 shadow-sm rounded-sm">
           <h2 className="text-[21px] font-bold mb-6 text-[#0f1111]">Recommended for you</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {products.slice(0, 18).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
           </div>
           
           {/* Sign In Footer */}
           <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col items-center">
              <div className="text-center max-w-sm w-full">
                <p className="text-[13px] text-[#0f1111] mb-2 font-medium">See personalized recommendations</p>
                <Link href="/login" className="block w-full bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] py-1.5 rounded-sm text-[13px] font-bold text-center mb-1 hover:from-[#f5d78e] hover:to-[#ebb331]">
                  Sign in
                </Link>
                <p className="text-[11px] text-[#0f1111]">New customer? <Link href="/register" className="text-[#007185] hover:underline">Start here.</Link></p>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}

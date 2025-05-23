import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../../helper/getProductFromApi';
import ProductCard from '../ProductCard/ProductCard';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response || []); // Remove .data since we're getting direct array
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500 font-semibold">{error}</div>
  );

  // Add a check to ensure products is an array before mapping
  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    return <div className="text-center py-20 text-red-500 font-semibold">Invalid product data format</div>;
  }

  // Giới hạn hiển thị chỉ 8 sản phẩm
  const displayedProducts = products.slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {displayedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products.length > 4 && (
        <div className="text-center mt-10">
          <Link 
            to="/products" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Xem thêm
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductList;
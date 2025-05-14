import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const defaultImage = product.images.find(img => img.default)?.imageURL || product.images[0]?.imageURL;
  
  const colorCount = new Set(product.options
    .filter(option => option.optionName === 'Màu sắc')
    .map(option => option.value)).size;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 gap-2">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img 
            src={defaultImage} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-gray-800 truncate">
            {product.name}
          </h3>
          
          <span className="text-3xl font-bold text-red-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.basePrice)}
          </span>
          <span className="text-lg text-gray-600">
            {product.category.name}
          </span>
          <span className="text-lg text-gray-600">
            {colorCount} màu sắc
          </span>

          <div className="flex gap-1">
            {product.groups.map((group, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {group.type}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
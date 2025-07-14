import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../helper/getProductFromApi';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { FaShoppingCart, FaShoppingBag } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const ProductDetail = () => {
  // Add CSS for the fade-in animation
  const fadeInStyle = `
    @keyframes fadeIn {
       0% {
        opacity: 0;
        transform: translateY(20px) scale(0.95) rotateZ(-1deg);
        filter: blur(10px);
      }
      30% {
        opacity: 0.5;
        transform: translateY(-5px) scale(1.02) rotateZ(0.5deg);
        filter: blur(4px);
      }
      60% {
        opacity: 0.85;
        transform: translateY(3px) scale(0.99) rotateZ(-0.2deg);
        filter: blur(1px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateZ(0deg);
        filter: blur(0);
      }
    }
  `;

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [variantPrice, setVariantPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Get current user from Redux store
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setMainImage(data.images.find(img => img.default)?.imageURL || data.images[0]?.imageURL);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (selectedColor && product) {
      const variant = product.variants.find(v => v.name.includes(selectedColor));
      if (variant?.img) {
        setMainImage(variant.img);
      }
    }
  }, [selectedColor, product]);

  const getAvailableSizes = (color) => {
    if (!color || !product) return [];
    return product.variants
      .filter(v => v.name.includes(color))
      .map(v => {
        const parts = v.name.split(' - ');
        return parts.length > 1 ? parts[1] : null;
      })
      .filter(Boolean);
  };

  // Add effect to update price when color and size are selected
  useEffect(() => {
    if (selectedColor && selectedSize && product) {
      const selectedVariant = product.variants.find(
        v => v.name.includes(selectedColor) && v.name.includes(selectedSize)
      );
      
      if (selectedVariant) {
        setVariantPrice(selectedVariant.price);
      } else {
        setVariantPrice(null);
      }
    } else {
      setVariantPrice(null);
    }
  }, [selectedColor, selectedSize, product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  const uniqueColors = [...new Set(product.options
    .filter(option => option.optionName === 'Màu sắc')
    .map(option => option.value))];

  const uniqueSizes = [...new Set(product.options
    .filter(option => option.optionName === 'Kích cỡ')
    .map(option => option.value))];

  const availableSizes = selectedColor ? getAvailableSizes(selectedColor) : [];

  // Function to add product to cart
  const addToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Vui lòng chọn màu sắc và kích cỡ');
      return;
    }
    
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    // Find the selected variant
    const selectedVariant = product.variants.find(
      v => v.name.includes(selectedColor) && v.name.includes(selectedSize)
    );
    
    if (!selectedVariant) {
      toast.error('Không tìm thấy biến thể sản phẩm');
      return;
    }
    
    setAddingToCart(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URI}/cart/${currentUser.userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: new URLSearchParams({
          variantId: selectedVariant.id,
          quantity: quantity
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể thêm vào giỏ hàng');
      }
      
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi thêm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  // Add a function to handle the "Buy Now" button click
  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm');
      return;
    }

    if (!selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    if (!selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }

    // Navigate to checkout with product information as URL parameters
    navigate(`/checkout?product=${product.id}&variant=${selectedVariant.id}&color=${selectedColor}&size=${selectedSize}&quantity=${quantity}`);
  };

  return (
    <>
      <style>{fadeInStyle}</style>
      <Header />
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div className="relative">
                <button 
                  onClick={() => {
                    const currentIndex = product.images.findIndex(img => img.imageURL === mainImage);
                    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
                    setMainImage(product.images[prevIndex].imageURL);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                >
                  <IoIosArrowBack className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => {
                    const currentIndex = product.images.findIndex(img => img.imageURL === mainImage);
                    const nextIndex = (currentIndex + 1) % product.images.length;
                    setMainImage(product.images[nextIndex].imageURL);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                >
                  <IoIosArrowForward className="w-6 h-6" />
                </button>
                
                <div className="aspect-square rounded-lg overflow-hidden max-w-[80%] mx-auto shadow-md">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 ease-in-out transform hover:scale-105"
                    key={mainImage} // This key prop helps React recognize when to animate
                    style={{animation: 'fadeIn 0.5s'}}
                  />
                </div>
              </div>
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin max-w-[80%] mx-auto scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setMainImage(image.imageURL)}
                    className={`flex-shrink-0 w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                      ${mainImage === image.imageURL ? 'border-blue-500 scale-105' : 'border-transparent'}`}
                  >
                    <img
                      src={image.imageURL}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex gap-2">
                  {product.groups.map((group, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                    >
                      {group.type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-4xl font-bold text-red-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(variantPrice || product.basePrice)}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Màu sắc</h3>
                  <div className="flex gap-3">
                    {uniqueColors.map((color, index) => {
                      const variant = product.variants.find(v => v.name.includes(color));
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedColor(color);
                            setSelectedSize(null); // Reset size when color changes
                          }}
                          className={`w-12 h-12 rounded-lg border-2 overflow-hidden
                            ${selectedColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                        >
                          <img
                            src={variant?.img}
                            alt={color}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Kích cỡ</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((size, index) => {
                      const isAvailable = availableSizes.includes(size);
                      return (
                        <button
                          key={index}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-md border transition-all
                            ${selectedSize === size 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : isAvailable
                                ? 'border-gray-200 hover:border-gray-300'
                                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedColor && (
                    <p className="text-sm text-gray-500 mt-2">Vui lòng chọn màu sắc trước</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Add quantity selector */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Số lượng</h3>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-t border-b border-gray-300 py-1"
                  />
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={!selectedColor || !selectedSize || addingToCart}
                  onClick={addToCart}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors duration-200
                    ${selectedColor && selectedSize && !addingToCart
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  {addingToCart ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang thêm...
                    </span>
                  ) : (
                    <>
                      <FaShoppingCart className="w-5 h-5" />
                      {!selectedColor 
                        ? 'Chọn màu sắc'
                        : !selectedSize 
                          ? 'Chọn kích cỡ'
                          : 'Thêm vào giỏ'}
                    </>
                  )}
                </button>
                
                <button
                  disabled={!selectedColor || !selectedSize}
                  onClick={() => {
                    if (!currentUser) {
                      toast.error('Vui lòng đăng nhập để mua sản phẩm');
                      navigate('/login', { state: { from: `/product/${id}` } });
                      return;
                    }
                    
                    if (selectedColor && selectedSize) {
                      const selectedVariant = product.variants.find(
                        v => v.name.includes(selectedColor) && v.name.includes(selectedSize)
                      );
                      
                      if (selectedVariant) {
                        // Create a cart item for direct checkout
                        const cartItem = {
                          id: selectedVariant.id,
                          productId: product.id,
                          productName: product.name,
                          variantName: selectedVariant.name,
                          color: selectedColor,
                          size: selectedSize,
                          quantity: quantity,
                          unitPrice: selectedVariant.price,
                          totalPrice: selectedVariant.price * quantity,
                          imageUrl: selectedVariant.img || product.images[0]?.imageURL
                        };
                        
                        // Navigate to checkout with cart item in state
                        navigate('/checkout', {
                          state: {
                            cartItems: [cartItem],
                            totalPrice: cartItem.totalPrice,
                            itemCount: 1,
                            fromCart: false // Indicate this is a direct purchase, not from cart
                          }
                        });
                      }
                    } else {
                      if (!selectedColor) {
                        toast.error('Vui lòng chọn màu sắc');
                      } else if (!selectedSize) {
                        toast.error('Vui lòng chọn kích cỡ');
                      }
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors duration-200
                    ${selectedColor && selectedSize
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  <FaShoppingBag className="w-5 h-5" />
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
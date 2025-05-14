import { useState, useEffect } from "react";
import { useParams ,useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import {  updateProductApi } from "../../helper/productApi";
import { getProductById } from "../../helper/getProductFromApi";
import { useSelector } from "react-redux";
import uploadImage from "../../helper/uploadImage";


const EditProduct =  () => {
  const { productId  } = useParams();
  console.log("Product ID:", productId);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Product data state
  const [productData, setProductData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  
  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError("");
        
        if (!productId) {
          setError("Product ID is missing");
          return;
        }
        
        const data = await getProductById(productId);
        
        // Map API data to component state format
        const formattedData = formatProductData(data);
        setProductData(formattedData);
        setOriginalData(formattedData);
        
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productId]);
  
  // Format API data to match component state structure
  const formatProductData = (apiData) => {
    // Extract unique options from variants
    const uniqueOptions = extractUniqueOptions(apiData.variants || []);
    
    return {
      id: apiData.id,
      name: apiData.name || "",
      description: apiData.description || "",
      basePrice: apiData.basePrice || 0,
      images: apiData.images || [],
      groups: apiData.groups || [],
      options: uniqueOptions,
      variants: (apiData.variants || []).map(variant => ({
        id: variant.id,
        name: variant.name || "",
        sku: variant.sku || "",
        price: variant.price || 0,
        img: variant.img || "",
        quantity: variant.quantity || 0,
        optionIds: variant.optionIds || []
      })),
      storeId: apiData.storeId,
      category: apiData.category || { id: null, name: "" }
    };
  };
  
  // Extract unique options from variants
  const extractUniqueOptions = (variants) => {
    const optionsMap = new Map();
    
    variants.forEach(variant => {
      // For each variant, extract color and size options
      if (variant.color) {
        if (!optionsMap.has("color")) {
          optionsMap.set("color", { optionId: 1, optionName: "Màu sắc", values: [] });
        }
        
        const colorOption = optionsMap.get("color");
        if (!colorOption.values.includes(variant.color)) {
          colorOption.values.push(variant.color);
        }
      }
      
      // Extract sizes
      if (variant.sizes && variant.sizes.length > 0) {
        if (!optionsMap.has("size")) {
          optionsMap.set("size", { optionId: 2, optionName: "Kích cỡ", values: [] });
        }
        
        const sizeOption = optionsMap.get("size");
        variant.sizes.forEach(size => {
          if (!sizeOption.values.includes(size.size)) {
            sizeOption.values.push(size.size);
          }
        });
      }
    });
    
    // Convert map to array
    const options = [];
    optionsMap.forEach(option => {
      option.values.forEach(value => {
        options.push({
          optionId: option.optionId,
          optionName: option.optionName,
          value: value
        });
      });
    });
    
    return options;
  };
  
  // Get unique option names
  const getUniqueOptionNames = () => {
    if (!productData || !productData.options) return [];
    return [...new Set(productData.options.map(opt => opt.optionName))];
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };
  
  // Handle price input with formatting
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (!isNaN(value)) {
      setProductData({
        ...productData,
        basePrice: Number(value),
      });
    }
  };
  
  // Format price display
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };
  
  // Update variant
  const handleVariantChange = (id, field, value) => {
    const updatedVariants = productData.variants.map(variant => {
      if (variant.id === id) {
        if (field === "price" && !isNaN(value.replace(/,/g, ""))) {
          return { ...variant, [field]: Number(value.replace(/,/g, "")) };
        }
        if (field === "quantity" && !isNaN(value)) {
          return { ...variant, [field]: Number(value) };
        }
        return { ...variant, [field]: value };
      }
      return variant;
    });
    
    setProductData({
      ...productData,
      variants: updatedVariants,
    });
  };
  
  // Set default image
  const setDefaultImage = (imageId) => {
    const updatedImages = productData.images.map(img => ({
      ...img,
      default: img.id === imageId,
    }));
    
    setProductData({
      ...productData,
      images: updatedImages,
    });
  };
  
  // Remove image
  const removeImage = (imageId) => {
    const updatedImages = productData.images.filter(img => img.id !== imageId);
    
    setProductData({
      ...productData,
      images: updatedImages,
    });
  };
  
  // Add new image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const uploadResult = await uploadImage(file);
      
      const newImage = {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        imageURL: uploadResult.url,
        default: productData.images.length === 0 // Make it default if it's the first image
      };
      
      setProductData({
        ...productData,
        images: [...productData.images, newImage]
      });
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", text: "Failed to upload image. Please try again." });
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };
  
  // Format product data for API
  const formatProductForApi = () => {
    return {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      basePrice: productData.basePrice,
      categoryId: productData.category.id,
      storeId: productData.storeId,
      productGroupIds: productData.groups.map(group => group.id),
      images: productData.images.map(img => ({
        id: img.id,
        imageURL: img.imageURL,
        default: img.default
      })),
      variants: productData.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        img: variant.img,
        quantity: variant.quantity,
        optionIds: variant.optionIds
      }))
    };
  };
  function convertProductToStandardFormat(productData) {
    // Helper function to extract color and size from variant name (e.g., "Trắng - 41")
    const parseVariantName = (name) => {
      const [color, size] = name.split(' - ').map(str => str.trim());
      return { color, size };
    };
  
    // Extract unique colors and sizes for options
    const variantsInfo = productData.variants.map(variant => ({
      ...parseVariantName(variant.name),
      sku: variant.sku,
      price: variant.price,
      img: variant.img,
      quantity: variant.quantity.toString(), // Convert quantity to string
    }));
  
    const uniqueColors = [...new Set(variantsInfo.map(v => v.color))];
    const uniqueSizes = [...new Set(variantsInfo.map(v => v.size))].sort((a, b) => parseInt(a) - parseInt(b));
  
    // Group variants by color
    const variantsByColor = uniqueColors.map(color => {
      const variantsForColor = variantsInfo.filter(v => v.color === color);
      const firstVariant = variantsForColor[0];
      return {
        sku: firstVariant.sku.split('-').slice(0, 2).join('-'), // e.g., "TST-001"
        price: firstVariant.price,
        variantImage: firstVariant.img,
        color,
        sizes: variantsForColor.map(v => ({
          size: v.size,
          quantity: v.quantity,
        })),
      };
    });
  
    return {
      id: productData.id,
      name: productData.name.trim(),
      description: productData.description,
      basePrice: productData.basePrice,
      categoryId: productData.categoryId,
      storeId: productData.storeId,
      productGroupIds: productData.productGroupIds,
      images: productData.images.map(img => img.imageURL),
      options: [
        {
          name: "Màu sắc",
          values: uniqueColors,
        }
        // {
        //   name: "Kích thước",
        //   values: uniqueSizes,
        // },
      ],
      variants: variantsByColor,
    };
  }
  
  // Save changes
  const saveChanges = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      
      // Format data for API
      const formattedData = formatProductForApi();
      console.log("Data to send:", formattedData);

      const convertData = convertProductToStandardFormat(formattedData);
      console.log("Data to testt:", convertData);
      
      
      await updateProductApi(formattedData.id,convertData, currentUser.token);
      
      // Update original data to reflect saved changes
      setOriginalData({...productData});
      
      setMessage({ type: "success", text: "Đã lưu thành công!" });
      setIsEditing(false);
      
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage({ type: "error", text: "Lưu không thành công. Vui lòng thử lại." });
    } finally {
      setSaving(false);
    }
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setProductData({...originalData});
    setIsEditing(false);
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => navigate("/dashboard/products")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }
  
  // Handle null product data
  if (!productData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <p className="text-yellow-600 font-medium">Không tìm thấy thông tin sản phẩm</p>
          <button 
            onClick={() => navigate("/dashboard/products")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu'
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Notification message */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("basic")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "basic"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Thông tin cơ bản
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "images"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Hình ảnh
              </button>
              <button
                onClick={() => setActiveTab("variants")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "variants" 
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" 
                }`}
              >
                Biến thể
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã sản phẩm</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      disabled
                      value={productData.id}
                      className="bg-gray-100 border border-gray-300 rounded-md py-2 px-3 w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${
                        isEditing ? "bg-white" : "bg-gray-100"
                      } border border-gray-300 rounded-md py-2 px-3 w-full`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <div className="mt-1">
                    <textarea
                      name="description"
                      rows="4"
                      value={productData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${
                        isEditing ? "bg-white" : "bg-gray-100"
                      } border border-gray-300 rounded-md py-2 px-3 w-full`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Giá cơ bản</label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      name="basePrice"
                      value={formatPrice(productData.basePrice)}
                      onChange={handlePriceChange}
                      disabled={!isEditing}
                      className={`${
                        isEditing ? "bg-white" : "bg-gray-100"
                      } border border-gray-300 rounded-md py-2 px-3 pr-12 w-full`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">VND</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={productData.category.name}
                      disabled={!isEditing}
                      className={`${
                        isEditing ? "bg-white" : "bg-gray-100"
                      } border border-gray-300 rounded-md py-2 px-3 w-full`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nhóm sản phẩm</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {productData.groups.map((group) => (
                      <span
                        key={group.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {group.type === "NAM" && "Nam"}
                        {group.type === "NU" && "Nữ"}
                        {group.type === "TRE_EM" && "Trẻ em"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh sản phẩm</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {productData.images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className={`border rounded-lg overflow-hidden ${image.default ? 'ring-2 ring-indigo-500' : ''}`}>
                        <img
                          src={image.imageURL}
                          alt="Product"
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setDefaultImage(image.id)}
                            className={`p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 ${image.default ? 'text-indigo-600' : ''}`}
                            title="Đặt làm ảnh mặc định"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="p-2 rounded-full bg-white text-red-600 hover:bg-gray-100"
                            title="Xóa ảnh"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {image.default && (
                        <span className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center h-40">
                      <label className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="mt-2 text-sm">Thêm ảnh</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === "variants" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Biến thể sản phẩm</h3>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Tùy chọn sản phẩm</h4>
                  <div className="space-y-4">
                    {getUniqueOptionNames().map((optionName, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium text-gray-700">{optionName}:</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {productData.options
                            .filter(option => option.optionName === optionName)
                            .map((option, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                              >
                                {option.value}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hình ảnh
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên biến thể
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productData.variants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded object-cover" src={variant.img} alt="" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{variant.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => handleVariantChange(variant.id, "sku", e.target.value)}
                                className="border border-gray-300 rounded-md py-1 px-2 w-full"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">{variant.sku}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={formatPrice(variant.price)}
                                  onChange={(e) => handleVariantChange(variant.id, "price", e.target.value)}
                                  className="border border-gray-300 rounded-md py-1 px-2 pr-12 w-full"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 text-xs">VND</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">{formatPrice(variant.price)} VND</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                value={variant.quantity}
                                onChange={(e) => handleVariantChange(variant.id, "quantity", e.target.value)}
                                className="border border-gray-300 rounded-md py-1 px-2 w-20"
                                min="0"
                              />
                            ) : (
                              <div className={`text-sm ${variant.quantity === 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                {variant.quantity === 0 ? 'Hết hàng' : variant.quantity}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
)}
export default EditProduct;
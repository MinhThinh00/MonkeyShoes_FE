import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import uploadImage from '../../helper/uploadImage';
import { toast } from 'react-hot-toast';
import { fetchCategories, fetchStores,createProductApi } from '../../helper/productApi';


const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [options, setOptions] = useState([]);
  const [nextOptionId, setNextOptionId] = useState(1);
  const [variants, setVariants] = useState([]);
  const [nextVariantId, setNextVariantId] = useState(1);
  const [basePrice, setBasePrice] = useState('');

  const [categoryId, setCategoryId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [productGroups, setProductGroups] = useState([]);
  const [selectedProductGroups, setSelectedProductGroups] = useState([]);
  
  const currentUser = useSelector((state) => state.user.currentUser);
  const fetchProductGroups = async () => {
    return [
      { id: 1, name: 'Nam' },
      { id: 2, name: 'Nữ' },
      { id: 3, name: 'Trẻ em' },
    ];
  };
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?.token) {
          setIsLoadingUser(true);
          return;
        }
        
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        const storesData = await fetchStores(currentUser.token);
        setStores(storesData);
        
        const groups = await fetchProductGroups();
        setProductGroups(groups);
      } catch (error) {
        //console.error('Error fetching data:', error);
        setError('Failed to load required data. Please try again.');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // In your render/return, add loading state
  if (isLoadingUser) {
      return <div>Loading user data...</div>;
  }
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      // Show loading state while uploading
      setLoading(true);
      
      // Upload all images to Cloudinary
      const uploadPromises = files.map(async (file) => {
        const uploadResult = await uploadImage(file);
        return {
          url: uploadResult.url,
          preview: uploadResult.url
        };
      });
    
      const uploadedImages = await Promise.all(uploadPromises);
    
      setImageFiles(prevImages => [...prevImages, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  // Update removeImage function
  const removeImage = (indexToRemove) => {
    setImageFiles(prevImages => {
      return prevImages.filter((_, index) => index !== indexToRemove);
    });
  };

  const addOption = () => {
    // Only allow adding one color option
    if (options.length === 0) {
      setOptions([{ id: nextOptionId, name: 'Màu sắc', values: [''] }]);
      setNextOptionId(nextOptionId + 1);
    }
  };

  const handleOptionNameChange = (id, value) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, name: value } : opt));
  };

  const handleOptionValueChange = (optionId, valueIndex, value) => {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        const newValues = [...opt.values];
        newValues[valueIndex] = value;
        return { ...opt, values: newValues };
      }
      return opt;
    }));
  };

  const addOptionValue = (optionId) => {
    setOptions(options.map(opt => opt.id === optionId ? { ...opt, values: [...opt.values, ''] } : opt));
  };

  const removeOptionValue = (optionId, valueIndex) => {
    setOptions(options.map(opt => {
      if (opt.id === optionId) {
        if (opt.values.length <= 1) return opt;
        const newValues = opt.values.filter((_, index) => index !== valueIndex);
        return { ...opt, values: newValues };
      }
      return opt;
    }));
  };

  const removeOption = (id) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const addVariant = () => {
    setVariants([...variants, {
      id: nextVariantId,
      sku: '',
      price: '',
      variantImage: null,
      color: '',
      sizes: [],
    }]);
    setNextVariantId(nextVariantId + 1);
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleVariantImageChange = async (variantId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const uploadResult = await uploadImage(file);

      setVariants(variants.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            variantImage: {
              url: uploadResult.url,
              preview: uploadResult.url
            }
          };
        }
        return v;
      }));
    } catch (error) {
      console.error('Error uploading variant image:', error);
      setError('Failed to upload variant image. Please try again.');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const removeVariantImage = (variantId) => {
    setVariants(variants.map(v => {
      if (v.id === variantId && v.variantImage) {
        URL.revokeObjectURL(v.variantImage.preview);
        return { ...v, variantImage: null };
      }
      return v;
    }));
  };

  const addSizeToVariant = (variantId) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          sizes: [...v.sizes, { size: '', quantity: 0 }],
        };
      }
      return v;
    }));
  };

  const handleSizeChange = (variantId, sizeIndex, field, value) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const updatedSizes = v.sizes.map((s, index) =>
          index === sizeIndex ? { ...s, [field]: value } : s
        );
        return { ...v, sizes: updatedSizes };
      }
      return v;
    }));
  };

  const removeSizeFromVariant = (variantId, sizeIndex) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const updatedSizes = v.sizes.filter((_, index) => index !== sizeIndex);
        return { ...v, sizes: updatedSizes };
      }
      return v;
    }));
  };

  const removeVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const productData = {
      name,
      description,
      basePrice: parseFloat(basePrice) || 0,
      categoryId: categoryId, // Changed from categoryIds to categoryId
      storeId: storeId, // Changed from storeIds to storeId
      productGroupIds: selectedProductGroups,
      images: imageFiles.map(img => img.url), // Now just sending the URLs
      options: options.map(opt => ({
        name: opt.name,
        values: opt.values.filter(v => v.trim() !== '')
      })),
      variants: variants.map(v => ({
        sku: v.sku,
        price: parseFloat(v.price) || 0,
        variantImage: v.variantImage ? v.variantImage.url : null, // Send URL instead of file
        color: v.color,
        sizes: v.sizes.map(s => ({ size: s.size, quantity: s.quantity }))
      })),
    };

    try {
      await createProductApi(productData, currentUser.token);
      toast.success('Tạo sản phẩm thành công!');
      navigate('/dashboard/products'); // This should now work
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Thêm sản phẩm mới</h1>

      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <section className="space-y-4 border-b pb-6 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">Nhập Thông Tin Cơ Bản</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên Sản Phẩm</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản</label>
              <input
                type="number"
                id="basePrice"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
        
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <Select
                id="category"
                value={categoryId ? {
                  value: categoryId,
                  label: categories.find(c => c.id === categoryId)?.name
                } : null}
                onChange={(selected) => setCategoryId(selected ? selected.value : null)}
                options={categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))}
                className="basic-select"
                classNamePrefix="select"
                placeholder="Chọn danh mục"
                isClearable
              />
            </div>
            <div>
              <label htmlFor="productGroup" className="block text-sm font-medium text-gray-700 mb-1">Nhóm sản phẩm</label>
              <Select
                isMulti
                id="productGroup"
                value={selectedProductGroups.map(id => ({
                  value: id,
                  label: productGroups.find(g => g.id === id)?.name
                }))}
                onChange={(selected) => setSelectedProductGroups(selected ? selected.map(s => s.value) : [])}
                options={productGroups.map(group => ({
                  value: group.id,
                  label: group.name
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
            <div>
              <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
              <Select
                id="store"
                value={storeId ? {
                  value: storeId,
                  label: stores.find(s => s.id === storeId)?.name
                } : null}
                onChange={(selected) => setStoreId(selected ? selected.value : null)}
                options={stores.map(store => ({
                  value: store.id,
                  label: store.name
                }))}
                className="basic-select"
                classNamePrefix="select"
                placeholder="Chọn cửa hàng"
                isClearable
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-b pb-6 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">Images</h2>
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
            <input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
          </div>

          {imageFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {imageFiles.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-md border border-gray-200"
                    onError={(e) => { e.target.style.display='none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label="Remove image"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 border-b pb-6 border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">Màu sắc</h2>
            <button 
              type="button"
              onClick={addOption}
              className={`flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${options.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={options.length > 0}
            >
              <FaPlus className="mr-1 h-4 w-4" /> Thêm màu
            </button>
          </div>
          
          {options.length === 0 && (
            <div className="p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
              Chưa có màu sắc nào. Nhấn "Thêm màu" để thêm màu cho sản phẩm.
            </div>
          )}
          
          {options.map((option, optionIndex) => (
            <div key={option.id} className="p-4 border border-gray-200 rounded-md space-y-3 bg-gray-50">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Tên màu (VD: Màu sắc)"
                  value={option.name}
                  onChange={(e) => handleOptionNameChange(option.id, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  readOnly
                />
                <button type="button" onClick={() => removeOption(option.id)} className="text-red-500 hover:text-red-700 p-1">
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
              <div className="pl-4 space-y-2">
                <label className="block text-sm font-medium text-gray-600">Giá trị màu</label>
                {option.values.map((value, valueIndex) => (
                  <div key={valueIndex} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Giá trị (VD: Đỏ, Xanh)"
                      value={value}
                      onChange={(e) => handleOptionValueChange(option.id, valueIndex, e.target.value)}
                      className="flex-grow px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {option.values.length > 1 && (
                      <button type="button" onClick={() => removeOptionValue(option.id, valueIndex)} className="text-red-500 hover:text-red-700 p-1">
                        <FaTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addOptionValue(option.id)} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                  <FaPlus className="mr-1 h-3 w-3" /> Thêm giá trị
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">Biến thể sản phẩm</h2>
            <button
              type="button"
              onClick={addVariant}
              disabled={options.length === 0}
              className={`flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${options.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPlus className="mr-1 h-4 w-4" /> Thêm biến thể
            </button>
          </div>
          {variants.map((variant, variantIndex) => (
            <div key={variant.id} className="p-4 border border-gray-200 rounded-md space-y-3 bg-gray-50 relative">
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                aria-label="Remove Variant"
              >
                <FaTrash className="h-4 w-4" />
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh biến thể</label>
                <div className="flex items-center space-x-4">
                  {variant.variantImage ? (
                    <div className="relative group w-24 h-24">
                      <img
                        src={variant.variantImage.preview}
                        alt={`Variant ${variant.id} preview`}
                        className="w-full h-full object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(variant.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        aria-label="Remove variant image"
                      >
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-2 border-2 border-dashed border-gray-300 rounded-md">
                      <FaPlus className="mx-auto h-6 w-6 text-gray-400" />
                      <span className="block text-xs text-gray-500 mt-1">Tải ảnh lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantImageChange(variant.id, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                  <select
                    value={variant.color}
                    onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                  >
                    <option value="" disabled>Chọn màu</option>
                    {options.map(opt => (
                      opt.values.map((val, idx) => (
                        <option key={idx} value={val}>{val}</option>
                      ))
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kích cỡ và số lượng</label>
                {variant.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="flex items-center space-x-2 mb-2">
                    <select
                      value={size.size}
                      onChange={(e) => handleSizeChange(variant.id, sizeIndex, 'size', e.target.value)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                      <option value="" disabled>Chọn kích cỡ</option>
                      {[32,33,34,36, 37, 38, 39, 40, 41, 42, 43, 44].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={size.quantity}
                      onChange={(e) => handleSizeChange(variant.id, sizeIndex, 'quantity', e.target.value)}
                      placeholder="Số lượng"
                      min="0"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSizeFromVariant(variant.id, sizeIndex)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSizeToVariant(variant.id)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <FaPlus className="mr-1 h-3 w-3" /> Thêm kích cỡ
                </button>
              </div>
            </div>
          ))}
        </section>

        <div className="pt-5">
          <div className="flex justify-end">
            <button type="button" onClick={() => navigate(-1)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
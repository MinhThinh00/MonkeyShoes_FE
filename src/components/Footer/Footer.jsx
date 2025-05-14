import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về chúng tôi</h3>
            <p className="text-gray-600 mb-4">
              Chuyên cung cấp các sản phẩm giày thể thao chính hãng với chất lượng tốt nhất cho khách hàng.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/minh.thinh.69857" className="text-gray-600 hover:text-blue-600 transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-600 transition-colors">
                <FaYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-gray-600 mt-1" />
                <span className="text-gray-600">123 Đường ABC, Quận XYZ, TP. Hà Nội</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-gray-600" />
                <span className="text-gray-600">0123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-600" />
                <span className="text-gray-600">minhthinh3002@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Đăng ký nhận tin</h3>
            <p className="text-gray-600 mb-4">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="text-center text-gray-600">
            <p>&copy; Monkey Shoes-code by minhthinh</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
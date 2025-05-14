import React from 'react';
import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import ProductList from '../components/ProductList/ProductList';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  return (
    <div>
      <Header />
      <Banner />
      <ProductList />
      {/* Rest of your HomePage content */}
      <Footer />
    </div>
  );
};

export default HomePage;
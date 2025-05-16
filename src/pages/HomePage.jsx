import React from 'react';
import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import ProductList from '../components/ProductList/ProductList';
import Footer from '../components/Footer/Footer';
import StoreSelector from '../components/StoreSelector/StoreSelector';

const HomePage = () => {
  return (
    <div>
      <Header />
      {/* <div className="container mx-auto px-4 py-4">
        <StoreSelector />
      </div> */}
      <Banner />
      <ProductList />
      {/* Rest of your HomePage content */}
      <Footer />
    </div>
  );
};

export default HomePage;
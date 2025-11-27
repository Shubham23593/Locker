import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';

const FilterData = () => {
    const filterProducts = useSelector(state => state.filterProduct.filteredData);

    return (
        <div className="mx-auto py-12 px-4 md:px-16 lg:px-24">
            <h2 className="text-2xl font-bold mb-6 text-center">
                SHOP
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 cursor-auto">
                {filterProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default FilterData;

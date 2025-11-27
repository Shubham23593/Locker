import React from "react";
import WomenCategory from '../assets/Images/17 pro ma.jpg';
import ManCategory from '../assets/Images/galaxy-s25-ultra-features-kv banner.jpg';
import KidCategory from '../assets/Images/vivo-x200-with-zeiss-imaging banner.png'; 

const categories = [
  {
    title: '',
    imageUrl: ManCategory, 
  },
  {
    title: '',
    imageUrl: WomenCategory,
  },
  {
    title: '',
    imageUrl: KidCategory,
  },
];

const CategorySection = () => {
  return (
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <div
          key={index}
          className="relative h-64 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <img
            src={category.imageUrl}
            alt={category.title}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
          <div className="absolute top-20 left-12">
            <p className="text-xl font-bold">{category.title}</p>
            <p className="text-gray-600"></p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategorySection; 

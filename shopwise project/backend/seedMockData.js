import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const mockProducts = [
  {
    name: "Apple iPhone 17 Pro Max",
    price: 154900,
    brand: "Apple",
    category: "Apple",
    image: "https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/original/cuKJrn3wEM-appleiphone17promax-mp-494741644-i-1-1200wx1200h. jpeg",
    stock: 50,
    rating: 4.5,
    description: "Latest iPhone with advanced features",
    isActive: true
  },
  {
    name: "Galaxy S25 Ultra 5G",
    price: 189000,
    brand: "Samsung",
    category: "Samsung",
    image: "https://images.samsung.com/is/image/samsung/p6pim/in/2501/gallery/in-galaxy-s25-ultra-s938-sm-s938bztcins-545247094",
    stock: 30,
    rating: 4.7,
    description: "Premium Samsung flagship",
    isActive: true
  },
  {
    name: "Vivo X200",
    price: 90000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.reliancedigital.in/medias/Vivo-X200-Mobile-Phone-494423128-i-1-1200Wx1200H",
    stock: 40,
    rating: 4.3,
    description: "Vivo flagship phone",
    isActive: true
  },
  {
    name: "Samsung Galaxy Z flip 7",
    price: 91743,
    brand: "Samsung",
    category: "Samsung",
    image: "https://vsprod.vijaysales.com/media/catalog/product/i/n/in-galaxy-zflip7. png",
    stock: 25,
    rating: 4.6,
    description: "Foldable smartphone",
    isActive: true
  },
  {
    name: "Samsung S25",
    price: 80999,
    brand: "Samsung",
    category: "Samsung",
    image: "https://images. samsung.com/is/image/samsung/p6pim/in/2501/gallery/in-galaxy-s25-s931-sm-s931bzeains-545247022",
    stock: 50,
    rating: 4.5,
    description: "Latest Samsung flagship",
    isActive: true
  },
  {
    name: "iPhone 17",
    price: 79900,
    brand: "Apple",
    category: "Apple",
    image: "https://cdn. jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/original/-7iRIOcdWH-apple-iphone17-494741626-i-1-1200wx1200h.jpeg",
    stock: 50,
    rating: 4.4,
    description: "iPhone 17",
    isActive: true
  },
  {
    name: "Samsung Galaxy Z Fold7",
    price: 174999,
    brand: "Samsung",
    category: "Samsung",
    image: "https://vsprod.vijaysales.com/media/catalog/product/i/n/in-galaxy-z-fold7-f966-sm-f966bdbgins-547543120_2.jpg",
    stock: 20,
    rating: 4.8,
    description: "Premium foldable phone",
    isActive: true
  },
  {
    name: "Samsung S24 Ultra",
    price: 120999,
    brand: "Samsung",
    category: "Samsung",
    image: "https://www.designinfo.in/wp-content/uploads/2023/10/Samsung-Galaxy-S23-Ultra-256GB-Unlocked-Lavender-1. webp",
    stock: 35,
    rating: 4.7,
    description: "S24 Ultra flagship",
    isActive: true
  },
  {
    name: "Galaxy S25 Edge",
    price: 109999,
    brand: "Samsung",
    category: "Samsung",
    image: "https://vsprod.vijaysales.com/media/catalog/product/s/2/s25_titanium_jetblack. jpg",
    stock: 45,
    rating: 4.6,
    description: "Edge display phone",
    isActive: true
  },
  {
    name: "Galaxy A56 5G",
    price: 44999,
    brand: "Samsung",
    category: "Samsung",
    image: "https://mahajanelectronics.com/cdn/shop/files/Samsung-Galaxy-A56-5G-Awesome-Olive-BAck. png",
    stock: 60,
    rating: 4.2,
    description: "Mid-range Samsung",
    isActive: true
  },
  {
    name: "Samsung Galaxy S24 FE",
    price: 42799,
    brand: "Samsung",
    category: "Samsung",
    image: "https://www. 91-img.com/gallery_images_uploads/e/2/e2a6726fec453aa75140c30b91ed638393a97ac0.jpg",
    stock: 55,
    rating: 4.3,
    description: "Fan Edition phone",
    isActive: true
  },
  {
    name: "iPhone 16 Pro Max",
    price: 130000,
    brand: "Apple",
    category: "Apple",
    image: "https://in.static. webuy.com/product_images/Phones/Phones%20iPhone/SAPPIP16PM256GWTUNLC_l.jpg",
    stock: 30,
    rating: 4.8,
    description: "iPhone 16 Pro Max",
    isActive: true
  },
  {
    name: "iPhone 15",
    price: 71500,
    brand: "Apple",
    category: "Apple",
    image: "https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-15-lineup-color-lineup-geo-230912_big.jpg. large.jpg",
    stock: 40,
    rating: 4.5,
    description: "iPhone 15",
    isActive: true
  },
  {
    name: "iPhone 14 Pro Max",
    price: 110000,
    brand: "Apple",
    category: "Apple",
    image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple",
    stock: 25,
    rating: 4.7,
    description: "iPhone 14 Pro Max",
    isActive: true
  },
  {
    name: "iPhone 14",
    price: 60000,
    brand: "Apple",
    category: "Apple",
    image: "https://buy.cashforphone.in/cdn/shop/files/Apple-iPhone-14-Plus-Blue-1_ff0291e5-3828-475a-9fdd-ccc348482e77.jpg",
    stock: 35,
    rating: 4.4,
    description: "iPhone 14",
    isActive: true
  },
  {
    name: "iPhone 13 Pro Max",
    price: 90000,
    brand: "Apple",
    category: "Apple",
    image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-pro-max-blue-select",
    stock: 30,
    rating: 4.6,
    description: "iPhone 13 Pro Max",
    isActive: true
  },
  {
    name: "iPhone 13",
    price: 59000,
    brand: "Apple",
    category: "Apple",
    image: "https://vsprod.vijaysales.com/media/catalog/product/1/9/193010-image4_3.jpg",
    stock: 40,
    rating: 4.3,
    description: "iPhone 13",
    isActive: true
  },
  {
    name: "Xiaomi 15",
    price: 64999,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i03.appmifile.com/783_item_in/17/03/2025/d8ecae0f2ed29d943d83c44afac14873. png",
    stock: 50,
    rating: 4.4,
    description: "Xiaomi 15 flagship",
    isActive: true
  },
  {
    name: "Xiaomi 14",
    price: 62999,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://img-prd-pim. poorvika.com/product/xiaomi-14-5g-white-512gb-12gb-ram-front-back-view. png",
    stock: 45,
    rating: 4.3,
    description: "Xiaomi 14",
    isActive: true
  },
  {
    name: "Xiaomi MIX Flip",
    price: 70999,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i02.appmifile.com/562_operatorx_operatorx_opx/26/09/2024/dbd8ab2e47beb33c1e0b9aa96287b35c.png",
    stock: 30,
    rating: 4.5,
    description: "Foldable Xiaomi phone",
    isActive: true
  },
  {
    name: "Xiaomi Mix Fold 3",
    price: 120000,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i02.appmifile.com/851_operatorx_operatorx_opx/05/03/2024/c12e2ad71964ca90b59af9112407b9d7.png",
    stock: 20,
    rating: 4.6,
    description: "Premium foldable",
    isActive: true
  },
  {
    name: "Xiaomi 15 Ultra",
    price: 110000,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i02.appmifile.com/492_operatorx_operatorx_opx/02/03/2025/5667c36c15d47b90d0faa7ac23c9f276.png",
    stock: 25,
    rating: 4.7,
    description: "Xiaomi 15 Ultra",
    isActive: true
  },
  {
    name: "Xiaomi 13 Ultra",
    price: 99999,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i02.appmifile.com/878_operatorx_operatorx_opx/07/06/2023/4affff37b341e19992e993cdedd0baaf.png",
    stock: 30,
    rating: 4.5,
    description: "Xiaomi 13 Ultra",
    isActive: true
  },
  {
    name: "Xiaomi 14T Pro",
    price: 48525,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://i02.appmifile.com/675_operatorx_operatorx_opx/26/09/2024/f81bba823d0ac2abe8c07ce09e2eb11f.png",
    stock: 50,
    rating: 4.2,
    description: "Xiaomi 14T Pro",
    isActive: true
  },
  {
    name: "Xiaomi 14 Ultra",
    price: 134406,
    brand: "Xiaomi",
    category: "Xiaomi",
    image: "https://images-cdn.ubuy.co.in/665236641d8ed32ece43672f-xiaomi-14-ultra-5g-4g-lte-512gb. jpg",
    stock: 15,
    rating: 4.8,
    description: "Xiaomi 14 Ultra",
    isActive: true
  },
  {
    name: "OnePlus 13s",
    price: 54000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://media-ik.croma.com/prod/https://media. tatacroma.com/Croma%20Assets/Communication/Mobiles/Images/315929_0_by9jmx. png",
    stock: 40,
    rating: 4.4,
    description: "OnePlus 13s",
    isActive: true
  },
  {
    name: "OnePlus 13",
    price: 89997,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://m.media-amazon.com/images/I/715k0WQtg9L._SL1500_.jpg",
    stock: 35,
    rating: 4.6,
    description: "OnePlus 13",
    isActive: true
  },
  {
    name: "OnePlus 10R",
    price: 20000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://image01.oneplus.net/ebp/202204/25/1-m00-3f-8b-cpgm7gl2vbgac-lsaacfzqmrlpu0383. png",
    stock: 60,
    rating: 4.0,
    description: "OnePlus 10R",
    isActive: true
  },
  {
    name: "OnePlus Nord",
    price: 32000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://oasis.opstatics.com/content/dam/oasis/page/2024/in/product/nord-ce4/specs-img/blue-img. png",
    stock: 55,
    rating: 4.1,
    description: "OnePlus Nord",
    isActive: true
  },
  {
    name: "OnePlus Nord 3",
    price: 26000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://image01.oneplus.net/ebp/202307/05/1-m00-51-93-cpgm7ma5ioxagxdbaadeflzkgso827.png",
    stock: 50,
    rating: 4.2,
    description: "OnePlus Nord 3",
    isActive: true
  },
  {
    name: "OnePlus 11R",
    price: 31000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://m.media-amazon.com/images/I/414+xRBltFL._SY300_SX300_. jpg",
    stock: 45,
    rating: 4.3,
    description: "OnePlus 11R",
    isActive: true
  },
  {
    name: "OnePlus Nord 5",
    price: 35999,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://oasis.opstatics. com/content/dam/oasis/page/2024/in/5g-phone/nord-4/specs/nord-4-black.png",
    stock: 40,
    rating: 4.3,
    description: "OnePlus Nord 5",
    isActive: true
  },
  {
    name: "OnePlus 12",
    price: 55000,
    brand: "OnePlus",
    category: "OnePlus",
    image: "https://image01.oneplus.net/ebp/202401/09/1-m00-5c-15-cpgm7gv8p5qak9jtaakwh1hxyds267.png",
    stock: 35,
    rating: 4.5,
    description: "OnePlus 12",
    isActive: true
  },
  {
    name: "Vivo V50 5G",
    price: 40000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page-2025/x200-series/x200-pro/specs/gallery/X200-Pro-White. png",
    stock: 50,
    rating: 4.2,
    description: "Vivo V50 5G",
    isActive: true
  },
  {
    name: "Vivo T3 Pro",
    price: 22000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page/t3-pro/pc-specs/vivo-T3-Pro-Sand-Orange. png",
    stock: 60,
    rating: 4.0,
    description: "Vivo T3 Pro",
    isActive: true
  },
  {
    name: "Vivo V40e",
    price: 25000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page/v40e/v40e-specs-pc. png",
    stock: 55,
    rating: 4.1,
    description: "Vivo V40e",
    isActive: true
  },
  {
    name: "Vivo Y53s",
    price: 20000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page/y-series/y58-5g/specs/gallery/Y58-5G-White.png",
    stock: 65,
    rating: 3.9,
    description: "Vivo Y53s",
    isActive: true
  },
  {
    name: "Vivo V29e",
    price: 25000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page/v29e/specs/v29e-specs-pc.png",
    stock: 50,
    rating: 4.1,
    description: "Vivo V29e",
    isActive: true
  },
  {
    name: "Vivo V29 Pro",
    price: 25000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page/v29-pro/specs/v29-pro-specs-pc.png",
    stock: 45,
    rating: 4.2,
    description: "Vivo V29 Pro",
    isActive: true
  },
  {
    name: "Vivo X100 Pro",
    price: 67000,
    brand: "Vivo",
    category: "Vivo",
    image: "https://www.vivo. com/content/dam/vivo/product-page-2024/x100-series/x100-pro/specs/gallery/X100-Pro-White.png",
    stock: 30,
    rating: 4.5,
    description: "Vivo X100 Pro",
    isActive: true
  },
  {
    name: "Oppo Find X8 Pro",
    price: 85000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo.com/content/dam/oppo/common/mkt/v2-2/find-x8-pro-all/navigation/find-x8-pro-black-pc-400-v1.png",
    stock: 25,
    rating: 4.6,
    description: "Oppo Find X8 Pro",
    isActive: true
  },
  {
    name: "Oppo Reno 14 Pro",
    price: 49999,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo. com/content/dam/oppo/common/mkt/v2-2/reno14-pro-5g-in/navigation/Reno14-Pro-5G-Brown-Navigation-PC. png",
    stock: 40,
    rating: 4.3,
    description: "Oppo Reno 14 Pro",
    isActive: true
  },
  {
    name: "Oppo Reno 10 Pro Plus",
    price: 46000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo.com/content/dam/oppo/common/mkt/v2-2/reno10-pro-plus-5g-navigation-violet. png",
    stock: 35,
    rating: 4.2,
    description: "Oppo Reno 10 Pro Plus",
    isActive: true
  },
  {
    name: "Oppo RENO 13 F",
    price: 46999,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo. com/content/dam/oppo/common/mkt/v2-2/reno13f-5g-in/navigation/Reno13F-5G-IN-Green-PC-400. png",
    stock: 40,
    rating: 4.2,
    description: "Oppo RENO 13 F",
    isActive: true
  },
  {
    name: "Oppo Reno 12 Pro",
    price: 52000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo. com/content/dam/oppo/common/mkt/v2-2/reno12-pro-5g-in/navigation/Reno12-Pro-5G-Brown-Navigation-PC.png",
    stock: 30,
    rating: 4.4,
    description: "Oppo Reno 12 Pro",
    isActive: true
  },
  {
    name: "Oppo Find N3 Flip 5G",
    price: 66000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo.com/content/dam/oppo/common/mkt/v2-2/find-n3-flip-navigation-black.png",
    stock: 20,
    rating: 4.5,
    description: "Foldable Oppo phone",
    isActive: true
  },
  {
    name: "Oppo Reno10 5G",
    price: 29000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo. com/content/dam/oppo/common/mkt/v2-2/reno10-5g-navigation-blue.png",
    stock: 50,
    rating: 4.0,
    description: "Oppo Reno10 5G",
    isActive: true
  },
  {
    name: "Oppo Reno13 5G",
    price: 35000,
    brand: "Oppo",
    category: "Oppo",
    image: "https://image01.oppo.com/content/dam/oppo/common/mkt/v2-2/reno13-5g-in/navigation/Reno13-5G-IN-Blue-PC-400.png",
    stock: 45,
    rating: 4.1,
    description: "Oppo Reno13 5G",
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env. MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing products`);

    console.log(`📥 Inserting ${mockProducts.length} products... `);
    const products = await Product.insertMany(mockProducts);
    console.log(`✅ Successfully added ${products.length} products! `);

    console.log('\n📊 Summary:');
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Brands: ${[...new Set(products.map(p => p.brand))].join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();
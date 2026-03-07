import React, { useEffect, useRef } from "react";
import { Categories, mockData } from "../assets/mockData";
import HeroVideo from "../assets/Videos/videoplayback.mp4";
import InfoSection from "../components/InfoSection";
import CategorySection from "../components/CategorySection";
import { setProducts } from "../redux/productSlice";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import { gsap } from "gsap";
import "@splidejs/react-splide/css";

const brandImages = {
  Apple:
    "https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/original/cuKJrn3wEM-appleiphone17promax-mp-494741644-i-1-1200wx1200h.jpeg",
  Samsung:
    "https://vsprod.vijaysales.com/media/catalog/product/i/n/in-galaxy-z-fold7-f966-sm-f966bdbgins-547543120_2.jpg?optimize=medium&fit=bounds&height=500&width=500",
  Xiaomi:
    "https://i03.appmifile.com/783_item_in/17/03/2025/d8ecae0f2ed29d943d83c44afac14873.png?thumb=1&f=webp&q=85",
  OnePlus:
    "https://media-ik.croma.com/prod/https://media.tatacroma.com/Croma%20Assets/Communication/Mobiles/Images/315929_0_by9jmx.png?tr=w-640",
  Vivo: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSDtFXepoLeHqsNH25FT6dZROOpoPBRgj9-ROc8Sus9CB25lIgBS_rdPAAFOFf-RLa9sub1oeJmuNU4KXQonmhbmcw5xiP67eGciiK45OpYm4P199ufZA3d",
  Oppo: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTdXi7BPGzQjM89mIrZeOgg4VUefg_-rnO-hAJ4AgvlBaGDyfhE2hswoQc1XvttEnoSS5rRpHQsQPHq0cM4xqMl-YB_EGrKisaZ9rXPP7XtL741JrVC6y6v",
};

// ✅ Individual brand list item with its own image + GSAP quickTo
const BrandItem = ({ category, onClick }) => {
  const imgRef = useRef(null);
  const firstEnter = useRef(true);
  const setX = useRef(null);
  const setY = useRef(null);
  const fadeAnim = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // ✅ Set center-origin like the original
    gsap.set(img, { xPercent: -50, yPercent: -50 });

    // ✅ quickTo — same as original
    setX.current = gsap.quickTo(img, "x", { duration: 0.4, ease: "power3" });
    setY.current = gsap.quickTo(img, "y", { duration: 0.4, ease: "power3" });

    // ✅ fade tween — same as original
    fadeAnim.current = gsap.to(img, {
      autoAlpha: 1,
      ease: "none",
      paused: true,
      duration: 0.15,
    });
  }, []);

  const align = (e) => {
    if (firstEnter.current) {
      // Snap to position instantly on first enter
      setX.current(e.clientX, e.clientX);
      setY.current(e.clientY, e.clientY);
      firstEnter.current = false;
    } else {
      setX.current(e.clientX);
      setY.current(e.clientY);
    }
  };

  const handleMouseEnter = (e) => {
    firstEnter.current = true;
    fadeAnim.current.play();
    align(e);
    document.addEventListener("mousemove", align);
  };

  const handleMouseLeave = () => {
    fadeAnim.current.reverse();
    document.removeEventListener("mousemove", align);
  };

  const img = brandImages[category];

  return (
    <li
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="flex items-center text-sm font-medium cursor-pointer hover:text-black p-2 rounded transition-all duration-300 group"
    >
      {img && (
        <img
          ref={imgRef}
          src={img}
          alt={category}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "220px",
            height: "260px",
            objectFit: "contain",
            zIndex: 9999,
            opacity: 0,
            visibility: "hidden",
            pointerEvents: "none",
            background: "white",
            borderRadius: "16px",
            padding: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
          }}
        />
      )}

      <div className="w-2 h-2 border border-[#3B2F2F] rounded-full mr-3 group-hover:bg-white flex-shrink-0"></div>
      {category}
    </li>
  );
};

// ─────────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, searchTerm } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(setProducts(mockData));
  }, [dispatch]);

  const handleClick = () => navigate("/shop");

  const handleCategoryClick = (brand) => {
    brand === "All"
      ? navigate("/shop")
      : navigate(`/shop?brand=${encodeURIComponent(brand)}`);
  };

  const searchResults = searchTerm
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  return (
    <div className="bg-white mt-2 px-4 md:px-16 lg:px-24 py-4">
      {/* Search Results */}
      {searchTerm && (
        <div className="container mx-auto py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Search Results for "{searchTerm}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 cursor-pointer">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-lg">No products found.</p>
          )}
        </div>
      )}

      <div className="container mx-auto py-4 flex flex-col md:flex-row space-x-2">
        {/* SHOP BY BRAND panel */}
        <div className="w-full md:w-3/12 h-auto rounded-xl overflow-hidden shadow-md">
          <div className="bg-[#3B2F2F] text-white text-xs font-bold px-3 py-3 tracking-wider rounded-t-xl">
            SHOP BY BRAND
          </div>

         <ul class="space-y-4 bg-gray-100 p-2.5 rounded-b-xl">
            {Categories.map((category, index) => (
              <BrandItem
                key={index}
                category={category}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </ul>
        </div>

        {/* Hero Video */}
        <div className="w-full md:w-9/12 mt-8 md:mt-0 h-[406px] relative rounded-xl overflow-hidden">
          <video
            src={HeroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute top-16 left-8 text-white max-w-sm">
            <p className="mb-4 text-lg">Shop. Save. Smile.</p>
            <h2 className="text-2xl mt-2.5 font-bold">Welcome to ShopWise</h2>
            <p className="mt-1 text-sm">Trusted by thousands.</p>
            <button
              onClick={handleClick}
              className="bg-[#3B2F2F] px-4 py-1.5 text-white mt-4 hover:bg-red-700 transform transition-transform duration-300 hover:scale-105 rounded-lg"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      <InfoSection />
      <CategorySection />

      {/* Top Products */}
      <div className="container mx-auto py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Top Products</h2>
        {products && products.length > 0 ? (
          <Splide
            options={{
              type: "loop",
              drag: "free",
              focus: "center",
              perPage: 4,
              gap: "1rem",
              arrows: false,
              pagination: false,
              autoScroll: { speed: 1, pauseOnHover: true, pauseOnFocus: false },
              breakpoints: {
                1024: { perPage: 3 },
                768: { perPage: 2 },
                640: { perPage: 1 },
              },
            }}
            extensions={{ AutoScroll }}
          >
            {products.map((product) => (
              <SplideSlide key={product.id}>
                <ProductCard product={product} />
              </SplideSlide>
            ))}
          </Splide>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

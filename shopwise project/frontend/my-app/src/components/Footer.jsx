import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null, "success", or "error"
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = {
      access_key: "a6466566-2d8a-4f93-9863-d83a517ade65", // ✅ your access key here
      email: email,
      subject: "New Subscriber from ShopWise",
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail(""); // Clear the input
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#3B2F2F] text-white py-10 px-4 md:px-16 lg:px-24">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Logo and Description */}
        <div>
          <h3 className="text-2xl font-bold tracking-wide">ShopWise</h3>
          <p className="mt-4 text-sm text-gray-300 leading-relaxed">
            Your one-stop for all your needs. Shop with us and experience the best online shopping experience.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:items-center">
          <h4 className="text-xl font-semibold">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:underline hover:text-gray-200">Home</Link></li>
            <li><Link to="/Shop" className="hover:underline hover:text-gray-200">Shop</Link></li>
            <li><Link to="/Contact" className="hover:underline hover:text-gray-200">Contact</Link></li>
            <li><Link to="/About" className="hover:underline hover:text-gray-200">About</Link></li>
          </ul>
        </div>

        {/* Social and Newsletter */}
        <div>
          <h4 className="text-xl font-semibold">Follow Us</h4>
          <div className="flex space-x-4 mt-4 text-2xl">
            <a
              href="https://www.instagram.com/_shubham_7883_/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/in/shubham-dalvi-7586b0342/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
          </div>

          {/* Subscribe Form */}
          <form onSubmit={handleSubmit} className="flex mt-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-l bg-[#4B3F3F] text-sm text-white placeholder-gray-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2 rounded-r"
            >
              {loading ? "Submitting..." : "Subscribe"}
            </button>
          </form>

          {/* Notification */}
          {status === "success" && (
            <p className="mt-3 text-green-400 text-sm">Thank you for subscribing!</p>
          )}
          {status === "error" && (
            <p className="mt-3 text-red-400 text-sm">Oops! Something went wrong. Please try again.</p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-600 mt-8 pt-4 flex flex-col md:flex-row justify-between text-xs text-gray-400">
        <p>&copy; 2025 ShopWise. All rights reserved.</p>
        <div className="space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-gray-200">Privacy Policy</a>
          <a href="#" className="hover:text-gray-200">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("access_key", "a6466566-2d8a-4f93-9863-d83a517ade65"); // ✅ NEW ACCESS KEY
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("message", formData.message);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      console.log("🌐 Web3Forms response:", data);

      if (data.success) {
        toast.success("✅ Thanks for contacting us! We'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(`❌ ${data.message || "Failed to send. Please try again."}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-lg w-full border border-gray-100">
        <h2 className="text-3xl font-bold mb-4 text-center text-[#3B2F2F]">
          Contact Us
        </h2>
        <p className="text-center text-gray-500 mb-8">
          We'd love to hear from you. Please fill out the form below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B2F2F] focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B2F2F] focus:border-transparent transition duration-200"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Your message..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3B2F2F] focus:border-transparent transition duration-200"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#3B2F2F] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[#2a2222] transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

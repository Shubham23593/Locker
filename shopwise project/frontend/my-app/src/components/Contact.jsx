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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full transform transition hover:scale-[1.02] hover:shadow-[rgba(0,0,0,0.3)_0px_20px_30px] hover:translate-y-[-3px]">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-[#3B2F2F] drop-shadow">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 mb-6">
          We'd love to hear from you. Please fill out the form below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Your message..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#3B2F2F] text-white py-2 rounded-lg shadow-lg hover:shadow-xl transform active:translate-y-[2px] transition ${
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

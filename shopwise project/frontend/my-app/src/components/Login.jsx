import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex - justify-center bg-gradient-to-br from-amber-100/50 to-amber-200/50 backdrop-blur-lg">
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md transform hover:-translate-y-1 hover:shadow-amber-300 transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-6">
          Login
        </h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-amber-300 rounded px-3 py-2 bg-white/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-amber-300 rounded px-3 py-2 bg-white/50 backdrop-blur focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            className="w-full bg-amber-900 text-white py-2 rounded hover:bg-amber-800 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-amber-900 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 w-full bg-gray-300/70 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Login;

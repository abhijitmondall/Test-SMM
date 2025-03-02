import { useEffect } from "react";
import { motion } from "framer-motion";

import { BASE_URL } from "../../helpers/settings";

function Login() {
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      window.location.href = `${BASE_URL}/api/v1/users/login`;

      // navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5">
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to InstaConnect
      </motion.h1>
      <p className="mt-4 text-lg md:text-xl text-center">
        Securely connect with Instagram and manage your conversations easily.
      </p>
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-white text-blue-600 font-semibold text-lg rounded-lg shadow-lg hover:bg-gray-200 transition cursor-pointer"
        >
          Login with Instagram
        </button>
      </motion.div>
    </div>
  );
}

export default Login;

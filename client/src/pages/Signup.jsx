import React from "react";
import { Link, useNavigate } from "react-router-dom";
function Signup() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add signup logic, then:
    localStorage.setItem("token", "fake-jwt-token");
    navigate("/client");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          placeholder="Full Name"
          required
          className="border p-3 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          required
          className="border p-3 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="border p-3 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>

      <div className="my-6 flex flex-col gap-3">
        <button className="p-3 border rounded flex justify-center items-center gap-2 hover:bg-gray-100">
          <span>Sign up with Google</span>
        </button>
        <button className="p-3 border rounded flex justify-center items-center gap-2 hover:bg-gray-100">
          <span>Sign up with Facebook</span>
        </button>
      </div>

      <p>
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Signup;

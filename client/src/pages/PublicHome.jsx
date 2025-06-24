import React from "react";
import { Link } from "react-router-dom";

function PublicHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to ProjectDemandHub</h1>
      <p className="mb-6 text-center max-w-lg">
        Request your IT projects and get them delivered professionally.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-100"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default PublicHome;

import React from "react";
import { Link } from "react-router-dom";

 function ClientHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Client Dashboard</h1>
      <nav className="flex gap-4">
        <Link
          to="/client/demands"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          My Demands
        </Link>
        <Link
          to="/client/demands/add"
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-100"
        >
          Add New Demand
        </Link>
        <Link
          to="/client/chat/1"
          className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-100"
        >
          Chat
        </Link>
        <Link
          to="/client/notifications"
          className="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-100"
        >
          Notifications
        </Link>
      </nav>
    </div>
  );

}

export default ClientHome;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Demands() {
  const [demands, setDemands] = useState([]);

  useEffect(() => {
    // TODO: fetch demands from backend API
    // For now, mock data:
    setDemands([
      {
        id: 1,
        projectType: "web",
        status: "pending",
        budget: 1200,
        deadline: "2025-08-30",
      },
      {
        id: 2,
        projectType: "mobile",
        status: "accepted",
        budget: 2000,
        deadline: "2025-09-15",
      },
    ]);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Demands</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Project Type</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Budget ($)</th>
            <th className="border border-gray-300 p-2">Deadline</th>
            <th className="border border-gray-300 p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {demands.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 capitalize">
                {d.projectType}
              </td>
              <td className="border border-gray-300 p-2 capitalize">
                {d.status}
              </td>
              <td className="border border-gray-300 p-2">{d.budget}</td>
              <td className="border border-gray-300 p-2">{d.deadline}</td>
              <td className="border border-gray-300 p-2">
                <Link
                  to={`/client/demands/${d.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
          {demands.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No demands found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Demands;

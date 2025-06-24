import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
function DemandDetail() {
  const { id } = useParams();
  const [demand, setDemand] = useState(null);

  useEffect(() => {
    // TODO: fetch demand detail by id from backend API
    // For now, mock data:
    setDemand({
      id,
      projectType: "web",
      stack: "fullstack",
      preferredLanguage: "React, Node.js",
      database: "PostgreSQL",
      budget: 1500,
      deadline: "2025-08-30",
      description: "Build a project demand management app",
      status: "negotiating",
    });
  }, [id]);

  if (!demand) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Demand Details</h1>

      <p>
        <strong>Project Type:</strong> {demand.projectType}
      </p>
      <p>
        <strong>Stack:</strong> {demand.stack}
      </p>
      <p>
        <strong>Preferred Language:</strong> {demand.preferredLanguage}
      </p>
      <p>
        <strong>Database:</strong> {demand.database}
      </p>
      <p>
        <strong>Budget:</strong> ${demand.budget}
      </p>
      <p>
        <strong>Deadline:</strong> {demand.deadline}
      </p>
      <p>
        <strong>Description:</strong>
      </p>
      <p className="whitespace-pre-wrap mb-6">{demand.description}</p>
      <p>
        <strong>Status:</strong> {demand.status}
      </p>

      <Link
        to="/client/demands"
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Demands
      </Link>
    </div>
  );
}

export default DemandDetail;

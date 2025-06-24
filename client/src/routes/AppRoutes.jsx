import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import PublicHome from "../pages/PublicHome";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ClientHome from "../pages/ClientHome";
import AddDemand from "../pages/AddDemand";
import Demands from "../pages/Demands";
import DemandDetail from "../pages/DemandDetail";
import Chat from "../pages/Chat";
import Notifications from "../pages/Notifications";
import ClientLayout from "../layout/ClientLayout";

const isAuthenticated = () => !!localStorage.getItem("token");

const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" />;

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Client Private Routes under Layout */}
      <Route
        path="/client"
        element={
          <PrivateRoute>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ClientHome />} />
        <Route path="demands" element={<Demands />} />
        <Route path="demands/add" element={<AddDemand />} />
        <Route path="demands/:id" element={<DemandDetail />} />
        <Route path="chat/:conversationId" element={<Chat />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

import React, { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // TODO: Fetch notifications from backend API
    setNotifications([
      { id: 1, message: "Your demand #1 was accepted." },
      { id: 2, message: "Admin sent a message in your chat." },
    ]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && <p>No notifications yet.</p>}

      <ul className="space-y-3">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className="border p-3 rounded bg-gray-50 hover:bg-gray-100"
          >
            {notif.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;

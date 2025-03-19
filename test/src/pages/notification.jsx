import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const notificationsData = [
  {
    id: 1,
    name: "Lex Murphy",
    message: "requested access to your Project in order to collaborate in Historical Section",
    time: "Today at 10:42 AM",
    avatar: "https://i.pravatar.cc/50?img=1",
    actions: true,
  },
  {
    id: 2,
    name: "Ray Arnold",
    message: "requested access to your Project in order to collaborate in Architectural Section",
    time: "Last Wednesday at 11:42 AM",
    avatar: "https://i.pravatar.cc/50?img=2",
    actions: true,
  },
  {
    id: 3,
    name: "Denise Nedry",
    message: "is asking to start a conflict with you",
    quote: "Oh, I find a little mistake about Casbah place in your project",
    time: "Last Wednesday at 9:42 PM",
    avatar: "https://i.pravatar.cc/50?img=3",
    actions: false,
  },
  {
    id: 4,
    name: "Denise Nedry",
    message: "commented on Isla Nublar **SOC2 compliance report**",
    quote: "Your status has been approved from viewer to expert. You can now share your projects.",
    time: "Last week at 9:42 AM",
    avatar: "https://i.pravatar.cc/50?img=4",
    actions: false,
  },
];

const NotificationBar = () => {
  const [notifications, setNotifications] = useState(notificationsData);

  const markAllAsRead = () => {
    setNotifications([]);
  };

  return (
    <div className="w-96 bg-[#F5EFE2] shadow-lg rounded-lg p-4 max-h-[500px] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="font-semibold text-lg text-gray-800">Notifications</h2>
        <button className="text-gray-500 text-sm hover:text-gray-700 flex items-center" onClick={markAllAsRead}>
          Mark all as read <FaCheckCircle className="ml-1 text-green-600" />
        </button>
      </div>

      {/* Notification Items */}
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No new notifications</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="flex items-start p-3 border-b last:border-none">
            {/* Profile Picture */}
            <img src={notification.avatar} alt={notification.name} className="w-10 h-10 rounded-full mr-3" />

            {/* Notification Content */}
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{notification.name}</span> {notification.message}
              </p>

              {/* Quoted Message (Optional) */}
              {notification.quote && (
                <p className="mt-1 p-2 text-xs italic bg-gray-100 border-l-4 border-[#9B8562] text-gray-600 rounded">
                  "{notification.quote}"
                </p>
              )}

              {/* Time */}
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>

              {/* Action Buttons (If Needed) */}
              {notification.actions && (
                <div className="mt-2 space-x-2">
                  <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Approve</button>
                  <button className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-400">Decline</button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationBar;

// src/components/DashboardCard.jsx
import { Link } from "react-router-dom";

const DashboardCard = ({ icon, title, description, link }) => (
  <Link to={link} className="block">
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

export default DashboardCard;
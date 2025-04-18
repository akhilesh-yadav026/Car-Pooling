import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Wallet, CalendarClock, MapPin } from "lucide-react";

const CaptainEarnings = () => {
  const [earnings, setEarnings] = useState({ total: 0, today: 0 });
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/captain/profile`,
          {
            headers: { token },
          }
        );

        const captain = res.data.captain;
        let total = 0;
        let today = 0;
        const todayDate = new Date().toISOString().split("T")[0];

        const completedRides = captain.rides.filter((ride) => ride.status === "completed");

        completedRides.forEach((ride) => {
          total += ride.fare;
          const rideDate = new Date(ride.updatedAt).toISOString().split("T")[0];
          if (rideDate === todayDate) today += ride.fare;
        });

        setEarnings({ total, today });
        setRideHistory(completedRides.reverse()); // latest first
        setLoading(false);
      } catch (error) {
        console.error("Error loading earnings:", error);
        localStorage.removeItem("token");
        navigate("/captain/login");
      }
    };

    fetchEarningsData();
  }, [navigate, token]);

  if (loading) return <div className="p-6">Loading earnings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Earnings Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <Wallet className="text-purple-600" size={24} />
            <div>
              <p className="text-gray-500">Total Earnings</p>
              <p className="text-xl font-semibold">₹{earnings.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <CalendarClock className="text-green-600" size={24} />
            <div>
              <p className="text-gray-500">Today's Earnings</p>
              <p className="text-xl font-semibold">₹{earnings.today.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" size={24} />
            <div>
              <p className="text-gray-500">Completed Rides</p>
              <p className="text-xl font-semibold">{rideHistory.length}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Ride-wise Earnings</h2>
      <div className="bg-white rounded-lg shadow p-4 divide-y">
        {rideHistory.length > 0 ? (
          rideHistory.map((ride) => (
            <div key={ride._id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {ride.pickupLocation} → {ride.dropoffLocation}
                </p>
                <p className="text-sm text-gray-500">{new Date(ride.updatedAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹{ride.fare.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{(ride.distance / 1000).toFixed(1)} km</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-6">No earnings to display.</p>
        )}
      </div>
    </div>
  );
};

export default CaptainEarnings;

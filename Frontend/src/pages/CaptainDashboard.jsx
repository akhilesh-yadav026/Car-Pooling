// src/pages/captain/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardCard from "../components/DashboardCard";
import { Car, CalendarClock, Wallet, Star, User, Settings, LogOut } from "lucide-react";
import StatsCard from "../components/StateCard";

const CaptainDashboard = () => {
  const [captainData, setCaptainData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch captain profile
        const profileRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/captain/profile`,
          {
            headers: { token },
          }
        );
        
        // Fetch captain stats (you'll need to create this endpoint)
        const statsRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/captain/stats`,
          {
            headers: { token },
          }
        );

        setCaptainData(profileRes.data.captain);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        localStorage.removeItem("token");
        navigate("/captain/login");
      }
    };

    fetchData();
  }, [navigate, token]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {captainData.fullname.firstname}!</h1>
      <p className="text-gray-500 mb-8">Here's what's happening with your rides today</p>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Today's Rides" 
          value={stats?.todayRides || 0} 
          change={stats?.rideChange || 0} 
        />
        <StatsCard 
          title="Earnings" 
          value={`$${stats?.todayEarnings?.toFixed(2) || 0}`} 
          change={stats?.earningsChange || 0} 
          isCurrency 
        />
        <StatsCard 
          title="Rating" 
          value={stats?.rating?.toFixed(1) || '0.0'} 
          change={stats?.ratingChange || 0} 
          isRating 
        />
        <StatsCard 
          title="Active Hours" 
          value={stats?.activeHours || 0} 
          change={stats?.hoursChange || 0} 
          unit="hrs" 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          icon={<Car size={24} className="text-blue-600" />}
          title="Start Ride"
          description="Begin a new ride"
          link="/captain/ride/new"
        />
     
        <DashboardCard 
          icon={<Wallet size={24} className="text-purple-600" />}
          title="Earnings"
          description="View your payments"
          link="/captain/earnings"
        />
        <DashboardCard 
          icon={<User size={24} className="text-orange-500" />}
          title="Profile"
          description="Update your details"
          link="/captain/edit-profile"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Rides</h2>
          <button 
            onClick={() => navigate('/captain/rides')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        {stats?.recentRides?.length > 0 ? (
          <div className="space-y-4">
            {stats.recentRides.map((ride) => (
              <div key={ride._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{ride.pickupLocation} to {ride.dropoffLocation}</p>
                  <p className="text-sm text-gray-500">{new Date(ride.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${ride.fare.toFixed(2)}</p>
                  <div className="flex items-center justify-end">
                    <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="text-sm">{ride.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent rides found</p>
        )}
      </div>
    </div>
  );
};

export default CaptainDashboard;
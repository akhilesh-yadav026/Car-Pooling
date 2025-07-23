// // src/pages/captain/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import DashboardCard from "../components/DashboardCard";
// import { Car, CalendarClock, Wallet, Star, User, Settings, LogOut } from "lucide-react";
// import StatsCard from "../components/StateCard";

// const CaptainDashboard = () => {
//   const [captainData, setCaptainData] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [earnings, setEarnings] = useState({
//     total: 0,
//     today: 0,
//   });
//   const [rideStats, setRideStats] = useState({
//     accepted: 0,
//     cancelled: 0,
//     distanceTravelled: 0,
//   });
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch captain profile
//         const profileRes = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/captain/profile`,
//           {
//             headers: { token },
//           }
//         );
        
//         // Calculate earnings and ride stats from the profile data
//         const captain = profileRes.data.captain;
//         calculateEarnings(captain);
        
//         // Fetch captain stats (you'll need to create this endpoint)
//         const statsRes = await axios.get(
//           `${import.meta.env.VITE_SERVER_URL}/captain/stats`,
//           {
//             headers: { token },
//           }
//         );

//         setCaptainData(captain);
//         setStats(statsRes.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         localStorage.removeItem("token");
//         navigate("/captain/login");
//       }
//     };

//     fetchData();
//   }, [navigate, token]);

//   const calculateEarnings = (captain) => {
//     let Totalearnings = 0;
//     let Todaysearning = 0;

//     let acceptedRides = 0;
//     let cancelledRides = 0;
//     let distanceTravelled = 0;

//     const today = new Date();
//     const todayWithoutTime = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate()
//     );

//     captain.rides.forEach((ride) => {
//       if (ride.status == "completed") {
//         acceptedRides++;
//         distanceTravelled += ride.distance;
//       }
//       if (ride.status == "cancelled") cancelledRides++;

//       Totalearnings += ride.fare;
//       const rideDate = new Date(ride.updatedAt);

//       const rideDateWithoutTime = new Date(
//         rideDate.getFullYear(),
//         rideDate.getMonth(),
//         rideDate.getDate()
//       );

//       if (
//         rideDateWithoutTime.getTime() === todayWithoutTime.getTime() &&
//         ride.status === "completed"
//       ) {
//         Todaysearning += ride.fare;
//       }
//     });

//     setEarnings({ 
//       total: Totalearnings, 
//       today: Todaysearning 
//     });
    
//     setRideStats({
//       accepted: acceptedRides,
//       cancelled: cancelledRides,
//       distanceTravelled: Math.round(distanceTravelled / 1000),
//     });
//   };

//   if (loading) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {captainData.fullname.firstname}!</h1>
//       <p className="text-gray-500 mb-8">Here's what's happening with your rides today</p>
      
//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard 
//           title="Today's Rides" 
//           value={stats?.todayRides || rideStats.accepted} 
//           change={stats?.rideChange || 0} 
//         />
//         <StatsCard 
//           title="Today's Earnings" 
//           value={`₹${earnings.today}`} 
//           change={stats?.earningsChange || 0} 
//           isCurrency 
//         />
//         <StatsCard 
//           title="Total Earnings" 
//           value={`₹${earnings.total}`} 
//           change={stats?.earningsChange || 0} 
//           isCurrency 
//         />
//         <StatsCard 
//           title="Rating" 
//           value={stats?.rating?.toFixed(1) || '0.0'} 
//           change={stats?.ratingChange || 0} 
//           isRating 
//         />
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <DashboardCard 
//           icon={<Car size={24} className="text-blue-600" />}
//           title="Start Ride"
//           description="Begin a new ride"
//           link="/captain/ride/new"
//         />
//         <DashboardCard 
//           icon={<CalendarClock size={24} className="text-green-600" />}
//           title="Ride History"
//           description="View past rides"
//           link="/captain/rides"
//         />
//         <DashboardCard 
//           icon={<Wallet size={24} className="text-purple-600" />}
//           title="Earnings"
//           description="View your payments"
//           link="/captain/earnings"
//         />
//         <DashboardCard 
//           icon={<User size={24} className="text-orange-500" />}
//           title="Profile"
//           description="Update your details"
//           link="/captain/edit-profile"
//         />
//       </div>

//       {/* Ride Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold mb-2">Ride Statistics</h3>
//           <div className="space-y-4">
//             <div>
//               <p className="text-gray-500">Completed Rides</p>
//               <p className="text-xl font-bold">{rideStats.accepted}</p>
//             </div>
//             <div>
//               <p className="text-gray-500">Cancelled Rides</p>
//               <p className="text-xl font-bold">{rideStats.cancelled}</p>
//             </div>
//             <div>
//               <p className="text-gray-500">Distance Travelled</p>
//               <p className="text-xl font-bold">{rideStats.distanceTravelled} km</p>
//             </div>
//           </div>
//         </div>
        
//         {/* Recent Activity */}
//         <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Recent Rides</h2>
//             <button 
//               onClick={() => navigate('/captain/rides')}
//               className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//             >
//               View All
//             </button>
//           </div>
//           {stats?.recentRides?.length > 0 ? (
//             <div className="space-y-4">
//               {stats.recentRides.map((ride) => (
//                 <div key={ride._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="font-medium">{ride.pickupLocation} to {ride.dropoffLocation}</p>
//                     <p className="text-sm text-gray-500">{new Date(ride.createdAt).toLocaleString()}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">₹{ride.fare.toFixed(2)}</p>
//                     <div className="flex items-center justify-end">
//                       <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
//                       <span className="text-sm">{ride.rating || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-4">No recent rides found</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


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
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });
  const [rideStats, setRideStats] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });
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
        
        // Calculate earnings and ride stats from the profile data
        const captain = profileRes.data.captain;
        calculateEarnings(captain);
        
        // Fetch captain stats (you'll need to create this endpoint)
        const statsRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/captain/stats`,
          {
            headers: { token },
          }
        );

        setCaptainData(captain);
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

  const calculateEarnings = (captain) => {
    let totalEarnings = 0;
    let todaysEarnings = 0;
    let acceptedRides = 0;
    let cancelledRides = 0;
    let distanceTravelled = 0;

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format

    captain.rides.forEach((ride) => {
      if (ride.status === "completed") {
        // Always add to total earnings for completed rides
        totalEarnings += ride.fare;
        acceptedRides++;
        distanceTravelled += ride.distance;

        // Check if ride was completed today
        const rideDate = new Date(ride.updatedAt);
        const rideDateStr = rideDate.toISOString().split('T')[0];
        
        if (rideDateStr === todayDate) {
          todaysEarnings += ride.fare;
        }
      } else if (ride.status === "cancelled") {
        cancelledRides++;
      }
    });

    setEarnings({ 
      total: totalEarnings, 
      today: todaysEarnings 
    });
    
    setRideStats({
      accepted: acceptedRides,
      cancelled: cancelledRides,
      distanceTravelled: Math.round(distanceTravelled / 1000),
    });
  };

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
          value={stats?.todayRides || rideStats.accepted} 
          change={stats?.rideChange || 0} 
        />
        <StatsCard 
          title="Today's Earnings" 
          value={`₹${earnings.today}`} 
          change={stats?.earningsChange || 0} 
          isCurrency 
        />
        <StatsCard 
          title="Total Earnings" 
          value={`₹${earnings.total}`} 
          change={stats?.earningsChange || 0} 
          isCurrency 
        />
        <StatsCard 
          title="Rating" 
          value={stats?.rating?.toFixed(1) || '0.0'} 
          change={stats?.ratingChange || 0} 
          isRating 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          icon={<Car size={24} className="text-blue-600" />}
          title="Start Ride"
          description="Begin a new ride"
          link="/captain/start-ride/"
        />
        <DashboardCard 
          icon={<CalendarClock size={24} className="text-green-600" />}
          title="Ride History"
          description="View past rides"
          link="/captain/rides"
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

      {/* Ride Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Ride Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Completed Rides</p>
              <p className="text-xl font-bold">{rideStats.accepted}</p>
            </div>
            <div>
              <p className="text-gray-500">Cancelled Rides</p>
              <p className="text-xl font-bold">{rideStats.cancelled}</p>
            </div>
            <div>
              <p className="text-gray-500">Distance Travelled</p>
              <p className="text-xl font-bold">{rideStats.distanceTravelled} km</p>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
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
                    <p className="font-medium">₹{ride.fare.toFixed(2)}</p>
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
    </div>
  );
};

export default CaptainDashboard;
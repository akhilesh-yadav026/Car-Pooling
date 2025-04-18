import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  GetStarted,
  UserLogin,
  CaptainLogin,
  UserHomeScreen,
  CaptainHomeScreen,
  UserProtectedWrapper,
  CaptainProtectedWrapper,
  UserSignup,
  CaptainSignup,
  RideHistory,
  UserEditProfile,
  CaptainEditProfile,
} from "./screens/";
import ChatScreen from "./screens/ChatScreen";
import { ResetPassword } from "./screens/ResetPassword";
import CaptainDashboard from "./pages/CaptainDashboard";
import { ForgotPassword } from "./screens/ForgotPassword";
import { CaptainForgotPassword } from "./screens/CaptainForgotPassword";
import { CaptainResetPassword } from "./screens/CaptainResetPassword";
import CaptainEarnings from "./pages/CaptainEarning";


function App() {
  return (
    <div className="w-full h-dvh flex items-center">
      <div className="w-full  h-full bg-white overflow-hidden">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GetStarted />} />
            <Route
              path="/home"
              element={
                <UserProtectedWrapper>
                  <UserHomeScreen />
                </UserProtectedWrapper>
              }
            />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
              <Route path ="/resetpassword/:token" element={<ResetPassword/>}></Route>
              <Route path="/forgotPassword" element={<ForgotPassword />}></Route>
              
            <Route
              path="/user/edit-profile"
              element={
                <UserProtectedWrapper>
                  <UserEditProfile />
                </UserProtectedWrapper>
              }
            />
            <Route
              path="/user/rides"
              element={
                <UserProtectedWrapper>
                  <RideHistory />
                </UserProtectedWrapper>
              }
            />

            <Route
              path="/captain/home"
              element={
                <CaptainProtectedWrapper>
                  <CaptainHomeScreen />
                </CaptainProtectedWrapper>
              }
            />
            <Route path="/captain/login" element={<CaptainLogin />} />
            <Route path="/captain/signup" element={<CaptainSignup />} />
              <Route path="/captain/forgotPassword" element={<CaptainForgotPassword />}></Route>
              <Route path="/captain/resetpassword/:token" element={<CaptainResetPassword />}></Route>
            <Route
              path="/captain/edit-profile"
              element={
                <CaptainProtectedWrapper>
                  <CaptainEditProfile />
                </CaptainProtectedWrapper>
              }
            />
            <Route
              path="/captain/rides"
              element={
                <CaptainProtectedWrapper>
                  <RideHistory />
                </CaptainProtectedWrapper>
              }
            />
            <Route path="/dashboard" element={<CaptainDashboard />} />
            <Route path="/captain/earnings" element={<CaptainEarnings />}></Route>
      
            <Route path="/:userType/chat/:rideId" element={<ChatScreen />} />
          </Routes>
        </BrowserRouter>
      </div>
     
    </div>
  );
}

export default App;

import React, { useEffect } from "react";
import { ArrowRight, Smartphone, Shield, Clock } from "lucide-react";
import { Button } from "../components/index";
import logo from "/logo.png";
import { useNavigate } from "react-router-dom";

function GetStarted() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.type === "user") navigate("/home");
      else if (parsed.type === "captain") navigate("/captain/home");
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Logo Header */}
        <header className="px-6 pt-8 sm:px-10 sm:pt-12 flex justify-between items-center">
          <img
            src={logo}
            alt="Car-Pooling Logo"
            className="h-10 w-auto sm:h-12"
          />
          <a
            href="/login"
            className="text-gray-800 font-medium hover:text-gray-600 transition-colors hidden sm:block"
          >
            Sign In
          </a>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Move with <span className="text-primary">confidence</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Safe, reliable rides at your fingertips. Wherever you're going,
              we'll get you there.
            </p>

            <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-primary" />
                <span>Available 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-5 h-5 text-primary" />
                <span>Safety first</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Smartphone className="w-5 h-5 text-primary" />
                <span>Easy to use</span>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ready to ride?
            </h2>

            <div className="space-y-4">
              <Button
                title={"Get a ride"}
                path={"/login"}
                type={"link"}
                icon={<ArrowRight className="w-5 h-5" />}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white text-lg font-semibold rounded-xl 
                          transition-all duration-300 transform hover:scale-[1.02] active:scale-100
                          flex items-center justify-center gap-2 shadow-lg"
              />

              <Button
                title={"Drive with us"}
                path={"/captain/login"}
                type={"link"}
                variant="outline"
                className="w-full py-4 px-6 bg-transparent border-gray-300 text-gray-800 hover:bg-gray-100 text-lg font-semibold rounded-xl 
                          transition-all duration-300 transform hover:scale-[1.02] active:scale-100
                          flex items-center justify-center gap-2"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <a href="#" className="inline-block">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-10 w-auto hover:opacity-90 transition-opacity"
                />
              </a>
              <a href="#" className="inline-block">
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-12 w-auto hover:opacity-90 transition-opacity"
                />
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-gray-500 text-sm">
          <div className="flex flex-wrap justify-center gap-4 mb-3">
            <a href="#" className="hover:text-gray-800 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Safety
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Cities
            </a>
          </div>
          <p>© {new Date().getFullYear()} CarPooling Technologies Inc.</p>
        </footer>
      </div>
    </div>
  );
}

export default GetStarted;
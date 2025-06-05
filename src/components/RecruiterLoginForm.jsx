import React, { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export function RecruiterLoginForm({ onSwitchForm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Email/password validation
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  // Handle standard email/password login
  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!formValid) return;

    setLoading(true);
    setErr("");

    try {
      console.log("Attempting login with credentials:", { email, password: "********" });
      
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      // Get response data
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing response:", jsonError);
        throw new Error("Invalid server response");
      }
      
      // Check for non-2xx responses
      if (!response.ok) {
        console.error("Login failed:", data);
        throw new Error(data.error || data.message || "Login failed. Please check your credentials.");
      }
      
      // Verify user role - this recruiter form should only allow recruiters
      if (data.user && data.user.role !== 'recruiter') {
        throw new Error("This account is not registered as a recruiter. Please use a recruiter account.");
      }

      console.log("Login successful:", data);
      
      // Store auth token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role);

      // Close modal if provided and navigate to the recruiter dashboard
      if (onClose) onClose();
      navigate('/helloR');
    } catch (error) {
      console.error("Login error:", error);
      
      // More user-friendly error messages
      if (error.message === "Failed to fetch") {
        setErr("Cannot connect to server. Please check your internet connection.");
      } else if (error.message.includes("not registered as a recruiter")) { 
        setErr("This account is not a recruiter account. Please use a recruiter login.");
      } else if (error.message.includes("Invalid email or password")) {
        setErr("Invalid email or password. Please try again.");
      } else {
        setErr(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 pb-6 flex flex-col gap-4" aria-label="Recruiter Login">
      <p className="text-muted-foreground mb-4">Access your dashboard and start recruiting.</p>

      {/* Email/Password login form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col font-medium gap-1">
          Email
          <input
            type="email"
            className={`border rounded-md px-3 py-2 text-base outline-none transition ${
              touched.email && !emailValid ? "border-red-500" : "border-gray-300"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({...t, email: true}))}
          />
          {touched.email && !emailValid && <span className="text-red-600 text-sm">Enter a valid email</span>}
        </label>

        <label className="flex flex-col font-medium gap-1 relative">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`border rounded-md px-3 py-2 text-base outline-none transition w-full pr-10 ${
                touched.password && !passwordValid ? "border-red-500" : "border-gray-300"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({...t, password: true}))}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? (
                <HiOutlineEyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <HiOutlineEye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {touched.password && !passwordValid && <span className="text-red-600 text-sm">Password must be at least 6 characters</span>}
        </label>

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={!formValid || loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      
      <div className="text-center pt-2">
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-blue-700 font-semibold"
          onClick={() => onSwitchForm("register")}
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}
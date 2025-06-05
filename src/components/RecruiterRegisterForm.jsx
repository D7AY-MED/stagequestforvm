import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function RecruiterRegisterForm({ onClose }) {
  // Define state variables for form values
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    password2: "",
  });
  
  // Other state variables
  const [touched, setTouched] = useState({
    name: false,
    company: false,
    email: false,
    password: false,
    password2: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const navigate = useNavigate();
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  
  // Field validation logic
  const nameError = touched.name && !values.name ? "Name is required" : "";
  const companyError = touched.company && !values.company ? "Company is required" : "";
  const emailError = touched.email && !values.email ? "Email is required" : 
                    touched.email && !/\S+@\S+\.\S+/.test(values.email) ? "Invalid email format" : "";
  const passwordError = touched.password && !values.password ? "Password is required" : 
                       touched.password && values.password.length < 8 ? "Password must be at least 8 characters" : "";
  const password2Error = touched.password2 && values.password !== values.password2 ? "Passwords do not match" : "";
  
  const formValid = !nameError && !companyError && !emailError && !passwordError && !password2Error && 
                  values.name && values.company && values.email && values.password && values.password2;
    // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    setTouched({
      name: true,
      company: true,
      email: true,
      password: true,
      password2: true,
    });
    
    // Additional validation check
    if (!values.name.trim() || !values.company.trim() || !values.email.trim() || !values.password || !values.password2) {
      setErr("All fields are required. Please fill out the entire form.");
      return;
    }
    
    // Validate form before submitting
    if (!formValid) {
      setErr("Please fix the validation errors before submitting.");
      return;
    }
    
    // Password match check
    if (values.password !== values.password2) {
      setErr("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setErr("");
    
    try {
      // Create the payload with all required fields
      const payload = {
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        password: values.password
      };
      
      // Log the payload (excluding password for security)
      console.log("Registration request payload:", {
        ...payload,
        password: "[REDACTED]"
      });
      
      // Stringified payload for debugging
      const jsonPayload = JSON.stringify(payload);
      console.log("Stringified payload length:", jsonPayload.length);
      
      // Try XMLHttpRequest first for better compatibility
      const registerPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3000/api/register", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            console.log("XHR response received:", xhr.status);
            console.log("XHR response text:", xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error("Error parsing response:", parseError);
                reject(new Error("Invalid response format"));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.error || errorData.message || "Registration failed"));
              } catch (parseError) {
                reject(new Error(`Server error: ${xhr.status}`));
              }
            }
          }
        };
        
        xhr.onerror = function() {
          console.error("XHR error occurred");
          reject(new Error("Network error"));
        };
        
        console.log("Sending XHR request...");
        xhr.send(jsonPayload);
      });
      
      // Use a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });
      
      // Wait for either the registration to complete or timeout
      const result = await Promise.race([registerPromise, timeoutPromise]);
      
      console.log("Registration successful:", result);
      
      // Store authentication data
      localStorage.setItem("authToken", result.token || "");
      localStorage.setItem("userData", JSON.stringify(result.user || {}));
      
      // Show success message and navigate
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        if (onClose) onClose();
        navigate("/helloR");
      }, 3000);
      
    } catch (error) {
      console.error("Registration error:", error);
      setErr(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold text-center">Create a Recruiter Account</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${nameError ? "border-red-500" : ""}`}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>
          
          {/* Company input */}
          <div className="mb-4">
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company
            </label>
            <Input
              id="company"
              name="company"
              type="text"
              value={values.company}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${companyError ? "border-red-500" : ""}`}
            />
            {companyError && <p className="text-red-500 text-xs mt-1">{companyError}</p>}
          </div>
          
          {/* Email input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${emailError ? "border-red-500" : ""}`}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          
          {/* Password input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${passwordError ? "border-red-500" : ""}`}
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          
          {/* Confirm password input */}
          <div className="mb-4">
            <label htmlFor="password2" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <Input
              id="password2"
              name="password2"
              type="password"
              value={values.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${password2Error ? "border-red-500" : ""}`}
            />
            {password2Error && <p className="text-red-500 text-xs mt-1">{password2Error}</p>}
          </div>
          
          {/* Error message */}
          {err && <p className="text-red-500 text-sm mt-2 mb-4">{err}</p>}
          
          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>
      
      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">Registration Successful!</h3>
            <p>Your account has been created successfully.</p>
            <p className="mt-2">Redirecting you to your dashboard...</p>
          </div>
        </div>
      )}
    </>

  );
};
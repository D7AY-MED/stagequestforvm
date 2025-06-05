import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

const RecruiterRegisterForm = () => {
  const { instance } = useMsal();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAzureRegister = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email", "User.Read"],
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: 'POST', // Ensure this is POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Registration successful:', data);
        // Redirect to login page
        navigate('/recruiter-login');
      } else {
        console.error('Registration failed:', data.message);
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="p-4">
      <p className="mb-4">
        To register as a recruiter, sign in with your organization's Microsoft
        account:
      </p>
      <button 
        onClick={handleAzureRegister}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Register / Sign in with Azure Entra ID
      </button>
      
      <div className="mt-6">
        <h3 className="font-medium mb-3">Or register with email and password:</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Company</label>
            <input 
              type="text" 
              name="company" 
              value={formData.company} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
              minLength="8"
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterRegisterForm;
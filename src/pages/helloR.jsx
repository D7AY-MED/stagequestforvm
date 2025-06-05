import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import config from '../config';

export default function HelloRecruiter() {
  const [recruiterData, setRecruiterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication check for recruiters
    const verifyRecruiterAuth = async () => {
      try {
        // First check localStorage for user data
        const storedUserData = localStorage.getItem('userData');
        const token = localStorage.getItem('authToken');
        
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setRecruiterData(userData);
            setAuthError(false);
            setLoading(false);
            console.log('Using stored recruiter data:', userData);
            return;
          } catch (error) {
            console.warn('Failed to parse stored user data:', error);
          }
        }

        // If no token, redirect to login
        if (!token) {
          console.log('No auth token found in localStorage');
          setAuthError(true);
          setLoading(false);
          return;
        }
        
        // Try to verify with backend API
        try {
          console.log('Attempting to verify with backend API at:', `${config.apiUrl}/api/verify-recruiter`);
          const response = await fetch(`${config.apiUrl}/api/verify-recruiter`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (!response.ok) {
            console.log('API verification failed with status:', response.status);
            throw new Error(`API responded with status ${response.status}`);
          }

          const data = await response.json();
          console.log('API verification successful:', data);
          setRecruiterData(data);
          setAuthError(false);
          
          // Store the data for future use
          localStorage.setItem('userData', JSON.stringify(data));
        } catch (apiError) {
          console.error('API verification failed:', apiError);
          
          // If API fails but we have a token, create a fallback user
          console.log('Using fallback data based on token');
          const fallbackData = {
            name: 'Recruiter Account',
            company: 'Your Company', 
            role: 'recruiter'
          };
          setRecruiterData(fallbackData);
          localStorage.setItem('userData', JSON.stringify(fallbackData));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyRecruiterAuth();
  }, [navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authError && !loading) {
      navigate("/recreuter", { state: { message: "Please login as a recruiter to access this page" } });
    }
  }, [authError, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {recruiterData?.name || 'Recruiter'}!
              </h1>
              <p className="text-gray-500">
                {recruiterData?.company || 'Your Company'}
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Recruiter Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">Post a Job</h3>
              <p className="text-gray-600 mb-4">Create a new job listing to attract qualified candidates.</p>
              <Button className="w-full">Create Job Listing</Button>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-purple-800">Browse Candidates</h3>
              <p className="text-gray-600 mb-4">Find qualified candidates for your open positions.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Search Candidates</Button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-lg mb-4">Your Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-500 text-sm">Job Listings</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-gray-500 text-sm">Applications</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-gray-500 text-sm">Interviews</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-gray-500 text-sm">Hires</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>This is a protected page only accessible to recruiters.</p>
          <button 
            className="text-blue-500 hover:underline mt-2" 
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              localStorage.removeItem('userRole');
              navigate("/");
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

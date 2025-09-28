// React hook for managing state
import { useState } from "react";
// React Router hooks for navigation and links
import { useNavigate, Link } from "react-router-dom";
// Authentication context to access login function
import { useAuth } from "../context/AuthContext";
// API function to handle signup requests
import { signup as apiSignup } from "../api";
// UI components from design system
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Main Signup component
export default function Signup() {
  // Local state for form inputs
  const [form, setForm] = useState({
    username: "", // Username input
    password: "", // Password input
    confirmPassword: "", // Confirm password input
    role: "student", // Default role selection
  });

  // Local state for error messages
  const [error, setError] = useState("");

  // Get login function from auth context
  const { login } = useAuth();

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if password and confirm password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); // Show error if mismatch
      return;
    }

    try {
      // Call API to create a new user
      const userData = await apiSignup({
        username: form.username,
        password: form.password,
        role: form.role,
      });

      // Log in the newly created user
      login(userData);

      // Navigate to home page after successful signup
      navigate("/");
    } catch (err) {
      // Display API error or default error message
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  // JSX for rendering the signup UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-100">
      {/* Card component wrapping the signup form */}
      <Card className="w-full max-w-md fade-in">
        {/* Card header with title */}
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>

        {/* Card content containing the form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username input field */}
            <Input
              type="text"
              placeholder="Username"
              value={form.username} // Controlled input
              onChange={(e) => setForm({ ...form, username: e.target.value })} // Update state
              required // Field is required
            />

            {/* Password input field */}
            <Input
              type="password"
              placeholder="Password"
              value={form.password} // Controlled input
              onChange={(e) => setForm({ ...form, password: e.target.value })} // Update state
              required
            />

            {/* Confirm Password input field */}
            <Input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword} // Controlled input
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              } // Update state
              required
            />

            {/* Role selection dropdown */}
            <select
              value={form.role} // Controlled select
              onChange={(e) => setForm({ ...form, role: e.target.value })} // Update state
              className="w-full p-2 border rounded"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="ta">Teaching Assistant</option>
            </select>

            {/* Display error message if any */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>

          {/* Link to navigate to login page */}
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500">
              Log in
            </Link>
          </p>

          {/* Button to navigate back to home */}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full mt-4"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

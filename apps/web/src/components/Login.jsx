// Import React hooks and necessary functions from react-router-dom
import { useState, useEffect } from "react"; // useState for managing local state, useEffect for side effects
import { useNavigate, Link } from "react-router-dom"; // useNavigate for programmatic navigation, Link for navigation links

// Import authentication context and API function
import { useAuth } from "../context/AuthContext"; // Custom hook to access auth context
import { login as apiLogin } from "../api"; // API call function for login

// Import UI components from your design system
import { Button } from "@/components/ui/button"; // Button component
import { Input } from "@/components/ui/input"; // Input field component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card UI components
import { toast } from "sonner"; // Toast notifications for user feedback

// Define the Login component
export default function Login() {
  // State to store form inputs: username and password
  const [form, setForm] = useState({ username: "", password: "" });

  // State to store any login errors
  const [error, setError] = useState("");

  // Destructure auth context to get login function, user info, and loading state
  const { login, user, loading } = useAuth();

  // Hook for navigation between routes
  const navigate = useNavigate();

  // useEffect runs after every render when user or loading changes
  useEffect(() => {
    // If a user is already logged in and not loading
    if (user && !loading) {
      // Show a success toast message welcoming the user
      toast.success("Welcome back, " + user.username);

      // Navigate user to the home page
      navigate("/");
    }
  }, [user]); // Dependency array ensures this effect runs when 'user' changes

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Call the login API with the form data
      const userData = await apiLogin(form);

      // Call login from context to update global auth state
      login(userData);

      // Navigate to home page after successful login
      navigate("/");
    } catch (err) {
      // If error occurs, set error state to show the error message
      // err.response?.data?.message checks if server returned an error message
      setError(err.response?.data?.message || "Login failed");
    }
  };

  // JSX for rendering the login UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      {/* Card component wrapping the login form */}
      <Card className="w-full max-w-md fade-in">
        {/* Card header with title */}
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>

        {/* Card content contains the form and additional buttons/links */}
        <CardContent>
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username input */}
            <Input
              type="text"
              placeholder="Username"
              value={form.username} // Controlled input bound to state
              onChange={(e) => setForm({ ...form, username: e.target.value })} // Update state on change
              required // Make field required
            />

            {/* Password input */}
            <Input
              type="password"
              placeholder="Password"
              value={form.password} // Controlled input bound to state
              onChange={(e) => setForm({ ...form, password: e.target.value })} // Update state on change
              required // Make field required
            />

            {/* Display error message if any */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Submit button */}
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>

          {/* Button to go back to home */}
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full mt-4"
          >
            Back to Home
          </Button>

          {/* Link to navigate to SignUp page */}
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

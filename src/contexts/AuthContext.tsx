
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// We'll add a simple "database" in localStorage for users
interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the user database if it doesn't exist
  const initializeUserDatabase = () => {
    if (!localStorage.getItem("users")) {
      console.log("Initializing user database with admin account");
      const initialUsers: StoredUser[] = [
        {
          id: "admin-user",
          email: "admin@example.com",
          password: "admin123",
          isAdmin: true
        }
      ];
      localStorage.setItem("users", JSON.stringify(initialUsers));
    }
  };

  useEffect(() => {
    // Initialize user database
    initializeUserDatabase();
    
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple validation
    if (!email || !password) {
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get users from localStorage
    const usersJson = localStorage.getItem("users");
    if (!usersJson) {
      console.error("No users found in localStorage");
      initializeUserDatabase(); // Ensure admin user exists
      return false;
    }
    
    try {
      const users = JSON.parse(usersJson) as StoredUser[];
      console.log("Users found:", users.length);
      
      // Special case for admin login
      if (email === "admin@example.com" && password === "admin123") {
        const adminUser = users.find(u => u.email === "admin@example.com" && u.isAdmin);
        
        if (adminUser) {
          console.log("Admin login successful!");
          const { password: _, ...userWithoutPassword } = adminUser;
          setUser(userWithoutPassword);
          localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
          return true;
        }
      }
      
      // Find the user with matching email and password
      const foundUser = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        console.log("User found:", foundUser.email, "isAdmin:", foundUser.isAdmin);
        // Remove password from user object before storing in state
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        // Store user in localStorage (without password)
        localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
        return true;
      } else {
        console.log("Invalid credentials. Email:", email);
        return false;
      }
    } catch (error) {
      console.error("Error parsing users from localStorage:", error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    // Simple validation
    if (!email || !password) {
      return false;
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Get users from localStorage
      const usersJson = localStorage.getItem("users");
      let users: StoredUser[] = [];
      
      if (usersJson) {
        users = JSON.parse(usersJson) as StoredUser[];
      } else {
        initializeUserDatabase();
        const newUsersJson = localStorage.getItem("users");
        if (newUsersJson) {
          users = JSON.parse(newUsersJson) as StoredUser[];
        }
      }
      
      // Check if user already exists
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        console.log("User already exists:", email);
        return false; // User already exists
      }
      
      // Create new user
      const newUser: StoredUser = { 
        id: `user-${Date.now()}`, 
        email,
        password,
        isAdmin: false
      };
      
      // Add user to localStorage
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      console.log("User registered:", newUser.email);
      
      return true;
    } catch (error) {
      console.error("Error registering user:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

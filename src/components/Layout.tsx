
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, UserCircle, ShieldCheck } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="event-header sticky top-0 z-50">
        <div className="flex items-center">
          <Link to="/" className="font-medium mr-6">
            <span className="bg-black text-white px-1">EVENT</span> | <span className="bg-white text-black px-1">REG</span>
          </Link>
          <nav className="hidden sm:flex items-center space-x-1">
            <Link
              to="/events"
              className={`nav-link ${isActive("/events") ? "nav-link-active" : ""}`}
            >
              EVENT LIST
            </Link>
            {!isAdmin && (
              <Link
                to="/events/record"
                className={`nav-link ${isActive("/events/record") ? "nav-link-active" : ""}`}
              >
                EVENT RECORD
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${isActive("/admin") ? "nav-link-active" : ""}`}
              >
                ADMIN PANEL
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-8 w-8 border border-gray-500 hover:border-gray-400 transition-colors">
                    <AvatarFallback className={`${isAdmin ? 'bg-gray-800' : 'bg-gray-700'} text-white`}>
                      {user ? getInitials(user.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center">
                  My Account 
                  {isAdmin && (
                    <span className="ml-2 bg-gray-800 text-gray-200 text-xs font-medium px-2 py-0.5 rounded dark:bg-gray-900 dark:text-gray-300 flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{user?.email}</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center cursor-pointer w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "nav-link-active" : ""}`}
              >
                LOG IN
              </Link>
              <Link
                to="/register"
                className={`nav-link ${isActive("/register") ? "nav-link-active" : ""}`}
              >
                REGISTER
              </Link>
            </>
          )}
        </div>
      </header>
      
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;

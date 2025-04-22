import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { fetchEvents, Event } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EventList = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filter, setFilter] = useState("all"); // "all", "registered", "approved", "created"
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents
  });
  
  const filteredEvents = events?.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (isAdmin) return true;
    
    if (filter === "all") return true;
    if (filter === "registered" && user) {
      return event.registrations?.some(reg => reg.userId === user.id);
    }
    if (filter === "approved" && user) {
      return event.registrations?.some(reg => reg.userId === user.id && reg.status === "approved");
    }
    if (filter === "created" && user) {
      return event.organizer === user.email;
    }
    
    if (!event.isPublished && !isAdmin) {
      return user?.email === event.organizer;
    }
    
    return event.isPublished;
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-medium mb-4">EXPLORE EVENTS HERE</h2>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gray-800 hover:bg-gray-600-accent/90"
            >
              Log In
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-light">Event List</h1>
          
          {!isAdmin && (
            <Button 
              onClick={() => navigate('/events/record')}
              className="bg-event-accent hover:bg-event-accent/90"
            >
              Create New Event
            </Button>
          )}
        </motion.div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search events by title, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-event-accent focus:border-transparent transition-all duration-300 rounded-md"
            />
          </div>
          
          {!isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-event-accent" : ""}
              >
                All Events
              </Button>
              <Button 
                variant={filter === "registered" ? "default" : "outline"}
                onClick={() => setFilter("registered")}
                className={filter === "registered" ? "bg-event-accent" : ""}
              >
                My Registrations
              </Button>
              <Button 
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                className={filter === "approved" ? "bg-event-accent" : ""}
              >
                Approved
              </Button>
              <Button 
                variant={filter === "created" ? "default" : "outline"}
                onClick={() => setFilter("created")}
                className={filter === "created" ? "bg-event-accent" : ""}
              >
                My Events
              </Button>
            </div>
          )}
          
          {isAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md">
              <span className="text-sm text-gray-300">Admin view: All events are displayed</span>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-event-accent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            An error occurred while fetching events.
          </div>
        ) : filteredEvents?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No events found matching your search.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                if (!isAdmin) setFilter("all");
              }}
              className="text-event-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents?.map((event, index) => (
              <EventCard 
                key={event.id} 
                event={event} 
                index={index} 
                userId={user?.id || ""} 
                userEmail={user?.email || ""}
                isAdmin={isAdmin}
              />
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

const EventCard: React.FC<{ 
  event: Event; 
  index: number; 
  userId: string;
  userEmail: string;
  isAdmin?: boolean 
}> = ({ 
  event, 
  index, 
  userId,
  userEmail,
  isAdmin 
}) => {
  const navigate = useNavigate();
  
  const userRegistration = event.registrations?.find(reg => reg.userId === userId);
  const isRegistered = !!userRegistration;
  const registrationStatus = userRegistration ? userRegistration.status : null;
  
  const isCreator = event.organizer === userEmail;
  // New publication status indicator
  let publicationStatus = null;
  if (isAdmin || isCreator || isRegistered) {
    publicationStatus = event.isPublished
      ? (
        <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
          <Calendar className="w-4 h-4"/>
          Published
        </span>
      )
      : (
        <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
          <AlertTriangle className="w-4 h-4"/>
          Unpublished
        </span>
      );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl text-white">{event.title}</CardTitle>
            <div className="flex flex-col items-end gap-2">
              {publicationStatus}
              {isCreator && (
                <div className={`text-xs px-2 py-1 rounded-full ${event.isPublished ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                  {event.isPublished ? 'Published' : 'Awaiting Approval'}
                </div>
              )}
              {!isAdmin && !isCreator && isRegistered && (
                <div className="flex items-center text-xs">
                  {registrationStatus === "approved" ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4"/>
                      Approved
                    </span>
                  ) : registrationStatus === "rejected" ? (
                    <span className="flex items-center text-red-600">
                      <XCircle className="w-4 h-4"/>
                      Rejected
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <Clock className="w-4 h-4"/>
                      Pending
                    </span>
                  )}
                </div>
              )}
              {isAdmin && !isCreator && (
                <div className="text-xs px-2 py-1 rounded-full bg-gray-700">
                  {event.isPublished ? (
                    <span className="text-green-400">Published</span>
                  ) : (
                    <span className="text-yellow-400">Draft</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.attendees} attendees</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EventList;

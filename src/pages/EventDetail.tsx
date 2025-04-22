import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { fetchEvents, registerForEvent } from "@/lib/mockData";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents
  });
  
  const event = events?.find(event => event.id === id);
  
  const userRegistration = event?.registrations?.find(reg => reg.userId === user?.id);
  const isRegistered = !!userRegistration;
  const registrationStatus = userRegistration ? userRegistration.status : null;
  
  const isCreator = event?.organizer === user?.email;
  
  const registerMutation = useMutation({
    mutationFn: () => {
      if (!user || !event) throw new Error("Cannot register");
      return registerForEvent(event.id, user.id, user.email);
    },
    onSuccess: () => {
      toast.success("Registration submitted! Waiting for approval.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.error("Failed to register for the event");
    }
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
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
            <h2 className="text-2xl font-medium mb-4">Please log in to view event details</h2>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gray-700 hover:bg-gray-600"
            >
              Log In
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-72px)]">
          <div className="w-12 h-12 border-t-2 border-gray-700 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  if (error || !event) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-medium mb-4">Event not found</h2>
          <Button onClick={() => navigate("/events")}>Return to Event List</Button>
        </div>
      </Layout>
    );
  }
  
  if (!event.isPublished && !user?.isAdmin && !isCreator) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-medium mb-4">This event is not currently available</h2>
          <Button onClick={() => navigate("/events")}>Return to Event List</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={() => navigate("/events")}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            ← Back to Events
          </button>

          {((user?.isAdmin || isCreator || isRegistered) && (
            <div className={`mb-6 ${event.isPublished ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-300'} p-4 rounded-md flex items-center gap-3`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
                <use href={event.isPublished ? "#lucide-calendar-check" : "#lucide-calendar-x"} />
              </svg>
              <p className="text-lg font-semibold">
                {event.isPublished ? "This event is published and open for participation." : "This event is currently unpublished (awaiting admin approval)."}
              </p>
            </div>
          ))}

          <Card className="border-gray-700 bg-gray-800 text-gray-100">
            <CardHeader className="border-b border-gray-700 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {isCreator && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${event.isPublished ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                      {event.isPublished ? 'Published' : 'Awaiting Approval'}
                    </div>
                  )}
                  {isRegistered && (
                    <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium">
                      {registrationStatus === "approved" ? (
                        <span className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          Registration Approved
                        </span>
                      ) : registrationStatus === "rejected" ? (
                        <span className="flex items-center text-red-400">
                          <XCircle className="h-5 w-5 mr-1" />
                          Registration Rejected
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-400">
                          <Clock className="h-5 w-5 mr-1" />
                          Approval Pending
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-700/30 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-400">Attendees</p>
                    <p className="font-medium">{event.attendees}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">About This Event</h2>
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Organizer</h2>
                <p className="text-gray-300">{event.organizer}</p>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 border-t border-gray-700">
              {!isRegistered ? (
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className="w-full md:w-auto bg-gray-700 hover:bg-gray-600"
                >
                  {registerMutation.isPending ? "Registering..." : "Register for Event"}
                </Button>
              ) : (
                <div className="bg-gray-700/30 p-4 rounded-md w-full">
                  <p className="text-gray-300">
                    You are already registered for this event. 
                    {registrationStatus === "pending" && " Your registration is pending approval."}
                    {registrationStatus === "approved" && " Your registration has been approved."}
                    {registrationStatus === "rejected" && " Your registration has been rejected."}
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EventDetail;

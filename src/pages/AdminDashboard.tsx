
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchEvents, 
  fetchAllRegistrations, 
  updateRegistrationStatus,
  updateEventPublicationStatus,
  EventRegistration,
  Event
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RegisteredUser {
  id: string;
  email: string;
  registrationDate: string;
}

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents
  });
  
  const { data: registrations = [] } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchAllRegistrations
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch registered users from localStorage
        const storedUsers = localStorage.getItem("registeredUsers");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        } else {
          // Create demo data if none exists
          const demoUsers: RegisteredUser[] = [
            {
              id: "user-1",
              email: "user1@example.com",
              registrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "user-2",
              email: "user2@example.com",
              registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "admin",
              email: "admin@example.com",
              registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ];
          setUsers(demoUsers);
          localStorage.setItem("registeredUsers", JSON.stringify(demoUsers));
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, isAuthenticated, navigate]);

  // Re-sync users if new ones are added from another tab/registration
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const storedUsers = localStorage.getItem("registeredUsers");
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Mutation for updating registration status
  const updateRegistrationMutation = useMutation({
    mutationFn: ({ registrationId, status }: { registrationId: string; status: "approved" | "rejected" | "pending" }) =>
      updateRegistrationStatus(registrationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Registration status updated");
    },
    onError: () => {
      toast.error("Failed to update registration status");
    }
  });
  
  // Mutation for updating event publication status
  const updatePublicationMutation = useMutation({
    mutationFn: ({ eventId, isPublished }: { eventId: string; isPublished: boolean }) =>
      updateEventPublicationStatus(eventId, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event status updated");
    },
    onError: () => {
      toast.error("Failed to update event status");
    }
  });

  return (
    <Layout>
      <div className="container mx-auto px-0 py-8 w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 w-full max-w-4xl"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Admin Dashboard
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="mb-6 bg-black border border-black/50 shadow-md shadow-black text-white">
                <TabsTrigger value="events" className="text-white">Manage Events</TabsTrigger>
                <TabsTrigger value="registrations" className="text-white">Event Registrations</TabsTrigger>
                <TabsTrigger value="users" className="text-white">Registered Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="events" className="event-card p-6 border-black shadow-black">
                <h2 className="text-xl font-semibold mb-4 text-white">Event Management</h2>
                <div className="bg-gray-800 p-4 rounded-md mb-6 border border-black shadow shadow-black">
                  <p className="text-gray-300">
                    As an admin, you can view, edit, and manage the publication status of events created by users. 
                    Only regular users can create new events.
                  </p>
                </div>
                <div className="overflow-auto w-full">
                  <Table className="text-white border-black shadow-black w-full min-w-[700px]">
                    <TableCaption className="text-gray-300">List of all events in the system</TableCaption>
                    <TableHeader>
                      <TableRow className="border-black">
                        <TableHead className="text-white border-black">Event Title</TableHead>
                        <TableHead className="text-white border-black">Date</TableHead>
                        <TableHead className="text-white border-black">Location</TableHead>
                        <TableHead className="text-white border-black">Status</TableHead>
                        <TableHead className="text-white border-black">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.length > 0 ? (
                        events.map((event) => (
                          <TableRow key={event.id} className="border-black">
                            <TableCell className="text-white border-black">{event.title}</TableCell>
                            <TableCell className="text-white border-black">{formatDate(event.date)}</TableCell>
                            <TableCell className="text-white border-black">{event.location}</TableCell>
                            <TableCell className="border-black">
                              {event.isPublished ? (
                                <Badge className="bg-green-700 text-white border-black shadow-black">Published</Badge>
                              ) : (
                                <Badge className="bg-yellow-700 text-white border-black shadow-black">Draft</Badge>
                              )}
                            </TableCell>
                            <TableCell className="border-black">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-white border-black shadow-black"
                                  onClick={() => navigate(`/events/${event.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-white border-black shadow-black"
                                  onClick={() => navigate(`/events/edit/${event.id}`)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant={event.isPublished ? "destructive" : "default"}
                                  size="sm"
                                  className="text-white border-black shadow-black"
                                  onClick={() => updatePublicationMutation.mutate({
                                    eventId: event.id,
                                    isPublished: !event.isPublished
                                  })}
                                >
                                  {event.isPublished ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-1" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      Publish
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-white border-black">
                            No events found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="registrations" className="event-card p-6 border-black shadow-black">
                <h2 className="text-xl font-semibold mb-4 text-white">Event Registrations</h2>
                <div className="overflow-auto w-full">
                  <Table className="text-white border-black shadow-black w-full min-w-[700px]">
                    <TableCaption className="text-gray-300">
                      List of all event registrations
                    </TableCaption>
                    <TableHeader>
                      <TableRow className="border-black">
                        <TableHead className="text-white border-black">Event</TableHead>
                        <TableHead className="text-white border-black">User</TableHead>
                        <TableHead className="text-white border-black">Registration Date</TableHead>
                        <TableHead className="text-white border-black">Status</TableHead>
                        <TableHead className="text-white border-black">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.length > 0 ? (
                        registrations.map((registration) => {
                          const event = events.find(e => e.id === registration.eventId);
                          return (
                            <TableRow key={registration.id} className="border-black">
                              <TableCell className="text-white border-black">{event?.title || "Unknown Event"}</TableCell>
                              <TableCell className="text-white border-black">{registration.userEmail}</TableCell>
                              <TableCell className="text-white border-black">{formatDate(registration.registrationDate)}</TableCell>
                              <TableCell className="border-black">
                                {registration.status === "approved" ? (
                                  <Badge className="bg-green-700 flex items-center w-fit text-white border-black shadow-black">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approved
                                  </Badge>
                                ) : registration.status === "rejected" ? (
                                  <Badge className="bg-red-700 flex items-center w-fit text-white border-black shadow-black">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Rejected
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-700 flex items-center w-fit text-white border-black shadow-black">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="border-black">
                                <div className="flex space-x-2">
                                  {registration.status !== "approved" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="bg-green-900/20 text-white hover:bg-green-900/30 hover:text-white border-black shadow-black"
                                      onClick={() => updateRegistrationMutation.mutate({
                                        registrationId: registration.id,
                                        status: "approved"
                                      })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  )}
                                  
                                  {registration.status !== "rejected" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="bg-red-900/20 text-white hover:bg-red-900/30 hover:text-white border-black shadow-black"
                                      onClick={() => updateRegistrationMutation.mutate({
                                        registrationId: registration.id,
                                        status: "rejected"
                                      })}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  )}
                                  
                                  {registration.status !== "pending" && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-white border-black shadow-black"
                                      onClick={() => updateRegistrationMutation.mutate({
                                        registrationId: registration.id,
                                        status: "pending"
                                      })}
                                    >
                                      <Clock className="h-4 w-4 mr-1" />
                                      Mark Pending
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-white border-black">
                            No registrations found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="event-card p-6 border-black shadow-black">
                <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
                <div className="overflow-x-auto w-full">
                  <Table className="text-white border-black shadow-black w-full min-w-[700px]">
                    <TableCaption className="text-gray-300">
                      List of all registered users in the system
                    </TableCaption>
                    <TableHeader>
                      <TableRow className="border-black">
                        <TableHead className="text-white border-black">User ID</TableHead>
                        <TableHead className="text-white border-black">Email</TableHead>
                        <TableHead className="text-white border-black">Registration Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id} className="border-black">
                            <TableCell className="text-white border-black">{user.id}</TableCell>
                            <TableCell className="text-white border-black">{user.email}</TableCell>
                            <TableCell className="text-white border-black">{formatDate(user.registrationDate)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-white border-black">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;


import React from "react";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { addEvent } from "@/lib/mockData";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  organizer: z.string().min(1, "Organizer is required"),
  attendees: z.number().default(0)
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventRecord = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  if (isAdmin) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-medium mb-4">Admin users cannot create events</h2>
            <p className="text-gray-600 mb-6">
              As an admin, you can only view, edit, and manage events created by regular users.
            </p>
            <Button 
              onClick={() => navigate("/admin")}
              variant="secondary"
            >
              Go to Admin Dashboard
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      organizer: user?.email || "",
      attendees: 0
    }
  });

  const mutation = useMutation({
    mutationFn: (data: EventFormValues) => {
      return addEvent({
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        organizer: data.organizer,
        attendees: data.attendees,
        imageUrl: "/lovable-uploads/8312948d-29a6-4ca3-b39a-8b5905dc7b05.png"
      });
    },
    onSuccess: (newEvent) => {
      toast.success("Event created successfully! Awaiting admin approval.");
      navigate(`/events/${newEvent.id}`);
    },
    onError: () => {
      toast.error("Failed to create event");
    }
  });

  const onSubmit = (data: EventFormValues) => {
    mutation.mutate(data);
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
            <h2 className="text-2xl font-medium mb-4">EXPLORE EVENTS HERE</h2>
            <Button 
              onClick={() => navigate("/login")}
              variant="secondary"
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-light mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details to create a new event</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/30"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-yellow-300 font-medium mb-1">Event Publication Notice</h3>
              <p className="text-yellow-200/80 text-sm">
                Your event will be created in draft status and will need to be approved by an admin before it becomes visible to other users.
                After creation, you can still view and register for your own event.
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-md p-6 md:p-8 rounded-lg"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                        placeholder="Describe your event"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      <Input placeholder="Organizer name or company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EventRecord;


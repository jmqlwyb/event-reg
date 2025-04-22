
import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-5xl font-light tracking-tight text-gray-200 mb-6">
            <span className="font-bold text-gray-400">Events</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            A minimalist approach to event management. Create, track, and join events with elegant simplicity.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(isAuthenticated ? "/events/record" : "/register")}
              className="primary-button"
            >
              {isAuthenticated ? "Create Event" : "Get Started"}
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {[
            {
              title: "Simple Registration",
              description: "Create an account in seconds and start managing your events right away."
            },
            {
              title: "Event Creation",
              description: "Add new events with all the details your attendees need to know."
            },
            {
              title: "Event Discovery",
              description: "Browse and filter through events to find ones that interest you."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="bg-gray-800 p-6 shadow-md border border-gray-700 rounded-lg"
            >
              <h3 className="text-lg font-medium mb-2 text-gray-200">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;

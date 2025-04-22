
// Mock data for our events system

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  attendees: number;
  imageUrl?: string;
  registrations?: EventRegistration[];
  isPublished?: boolean;
}

// Demo users for reference
const mockUsers = [
  { id: "user-1", email: "user1@example.com" },
  { id: "user-2", email: "user2@example.com" },
  { id: "admin", email: "admin@example.com" }
];

// Utils for localStorage
const EVENTS_KEY = "lovable_events_data";
const REGISTRATIONS_KEY = "lovable_event_registrations";
const REGISTERED_USERS_KEY = "registeredUsers";

const loadLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
};

const setLocalStorage = <T,>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Demo registrations
const initialMockRegistrations: EventRegistration[] = [
  {
    id: "reg-1",
    eventId: "evt-001",
    userId: "user-1",
    userEmail: "user1@example.com",
    registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved"
  },
  {
    id: "reg-2",
    eventId: "evt-002",
    userId: "user-1",
    userEmail: "user1@example.com",
    registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending"
  },
  {
    id: "reg-3",
    eventId: "evt-003",
    userId: "user-2",
    userEmail: "user2@example.com",
    registrationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "rejected"
  },
  {
    id: "reg-4",
    eventId: "evt-004",
    userId: "user-2",
    userEmail: "user2@example.com",
    registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved"
  }
];

// Initial mock events data
const initialMockEvents: Event[] = [
  {
    id: "evt-001",
    title: "Annual Tech Conference",
    description: "Join us for the most anticipated tech event of the year featuring keynotes from industry leaders.",
    date: "2023-11-15",
    location: "San Francisco, CA",
    organizer: "TechCorp Inc.",
    attendees: 1200,
    imageUrl: "/lovable-uploads/8312948d-29a6-4ca3-b39a-8b5905dc7b05.png",
    registrations: initialMockRegistrations.filter(reg => reg.eventId === "evt-001"),
    isPublished: true
  },
  {
    id: "evt-002",
    title: "Design Systems Workshop",
    description: "A hands-on workshop focusing on creating and implementing effective design systems.",
    date: "2023-12-05",
    location: "New York, NY",
    organizer: "DesignHub",
    attendees: 75,
    imageUrl: "/lovable-uploads/8312948d-29a6-4ca3-b39a-8b5905dc7b05.png",
    registrations: initialMockRegistrations.filter(reg => reg.eventId === "evt-002"),
    isPublished: true
  },
  {
    id: "evt-003",
    title: "Startup Funding Summit",
    description: "Connect with investors and learn about funding opportunities for early-stage startups.",
    date: "2024-01-20",
    location: "Austin, TX",
    organizer: "Venture Partners",
    attendees: 350,
    imageUrl: "/lovable-uploads/8312948d-29a6-4ca3-b39a-8b5905dc7b05.png",
    registrations: initialMockRegistrations.filter(reg => reg.eventId === "evt-003"),
    isPublished: false
  },
  {
    id: "evt-004",
    title: "AI in Healthcare Symposium",
    description: "Exploring the latest applications of artificial intelligence in healthcare and medicine.",
    date: "2024-02-10",
    location: "Boston, MA",
    organizer: "MedTech Alliance",
    attendees: 520,
    imageUrl: "/lovable-uploads/8312948d-29a6-4ca3-b39a-8b5905dc7b05.png",
    registrations: initialMockRegistrations.filter(reg => reg.eventId === "evt-004"),
    isPublished: true
  }
];

// Export mutable data that can be updated from localStorage
export let mockEvents: Event[] = loadLocalStorage<Event[]>(
  EVENTS_KEY,
  initialMockEvents
);

let eventRegistrations: EventRegistration[] = loadLocalStorage<EventRegistration[]>(
  REGISTRATIONS_KEY,
  initialMockRegistrations
);

const syncEvents = () => setLocalStorage(EVENTS_KEY, mockEvents);
const syncRegistrations = () => setLocalStorage(REGISTRATIONS_KEY, eventRegistrations);

// Function to simulate fetching events
export const fetchEvents = async (): Promise<Event[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  mockEvents = loadLocalStorage(EVENTS_KEY, mockEvents);
  return [...mockEvents];
};

// Function to simulate adding an event
export const addEvent = async (event: Omit<Event, "id">): Promise<Event> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newEvent: Event = {
    ...event,
    id: `evt-${Date.now()}`,
    attendees: isNaN(event.attendees) ? 0 : event.attendees,
    registrations: [],
    isPublished: false
  };
  mockEvents.push(newEvent);
  syncEvents();
  return newEvent;
};

// Function to register for an event
export const registerForEvent = async (
  eventId: string, userId: string, userEmail: string
): Promise<EventRegistration> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  eventRegistrations = loadLocalStorage(REGISTRATIONS_KEY, eventRegistrations);
  // Check if user is already registered
  const existingRegistration = eventRegistrations.find(
    reg => reg.eventId === eventId && reg.userId === userId
  );
  if (existingRegistration) return existingRegistration;
  const newRegistration: EventRegistration = {
    id: `reg-${Date.now()}`,
    eventId, userId, userEmail,
    registrationDate: new Date().toISOString(),
    status: "pending"
  };
  eventRegistrations.push(newRegistration);
  syncRegistrations();
  // Update event registrations and increase attendee count
  mockEvents = loadLocalStorage(EVENTS_KEY, mockEvents);
  const event = mockEvents.find(e => e.id === eventId);
  if (event) {
    if (!event.registrations) event.registrations = [];
    event.registrations.push(newRegistration);
    event.attendees += 1;
    syncEvents();
  }

  // --- NEW: Also add to registered users in localStorage ---
  let registeredUsers: any[] = [];
  try {
    registeredUsers = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
  } catch {
    registeredUsers = [];
  }
  const alreadyRegistered = registeredUsers.some(
    (u) => u.id === userId
  );
  if (!alreadyRegistered) {
    registeredUsers.push({
      id: userId,
      email: userEmail,
      registrationDate: newRegistration.registrationDate,
    });
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
  }

  return newRegistration;
};

// Function to update registration status (for admin)
export const updateRegistrationStatus = async (
  registrationId: string,
  status: "approved" | "rejected" | "pending"
): Promise<EventRegistration | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  eventRegistrations = loadLocalStorage(REGISTRATIONS_KEY, eventRegistrations);
  const registrationIndex = eventRegistrations.findIndex(reg => reg.id === registrationId);
  if (registrationIndex === -1) return null;
  eventRegistrations[registrationIndex] = {
    ...eventRegistrations[registrationIndex], status
  };
  syncRegistrations();
  // Also update in the event's registrations array
  mockEvents = loadLocalStorage(EVENTS_KEY, mockEvents);
  const eventId = eventRegistrations[registrationIndex].eventId;
  const event = mockEvents.find(e => e.id === eventId);
  if (event && event.registrations) {
    const regIndex = event.registrations.findIndex(reg => reg.id === registrationId);
    if (regIndex !== -1) {
      event.registrations[regIndex] = {
        ...event.registrations[regIndex], status
      };
      syncEvents();
    }
  }
  return eventRegistrations[registrationIndex];
};

// Function to fetch all registrations (for admin)
export const fetchAllRegistrations = async (): Promise<EventRegistration[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  eventRegistrations = loadLocalStorage(REGISTRATIONS_KEY, eventRegistrations);
  return [...eventRegistrations];
};

// Function to update event publication status (for admin)
export const updateEventPublicationStatus = async (
  eventId: string,
  isPublished: boolean
): Promise<Event | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  mockEvents = loadLocalStorage(EVENTS_KEY, mockEvents);
  const eventIndex = mockEvents.findIndex(event => event.id === eventId);
  if (eventIndex === -1) return null;
  mockEvents[eventIndex] = {
    ...mockEvents[eventIndex], isPublished
  };
  syncEvents();
  return mockEvents[eventIndex];
};

// Function to update an event (for admin)
export const updateEvent = async (updatedEvent: Event): Promise<Event | null> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  mockEvents = loadLocalStorage(EVENTS_KEY, mockEvents);
  const eventIndex = mockEvents.findIndex(event => event.id === updatedEvent.id);
  if (eventIndex === -1) return null;
  const originalRegistrations = mockEvents[eventIndex].registrations;
  mockEvents[eventIndex] = {
    ...updatedEvent,
    registrations: originalRegistrations
  };
  syncEvents();
  return mockEvents[eventIndex];
};

export const mockPatients = [
  {
    id: 1,
    name: "Alice Smith",
    age: 45,
    gender: "Female",
    phone: "555-0101",
    bloodGroup: "A+",
    status: "Admitted",
  },
  {
    id: 2,
    name: "Bob Johnson",
    age: 32,
    gender: "Male",
    phone: "555-0102",
    bloodGroup: "O-",
    status: "Discharged",
  },
  {
    id: 3,
    name: "Charlie Brown",
    age: 28,
    gender: "Male",
    phone: "555-0103",
    bloodGroup: "B+",
    status: "Admitted",
  },
  {
    id: 4,
    name: "Diana Prince",
    age: 38,
    gender: "Female",
    phone: "555-0104",
    bloodGroup: "AB+",
    status: "Outpatient",
  },
];

export const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiology",
    shift: "08:00 - 16:00",
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Mark Sloan",
    specialization: "Neurology",
    shift: "10:00 - 18:00",
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    specialization: "Pediatrics",
    shift: "09:00 - 17:00",
    status: "On Leave",
  },
];

export const mockAppointments = [
  {
    id: 1,
    patient: "Alice Smith",
    doctor: "Dr. Sarah Jenkins",
    date: "2026-05-04",
    time: "10:00 AM",
    status: "Scheduled",
  },
  {
    id: 2,
    patient: "Diana Prince",
    doctor: "Dr. Emily Chen",
    date: "2026-05-04",
    time: "11:30 AM",
    status: "Completed",
  },
  {
    id: 3,
    patient: "Bob Johnson",
    doctor: "Dr. Mark Sloan",
    date: "2026-05-05",
    time: "02:00 PM",
    status: "Cancelled",
  },
];

export const mockRooms = [
  { id: 101, type: "ICU", status: "Occupied", patient: "Alice Smith" },
  { id: 102, type: "Private", status: "Available", patient: null },
  { id: 103, type: "General", status: "Occupied", patient: "Charlie Brown" },
  { id: 104, type: "General", status: "Maintenance", patient: null },
];

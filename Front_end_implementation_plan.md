# Hospital Management System React Frontend

This document outlines the plan to build the front end for the Hospital Management System using React and Vite, interfacing with the defined backend blueprint.

## User Review Required

> [!IMPORTANT]  
> I have updated the plan to explicitly include the **React Router setup for Doctors** and the corresponding `Doctors.jsx` page. 
> 
> The styling will be strictly **Vanilla CSS** with a modern, high-end design (e.g., subtle glassmorphism, dynamic animations, modern typography like 'Inter'). We will avoid TailwindCSS. Does this updated plan look complete to you?

> [!IMPORTANT]
> The backend endpoints assume standard REST APIs with JWT authentication. For this iteration, we will mock the backend API calls or set up a lightweight service layer if a real backend is not yet running.

## Open Questions

- Should the default theme be light mode or dark mode? (I propose a sleek dark mode with vibrant medical teal/blue accents).

## Proposed Changes

We will create a new Vite React application in `C:\Users\Personal\.gemini\antigravity\scratch\hospital-management-frontend`.

### Environment Setup

- We will run `mkdir C:\Users\Personal\.gemini\antigravity\scratch\hospital-management-frontend` followed by `npx -y create-vite@latest ./ --template react --no-interactive` within that directory.
- We will install essential dependencies: `react-router-dom` for routing and `lucide-react` for modern iconography.

### Core Architecture & Routing

#### [NEW] `src/main.jsx` & `src/App.jsx`
Setup React Router with the following routes:
- `/login`: Authentication page.
- `/`: Main dashboard overview.
- `/patients`: Patient directory and registration.
- `/doctors`: Doctor directory, availability, and scheduling view. **(Added)**
- `/appointments`: Appointment scheduling and calendar view.
- `/rooms`: Room availability and patient admission.
- `/billing`: Financial overview and bill generation.

#### [NEW] `src/index.css`
Establish a robust design system with CSS variables for:
- Colors (primary, secondary, background, surface, text, success, warning, error).
- Typography (Inter font).
- Shadows, border radiuses, and glassmorphism utilities.
- Keyframe animations (fade-in, slide-up).

### Components

#### [NEW] `src/components/Sidebar.jsx`
Navigation sidebar with links to all major modules (including Doctors), highlighting the active route.

#### [NEW] `src/components/Header.jsx`
Top bar containing user profile, role display, and global actions.

#### [NEW] `src/components/Card.jsx`
A reusable, premium-looking container component for dashboard widgets.

#### [NEW] `src/components/Button.jsx`
Interactive button component with primary, secondary, and ghost variants.

### Pages

#### [NEW] `src/pages/Dashboard.jsx`
A visually stunning overview with statistics cards.

#### [NEW] `src/pages/Patients.jsx`
A clean, responsive table to list patients and a modal/form to register new patients.

#### [NEW] `src/pages/Doctors.jsx`
**(New addition)** A view to list all doctors, their specializations, their shift timings, and active status.

#### [NEW] `src/pages/Appointments.jsx`
A view to manage and schedule new appointments.

#### [NEW] `src/pages/Rooms.jsx`
A grid or list layout visualizing room occupancy.

#### [NEW] `src/pages/Billing.jsx`
Financial overview and bill generation.

## Verification Plan

### Manual Verification
1. Run `npm install` and `npm run dev` to start the Vite server.
2. Verify that the UI renders correctly and looks modern and dynamic.
3. Click through the routing (including `/doctors`) to ensure `react-router-dom` transitions work smoothly.
4. Test the mock data or service functions to verify state updates across components.

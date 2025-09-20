# 📅 Syllabus to Calendar

A web application that converts a course syllabus into calendar events.  
Built with **TypeScript, Next.js, and Node.js**, and deployed on **Vercel**.

---

## 🚀 Live Demo
🔗 [View App on Vercel](https://syllabus-calendar-cpbx.vercel.app/)

---

## 📂 Repository
This repository contains the complete source code for the project.  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript + TailwindCSS  
- **Backend:** Node.js (via Next.js API Routes)  
- **Deployment:** Vercel  
- **Libraries & Tools:**  
  - `date-fns` → Date parsing and formatting  
  - `ics` → Generate `.ics` calendar files  
  - `shadcn/ui` + `lucide-react` → Modern UI components  

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/namratha231/syllabus-to-calendar.git
cd syllabus-to-calendar

2. Install dependencies
npm install

3. Run locally (development mode)
npm run dev


The app will be available at: http://localhost:3000


4. Build for production
npm run build
npm start

Features

Upload or paste syllabus text.
Automatically parse dates, deadlines, and class events.
Display syllabus as a calendar inside the app.
Export events as .ics file to import into Google Calendar, Outlook, or Apple Calendar.
Modern UI using TailwindCSS and shadcn/ui.

Approach & Implementation

Parsing Input

The app accepts either typed or uploaded syllabus text.

Regex + date-fns utilities are used to detect and extract dates.

Event Creation

Events are structured with:

Title (e.g., Assignment 1 Due)

Date & optional time

Description

Calendar Integration

Events are exported to an .ics file using the ics library.

Users can import this file directly into calendar applications.

UI/UX Design

Built with shadcn/ui and TailwindCSS for a clean, responsive interface.



"use client";

import { useState, useEffect, ChangeEvent } from "react";
import * as chrono from "chrono-node";
import {
  Calendar,
  dateFnsLocalizer,
  Event as RBCEvent,
  SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { createEvents, EventAttributes } from "ics";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface MyEvent extends RBCEvent {
  type?: "exam" | "assignment" | "project";
}
import { enUS } from "date-fns/locale/en-US";

const locales = { "en-US": enUS };



const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function Home() {
  const [text, setText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date());

  // File upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setText(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  // Extract dates from syllabus
  const handleSubmit = (): void => {
    if (!text) {
      alert("Please upload or paste a syllabus first!");
      return;
    }

    const results = chrono.parse(text);
    const extractedEvents: MyEvent[] = results.map((res) => {
      const date = res.start!.date();
      let type: MyEvent["type"] = "assignment";
      if (/exam|midterm|final/i.test(res.text)) type = "exam";
      if (/project/i.test(res.text)) type = "project";

      return {
        title: (res.text || "").trim(),
        start: date,
        end: new Date(date.getTime() + 60 * 60 * 1000),
        type,
      };
    });

    setEvents(extractedEvents);

    const now = new Date();
    const nextEvent = extractedEvents.find((ev) => ev.start! >= now);
    if (nextEvent) setDefaultDate(nextEvent.start!);
  };

  // ICS Download
  const handleDownloadICS = (): void => {
    if (events.length === 0) {
      alert("No events to export!");
      return;
    }

    const icsEvents: EventAttributes[] = events.map((event) => ({
      start: [
        event.start!.getFullYear(),
        event.start!.getMonth() + 1,
        event.start!.getDate(),
        event.start!.getHours(),
        event.start!.getMinutes(),
      ],
      end: [
        event.end!.getFullYear(),
        event.end!.getMonth() + 1,
        event.end!.getDate(),
        event.end!.getHours(),
        event.end!.getMinutes(),
      ],
      title: String(event.title),
      status: "CONFIRMED",
      busyStatus: "BUSY",
    }));

    createEvents(icsEvents, (error, value) => {
      if (error) return console.error(error);
      const blob = new Blob([value!], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "syllabus-calendar.ics";
      link.click();
    });
  };

  // Event styling
  const eventStyleGetter = (event: MyEvent) => {
    let backgroundColor = "#3b82f6"; // default blue
    if (event.type === "exam") backgroundColor = "#ef4444";
    if (event.type === "project") backgroundColor = "#10b981";

    const now = new Date();
    if (
      event.start! >= now &&
      event.start!.getTime() - now.getTime() < 24 * 60 * 60 * 1000
    ) {
      backgroundColor = "#facc15"; // yellow for upcoming
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
      },
    };
  };

  // Browser notifications
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
  }, []);

  const notifyUpcoming = (event: MyEvent) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(`Upcoming: ${event.title}`, {
        body: `Starts at ${event.start!.toLocaleString()}`,
      });
    }
  };

  // Click to add new event
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const title = prompt("Enter event title:");
    if (title) {
      const newEvent: MyEvent = {
        title,
        start: slotInfo.start as Date,
        end: slotInfo.end as Date,
        type: "assignment",
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  };

  // Sort upcoming events
  const upcomingEvents = [...events]
    .filter((ev) => ev.start! >= new Date())
    .sort((a, b) => a.start!.getTime() - b.start!.getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">📘 Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <button className="text-left px-4 py-2 rounded-lg hover:bg-blue-600">
            📂 Upload
          </button>
          <button className="text-left px-4 py-2 rounded-lg hover:bg-blue-600">
            🗓 Calendar
          </button>
          <button className="text-left px-4 py-2 rounded-lg hover:bg-blue-600">
            ⚙️ Settings
          </button>
        </nav>
        <div className="mt-auto text-sm text-blue-200">
          &copy; {new Date().getFullYear()} Syllabus App
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            📅 Syllabus → Calendar
          </h1>
          <p className="text-gray-600">
            Upload your syllabus and view deadlines
          </p>
        </header>

        {/* Upload & Extract */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <input
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 mb-4"
          />
          {fileName && (
            <p className="mt-2 text-sm text-gray-500">Uploaded: {fileName}</p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your syllabus text here..."
            className="w-full h-40 p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 resize-none"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Extract Dates
          </button>
        </div>

        {/* Calendar + Upcoming */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                📌 Calendar View
              </h2>
              <Calendar
                localizer={localizer}
                events={events as unknown as RBCEvent[]}
                startAccessor="start"
                endAccessor="end"
                defaultDate={defaultDate}
                eventPropGetter={eventStyleGetter}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={(event) => alert(`Selected: ${event.title}`)}
                style={{ height: 550 }}
              />
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleDownloadICS}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  📥 Download (.ics)
                </button>
                <button
                  onClick={() => events.forEach(notifyUpcoming)}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                >
                  🔔 Notify Me
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                ⏰ Upcoming Events
              </h2>
              {upcomingEvents.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingEvents.map((event, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg shadow-sm flex flex-col"
                      style={{
                        backgroundColor:
                          event.type === "exam"
                            ? "#fee2e2"
                            : event.type === "project"
                            ? "#d1fae5"
                            : "#dbeafe",
                      }}
                    >
                      <span className="font-semibold">{event.title}</span>
                      <span className="text-sm text-gray-600">
                        {event.start!.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming events</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

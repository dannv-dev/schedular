import React, { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Bell,
  Filter,
  Search,
  Settings,
  Moon,
  Sun,
  MoreHorizontal,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  category: "work" | "personal" | "health" | "social";
  attendees?: string[];
  color: string;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Team Standup",
    description: "Daily standup meeting with the development team",
    date: new Date(),
    startTime: "09:00",
    endTime: "09:30",
    location: "Conference Room A",
    category: "work",
    attendees: ["John Doe", "Jane Smith", "Mike Johnson"],
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Product Review",
    description: "Quarterly product review with stakeholders",
    date: addDays(new Date(), 1),
    startTime: "14:00",
    endTime: "15:30",
    location: "Zoom Meeting",
    category: "work",
    attendees: ["Sarah Wilson", "Tom Brown"],
    color: "bg-purple-500",
  },
  {
    id: "3",
    title: "Gym Session",
    description: "Weekly workout session",
    date: addDays(new Date(), 2),
    startTime: "18:00",
    endTime: "19:30",
    location: "Local Gym",
    category: "health",
    color: "bg-green-500",
  },
];

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-purple-500",
  health: "bg-green-500",
  social: "bg-orange-500",
};

export default function CalendarScheduleApp() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    category: "work" as Event["category"],
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory,
      );
    }

    return filtered;
  }, [events, searchQuery, selectedCategory]);

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.date, date));
  };

  const getTodayEvents = () => {
    return filteredEvents.filter((event) => isSameDay(event.date, new Date()));
  };

  const getUpcomingEvents = () => {
    return filteredEvents
      .filter((event) => event.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const handleCreateEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      attendees: [],
      color: categoryColors[newEvent.category],
    };

    setEvents([...events, event]);
    setIsCreateEventOpen(false);
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      category: "work",
    });
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card
      className="mb-3 hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: event.color.replace("bg-", "#") }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="w-3 h-3" />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
            )}
            {event.description && (
              <p className="text-xs text-muted-foreground mb-2">
                {event.description}
              </p>
            )}
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="ml-2">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const WeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-1 h-[600px]">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="border rounded-lg p-2 bg-card"
          >
            <div
              className={`text-center mb-2 p-2 rounded ${isToday(day) ? "bg-primary text-primary-foreground" : ""}`}
            >
              <div className="text-xs font-medium">{format(day, "EEE")}</div>
              <div className="text-lg font-bold">{format(day, "d")}</div>
            </div>
            <ScrollArea className="h-[480px]">
              {getEventsForDate(day).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs p-2 mb-1 rounded ${event.color} text-white cursor-pointer hover:opacity-90`}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="opacity-90">{event.startTime}</div>
                </div>
              ))}
            </ScrollArea>
          </div>
        ))}
      </div>
    );
  };

  const DayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="border-b border-border/30 h-16 flex">
                <div className="w-16 p-2 text-sm text-muted-foreground border-r">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 relative">
                  {dayEvents
                    .filter(
                      (event) =>
                        parseInt(event.startTime.split(":")[0]) === hour,
                    )
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`absolute inset-x-1 top-1 p-2 rounded text-white text-xs ${event.color} cursor-pointer hover:opacity-90`}
                        style={{ height: "50px" }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="opacity-90">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-background transition-colors ${isDarkMode ? "dark" : ""}`}
    >
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Schedule
                </h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Day
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>

              <Dialog
                open={isCreateEventOpen}
                onOpenChange={setIsCreateEventOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        placeholder="Event title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                        placeholder="Event description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={newEvent.startTime}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, location: e.target.value })
                        }
                        placeholder="Event location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEvent.category}
                        onValueChange={(value: Event["category"]) =>
                          setNewEvent({ ...newEvent, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateEvent} className="w-full">
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Mini Calendar */}
              <Card>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border-0"
                    modifiers={{
                      hasEvents: (date) => getEventsForDate(date).length > 0,
                    }}
                    modifiersStyles={{
                      hasEvents: {
                        backgroundColor: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Today's Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Today's Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getTodayEvents().length > 0 ? (
                    getTodayEvents().map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No events today
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getUpcomingEvents().length > 0 ? (
                    getUpcomingEvents().map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No upcoming events
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">
                  {viewMode === "month" && format(selectedDate, "MMMM yyyy")}
                  {viewMode === "week" &&
                    `${format(startOfWeek(selectedDate), "MMM d")} - ${format(endOfWeek(selectedDate), "MMM d, yyyy")}`}
                  {viewMode === "day" && format(selectedDate, "MMMM d, yyyy")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (viewMode === "month") {
                        setSelectedDate(
                          new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth() - 1,
                          ),
                        );
                      } else if (viewMode === "week") {
                        setSelectedDate(addDays(selectedDate, -7));
                      } else {
                        setSelectedDate(addDays(selectedDate, -1));
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (viewMode === "month") {
                        setSelectedDate(
                          new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth() + 1,
                          ),
                        );
                      } else if (viewMode === "week") {
                        setSelectedDate(addDays(selectedDate, 7));
                      } else {
                        setSelectedDate(addDays(selectedDate, 1));
                      }
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {viewMode === "month" && (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border w-full"
                    classNames={{
                      months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-lg font-semibold",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell:
                        "text-muted-foreground rounded-md w-full font-normal text-sm",
                      row: "flex w-full mt-2",
                      cell: "relative h-24 w-full text-center text-sm p-1 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                      day: "h-full w-full p-1 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground flex flex-col items-start justify-start",
                      day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today:
                        "bg-accent text-accent-foreground font-semibold",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                    }}
                    components={{
                      DayContent: ({ date }) => (
                        <div className="w-full h-full flex flex-col">
                          <span className="text-sm font-medium mb-1">
                            {date.getDate()}
                          </span>
                          <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                            {getEventsForDate(date)
                              .slice(0, 2)
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                            {getEventsForDate(date).length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{getEventsForDate(date).length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    }}
                  />
                )}
                {viewMode === "week" && <WeekView />}
                {viewMode === "day" && <DayView />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

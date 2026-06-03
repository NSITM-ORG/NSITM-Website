import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../libs/cn";

// You can import buttonVariants if you still have it, or just use the classes directly
// import { buttonVariants } from "./button";

const Calendar = ({
  className,
  classNames = {},
  showOutsideDays = true,
  month,
  onMonthChange,
  selected,
  onSelect,
  ...props
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date());

  const displayMonth = month || currentMonth;

  const handlePrevMonth = () => {
    const newMonth = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() - 1,
    );
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() + 1,
    );
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const year = displayMonth.getFullYear();
  const monthIndex = displayMonth.getMonth();

  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const daysArray = [];
  // Previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const isSelected = (day) => {
    if (!selected || !day) return false;
    return (
      selected.getDate() === day &&
      selected.getMonth() === monthIndex &&
      selected.getFullYear() === year
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === monthIndex &&
      today.getFullYear() === year
    );
  };

  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className={cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity absolute left-1 flex items-center justify-center rounded-md hover:bg-accent",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-sm font-medium">
          {displayMonth.toLocaleString("default", { month: "long" })} {year}
        </div>

        <button
          onClick={handleNextMonth}
          className={cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity absolute right-1 flex items-center justify-center rounded-md hover:bg-accent",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="flex w-full mb-2">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, index) => {
          const isOutside = day === null;
          if (isOutside && !showOutsideDays)
            return <div key={index} className="h-9 w-9" />;

          const dayNumber = day || 1;
          const isCurrentMonthDay = day !== null;

          return (
            <button
              key={index}
              disabled={!isCurrentMonthDay}
              onClick={() => {
                if (!isCurrentMonthDay) return;
                const selectedDate = new Date(year, monthIndex, dayNumber);
                onSelect?.(selectedDate);
              }}
              className={cn(
                "h-9 w-9 text-sm font-normal rounded-md flex items-center justify-center relative",
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                !isCurrentMonthDay &&
                  "text-muted-foreground opacity-30 pointer-events-none",
                isSelected(day) &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isToday(day) &&
                  !isSelected(day) &&
                  "bg-accent text-accent-foreground",
                classNames.day,
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

Calendar.displayName = "Calendar";

export { Calendar };


{/* <Calendar
  selected={selectedDate}
  onSelect={setSelectedDate}
  month={currentMonth}
  onMonthChange={setCurrentMonth}
/>; */}
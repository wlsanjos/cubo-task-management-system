"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-bold text-on-surface",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-on-surface-variant/40 rounded-md w-9 font-bold text-[0.8rem] uppercase text-center",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-surface-container-low transition-all"
        ),
        day_button: "h-9 w-9 p-0 font-normal",
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary-container text-white hover:bg-primary-container hover:text-white focus:bg-primary-container focus:text-white shadow-sm font-bold",
        today: "bg-surface-container-low text-on-surface font-black ring-1 ring-primary/5",
        outside:
          "day-outside text-on-surface-variant/20 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-on-surface-variant/20 aria-selected:opacity-30",
        disabled: "text-on-surface-variant/20 opacity-50",
        range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-on-surface",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

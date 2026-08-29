// please don't set the start date to be later than the end date!!!
export type Holiday = {
  start: Temporal.PlainDate,
  end: Temporal.PlainDate
}

function next_weekday(d: Temporal.PlainDate): Temporal.PlainDate {
  // just skips over saturday (6) and sunday (0)
  return skip_weekend(d.add(Temporal.Duration.from(`P1D`)));
}

function skip_weekend(d: Temporal.PlainDate): Temporal.PlainDate {
  // same as next_weekday but no adding
  return d.add(Temporal.Duration.from(`P${d.dayOfWeek == 6 ? 2 : d.dayOfWeek == 7 ? 1 : 0}D`));
}

function days_of_holiday(h: Holiday): Temporal.PlainDate[] {
  let ret = [];

  let start: Temporal.PlainDate = skip_weekend(h.start);
  for (let d = start; Temporal.PlainDate.compare(d, h.end) != 1; d = next_weekday(d)) {
    ret.push(d);
  }

  return ret;
}

/// utility for math of dates and times in relation to the schoolyear.
export class Schoolyear {
  start_date: Temporal.PlainDate;
  end_date: Temporal.PlainDate;
  holidays: Holiday[] = [];

  constructor(start_date: Temporal.PlainDate, end_date: Temporal.PlainDate, holidays?: Holiday[]) {
    this.start_date = start_date;
    this.end_date = end_date;

    if (holidays) {
      this.holidays = holidays
        .filter((a) => Temporal.PlainDate.compare(a.start, this.start_date) != -1 && Temporal.PlainDate.compare(a.start, this.end_date) != 1)
        .sort((a, b) => Temporal.PlainDate.compare(a.start, b.start));
    }
  }

  get_list_of_days(): Temporal.PlainDate[] {
    let days: Temporal.PlainDate[] = [];
    // clone the array so we can perform some fun operations on it
    let hol_i = 0;
    for (var day = this.start_date; Temporal.PlainDate.compare(day, this.end_date) < 1; day = next_weekday(day)) {
      function check_for_schoolday(holidays: Holiday[]): boolean {
        if (hol_i < holidays.length) {
          let hol = holidays[hol_i];

          // if we're past the holiday start date 
          if (Temporal.PlainDate.compare(day, hol.start) != -1) {
            // AND we're past the holiday end date
            if (Temporal.PlainDate.compare(day, hol.end) == 1) {
              hol_i += 1; // then we're out of the holiday and should go to the next one
              return check_for_schoolday(holidays); // make sure we're not in that holiday too

            } else { // otherwise, we're IN the holiday
              return false
            }
          }
        }

        return true;
      }

      if (!check_for_schoolday(this.holidays)) continue;

      // at this point, we're not in a holiday, so add it to the array.
      
      days.push(day)
    }

    return days;
  }

  get_holidays(): Temporal.PlainDate[] {
    return this.holidays.flatMap(days_of_holiday)
  }

  // slower than get_list_of_days overall!!! it has to check all holidays per call!
  day_is_schoolday(d: Temporal.PlainDate): boolean {
    if(d.dayOfWeek == 6 || d.dayOfWeek == 0) return false;
    let is_schoolday = true;

    for(const h of this.holidays)
      if (Temporal.PlainDate.compare(d, h.start) != 1 && Temporal.PlainDate.compare(d, h.end) < -1) {
        is_schoolday = false;
        break;
      }

    return is_schoolday;
  }

  date_percentage(d: Temporal.PlainDate): number {
    let i = this.end_date.since(this.start_date).total("days");
    return (d.since(this.start_date).total("days") / i) * 100;
  }

  days_passed(days: Temporal.PlainDate[], d: Temporal.PlainDate): number {
    let i = days.findIndex((a)=>Temporal.PlainDate.compare(a, d)!=-1)
    return i > 0 ? i : 0
  }  

  days_remaining(days: Temporal.PlainDate[], d: Temporal.PlainDate): number {
    return days.length - this.days_passed(days, d)
  }

  

  // goofy!
  get_xy(d: Temporal.PlainDate): {x: number, y: number} {
    return {x: d.dayOfWeek-1, y: Math.floor(d.since(this.start_date.subtract(Temporal.Duration.from(`P${this.start_date.dayOfWeek-1}D`))).total({unit: "weeks", relativeTo: this.start_date}))};
  }
}

export const start_date_def = Temporal.PlainMonthDay.from("--08-28");
export const end_date_def = Temporal.PlainMonthDay.from("--05-22");
export const default_holidays: Holiday[] = [
  {
    start: Temporal.PlainDate.from("0000-10-17"),
    end: Temporal.PlainDate.from("0000-10-31")
  },
  {
    start: Temporal.PlainDate.from("0000-12-19"),
    end: Temporal.PlainDate.from("0001-01-02")
  },
  {
    start: Temporal.PlainDate.from("0001-03-21"),
    end: Temporal.PlainDate.from("0001-03-29")
  },
  {
    start: Temporal.PlainDate.from("0001-02-02"),
    end: Temporal.PlainDate.from("0001-02-02")
  },
  {
    start: Temporal.PlainDate.from("0001-03-17"),
    end: Temporal.PlainDate.from("0001-03-17")
  }
]

export function default_schoolyear(ref_date: Temporal.PlainDate, start_date: Temporal.PlainMonthDay, end_date: Temporal.PlainMonthDay): Schoolyear {
  // use last year as the starting year if ref_date is before this years start date
  let year = ref_date.year - (Temporal.PlainDate.compare(ref_date, start_date.toPlainDate({year: ref_date.year})) == -1 ? 1 : 0)

  return new Schoolyear(
    start_date.toPlainDate({year: year}), 
    end_date.toPlainDate({year: year+1}),
    default_holidays.map((hol) => {
        hol.start = hol.start.add(Temporal.Duration.from(`P${year}Y`));
        hol.end = hol.end.add(Temporal.Duration.from(`P${year}Y`));
        console.log(hol);
        return hol
  }))
}
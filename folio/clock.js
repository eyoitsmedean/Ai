/* Device calendar for the ninety-day folio.
   Dates are the local calendar of the clock you pass in.
   4 Sep 2026 start · October Red through 31 Oct · 1 Nov–3 Dec inclusive.
   This file does not authorize an application. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NinetyClock = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var START = [2026, 9, 4];
  var YELLOW_START = [2026, 11, 1];
  var END = [2026, 12, 3];
  var ADVENT = [2026, 11, 29];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function civil(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  }
  function cmp(a, b) {
    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  }
  function inclusive(from, to) {
    var a = Date.UTC(from[0], from[1] - 1, from[2]);
    var b = Date.UTC(to[0], to[1] - 1, to[2]);
    return Math.round((b - a) / 86400000) + 1;
  }
  function read(date) {
    var today = civil(date);
    var phase = cmp(today, YELLOW_START) < 0 ? "red" : cmp(today, END) > 0 ? "ended" : "open";
    var daysLeft = phase === "ended" ? 0 : phase === "red" ? inclusive(YELLOW_START, END) : inclusive(today, END);
    var usedThrough = cmp(today, END) > 0 ? END : today;
    var daysUsed = cmp(today, START) < 0 ? 0 : inclusive(START, usedThrough);
    return {
      today: today,
      phase: phase,
      daysLeft: daysLeft,
      daysUsed: daysUsed,
      weekday: WEEKDAYS[date.getDay()],
      label: WEEKDAYS[date.getDay()] + " " + today[2] + " " + MONTHS[today[1] - 1] + " " + today[0],
      short: today[2] + " " + MONTHS[today[1] - 1],
      adventSpan: inclusive(ADVENT, END)
    };
  }
  return { read: read, inclusive: inclusive, START: START, YELLOW_START: YELLOW_START, END: END, ADVENT: ADVENT };
});

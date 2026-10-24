# HopKit Life Planner — planned scope

Added 2026-10-23 at the user's request. **Planning only; no implementation or
release added to the current combined branding/General/Home/Delivery work.**
Source: the requirements pasted by the user from their
[lifestyle chat](https://chatgpt.com/g/g-p-67c54900ff9481919f3bf456ee1db279-lifestyle/c/6ad93881-0cf8-83ed-9669-5c979b1f3e23).
The linked conversation could not be fetched; this plan uses the supplied text.

## Goal and daily experience

Help choose a manageable day using HopKit's existing planning records. Keep a
small editable overview, with flexible anchors and room for interruptions. No
rigid calendar, automatic schedule optimization or new notifications.

- **Morning:** show today's mode, sleep/meals/work anchors, exercise and a short
  chosen list of personal tasks or linked shopping/meal plans. Make it easy to
  reduce the plan and leave time unallocated.
- **During the day:** edit an anchor, switch modes, move a workout or remove a
  commitment without rebuilding the whole plan. Planning a shopping errand does
  not mark its Items purchased.
- **Evening, about five minutes:** review what happened, postpone or skip unfinished
  commitments, choose tomorrow's essentials and adjust its mode/anchors. No
  required journaling or exhaustive backlog review.

## Routine, capacity and modes

Default sleep is **00:00–08:30**. Meals, **8 hours of company work** and personal
time are adjustable anchors; meal times, work start/end and breaks are not yet
specified. Allow flexible windows or duration-only entries instead of requiring
every activity to have a clock time. Company work is planned capacity, not a
timesheet entry or evidence of hours worked.

Day modes are separate from General/Home/Food **collection modes**. They change
the day's suggested load, never source records or completion states silently.

| Day mode | Intended behavior |
| --- | --- |
| Normal | Usual anchors and work allowance, selected tasks and exercise; optional personal project time of 0–2 hours when capacity allows. |
| Busy | Keep essential anchors and commitments visible; reduce optional work and offer easy postponement of the rest. |
| Emergency | Unexpected startup work takes priority in the plan. Show what no longer fits and let the user choose what moves or is skipped; do not silently compress sleep or move every task to tomorrow. |

Personal projects are always optional; **zero hours is a valid plan**, with no
catch-up debt. Show conflicting commitments without enforcing an uneditable
schedule. All defaults, anchors, durations and individual day choices stay editable.

## Weekly exercise and recovery

- Plan **two gym sessions plus volleyball each week**. Days, durations and
  volleyball timing remain editable; do not invent fixed days.
- Rescheduling moves the same planned session, avoiding duplicate workouts. A
  skipped session does not become debt in the next week.
- A late weekend night can override that night's sleep and the following day's
  anchors. Recovery days reduce optional commitments and allow exercise to move.
  These date-specific changes do not rewrite the normal weekday routine.
- Keep a simple week summary of planned/completed/skipped exercise. This is not
  a fitness tracker or a rigid recurring calendar.

## Reuse first; distinguish existing features from gaps

| Need | Reuse and smallest missing piece |
| --- | --- |
| Shopping and groceries | Reuse Collections/Items, notes, priorities, deadlines, quantities and purchase history. Link an errand to the existing list. Count-based grocery shopping fits today; measured ingredients and pantry arithmetic do not. |
| Meals | Food is planned, not implemented. Initially allow an editable meal note or link in the day plan. Connect recipes, meal assignments and ingredient shopping when the Food workflow exists; do not make a full Food build a prerequisite. |
| Chores and personal tasks | Purchase statuses are not generic task completion. Check for a suitable existing task resource before adding a minimal personal task/occurrence model; never use “purchased” to mean a chore is done. |
| Personal projects | Reuse existing briefs, notes and links where suitable; add only an optional daily time allowance and selected next action. No second project-management system. |
| Company work | Reuse links to authoritative work tools when available. The local Delivery pilot has separate Todoless identity, review and time-accounting rules; do not copy its workflow into personal planning or automatically log the 8-hour allowance. |
| Daily/weekly planning | Missing: routine defaults, date overrides, day mode, lightweight exercise occurrences and the morning/evening flow. Reference existing records rather than duplicating shopping or project data. |
| Shared foundation | Reuse identity, access checks, UI controls, English/Farsi, RTL, themes and mobile layouts. General/Home mode settings and the neutral shell are local work awaiting release; verify availability before relying on them. |

Keep personal routine/task data private to its owner by default. Referencing a
shared collection does not share the person's schedule or grant new access to
that collection. A removed or inaccessible source should not break the day view.

## Unfinished work without an accumulating backlog

- **Postpone:** move the same daily commitment to a chosen day, or return it to
  an unscheduled “Later” list. Do not create another task or silently alter the
  linked source's deadline.
- **Skip:** dismiss that occurrence from the day. Retain the source task/list and
  future routine occurrences; skipping is not deletion, archival or completion.
- **Complete:** mark a personal task or exercise occurrence done only through its
  appropriate action. Linked purchases retain their existing purchase workflow.
- **No automatic carryover:** yesterday's unfinished entries do not fill today's
  plan. Offer a short optional review, with selection, postponement and bulk skip;
  older unselected entries stay out of the daily overview, available on demand.
- Recurring chores/exercise do not create a growing pile of overdue occurrences.
  Keep only the current planning period active, with past outcomes available in
  history. A recurring occurrence's completion does not complete its template.

## Ordered implementation plan — when this work is selected

1. **Confirm the reuse map against the then-current release.** Inspect existing
   task, collection, permission and Food APIs. Decide the smallest persistence
   additions for personal routines, day overrides and linked occurrences. Define
   local-day/timezone behavior, preserving compatibility with existing records.
2. **Ship one small usable daily flow.** Editable anchors and three modes, morning
   overview, optional project allowance and evening completion/postpone/skip.
   Include the no-carryover rules from the start; reuse shopping links and manual
   meal notes. Add a minimal personal task only if no suitable resource exists.
3. **Add the flexible week.** Two gym sessions plus volleyball, move/skip controls,
   late-night overrides and recovery days. Preserve routine defaults and prevent
   duplicate or overdue recurring occurrences.
4. **Connect richer Food data when available.** Reuse its meal and grocery
   contracts; preserve the manual path. Measured units, pantry subtraction and
   repeat-shopping history remain governed by [GENERALIZATION.md](./GENERALIZATION.md#food-boundary).

This is a future workstream, not another selectable collection mode. Its priority
relative to Food and Activity can be selected later; it does not reorder the
current combined release. Use the existing app and backend. No separate app,
calendar sync, notification service or AI integration is needed for the first slice.

## Acceptance examples for implementation

- Normal day shows the editable 00:00–08:30 sleep and 8-hour work defaults. Choosing
  zero project time succeeds, and meals need no recipe or fixed timestamp.
- Switching to Busy or Emergency offers a smaller plan; it neither marks tasks
  done nor automatically reschedules them. Conflicts remain visible and editable.
- Moving a gym session preserves its identity and the weekly count. Moving
  volleyball changes that session; skipping a workout does not add next-week debt.
- A late Saturday night and Sunday recovery override leave Monday's routine intact.
  Overnight sleep and dates behave correctly across the chosen timezone and DST.
- An unfinished chore can move, return to Later or be skipped. Reopening tomorrow
  shows only chosen commitments; no duplicate task or recurring overdue pile appears.
- Skipping a grocery errand leaves its shopping records and purchase history intact.
  Marking an errand done never claims ingredients were bought or consumed.
- The morning overview and evening flow work on mobile, by keyboard and in Farsi
  RTL. Existing collection permissions and personal schedule privacy remain intact.

Next: retain this plan alongside the current release work; start implementation
only when the user selects the Life Planner task.

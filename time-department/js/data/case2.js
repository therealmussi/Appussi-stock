/* TIME DEPARTMENT — CASE 002 data */
(function (root) {
  "use strict";
  var CASE = {
    id: "TC-002", number: 2, difficulty: 2,
    title: "The Train That Arrived Yesterday",
    location: "Central Station — Platform 3 / East Yard",
    dateOfAnomaly: "Night of 19\u201320 November",
    severity: "III",
    brief:
      "At 09:15, a full passenger train arrived on Platform 3 — and the paperwork says it should not even exist yet. That sentence is wrong in every particular, and it is the opening line of the anomaly report, which is exactly why you were handed this case.\n\nWhat actually happened: trainset 88-12 is standing on Platform 3. Its scheduled DEPARTURE is today at 11:40. It is full of passengers who all disembarked at 09:15 insisting they have just completed an ordinary journey. Station surveillance insists the trainset has been standing on that platform since the previous evening.\n\nSomeone will tell you the train arrived before it departed. Nobody will tell you the train never went anywhere.",
    objectives: [
      "Reconstruct the true sequence of events for trainset 88-12 between 20:47 and 09:20.",
      "Reconcile the passengers' memory of a morning journey with the ticket record of an evening one.",
      "Identify the physical footprint of the anomaly.",
      "Establish the root cause of the signal fault logged at 22:47."
    ],
    evidence: [
      {
        id: "v1", name: "Anomaly intake report", type: "document", icon: "▤",
        summary: "The opening framing \u2014 and the one useful line buried in it.",
        body: "INTAKE 19-1121: \u201cPassenger train observed arriving Platform 3 at 09:15. Timetabled departure of same service: 11:40. Arrival precedes scheduled departure by 2h 25m. Recommend immediate reclassification.\u201d\n\nIn the annex, smaller: \u201cTrainset identified by platform duty officer as 88-12. Car consists LRV-301/302.\u201d\n\nThe intake compares an arrival with a departure for the same TRAINSET NUMBER but not the same service. Trainset 88-12 runs two services a day: it arrives in the evening, and departs the next day late morning. Whoever wrote \u2018the train arrived before its departure\u2019 compared Tuesday's sheet with Wednesday's.",
        details: ["Full roster cross-check (Laboratory): the 11:40 departure is a return service FORMED from 88-12 the next day. The train did not arrive early. The paperwork that generated this case is comparing two different service entries."],
        key: true
      },
      {
        id: "v2", name: "Service roster, trainset 88-12", type: "record", icon: "▥",
        summary: "20:50 service Valebridge\u2192Central, arrives 22:40. Forms the 11:40 return next day.",
        body: "Standard roster: 88-12 performs the 20:50 Valebridge\u2192Central service, scheduled arrival 22:40, and overnight stabling on Platform 3 before forming the 11:40 return service the following morning. Two services, one trainset, one night between them.",
        details: ["The overnight stand is not unusual. What is unusual is that the duty log for the overnight stand contains one entry written at 22:47 and then nothing at all until 09:15."]
      },
      {
        id: "v3", name: "Passenger statement: Mrs. E. Auld", type: "witness", icon: "☏",
        summary: "Boarded \u2018this morning\u2019. Her companion boarded \u2018the evening before\u2019. Same journey. Both saw the long red-signal stop.",
        body: "\u201cI got on this morning, around nine, at Valebridge. The carriage was calm. We stopped at a red signal outside the station for the longest time \u2014 not troubling, just quiet. Then we slid in and it was ten past nine and my daughter was waiting on the platform.\u201d\n\nThe duty officer notes, appended: Mrs. Auld's travel companion, Mr. P. Osser, states they boarded TOGETHER, 20:49 the previous evening, for \u201cthe late one\u201d. Both describe the same quiet outside the station. Mrs. Auld's wristwatch, seized for reading at 09:31 the next day, reads 23:07 and is running.",
        details: ["Full reconciliation table (Laboratory): two witnesses, one journey, two different departure days. And a wristwatch ten hours behind the platform clock \u2014 still ticking, still wrong, still confident."],
        key: true
      },
      {
        id: "v4", name: "Passenger statement: Mr. R. Bessel", type: "witness", icon: "☏",
        summary: "Insists he boarded at 09:04. His ticket says 20:51 the previous evening. His phone died \u2018on the way\u2019.",
        body: "\u201cI boarded at four past nine. I always catch the nine. I don't know what your machine is doing with that date.\u201d\n\nThe ticket in his coat pocket was machine-validated at Valebridge at 20:51 the previous evening, service 20:50. Bessel's phone: dead. Bessel's expression when shown the ticket: the particular blankness of a man being asked to defend a memory against a receipt.",
        details: ["Full statement review: Bessel 'remembers' watching the platform clock on Valebridge read 09:0X as the doors closed. Valebridge platform clock: synchronized to station master clock. No fault recorded. One of the two clocks is lying, and it is not the one with a maintenance history."]
      },
      {
        id: "v5", name: "Ticket validation export", type: "record", icon: "▥",
        summary: "41 validations, 20:47\u201320:52 the previous evening, service 20:50, trainset 88-12.",
        body: "Full validation export for Valebridge, evening of 19 November. 41 validations between 20:47 and 20:52, all against service 20:50 (trainset 88-12). No validations at all between 20:52 and 09:14. The 09:15 \u2018arrival\u2019 unloaded exactly 41 passengers plus 2 crew.",
        details: ["Full reconciliation (Laboratory): passengers aboard at 09:15 = passengers who validated at 20:51 the night before. To the person. Whatever the journey was, it had the same beginning and the same end, and a very strange middle."]
      },
      {
        id: "v6", name: "Platform 3 surveillance, overnight", type: "surveillance", icon: "▣",
        summary: "The train stands all night. Nothing on the platform moves \u2014 except a pigeon, every 89 seconds, 423 times.",
        body: "Full overnight extract. 22:40 \u2014 88-12 arrives, doors open, nine passengers disembark, doors close. 22:47 \u2014 all platform movement ceases. A pigeon crosses the platform. The same pigeon crosses again 89 seconds later. And again. 423 identical crossings until 09:14. Between crossings: no staff, no passengers, no wind, no flicker. The night cleaner mops past the stationary train twice and does not look at it once.",
        details: ["Full frame audit (Laboratory): the pigeon is not 423 pigeons. Identical wing positions, identical shadow, one crossing stamped at 89-second intervals. Something onto which the night was being copied \u2014 flat, patient, and cheap."]
      },
      {
        id: "v7", name: "Railway control log", type: "record", icon: "▥",
        summary: "22:47 \u2018signal fault E-9, 88-12 held.\u2019 08:50 \u2018D-4 dead-poll \u00d73 \u2014 escalate.\u2019 09:12 \u2018D-4 restart.\u2019",
        body: "Control room log entries: 22:40 arrival logged normally. 22:47: \u201cSignal fault E-9, 88-12 held at Platform 3, crew advised.\u201d Nothing between 22:47 and 08:50. 08:50: \u201cDamping station D-4 dead-poll \u00d73 \u2014 escalate to grid supervisor.\u201d 09:12: \u201cD-4 restarted by emergency crew.\u201d 09:15: doors open.\n\nThe dispatcher who called it a signal fault was standing outside the anomaly looking at its façade. From the control room, a stalled region of space presents exactly like a signal that will not change.",
        details: ["Full log provenance (Laboratory): D-4 is a line-side chronometric damping station \u2014 the kind of equipment railway control rooms are not told exists. The escalation at 08:50 happened only because the polling software in D-4 was still reachable from outside the bubble."]
      },
      {
        id: "v8", name: "Onboard event recorder extract", type: "measurement", icon: "◈",
        summary: "Onboard clock: 17 minutes 04 seconds elapsed. Interior temperature dropped 3.2\u00b0C.",
        body: "Event recorder, trainset 88-12. Door-open event at 22:40. Door-open event (disembarkation) at 09:15 by onboard reckoning of the outside world \u2014 but the onboard master clock elapsed only 17m 04s between the two. Interior temperature trace: a drop of 3.2\u00b0C beginning at 22:47, holding flat, recovering at 09:15. No HVAC event recorded.",
        details: ["Full trace analysis (Laboratory): the onboard clock ran inside something whose local rate of time was compressed by a factor of roughly 37. It did not stutter, drift or stop. It simply lived out its 17 honest minutes while the world outside spent the night."],
        key: true
      },
      {
        id: "v9", name: "D-4 maintenance record", type: "document", icon: "◈",
        summary: "D-4 serviced six days ago. Replacement module stamped: A-1 series. Inhibition module.",
        body: "Maintenance record, damping station D-4. Six days before the incident: \u201cInhibition module replaced \u2014 contractor: HALDEN APPLIED CHRONOMETRY.\u201d The replaced module \u2014 retained in stores, as procedure requires \u2014 is stamped: A-1 series, J-7 derivative.\n\nA-1 was the designation stencilled on the instrument case carried into the Central Station signal compound in March. The inhibition module that failed over the East Yard came from the same family of parts as the unit that re-anchored Elias Marchetti's paperwork.",
        details: ["Full procurement trail (Laboratory): Halden's invoice for this works order is billed to an entity named only as \u2018Office of Continuity\u2019, which cannot be found on any org chart the railway maintains. Which is precisely how an office stays off an org chart."],
        janus: true, key: true
      },
      {
        id: "v10", name: "Statement: night cleaner, Platform 3", type: "witness", icon: "☕",
        summary: "\u201cI never once heard the doors. And my radio clock jumped ahead twice, both times while I faced the train.\u201d",
        body: "The cleaner worked Platform 3 from 01:00. \u201cThe train just stood there all night, you know? Dormant. I mopped around it twice and I never once heard the doors. At some point my radio clock jumped ahead \u2014 twice, both times while I was facing the train. And there's a pigeon that crosses that platform like it's being paid by the crossing. Regular as a barber.\u201d\n\nThe cleaner's radio clock, a receiver synchronised to a time station that transmits from outside the city, lost synchronisation only while she faced the train \u2014 and only during the hours the surveillance shows as motionless.",
        details: ["Full timeline reconstruction (Laboratory): the two clock jumps occurred at 22:47 and 09:15. The exact boundaries of the event the surveillance shows as ten and a half hours of nothing."]
      },
      {
        id: "v11", name: "Micro-climate station log, station courtyard", type: "measurement", icon: "◈",
        summary: "A 3.2\u00b0C drop in a 400 m circle, 22:47\u219209:15. No weather matched it.",
        body: "Independent environmental sensors in the station courtyard and on the platform record a uniform temperature drop of 3.2\u00b0C starting at 22:47, holding flat for the night, recovering between 09:12 and 09:15. The drop is circularly symmetric around the East Yard, radius approximately 400 m. Metropolitan weather for the night: still, dry, 11\u00b0C, nothing.\n\nThe same footprint, the same shape, and the same depth as the temperature change recorded INSIDE the train.",
        details: ["Full sensor inter-comparison (Laboratory): sensors outside the 400 m circle recorded nothing. The boundary is clean to instrument resolution. Whatever happened inside a well-defined shell, and the shell was not weather."]
      },
      {
        id: "v12", name: "Service road gate log", type: "record", icon: "▥",
        summary: "The yard gate opens 14 times in the night. Thirteen are staff. The fourteenth is the emergency crew at 08:58.",
        body: "Gate log, East Yard service road. Between 22:00 and 09:30 the gate registered 14 openings. Thirteen match scheduled staff movements. The fourteenth, 08:58, is the two-person emergency crew dispatched to D-4. In particular: no crew entered the yard between 22:47 and 09:12. Whatever held that train did not require access, assistance, or even attention.",
        details: ["Full cross-reference (Laboratory): the emergency crew dispatched to D-4 was dispatched by polling software, not by a phone call. Nobody human asked about D-4 until 08:50. For ten hours, the incident was maintained by a machine, unattended."]
      }
    ],
    scanner: [
      { target: "Trainset 88-12 interior", signature: "normal", note: "Signature class NORMAL \u2014 but with a 10h 20m gap in its own clock's assertion, bridged internally by 17 honest minutes. The train spent the night inside something that rationed time.", yields: "sc1" },
      { target: "Platform 3 clock", signature: "normal", note: "Signature NORMAL. Raised and honest: it never noticed anything. It was outside the bubble, filing perfect minutes the whole while.", yields: "sc2" },
      { target: "Damping station D-4", signature: "missing", note: "Signature MISSING from 22:41 to 09:12. For ten and a half hours, the yard had no damper on it at all \u2014 like a river with the weir removed.", yields: "sc3" },
      { target: "Mrs. Auld's wristwatch", signature: "displaced", note: "Offset \u221210h 08m, wearing the same flat decay curve as the train's onboard clock. It spent the same compression she did.", yields: "sc4" },
      { target: "Ticket stock (Valebridge 20:50)", signature: "normal", note: "Signature NORMAL across all 41 validations. The tickets are telling the plain truth. It is everyone's memory of the morning that is wearing somebody else's timestamp.", yields: "sc5" }
    ],
    timeline: [
      { id: "e1", label: "41 passengers validate for the 20:50 service at Valebridge", stamp: "20:47\u201320:52", stampType: "confirmed", src: "v5" },
      { id: "e2", label: "Trainset 88-12 departs Valebridge, three minutes late", stamp: "20:58", stampType: "confirmed", src: "v3" },
      { id: "e3", label: "88-12 arrives Platform 3, Central; nine passengers disembark; doors close", stamp: "22:40", stampType: "confirmed", src: "v7" },
      { id: "e4", label: "Damping station D-4 fails \u2014 inhibition module (A-1 series) offline", stamp: "22:41", stampType: "confirmed", src: "v9" },
      { id: "e5", label: "Chronostasis bubble forms over the East Yard (400 m). Dispatcher logs a signal fault; onboard clocks begin 17 compressed minutes", stamp: "22:47", stampType: "confirmed", src: "v8" },
      { id: "e6", label: "Inside the bubble: standby. Doors closed, no disembarkation, one pigeon, 423 times", stamp: "17m 04s", stampType: "conflicting", src: "v6" },
      { id: "e7", label: "D-4 dead-poll escalated; emergency crew dispatched and restarts the damper", stamp: "08:50\u201309:12", stampType: "confirmed", src: "v7" },
      { id: "e8", label: "Bubble collapses; doors open; 41 passengers step out into an ordinary morning", stamp: "09:15", stampType: "confirmed", src: "v3" },
      { id: "e9", label: "Anomaly intake filed \u2014 arrival 09:15 vs scheduled departure 11:40", stamp: "09:40", stampType: "estimated", src: "v1" }
    ],
    trueOrder: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"],
    causality: [
      { from: "e1", to: "e2", rel: "precedes", why: "The validations at Valebridge immediately precede the departure of the only trainset the validations are for." },
      { from: "e4", to: "e5", rel: "causes", why: "Remove the damper and the yard stops damping. The bubble formed three minutes after D-4 went down." },
      { from: "e5", to: "e6", rel: "causes", why: "Inside the bubble, the train lived its 17 compressed minutes." },
      { from: "e6", to: "e8", rel: "precedes", why: "The onboard 17 minutes end where the bubble's collapse begins." },
      { from: "e7", to: "e8", rel: "causes", why: "The restart of D-4 at 09:12 is what lets the bubble collapse at 09:15. The doors did not open on a schedule; they opened on a repair." },
    ],
    interventions: [
      {
        id: "i1", label: "Standard chronal purge + record correction",
        desc: "Purge the residual bubble field, log 88-12's arrival as 22:40 plus an unexplained delay, compensate 41 passengers, file their statements as mass misremembering.",
        stability: 2.9,
        consequence: "Residue dissipates in under an hour; the platform pigeon files a complaint nobody will read; the Index improves measurably. Forty-one people receive letters politely informing them that their memories of a morning departure are wrong, and enclosing travel vouchers. Nobody receives the truth, which \u2014 strictly \u2014 was never theirs to receive.",
        quality: 10
      },
      {
        id: "i2", label: "Document the bubble; flag D-4 and Halden",
        desc: "File the chronostasis event as REAL in the official record. Name the failed module, its manufacturer, and the invoice.",
        stability: 0.6,
        consequence: "The record now contains a correctly-annotated impossible night. Stability pays modestly for the documentation load. It also means a Halden module with an A-1 stamp is now sitting in a file your Director can read, on a desk where it will either start something \u2014 or be found, one morning, not to be there any more.",
        quality: 6
      },
      {
        id: "i3", label: "Quarantine 88-12 for observation",
        desc: "Hold the trainset, crew and passengers in isolation for 72 hours of observation and re-interview.",
        stability: 0.2,
        consequence: "Yields nothing the event recorder has not already told you, costs 43 people their Tuesday, and teaches the passengers exactly how a bubble feels from the inside \u2014 which, strangely, they already knew.",
        quality: 2
      },
      {
        id: "i4", label: "Do nothing; classify as signal fault",
        desc: "Accept the dispatcher's framing. Signal fault E-9. Accepted as mundane.",
        stability: -1.2,
        consequence: "The residue is not purged, only papered over. Residual compression lingers: the cleaner keeps catching the pigeon mid-flight, passengers report dreaming the same quiet carriage, and the onboard recorder keeps 17 minutes it has no right to keep.",
        quality: 0
      }
    ],
    report: [
      {
        id: "q1", prompt: "What arrived at Platform 3 at 09:15?",
        options: [
          { text: "A real train with real passengers, held overnight inside a chronostasis bubble", w: 1, note: "41 validations in, 41 passengers out, one onboard clock that lived 17 honest minutes while the yard spent the night." },
          { text: "A temporal echo of the previous evening's service", w: 0.2, note: "Echoes do not eat. 41 people disembarked and had breakfast, which rules out pretty much everything spectral." },
          { text: "A duplicate trainset from a parallel service", w: 0, note: "There would then be two 88-12s. Platforms cannot hold two of the same kind of nothing, and roster checks find exactly one." },
          { text: "The 11:40 service departing early \u2014 a paperwork inversion", w: 0.4, note: "The paperwork inversion is in the intake report, not in the world. Read the annex; the intake compared two different services." }
        ]
      },
      {
        id: "q2", prompt: "How much time elapsed for the people on the train?",
        options: [
          { text: "Roughly 10h 35m, mostly compressed into a long quiet stop", w: 1, note: "Outside: 22:40 to 09:15. Inside: 17m 04s. The stop at the red signal was not long. It was the whole night, folded." },
          { text: "An ordinary 17-minute journey", w: 0.2, note: "17m 04s is the onboard clock's honest count \u2014 it is what the compression LOOKED like from inside." },
          { text: "2h 25m, matching the departure/arrival inversion", w: 0, note: "2h 25m is the paperwork gap between 09:15 and 11:40. It is arithmetic, not experience." },
          { text: "No time at all \u2014 instantaneous displacement", w: 0.2, note: "Instantaneous displacement leaves no temperature trace and no 423 pigeons." }
        ]
      },
      {
        id: "q3", prompt: "Why do the passengers remember a morning journey?",
        options: [
          { text: "Their perceived timeline was reshaped by the platform clock at the moment the bubble collapsed", w: 1, note: "They 'woke' into a 09:15 platform and back-fitted the memory to match. The quiet at the red signal is the only part they kept honest." },
          { text: "A memory alteration device was deployed on disembarkation", w: 0.2, note: "No device, no residue, no crew. The compression alone explains the accounting error." },
          { text: "Mass psychogenic suggestion \u2014 ordinary false memory", w: 0.4, note: "False memory of all 41 people in the same direction, same depth, same timestamp? Look at what the wristwatch says before settling for psychology." },
          { text: "They are deliberately lying to the Division", w: 0, note: "Nobody lies this consistently with a validated 20:51 ticket still in their own coat pocket." }
        ]
      },
      {
        id: "q4", prompt: "What is the physical footprint of the anomaly?",
        options: [
          { text: "A 400 m circle: 3.2\u00b0C uniform drop, sensor-clean boundary, matching inside and outside", w: 1, note: "Courtyard sensors, interior trace, same shape, same depth, same six-minute onset. That is a bubble with its address on it." },
          { text: "Nothing physical \u2014 purely an instrument discrepancy", w: 0, note: "Instruments do not agree by accident. They agree because they were inside the same shell." },
          { text: "Only the camera timestamps prove anything", w: 0.4, note: "The timestamps are the facade. The temperature sensors are the thing itself." },
          { text: "The pigeon", w: 0.6, note: "The pigeon is your favourite clue and you know it. It is evidence of compression, not of the bubble's extent." }
        ]
      },
      {
        id: "q5", prompt: "Root cause of the night:",
        options: [
          { text: "Failure of an A-1 series inhibition module at D-4 \u2014 damper offline, yard undamped", w: 1, note: "Failed 22:41; bubble at 22:47; restarted 09:12; collapse 09:15. The whole night fits inside the maintenance window of one module." },
          { text: "A particle collision with the train's onboard master clock", w: 0, note: "Collision narratives are for physicists who have run out of maintenance records." },
          { text: "An unlicensed chronometric pulse from a field test", w: 0.4, note: "Wrong instrument, wrong month, wrong case file. The pulse was Marchetti's night; this night belongs to a damper that wasn't there." },
          { text: "Railway signalling hardware fault, mundane and unremarkable", w: 0.2, note: "The fault is real, in the same sense that a shadow is a real thing that a lamppost is having." }
        ]
      }
    ],
    comms: [
      { id: "c1", trigger: { type: "start" }, from: "reed", text: "Platform 3. You'll want the annex of the intake before you believe the intake. And keep an eye on the cleaner's statement \u2014 night staff always know more than day staff, because night is when we are honest." },
      { id: "c2", trigger: { type: "examined", id: "v8" }, from: "mercer", text: "17m 04s. I ran the compression ratio three times. Factor ~37. If you can find ANY independent trace of that ratio outside the train, I will buy the coffee. (Found it. Courtyard sensors. 3.2 degrees. Same onset minute. Coffee is on me.)" },
      { id: "c3", trigger: { type: "examined", id: "v9" }, from: "vale", text: "\u2018A-1 series inhibition module.\u2019 You have seen that series before, in March. I would like \u2014 professionally, not personally \u2014 for your report to state it plainly. Parts have families. Families have sponsors. Sponsors have names we are not permitted to type." },
      { id: "c4", trigger: { type: "examined", id: "v6" }, from: "cross", text: "There is a file in the archive about a pigeon. It is thicker than you would hope, and \u2014 I will deny saying this \u2014 it is one of my favourite things we keep. 423 identical crossings. The night copied itself, gently, on a loop, for nobody." },
      { id: "c5", trigger: { type: "hint" }, from: "mercer", text: "Official consultation #1. The wristwatch is the key that prints the whole door: Mrs. Auld's watch reads 23:07 at 09:31. A watch that is BEHIND by the exact duration of the missing night. She did not board at 09:04. She boarded at 20:49 and time stopped arguing." },
      { id: "c6", trigger: { type: "hint" }, from: "reed", text: "Official consultation #2. The dispatcher's \u2018signal fault\u2019 is the bubble seen from outside \u2014 and the restart at 09:12 is what opened the doors at 09:15. The whole anomaly lives and dies with D-4. Read the maintenance record of the part you take for granted." }
    ],
    truth: {
      headline: "The train never went anywhere. The night went somewhere instead.",
      body: "Trainset 88-12 completed an entirely ordinary evening service, arriving on Platform 3 at 22:40 to stable overnight before forming the 11:40 return. At 22:41, its inhibition module \u2014 replaced six days earlier by Halden Applied Chronometry with an A-1 (JANUS) series part \u2014 failed. Damping station D-4 went offline.\n\nUndamped, the East Yard formed a chronostasis bubble: a 400-metre sphere in which local time ran compressed by a factor of roughly 37. From 22:47 to 09:15 the train, its 41 sleeping passengers and its 2 crew lived out 17 minutes and 4 seconds of a long red-signal stop. Outside, the world spent the whole night. The temperature fell 3.2\u00b0C inside a clean circular boundary. A pigeon crossed the platform 423 times, identically.\n\nWhen the polling software finally escalated D-4's dead signal and an emergency crew restarted the damper at 09:12, the bubble collapsed at 09:15. The doors opened. 41 people stepped out, glanced at a platform clock that honestly read 09:15, and back-fitted the last thing they remembered \u2014 the quiet at the red signal \u2014 into an ordinary morning journey. Their memories were not altered. They were misdated, by exactly the interval the wristwatch still faithfully carries: Mrs. Auld's watch, which spent the night inside the bubble, says 23:07.\n\nThe intake report's \u201carrival before departure\u201d compares two services of the same trainset \u2014 Tuesday's sheet against Wednesday's. The train did not arrive before it departed. One version of it departed; the other had merely been standing there all night, being a place where time was being carefully hoarded."
    }
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = CASE; }
  else { (root.TD = root.TD || {}).CASE_2 = CASE; }
})(typeof window !== "undefined" ? window : globalThis);

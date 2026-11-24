/* TIME DEPARTMENT — CASE 004 data */
(function (root) {
  "use strict";
  var CASE = {
    id: "TC-004", number: 4, difficulty: 4,
    title: "The Missing Monday",
    location: "Vantren \u2014 citywide (sealed file)",
    dateOfAnomaly: "21 years ago \u2014 14 October",
    severity: "V",
    brief:
      "This file was sealed before you were hired, unsealed four days ago, and re-sealed twice since. Open it anyway. Someone at a desk two floors up has decided you are exactly the kind of person who will.\n\nIn the municipal record of the city of Vantren, the week of 13 October reads: Sunday 13 \u2014 Tuesday 14 \u2014 Wednesday 15. Dates intact, day of the week skipped. Nine hundred and ninety-nine people in a thousand will tell you Sunday was followed directly by Tuesday, and will be quite calm about it, the way people are calm about weather in someone else's story.\n\nEleven people \u2014 eleven only, scattered and unconnected \u2014 will tell you it was a Monday, and mostly an ordinary one. One of them has spent twenty-one years petitioning this office about a woman he says boarded a bus on a day you will not find in any records. Handle this one gently, investigator. It does not stay a records problem.",
    objectives: [
      "Establish what did and did not happen in Vantren on 14 October.",
      "Explain the split between collective memory and the eleven dissenting witnesses.",
      "Identify the mechanism that removed the day from the record.",
      "Identify who authorized it \u2014 and decide what you, personally, will do about that."
    ],
    evidence: [
      {
        id: "v1", name: "Anomaly intake \u2014 calendar discontinuity", type: "document", icon: "▤",
        summary: "\u201c14 October recorded as Tuesday. Population testimony split: 99.4% Sunday\u2192Tuesday; 11 individuals insist on Monday.\u201d",
        body: "Retrospective intake, reconstructed 21 years after the fact from surviving fragments and one surviving inert civil clock. The date 14 October exists everywhere in the record; the DAY is recorded as Tuesday, uniformly, in every document of that date across the city \u2014 diaries, letters, receipts, newspapers, church bulletins. No document anywhere in Vantren describes 14 October as Monday, except those written by 11 individuals.",
        details: ["Full corpus audit (Laboratory): 41,206 documents dated 14 October across municipal, commercial and private collections. Day-of-week: Tuesday in 41,195. Monday in 11. The unanimity is the anomaly. Real cities disagree about days constantly."]
      },
      {
        id: "v2", name: "Municipal printing works job ledger", type: "record", icon: "▥",
        summary: "On Friday 11 October, the works printed 2,000 delivery placards reading \u2018MONDAY 14 OCT\u2019. Placards gone. Ledger survived.",
        body: "Job ledger, municipal printing works. Friday 11 October: order M-4471, 2,000 adhesive placards for the Monday municipal delivery round, artwork proof attached: \u2018MONDAY 14 OCT \u2014 MUNICIPAL NOTICE \u2014 CLEAR BINS BEFORE 07:00\u2019.\n\nNo placards survive \u2014 all \u2018recycled\u2019, per one line in a waste contractor's log, in a single night, from every dependent district at the same hour. The ledger was in a basement, offline, and therefore survived. Somebody removed 2,000 placards from 200 km of streets in six hours, twenty-one years ago, and then went to a great deal of subsequent trouble about a single day of the week.",
        details: ["Full logistics review (Laboratory): collection logs for that night show the waste contractor running 340% of normal capacity, focused on municipal areas, starting at 04:00 TUESDAY. The morning after. Somebody was cleaning up the DAY BEFORE'S truth on a Tuesday morning."],
        key: true
      },
      {
        id: "v3", name: "Halbank transaction archive", type: "record", icon: "▥",
        summary: "One bank kept its clock offline. Its 412 transactions for 14 October ALL say Monday.",
        body: "Halbank ran its nightly batch on an offline vault clock \u2014 air-gapped, wind-up reserve, standard for the branch network. Every other institution's systems stamp from network time. For 14 October: city-wide transaction volume drops to near zero at every networked institution \u2014 and Halbank's archive shows a normal, fully populated business day, 412 transactions, all timestamped MONDAY 14 October.",
        details: ["Full stamp comparison (Laboratory): Halbank's Monday stamps are not a mistake to be unexplained: they are the only surviving sample of the day as it was LIVED. Everything that happened that day, the record now knows only through the slivers of one stubbornly offline bank and ten stubbornly offline people."],
        key: true
      },
      {
        id: "v4", name: "University meteorological mast \u2014 retained data", type: "measurement", icon: "◈",
        summary: "The physics department's own mast kept a full 24 hours for 14 October. The department kept the retrieval logs.",
        body: "Academic instrument, operated outside municipal networks. Full 24-hour record for 14 October: temperature, wind, rainfall, one creditable thunderstorm at 16:20. Attached: the department's retrieval log, and a note from the station keeper, dated the following week: \u201cMunicipal service requested our copy of the 14th 'due to an error in their systems'. Request repeated three times. Refused. Academic instruments do not make copies for committees.\u201d",
        details: ["Full cross-check: the municipal service that requested the data three times was the Bureau of Municipal Records. No such \u2018Bureau\u2019 appears in the municipal organigram of that year, or any year."]
      },
      {
        id: "v5", name: "Hospital admissions log + one ER form", type: "document", icon: "▤",
        summary: "11 admissions stamped \u2018Tuesday\u2019 \u2014 but one ER form is the OLD stock, pre-printed \u2018Monday 14 October\u2019, stamped over.",
        body: "Admissions log, Vantren General, 14 October: eleven admissions, deep-basement records room (morgue side, one floor down from MRI, shielded). All stamped \u2018Tuesday\u2019. All eleven admissions are people from the shielded basement \u2014 staff and one patient's visitor.\n\nOne of the eleven, a fractured wrist at 08:40, was written up on a form from the OLD print stock: the header reads \u201cMonday 14 October\u201d. The \u2018Tuesday\u2019 correction was applied with a rubber stamp, and the stamp is one millimetre out of register \u2014 you can see the Monday underneath it, because the correction was a lie applied by hand, to a form that told the truth.",
        details: ["Full supply audit (Laboratory): the old form's stock matches the hospital's stationery purchases of September, two weeks BEFORE the incident, and the new stock \u2014 all \u2018Tuesday\u2019 \u2014 is invoiced by a printer whose invoice is billed to the same municipal account as 2,000 delivery placards that were never delivered."]
      },
      {
        id: "v6", name: "Basement shift roster vs. activity log", type: "document", icon: "▤",
        summary: "The roster printed BEFORE the incident says Monday. The log written DURING the shift says Tuesday.",
        body: "Two documents from the same basement shift, same nine workers:\n\n1. Shift roster, printed Friday 11 Oct in advance (pre-excision stock): \u201cMonday 14 October, night-to-day rotation, basement staff\u201d.\n2. Activity log, filled in by hand during the shift itself, the morning after excision had \u2018bridged\u2019 everyone: \u201cTuesday. Quiet. Fridge needs defrosting.\u201d\n\nSame shift, same people. The pre-printed roster says Monday because it was made before somebody deleted the Monday, and the handwritten log says Tuesday because the writers woke up inside somebody else's version of the week.",
        details: ["Full paper-trail review (Laboratory): the roster's printer was the SAME municipal printing works. They knew on the Friday. It is not the knowledge that is damning \u2014 it is the payroll timing."]
      },
      {
        id: "v7", name: "The baker's diary", type: "witness", icon: "✎",
        summary: "A night baker with a shop full of mechanical clocks kept every single Monday she ever worked. Including that one.",
        body: "Diary of S. Petrossian, baker, 41 years at the same ovens. Her shop ran on three mechanical wall clocks and a hand-wound regulator \u2014 no network, no radio, no electronics. Her entries never miss a day in 41 years:\n\n\u201cMonday 14 Oct. Rail strike? No buses heard on the street all morning, which I noticed because I notice buses. Sold out of everything by ten. Strange quiet up the hill \u2014 not EMPTY, mind. Quiet. Wrote it down twice because it felt important over the second coffee. My regulator says Monday, my regulator is 60 years old, and I trust it more than the newspaper.\u201d",
        details: ["Full corpus cross-check (Laboratory): Ms. Petrossian's shop sits at the foot of the Halloway district, two blocks from the viaduct service road. When she says \u2018no buses\u2019 she is describing, with a baker's precision, an ambush of silence that had a number of victims nobody has ever said out loud to her."]
      },
      {
        id: "v8", name: "Emergency line recording, 07:34", type: "audio", icon: "◉",
        summary: "An analogue trunk kept 40 seconds of a woman calling about the Halloway Viaduct, \u2018before any official body knew\u2019.",
        body: "Retained analogue trunk recording, municipal emergency line, 07:34, that same morning. Caller: H. Quinn, schoolteacher, waiting at the viaduct stop: \u201cthe Halloway Viaduct \u2014 it's gone \u2014 there are people \u2014 the bus \u2014 send everything, send all of it.\u201d\n\nThe trunk was copper, mechanical switching, offline by design. The recording survived in a wax-cylinder backup the exchange kept for \u2018 disputed-call arbitration\u2019 \u2014 nobody disputes calls about bridges anymore, so nobody ever scrubbed it.",
        details: ["Full audio analysis (Laboratory): background layer at 07:30: a clock chime \u2014 eight strikes \u2014 from the Sankt-Aubin carillon, which stands UNDER the viaduct. Chime signature matches. Then four seconds of a crowd noise floor, then the words, then disconnect. A real person, a real morning, a real chime. The recording does not know it carried the starkest fifteen seconds in this file."],
        janus: true, key: true
      },
      {
        id: "v9", name: "University physics NVR frames, 07:31", type: "surveillance", icon: "▣",
        summary: "The viaduct at 07:31 with a bus mid-span. At 07:32: no bridge, no bus, people walking.",
        body: "Two frames recovered from an offline NVR in the physics basement, aimed at the Halloway Viaduct for a resonance study. Frame 07:31:03 \u2014 the viaduct intact, the number 12 bus midway across. Frame 07:32:09 \u2014 the span is gone; the river bed below carries debris; pedestrians frozen mid-gesture at what they are looking at.\n\nBetween those frames, in official records, nothing happened. In these frames, something with a number of casualties that the accountant in you will refuse to type happened, in full view of a bridge that no longer exists.",
        details: ["Full frame forensics (Laboratory): the two frames bracket 66 seconds. The work of sixty-six seconds is why the window was chosen: the collapse after 07:31, the bridging of memory before 07:45. Everything the day was, is in the gap between these two frames. You cannot unsee this. Good. You were meant to stop being able to."],
        key: true
      },
      {
        id: "v10", name: "The Alsen petitions \u2014 21 years of paper", type: "witness", icon: "✎",
        summary: "One man's handwriting, 54 petitions, one margin note in a different ink: \u2018grief construct \u2014 do not engage.\u2019",
        body: "Petitioner's file: Gerard Alsen, retired signalman. 54 petitions to this office across 21 years, each one neatly ruled, each one describing the same morning: \u201cI drove Mara to the stop for the 07:15, the twelve. I watched it climb the Halloway span at 07:31. I was on the service road. I have drawn the position of the bus from memory, four times, and it is the same four times.\u201d\n\nA departmental margin note, in a steady institutional hand: \u201cgrief construct \u2014 do not engage.\u201d Beneath the note, in pencil, smaller, different hand: \u201ccheck the drawing against the physics frames before you write anything else\u201d.",
        details: ["Full reconciliation (Laboratory): Alsen's fourth sketch, dated two years ago, places the bus at mid-span, left lane, 60% across. Physics frame 07:31:03: bus, mid-span, left lane, 60% across. He was THERE. He is not a grief construct. He is a widower with a very good memory and a department that put a name on it so nobody would have to look."],
        key: true
      },
      {
        id: "v11", name: "The 26 relocations", type: "record", icon: "▥",
        summary: "26 residents filed relocations out of Vantren the same week. Same notary. Same handwriting fee.",
        body: "Municipal relocation registers, the week after 14 October: 26 households filed emigration out of Vantren, processed through the same notary on the same three days, all \u2018for family reasons\u2019. The notary's register has one page torn out at that point. Administrative records \u2014 all of them \u2014 for these 26 people terminate: no further tax records, no medical records, no death registrations, no return.\n\nTwenty-six people became a filing decision. This is what the record of a day looks like when the record of the people in it is deleted first.",
        details: ["Full name-by-name audit (Laboratory): 26 is also the number of passengers on the 07:15 number 12 bus on Monday 14 October, according to a slip of paper Gerard Alsen has kept in his wallet for twenty-one years \u2014 the driver's run-sheet, given to him by a driver's widow who spent the rest of her life refusing to sign a single 'relocation' form. The dead did not relocate. The paperwork did."],
        janus: true, key: true
      },
      {
        id: "v12", name: "Internal memo fragment (from the Archive cross-file)", type: "comms", icon: "◉",
        summary: "\u201c...EXCISION-1 deployed 06:00\u201324:00... authorized: Acting Director R.V... countersigned: Dr. A.V... [remainder burnt]\u201d",
        body: "One page, partially burnt, recovered from a cross-reference in the Archive's 2009 purge file. Text as follows:\n\n\u201c...EXCISION-1 deployed 06:00\u201324:00... twenty-one (21) hours of the civil record of Vantren... usernames struck from the 14th... casualty ledger consolidated under relocation protocol... authorizations: ACTING DIRECTOR R.V.\n\ncountersigned (technical basis): DR. A.V.\n\nexecution & post-closure: OFFICE OF CONTINUITY. do not file under J. file fully \u2014 all copies routed through us, none retained.\u201d\n\nThe last line is in a third hand. The burn pattern on this page is not accident. Somebody, one day this month, decided that you specifically were going to read it.",
        details: ["Full graphology (Laboratory): the countersignature initials A.V. have been written over, legitimately, in the same hand, at a different period \u2014 Vale re-signed his own countersignature years later, the way a man re-closes a door he knows somebody will eventually come knocking on."],
        janus: true, key: true
      }
    ],
    scanner: [
      { target: "Vantren city records, 14 October", signature: "missing", note: "Signature MISSING across 21 hours of a civil record: not deleted punctuated, deleted CONTINUOUSLY \u2014 a smooth excision, not a fire. Fires leave edges. This has none.", yields: "sc1" },
      { target: "Gerard Alsen (memory profile)", signature: "normal", note: "Signature NORMAL. No re-anchoring, no decay seam, no compression. He remembers that morning the way a man remembers falling in love: because it happened to him.", yields: "sc2" },
      { target: "Halbank vault clock", signature: "normal", note: "Signature NORMAL \u2014 offline, wind-up, snobbishly independent. The most truthful instrument in the city that day was a clock nobody could reach.", yields: "sc3" },
      { target: "S. Petrossian's shop regulator", signature: "normal", note: "Signature NORMAL. She did not work that Monday by wireless authority; she worked it by sixty years of brass and gearing.", yields: "sc4" },
      { target: "Memorial site, Halloway district", signature: "missing", note: "Signature MISSING. The site expected 26 temporal signatures: residents, commuters, a bus. There is nothing on it at all. What is missing from a city when you ask a city for 26 people and the city returns 26 relocations?", yields: "sc5" }
    ],
    timeline: [
      { id: "e1", label: "Normal overnight: transactions, deliveries, the world proceeding in its habits", stamp: "00:00\u201306:00", stampType: "confirmed", src: "v3" },
      { id: "e2", label: "Excision window opens (deployed under Protocol EXCISION-1)", stamp: "06:00", stampType: "estimated", src: "v12" },
      { id: "e3", label: "Mara Alsen boards the 07:15 number 12 at the Halloway stop", stamp: "07:15", stampType: "witness", src: "v10" },
      { id: "e4", label: "Halloway Viaduct collapse \u2014 bus no. 12 and 26 people", stamp: "07:31", stampType: "confirmed", src: "v9" },
      { id: "e5", label: "H. Quinn's emergency call from the viaduct stop (analogue trunk, retained)", stamp: "07:34", stampType: "confirmed", src: "v8" },
      { id: "e6", label: "The baker's quiet Monday, no buses, sold out by ten \u2014 noted twice because it felt important", stamp: "morning", stampType: "witness", src: "v7" },
      { id: "e7", label: "Alsen waits on the service road; the day continues for 11 insulated witnesses", stamp: "day", stampType: "witness", src: "v10" },
      { id: "e8", label: "Excision window closes; Tuesday 00:00 arrives; the city's record now reads Sunday 13 \u2014 Tuesday 14", stamp: "24:00", stampType: "confirmed", src: "v1" },
      { id: "e9", label: "26 relocations filed through one notary; municipal placards collected; memory bridging propagates", stamp: "week after", stampType: "estimated", src: "v11" }
    ],
    trueOrder: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"],
    causality: [
      { from: "e4", to: "e9", rel: "causes", why: "The excision exists BECAUSE the collapse happened: the day was removed to remove the collapse from the record." },
      { from: "e2", to: "e8", rel: "precedes", why: "The window opens at 06:00 and closes at 24:00; everything between those two filings belonged to the day that was being made to not have happened." },
      { from: "e3", to: "e4", rel: "precedes", why: "The 07:15 boarding is what put the bus at 07:31 where the viaduct failed." },
      { from: "e4", to: "e5", rel: "precedes", why: "The emergency call at 07:34 answers a collapse that officialised records show never occurred." },
      { from: "e2", to: "e6", rel: "causes", why: "The excision is WHY the baker's Monday was \u2018quiet\u2019: the city went missing around her. What she experienced as a mood was a distortion field." },
      { from: "e8", to: "e9", rel: "precedes", why: "The bridging of memories propagates only after the window closes; the record's re-registration precedes the last administrative lie." }
    ],
    interventions: [
      {
        id: "i1", label: "Reinforce the excision \u2014 bind the 11 residual memories",
        desc: "Apply a targeted re-anchoring sweep to the eleven insulated individuals. The city becomes internally consistent; the last witnesses of Monday stop being witnesses.",
        stability: 2.4,
        consequence: "The Index improves almost the full width of the room. Gerard Alsen will spend the rest of his life quietly unsure what he is grieving: he will keep the wallet and the run-sheet and be unable, standing at the display case in his own front room, to tell you why. The other ten lose less grief and slightly more of themselves. The Office of Continuity files your work under \u2018routine\u2019. That will be the hardest word in this whole file.",
        quality: 0
      },
      {
        id: "i2", label: "Full restoration of Monday 14 October",
        desc: "Restore the excised 21 hours: records, memory continuity, casualty registration, the viaduct's loss, everything. The truth returns, all at once, twenty-one years late.",
        stability: -4.2,
        consequence: "Twenty-six deaths become real in an afternoon; 21 years of lives organised around an absence now explain themselves with a grief that has somewhere to go. Half the city will need weeks. Three open investigations collide with the new record and the Stability Index drops harder than it ever has in the Division's history. Voss summons you within the hour. The viaduct gets a memorial, and the memorial gets a queue, and the queue keeps forming for the rest of your career. Some things are worth the Index's opinion.",
        quality: 7
      },
      {
        id: "i3", label: "Memorial patch \u2014 register the 26, hear the witness",
        desc: "Leave the calendar bridged. Formally register the 26 names in a public memorial ledger; grant Gerard Alsen a hearing on the record; file Monday as \u2018under Division seal, casualty-bearing\u2019.",
        stability: 0.8,
        consequence: "The Index takes a small, principled knock. The 26 get their names into a public ledger, cut in stone, twenty-one years late \u2014 and the ledger gets a queue too, a shorter one, formed out of neighbours who always half-knew. Alsen's petitions stop; what he wants now, mostly, is to be believed by someone with a desk, and you have just become the person who did the believing. The Office of Continuity does not send anything to say they have noticed. They never do.",
        quality: 10
      }
    ],
    report: [
      {
        id: "q1", prompt: "What happened to Monday, 14 October in Vantren?",
        options: [
          { text: "It happened. It was subsequently removed from the record by Protocol EXCISION-1", w: 1, note: "The placards, the bank stamps, the old ER form, the roster: four independent pre-excision witnesses to a Monday that was later unwritten." },
          { text: "It never occurred \u2014 the calendar simply skipped Monday that week", w: 0, note: "Calendars do not skip; they are printed, and the municipality printed 2,001 proofs of a Monday it later pretended never got to." },
          { text: "It occurred in a parallel line and leaked through", w: 0.2, note: "Elegant. Unnecessary. Every surviving witness of the day was IN the city, in basements and bakeries and one viaduct service road." },
          { text: "It occurred but was experienced as Tuesday by everyone with Monday plans", w: 0.4, note: "Nobody experienced it as Tuesday at the time. The Tuesday label is post-hoc, applied by hand, one millimetre out of register." }
        ]
      },
      {
        id: "q2", prompt: "What was excised?",
        options: [
          { text: "21 hours: 06:00 to 24:00 of Monday 14 October", w: 1, note: "Records exist up to 06:00 and resume at Tuesday 00:00. The excision kept the night, which contained nothing anyone needed gone." },
          { text: "The whole 24 hours of 14 October", w: 0.4, note: "Close, but Halbank's transactions run from 00:00 to 06:00 and survive intact. The excision had a start time." },
          { text: "Only the viaduct collapse and its aftermath", w: 0.6, note: "That was the TARGET. The excision, bluntly, took the whole working day with it \u2014 groceries, deliveries, the baker's morning, everything." },
          { text: "An entire calendar week", w: 0, note: "Nobody is missing a week. The week is there. It is a week with one day of it edited out." }
        ]
      },
      {
        id: "q3", prompt: "Why was Monday 14 October excised?",
        options: [
          { text: "To remove from the record a mass-casualty civil disaster \u2014 the Halloway Viaduct collapse", w: 1, note: "The NVR frames. Quinn's call. The 26 relocations. The run-sheet in Alsen's wallet. The tragedy was not the loss of the day; the loss of the day was the mercy that was chosen FOR everyone." },
          { text: "To conceal a failed experiment at the university", w: 0.2, note: "The university is a bystander with the best instruments. Its physics basement is where truth went to survive, not where it was made." },
          { text: "To mask a banking and records failure across the city's institutions", w: 0.2, note: "Halbank's clock did not fail. It was never listening in the first place." },
          { text: "For reasons that cannot be established from the record", w: 0.2, note: "The record knows. It is in a burned memo and a preliminary authorization; the reason is in every frame of the physics NVR." }
        ]
      },
      {
        id: "q4", prompt: "Who authorized the excision?",
        options: [
          { text: "Acting Director R. Voss, countersigned by Dr. A. Vale \u2014 executed by the Office of Continuity", w: 1, note: "The burned memo names both, and the woman who countersigned it is the one who unsealed this file and handed it to a junior investigator. Make of the sequence what you can live with." },
          { text: "An external oversight body acting on the Department's behalf", w: 0.4, note: "The \u2018oversight body\u2019 is the Office of Continuity. It does not exist in the organigram. It signs invoices, though. It has NEVER once failed to sign an invoice." },
          { text: "The municipal government of the day", w: 0, note: "The municipality printed the Monday, collected the placards, and has been wondering quietly about both ever since. It did not know what the day was for." },
          { text: "Unauthorized \u2014 a rogue operation by an unknown actor", w: 0.2, note: "Two-level authorization with a countersignature is many things, but it is not rogue." }
        ]
      },
      {
        id: "q5", prompt: "Gerard Alsen's memory of Monday 14 October is:",
        options: [
          { text: "Genuine \u2014 he is an insulated witness; his memories were never bridged", w: 1, note: "Scanner: no edit signature. His bus sketch: matches the surviving NVR frame to a man's eye. He is not a grief construct. He is a widower with a very good memory." },
          { text: "A particle of manufactured grief, constructed by the Department", w: 0, note: "The margin note that says \u2018grief construct\u2019 was written by the same institution that burned its own authorization memo. Institutions do not get to be both." },
          { text: "Accurate in outline, corrupted in detail by 21 years of petitioning", w: 0.4, note: "Four sketches over 21 years: identical. His outline AND his details hold." },
          { text: "An honest confusion of Monday with Tuesday", w: 0.2, note: "He does not confuse anything. He is the only man in the city who is right about one day." }
        ]
      }
    ],
    comms: [
      { id: "c1", trigger: { type: "start" }, from: "voss", text: "Investigator. This file has been sealed for four years on my order and unsealed today on someone else's. I want the record accurate and the distribution contained. Whatever you conclude, you will conclude it in writing, in full, and bring it to me yourself. \u2014 E.V." },
      { id: "c2", trigger: { type: "examined", id: "v9" }, from: "reed", text: "I was a junior on the Halloway desk the year before this file. We were told the viaduct was decommissioned. I never once questioned it because there was no incident report to question. Twenty-six people moved away in the same week. I filed those relocations. I have been filing them ever since, in the only way left to me." },
      { id: "c3", trigger: { type: "examined", id: "v10" }, from: "cross", text: "There is a filing rule in this archive: petitions marked \u2018do not engage\u2019 are stored spine-out on the same shelf, in order, untouched. I have dusted that shelf 21 years running. Whatever you decide the file means, Investigator, the shelf does not get thinner by itself." },
      { id: "c4", trigger: { type: "examined", id: "v12" }, from: "voss", text: "I know what the memo fragment says. I have known what it says since the day it was burned. Come to my office when your report is finished, and I will not make it easy for either of us. \u2014 E.V." },
      { id: "c5", trigger: { type: "hint" }, from: "mercer", text: "Official consultation #1. Follow the STATIONERY. Placards printed Friday for a Monday: the printer knew the date in advance. Old ER form stock pre-printed 'Monday', corrected with a rubber stamp to 'Tuesday': the hospital knew the DATE was wrong BEFORE the day ended. Someone built the paperwork of the lie BEFORE the day was lived." },
      { id: "c6", trigger: { type: "hint" }, from: "voss", text: "Official consultation #2. The excision kept the night and took the working day. Whatever was to be hidden happened between 06:00 and 24:00 \u2014 and the record of every survivor of that window lives in basements, wax cylinders, and one wind-up clock. Follow what was NOT connected. Everything they left alive will testify." }
    ],
    truth: {
      headline: "Monday 14 October happened. The Halloway Viaduct fell. The city's worst morning was filed out of existence.",
      body: "On Monday 14 October, twenty-one years ago, at 07:31, the Halloway Viaduct in Vantren collapsed under the number 12 bus with twenty-six people aboard. The emergency services arrived in minutes. The dead were counted before nightfall.\n\nAnd then, by authorisation signed \u2018Acting Director R. Voss\u2019, countersigned by Dr. Adrian Vale, and executed by the Office of Continuity, the Protocol EXCISION-1 was deployed for the first and only time: 21 hours of a civil record \u2014 06:00 to 24:00 \u2014 removed from every connected system in the city, evidence collected and destroyed, casualty absence filed as relocation, and the collective memory of a population bridged from Sunday to Tuesday. The date 14 October was not deleted; it was re-labelled. The city lost no day. It lost a day of the week, and everyone politely agreed not to notice.\n\nThe excision was not perfect. It missed the physics department's offline NVR, the university's meteorological mast, Halbank's wind-up vault clock, a copper emergency trunk, a wax-cylinder backup, 2,000 printed placards' job ledger, a hospital's pre-printed form stock, an eleven-person basement behind shielded walls, and one night baker with three mechanical clocks and no reason to doubt them. Eleven people remembered the day because they were never fully connected to begin with.\n\nOne of them lost his wife on the bus, and spent 21 years being formally disregarded as a grief construct by the institution that made him one. The truth of this case is not that time broke. It is that time was working perfectly, and somebody chose, deliberately, in an office you will not find on any chart, that a city could bear anything better than it could bear a Tuesday that knew it used to be a Monday."
    }
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = CASE; }
  else { (root.TD = root.TD || {}).CASE_4 = CASE; }
})(typeof window !== "undefined" ? window : globalThis);

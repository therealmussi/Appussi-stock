/* TIME DEPARTMENT — CASE 001 data (canonical truth is fixed, never generated) */
(function (root) {
  "use strict";
  var CASE = {
    id: "TC-001", number: 1, difficulty: 1,
    title: "The Man Who Was Born Tomorrow",
    location: "Central Station — Platform 4 / east signal compound",
    dateOfAnomaly: "Night of 14\u201315 March",
    severity: "II",
    brief:
      "At 03:02 on 15 March, station staff found a maintenance technician unconscious beside the east signal compound. He is Elias Marchetti, 34, track crew. Nothing is wrong with Elias.\n\nSomething is wrong with his paperwork.\n\nHis identity documents now state a date of birth three days from today. A civil registry daemon has begun correcting every related record to match, which means that by 18 March, one of the following will be true: either the record wins, or the man does. Your task is to establish what was displaced, when, by what, and to keep the answer from falling apart before you write it down.",
    objectives: [
      "Establish whether Elias Marchetti himself was displaced, duplicated, or is otherwise intact.",
      "Identify the point of origin and mechanism of the anomaly.",
      "Determine who operated at the signal compound on the night of 14\u201315 March.",
      "Resolve the registry conflict before the 18 March correction lands."
    ],
    evidence: [
      {
        id: "v1", name: "Identity card, E. Marchetti", type: "document", icon: "▤",
        summary: "Date of birth printed three days from today. Chip validates intermittently.",
        body: "Standard civil identity card. Date of birth field reads 18 March of the current year. Photograph and biometrics: correct. A small inked footer states REISSUED \u2014 AUTO-REGISTRY ORD-7.",
        details: [
          "The lamination is new, but the document stock is old \u2014 the office did not print a new card; it reprinted an existing one with one field changed.",
          "When docked to the registry terminal, the chip fails 3 out of 5 validation attempts. The error returned is EMPL\u20140114: \u201csubject does not yet exist\u201d."
        ],
        lab: { label: "Chip audit trail (Laboratory)", result: ["Card was reissued at 09:40 on 15 March using a registry mirror token that was issued at 02:17 that same night \u2014 forty-five minutes before the office opened, by an operator account that does not belong to a person."] },
        key: true
      },
      {
        id: "v2", name: "Medical record, E. Marchetti", type: "record", icon: "✚",
        summary: "A completely ordinary, completely documented 34-year life.",
        body: "Municipal hospital record. Age 34. Childhood vaccinations, a broken left radius at 11, an appendectomy at 19. Born at home under midwife attendance; the midwife's own register from 34 years ago carries the entry. Admitted unconscious 03:02, discharged same day.",
        details: ["The treating physician noted only: \u201cpatient deeply asleep, no injury, no intoxication, mild hypothermia of the hands. Woke at 06:40, asked for his mother.\u201d"]
      },
      {
        id: "v3", name: "Track crew work log, night of 14\u201315", type: "document", icon: "✎",
        summary: "Signature at 01:30. Second entry breaks off mid-stroke at 02:17.",
        body: "Maintenance logbook. 01:30 \u2014 Elias signs on for the night shift, patrol of platform 4 circuitry. The next entry is a running job note beginning \u201c02:17, signal box interlock A\u2014\u201d. The handwriting stops mid-word. The pen has traveled two centimetres on the paper as the hand lost tension; the stroke tapers and ends.",
        details: ["Full forensic review: the hand was not forced. The arm simply switched off, over roughly one quarter of a second."]
      },
      {
        id: "v4", name: "Interview: June Marchetti (mother)", type: "witness", icon: "☏",
        summary: "Home birth, midwife present, no doubt whatsoever. And one strange phone call.",
        body: "\u201cHe was born in my front room with Mrs. Osti catching, and I have told that story at thirty dinners. If the government says he is being born on Friday, then the government should come to my front room on Friday and explain itself.\u201d\n\nShe adds, unasked: two nights ago Elias called her at 02:10, said every clock in his flat was showing a different time, and said the radio kept playing \u201cthe same three seconds of a song, over and over\u201d.",
        details: ["At 02:10 the flat's clocks disagreed. At 02:17 he stopped describing things. Reconcile that seven minutes."]
      },
      {
        id: "v5", name: "Statement: D. Kohl, platform barista", type: "witness", icon: "☕",
        summary: "Unmarked van, three people in coveralls, an instrument case with a stencilled mark.",
        body: "Kohl closes the bar at 02:00 and does accounts with the shutters half up. At 02:15 a grey utility van without plates parked at the east service gate. Three people in clean grey coveralls carried a grey instrument case toward the signal compound. Left by 02:35.\n\n\u201cThe case had a stencil on the side \u2014 a circle with a line down the middle of it. You see that kind of thing on government cases. You do not see it on government vans with no number plates, though, and I have been here nineteen years.\u201d",
        details: ["Kohl sketched the stencil from memory. The circle is closed; the vertical line runs top to bottom, slightly left of centre."],
        janus: true, key: true
      },
      {
        id: "v6", name: "Station surveillance DVD, Platform 4", type: "surveillance", icon: "▣",
        summary: "Van and crew at 02:15. Frame 02:17 is double-exposed. The crew arrives. They never leave.",
        body: "Footage recovered from the platform 4 camera. 02:15 \u2014 van arrives, crew unloads the case. 02:17 \u2014 the frame resolves twice onto itself: two overlapping exposures of the compound, the clock face in both. 02:19 \u2014 for eleven frames, a scan-line pattern traverses the image, orderly, not interference.\n\nThe crew walks in at 02:26. The van is still present at 02:35 when the recording ends due to a \u201cscheduled overwrite\u201d. No departure is recorded. The gate log for the service road shows no van exit that night.",
        details: ["Full frame enhancement (Laboratory): the double exposure exists for a single frame. Both clock faces in it read 02:17. The camera did not move. Something in front of it existed twice, at the same time, in the same place."],
        key: true
      },
      {
        id: "v7", name: "Mysterious photograph (personal effects)", type: "photo", icon: "🖼",
        summary: "An analogue double-exposure of the platform clock. Both exposures read 02:17.",
        body: "A 35mm print found folded in Elias's coat pocket. Analogue film, double exposure of the platform 4 clock \u2014 both clock faces read 02:17. On the reverse, in pencil: \u201cthe clock is lying to us.\u201d Signed E.\n\nFilm stock was discontinued eight years ago. The print's paper is consistent with the station darkroom, which has been sealed since 2019.",
        details: ["Full optical analysis (Laboratory): the two exposures were made no more than 0.4 seconds apart. The clock's second hand did not move between them."]
      },
      {
        id: "v8", name: "Field reading bundle (first pass)", type: "measurement", icon: "◈",
        summary: "Personal effects displaced; documents fragmented; signal box carries a foreign residue.",
        body: "First-pass scanner sweep logged on intake. Elias's personal effects: temporal signature DISPLACED, offset \u221272h, shallow decay curve (recent). His documents: FRAGMENTED \u2014 the paper anchor and a new, inorganic anchor coexist, 34 years apart. Signal compound residual field: UNKNOWN class, coherent, non-natural, series notation \u201cH\u201d.",
        details: ["Full target list is available to the Temporal Scanner. The unknown \u201cH\u201d series does not match any signature class previously filed by the Division."]
      },
      {
        id: "v9", name: "Registry extract, birth entry \u2018Marchetti, Elias\u2019", type: "document", icon: "▥",
        summary: "Birth entry marked PENDING. Auto-entry ORD-7. No human clerk signature anywhere.",
        body: "Certified extract from the civil registry. Birth entry status: PENDING \u2014 effective 18 March, entered by automated daemon ORD-7 with no reviewing clerk. The entry's provenance chain begins at a registry mirror installed on the station's administrative terminal.\n\nAppendix: daemon activity log. At 02:26 on 15 March, ORD-7 opened an unscheduled \u2018consistency pass\u2019 \u2014 forty minutes before documents were touched, and nine minutes after the platform 4 anomaly.",
        details: ["Full chain review (Laboratory): the consistency pass at 02:26 was triggered by a token event, not by user input. Something arrived on the registry network at 02:26. It has been \u2018correcting\u2019 ever since.", "The registry mirror on the station terminal was installed five weeks ago by an external contractor."],
        janus: true, key: true
      },
      {
        id: "v10", name: "Signal compound \u2014 maintenance manual page", type: "document", icon: "◈",
        summary: "A slim page describing a \u2018Chronometric Synchronizer, Anchor Unit A-1\u2019. Serviced list redacted.",
        body: "Loose page filed inside the signal compound's maintenance binder, in a binder pocket that per the binder's own index should not exist. Handset-printed, not photocopied: \u2018Chronometric Synchronizer, Designation Anchor Unit A-1. Purpose: aligning remote record anchors to operational clocks. Do not operate within 400 m of live registries.\u2019 Serviced-by list: redacted. Property stamp: HALDEN APPLIED CHRONOMETRY.",
        details: ["Full stamp comparison (Laboratory): the HALDEN stamp ink is batch-matched to a stamp held by the railway authority's contractor vetting office. Halden is vetted, registered \u2014 and has never invoiced the railway for any work at this station."],
        janus: true, key: true
      },
      {
        id: "v11", name: "North Ring Road camera stills", type: "surveillance", icon: "▣",
        summary: "The van leaves at 02:38. The plates are blank in every frame. It heads for District 9.",
        body: "Two consecutive camera stills from the North Ring Road, 02:37 and 02:38. The grey utility van, driving at a steady 61 km/h. In every frame, in every camera, the number plate region is smoothly, uniformly blank \u2014 not obscured, not blurred: absent, as if that part of the image was never recorded.\n\nTrajectory projection puts the vehicle in District 9 industrial estate by 02:55.",
        details: ["Cross-check: no vehicle with a blank-plate signature has ever been resolved on the ring system, on any night. The blank is not damage; it is policy."]
      },
      { id: "s3", name: "Scan report: registry terminal mirror", type: "measurement", icon: "◈",
        summary: "Scanner reading \u2014 registry terminal mirror.",
        body: "SCANNER TARGET: registry terminal mirror.\nSignature: UNKNOWN, class notation H-series. Assessment: an inorganic record anchor, freshly minted, bearing an expiration \u2014 the mirror asserts a new \u2018now\u2019 for any record it touches, 72 hours ahead of certified time. It is the loudest object in the building.",
        details: ["The mirror was installed five weeks ago by an external contractor. Halden Applied Chronometry does not appear in the installation paperwork. Neither does anybody else."],
        key: true },
    ],
    scanner: [
      { target: "Elias Marchetti (personal effects)", signature: "displaced", note: "Offset \u221272h, shallow decay. Something re-anchored his effects, not his body. Yields scan report R1.", yields: "sc1" },
      { target: "Identity documents", signature: "fragmented", note: "Two anchors coexist: a 34-year paper anchor and a new synthetic one. The synthetic anchor's parent token matches the registry mirror.", yields: "sc2" },
      { target: "Signal compound", signature: "unknown", note: "Residual field, non-natural, class H. Decaying 3.1%/day \u2014 very recent. Yields scan report R3.", yields: "sc3" },
      { target: "Platform 4 clock", signature: "duplicate", note: "The clock asserts 02:17 twice \u2014 two identical assertions, 0.4s apart, both cleanly filed. A clock does not stammer. This one was told to.", yields: "sc4" },
      { target: "Registry mirror (ORD-7)", signature: "unknown", note: "Inorganic anchor with a forward expiry. The pending entry expires at 18 March 00:00 \u2014 after which the daemon will consider the correction final and bind it permanently. Yields scan report R5.", yields: "sc5" }
    ],
    timeline: [
      { id: "e1", label: "Elias signs on for the night shift, patrol of platform 4 circuitry", stamp: "01:30", stampType: "confirmed", src: "v3" },
      { id: "e2", label: "Unmarked van parks at the east service gate; three in coveralls unload an instrument case", stamp: "02:15", stampType: "witness", src: "v5" },
      { id: "e3", label: "Anchor pulse issued at the signal compound; clocks stammer; Elias loses consciousness", stamp: "02:17", stampType: "confirmed", src: "v6" },
      { id: "e4", label: "Work log signature breaks mid-stroke; Elias lies beside the compound, breathing", stamp: "02:17\u201303:02", stampType: "confirmed", src: "v3" },
      { id: "e5", label: "Ambulance called by the night dispatcher; Elias transported", stamp: "03:02", stampType: "confirmed", src: "v2" },
      { id: "e6", label: "Registry daemon ORD-7 opens an unscheduled consistency pass, triggered by a token event", stamp: "02:26", stampType: "confirmed", src: "v9" },
      { id: "ev7", label: "ORD-7 reissues the identity card with date of birth 18 March", stamp: "09:40", stampType: "confirmed", src: "v1" },
      { id: "e8", label: "Registry auditor raises the anomaly report; the Division is engaged", stamp: "day of 15 March", stampType: "estimated", src: "brief" },
      { id: "e9", label: "Pending birth entry expires; the daemon would permanently bind its correction", stamp: "18 March 00:00", stampType: "conflicting", src: "v9" }
    ],
    trueOrder: ["e1", "e2", "e3", "e4", "e6", "e5", "ev7", "e8", "e9"],
    causality: [
      { from: "e2", to: "e3", rel: "causes", why: "The crew and their unit were at the compound at 02:15; the pulse at 02:17 is theirs." },
      { from: "e3", to: "e4", rel: "causes", why: "The pulse rendered a grown man unconscious at 40 metres." },
      { from: "e3", to: "e6", rel: "causes", why: "The pulse's token arrived on the registry network and woke the daemon's consistency pass." },
      { from: "e6", to: "ev7", rel: "causes", why: "The pass reissued the card with the shifted birth field." },
      { from: "ev7", to: "e9", rel: "precedes", why: "The reissue starts the clock on the pending entry; expiry would bind it permanently." },
      { from: "e3", to: "e5", rel: "precedes", why: "The dispatcher found a man down; the ambulance entry follows the pulse, not the other way round." }
    ],
    interventions: [
      {
        id: "i1", label: "Manual re-anchoring of the registry dossier",
        desc: "A Department clerk re-anchors the birth entry to its certified 34-year anchor and repeals the ORD-7 auto-corrections before the 18 March expiry.",
        stability: 2.6,
        consequence: "Record integrity is restored within hours; the pending entry dissolves; the chip validates again. The correction is logged as a benign registry fault \u2014 which also means the field test that caused it becomes invisible to any auditor. Halden's night at Central Station never existed on paper. Ordinarily you would not blink at that. Tonight it reads like a favour.",
        quality: 10
      },
      {
        id: "i2", label: "Contain: flag the dossier, monitor until 18 March",
        desc: "The record stays pending; the Division watches. Elias rides his own nonexistence for three days.",
        stability: 0.4,
        consequence: "Cheapest option. Elias loses pay access twice, is refused an interstate train ticket once, and spends 18 March wondering whether he meant it when he said birthdays were overrated. Stability barely moves. The pending entry expires harmless into a watched record.",
        quality: 6
      },
      {
        id: "i3", label: "Refer the field test to the Audit Office",
        desc: "Report the unlicensed pulse, the redacted manual and the plateless van as an external chronometric operation on civil infrastructure.",
        stability: -1.8,
        consequence: "The Audit Office timeline interferes with three open records and the referral itself needs six weeks of protective scheduling. Something answers the referral faster than any audit office should. You get a receipt with no letterhead and a feeling of being measured. Elias is compensated, technically.",
        quality: 3
      },
      {
        id: "i4", label: "Deny service to daemon ORD-7",
        desc: "Take the daemon offline entirely and hold all corrections \u2014 Elias's and everyone else's.",
        stability: -0.9,
        consequence: "ORD-7 is not only correcting Elias. It holds 1,102 routine corrections citywide, which now avalanche into a queue. Elias is safe; forty registrars are not. Stability pays for the cascade.",
        quality: 1
      }
    ],
    report: [
      {
        id: "q1", prompt: "What is the origin of the anomaly?",
        options: [
          { text: "A natural decay of the civil registry records", w: 0.2, note: "Records decay randomly; this one was steered. Look at the token event at 02:26." },
          { text: "An external chronometric pulse issued near the signal compound", w: 1, note: "Van, unit, pulse, stammering clocks \u2014 all of it lands within four minutes of 02:17." },
          { text: "Elias travelled back from a future in which he was born later", w: 0, note: "Elias never went anywhere. His paperwork did." },
          { text: "An ordinary clerical error amplified by the registry daemon", w: 0.4, note: "Daemons amplify; they do not choose 02:17 on a night when a stencilled case was carried into the compound." }
        ]
      },
      {
        id: "q2", prompt: "What was actually displaced?",
        options: [
          { text: "Elias himself, thrown forward out of his own timeline", w: 0, note: "His body, his history, his midwife: intact and local the whole time." },
          { text: "A duplicate of Elias from a parallel line", w: 0, note: "No second Elias, no duplicate signature on a person. The fragmentation is on paper." },
          { text: "His administrative records \u2014 the paper anchor, not the man", w: 1, note: "Records displaced, man anchored. That is what an Anchor Unit does." },
          { text: "The station's entire clock network", w: 0.2, note: "One clock stammered. One. The network was fine." }
        ]
      },
      {
        id: "q3", prompt: "When did the displacement occur?",
        options: [
          { text: "02:17, night of 14\u201315 March", w: 1, note: "Break in handwriting, camera double-exposure, clock stammer \u2014 all at 02:17. Consistent before, consistent after." },
          { text: "09:40, when the card was reissued", w: 0.2, note: "09:40 is when the damage was noticed by a daemon, not when it was done." },
          { text: "During Elias's birth, 34 years ago", w: 0, note: "The midwife's register is intact. Nobody rewound 34 years." },
          { text: "At an undeterminable time \u2014 the evidence is mute", w: 0.2, note: "The evidence shouts one minute with unusual discipline." }
        ]
      },
      {
        id: "q4", prompt: "Who operated at the signal compound that night?",
        options: [
          { text: "An unbadged contract crew with an instrument case, van unlicensed \u2014 not on any roster", w: 1, note: "Kohl saw them; the gate log never saw them leave; no service was ever invoiced. People who are on nobody's roster are on somebody's roster." },
          { text: "A Department field crew under Director's order", w: 0.4, note: "Reed ran the roster twice. Not ours. Though you will want to ask why the answer has a shape you recognise." },
          { text: "Ordinary railway maintenance \u2014 coincidence with computer trouble", w: 0, note: "Railway crews use marked vans, sign logs, and do not carry chronometric instruments." },
          { text: "Insufficient evidence to say", w: 0.2, note: "There is a stencilled case, a blank van and a redacted service list deciding to disagree with you." }
        ]
      },
      {
        id: "q5", prompt: "Elias Marchetti is best filed as:",
        options: [
          { text: "A victim of record displacement \u2014 he was here the whole time", w: 1, note: "Records were moved around him. He never moved at all." },
          { text: "A displaced person from a future registry", w: 0, note: "Displacement of a person leaves a person-shaped hole where he was. There is no hole." },
          { text: "A loop artefact \u2014 a closed circuit of himself", w: 0, note: "Loop artefacts repeat. Elias is annoyingly singular." },
          { text: "An unknown class \u2014 file and observe", w: 0.2, note: "Unknown is where investigations go to die. He is anything but unknowable: he is plain and documented and 34." }
        ]
      }
    ],
    comms: [
      { id: "c1", trigger: { type: "start" }, from: "reed", text: "Morning. Seen the intake on Marchetti? Registry says he's being born Friday. My advice: don't start with the man, start with the paperwork. Paperwork can't run." },
      { id: "c2", trigger: { type: "examined", id: "v5" }, from: "reed", text: "Kohl's stencil. Circle, vertical line. I'm going to send you something I probably shouldn't be holding. Not yet \u2014 first tell me what the crew did to that signal box." },
      { id: "c3", trigger: { type: "examined", id: "v9" }, from: "mercer", text: "02:26 consistency pass. Nine minutes after the anomaly \u2014 and before a single document was reissued. Whatever woke ORD-7 arrived from OUTSIDE the registry. It walked in wearing a token." },
      { id: "c4", trigger: { type: "examined", id: "v10" }, from: "vale", text: "\u2018Anchor Unit A-1.\u2019 I see you found my least favourite sentence in the railway binder. A technical note for your report: a pulse like that does not shift memories or bodies. It shifts records. Remember that when you file the answer." },
      { id: "c5", trigger: { type: "hint" }, from: "cross", text: "Official consultation, then. The pending entry expires 18 March at 00:00. Whatever your intervention is, it must land BEFORE the expiry, or the daemon binds the correction permanently. That is the entire game. Everything else is garnish." },
      { id: "c6", trigger: { type: "hint" }, from: "reed", text: "Second consultation, and I want it on the record that I gave you both halves. The documents are fragmented \u2014 two anchors, 34 years apart. The man is merely displaced, and shallowly. Ask yourself what kind of instrument separates a man from his paperwork at 400 metres." }
    ],
    truth: {
      headline: "Nobody travelled. Nobody was duplicated. Elias Marchetti's RECORDS were re-anchored.",
      body: "On the night of 14\u201315 March, an unbadged crew field-tested \u201cAnchor Unit A-1\u201d \u2014 a chronometric re-anchoring device \u2014 beside the Central Station signal compound.\n\nThe device's job is not to move people. It moves the temporal anchors of records: the faint assertion about \u201cwhen\u201d that a document carries. At 02:17 the unit issued an unlicensed pulse. It missed its intended target \u2014 the registry mirror \u2014 and hit the nearest administrative token set: Elias's civil registry dossier, sitting on the station's registry terminal. His personal effects, physically near the pulse, took a shallow relative re-anchoring that knocked him briefly unconscious and desynchronised every clock he could see.\n\nFrom 02:26, the registry daemon ORD-7 began \u201ccorrecting\u201d the displaced entry: reissuing documents printed with a birth date of 18 March and marking the birth PENDING. If the pending entry expires on 18 March, the correction binds permanently \u2014 Elias would become a man whose birth is always three days away from now.\n\nEvery clue agrees with this story: the mid-stroke signature break and the double-exposed clock (02:17), the mother's phone call about disagreeing clocks (02:10\u201302:17), the stencilled case (JANUS series), the redacted manual and HALDEN stamp (the instrument's maker), the token-borne consistency pass at 02:26, and the plateless van that every camera recorded and none resolved. The man was always here. The paper went travelling \u2014 three days and no years at all."
    }
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = CASE; }
  else { (root.TD = root.TD || {}).CASE_1 = CASE; }
})(typeof window !== "undefined" ? window : globalThis);

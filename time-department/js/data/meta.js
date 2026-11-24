/* TIME DEPARTMENT — shared metadata: namespace, personnel, archive, classified files */
(function (root) {
  "use strict";
  var TD = root.TD || (root.TD = {});

  TD.META = {
    title: "TIME DEPARTMENT",
    subtitle: "TEMPORAL STABILITY DIVISION",
    saveKey: "td_save_v1",
    baseStability: 84.0,
    deptEpoch: { y: 2031, m: 3, d: 15 } /* department date when hire begins */
  };

  /* ---------------- PERSONNEL ---------------- */
  TD.PERSONNEL = [
    {
      id: "voss", icon: "◈", name: "Dr. Eleanor Voss",
      role: "Director, Temporal Stability Division",
      bio: "Thirty-one years of service. Voss rose from field analyst to Director in a decade, a pace nobody in the building can explain and nobody asks about. She signs fewer documents than any Director on record — yet the archive keeps producing memos with her signature.",
      quote: "The Department does not protect the past. It protects the present from the past.",
      hidden: [
        { afterCase: 4, text: "Cross-reference: the signature on the EXCISION-1 authorization reads \u201cActing Director R. Voss\u201d. Her middle name is Rachel. She was 35 that year." }
      ]
    },
    {
      id: "vale", icon: "⌬", name: "Dr. Adrian Vale",
      role: "Senior Temporal Physicist",
      bio: "Author of the standard monograph On Temporal Signatures, which every recruit is issued and nobody finishes. Vale speaks in caveats and signs off on almost nothing. His laboratory is cold, his coffee is cold, and his questions are colder.",
      quote: "Time does not break. People break it, and then time invoices them.",
      hidden: [
        { afterCase: 1, text: "Vale quietly requests that any mention of \u201cHalden Applied Chronometry\u201d be omitted from your official wording. He does not say why." },
        { afterCase: 5, text: "Vale's transfer memo for File 9-JANUS ends: \u201cSome things are safer unread.\u201d He wrote it 12 years ago. He has never once mentioned it to you." }
      ]
    },
    {
      id: "cross", icon: "❖", name: "Miriam Cross",
      role: "Chief Archivist, Temporal Archive",
      bio: "Keeper of the Department's memory, official and otherwise. Cross can produce any document within minutes and can produce nothing, slowly, for as long as it suits her. She has performed every annual seal check on Vault B for twelve years.",
      quote: "The archive never lies. It just decides what order to tell the truth in.",
      hidden: [
        { afterCase: 5, text: "Cross's voice, aged by a phonetic model, matches the unidentified caller at 91% confidence. Your request to compare formal voiceprints is denied \u201cfor continuity reasons\u201d." }
      ]
    },
    {
      id: "reed", icon: "✚", name: "Agent Thomas Reed",
      role: "Senior Field Investigator, 22 years of service",
      bio: "Reed has worked more anomalies than anyone currently drawing a Department paycheck, and talks about nearly none of them. He keeps a private notebook with a symbol on the cover — a circle split by a vertical line — and slams it shut when anyone looks.",
      quote: "Every case is a door. Some doors open. Some doors are somebody else's office.",
      hidden: [
        { afterCase: 1, text: "Reed ran the roster twice: the coverall crew at Central Station was not Departmental. \u201cNot ours,\u201d he writes, \u201cand nobody invoiced us either.\u201d" },
        { afterCase: 4, text: "Reed's notebook, one page visible: the Janus circle, and under it the words \u201cthey didn't fix the river. they dammed it.\u201d" }
      ]
    },
    {
      id: "mercer", icon: "◉", name: "Analyst June Mercer",
      role: "Temporal Data Analysis",
      bio: "Mercer reads signatures the way other people read faces. She flagged the Chronomagnetic Lens L-9 file, the platform clock drifts, and eleven separate pattern echoes nobody else statistical-significanced into existence. She is almost never wrong, which unsettles people.",
      quote: "Noise is just a signal that hasn't found its case file yet.",
      hidden: [
        { afterCase: 3, text: "Mercer re-reads the 1978 L-9 survey and asks a question nobody wants to answer: \u201cWho signed \u2018no action recommended\u2019?\u201d The surveyor's countersignature is A. Vale's." }
      ]
    }
  ];

  /* ---------------- TEMPORAL ARCHIVE ----------------
     Records available from the Archive section.
     locked: { case: n } unlocks after case n is complete; { janus: n } needs janus score */
  TD.ARCHIVE = [
    {
      id: "charter", ref: "ARCH-01", title: "Department Charter, Article 1 (excerpts)",
      date: "1957", body: "The Department for Temporal Stability is chartered to observe, record, and where necessary correct discontinuities in the temporal record of record-holding institutions. It shall employ no method that substitutes one falsehood for another, save where the falsehood is smaller than the truth it replaces.\n\n(Article 1 has never been amended. Several clerks over the decades have pointed out that this sentence authorizes more than anyone intended, and several clerks over the decades have been reassigned.)"
    },
    {
      id: "stability-meth", ref: "ARCH-02", title: "The Temporal Stability Index — methodology note",
      date: "1988", body: "The Stability Index is a weighted composite of registry integrity, instrumental drift, witness convergence, and causal redundancy across monitored systems. It is not a measure of truth. A timeline may be perfectly stable and entirely wrong; the Index measures coherence, and coherence can be manufactured. Analysts are reminded of this once per fiscal year."
    },
    {
      id: "incidents71", ref: "ARCH-03", title: "Incident summary: the Cranlow Crane, 1971",
      date: "1971", body: "A dockside crane at Cranlow was documented lifting a load eight minutes before the load was attached. Investigation concluded a documentation fault. The load, a 4-tonne generator, remains in the as-built drawings of a warehouse that was never constructed. Status: closed. Cross-refers to nothing, which the file says twice, suspiciously."
    },
    {
      id: "mirage94", ref: "ARCH-04", title: "Incident summary: the Mirage Summer, 1994",
      date: "1994", body: "Between June and August 1994, the town of Auben reported 14% more days than the calendar provided. Civic authorities adjusted silently. Agricultural yields for the extra days were normal. The extra days were never observed departing at either end of the summer. Status: closed, sealed addendum withheld."
    },
    {
      id: "signatures", ref: "ARCH-05", title: "On Temporal Signatures — Dr. A. Vale",
      date: "1990", body: "Every sustained configuration of matter and record carries a signature: a faint assertion about when it is. Displacement is never total; something always anchors. When you find an object with two anchors, ask which one paid for the anchor.\n\nSignature classes: NORMAL, DISPLACED, DUPLICATE, MISSING, FRAGMENTED, UNKNOWN. The seventh class is not taught to recruits. It is not called anything."
    },
    {
      id: "purge09", ref: "ARCH-06", title: "Administrative summary: records purge of 2009 (redacted)",
      date: "2009", body: "In line with standing continuity policy, three classified files were destroyed on ███ by the Office of Continuity. Two of three were destroyed as scheduled. The third could not be located for destruction. A search is considered closed. A search is considered closed.", janus: 2
    },
    {
      id: "turin62", ref: "ARCH-07", title: "External report: persistent divergence, Turin 1962 diorama",
      date: "1962", body: "A historical exhibit depicting Turin in 1962 began, in 1988, to depict a curiously improved version: more tramlines, a complete metro network, happier faces. Conservators repainted it fourteen times. It has not been repainted since 2004. The exhibit has been stable, and incorrect, ever since. Referred to our counterparts with an interest in \u201cwhat could have been\u201d. No action. Probably."
    },
    {
      id: "l9survey", ref: "ARCH-08", title: "Geological survey excerpt: chronomagnetic lens, Hillcrest",
      date: "1978", body: "Subsurface formation exhibits measurable temporal curvature at a depth of 12\u201318 m. Localized, low energy. Classification L-9. Recommendation: no action recommended; do not irrigate; do not detonate; do not anchor.\n\nCountersignature: field review A. Vale, 1978.", janus: 1
    },
    {
      id: "handbook", ref: "ARCH-09", title: "Employee handbook excerpt — on clocks",
      date: "1977", body: "Employees are reminded that a wristwatch is a personal instrument and a clock is a public statement. If your watch and the wall clock disagree, the wall clock is correct. If two wall clocks disagree, the room is wrong and should be vacated in an orderly fashion."
    },
    {
      id: "pigeon", ref: "ARCH-10", title: "Miscellaneous report: the pigeon of Platform 3",
      date: "2024", body: "Maintenance reports a pigeon at Central Station crossing Platform 3 at almost exactly 89-second intervals for an extended observation window. Est. population of identically behaving pigeons required to explain the sightings: 423. Number of pigeons counted: 1. File left open at the request of Analyst Mercer."
    },
    {
      id: "looptheory", ref: "ARCH-11", title: "Research memo: closed loops and the patience of channels",
      date: "2003", body: "A closed temporal channel requires an anchor: a token, a clock, or a person stable enough to bear the round trip. Anchors survive because they are ordinary. The most reliable anchor in any correspondence archive is the custodian's access token, precisely because nobody thinks about it.\n\nIf a message reaches the past, the sender has already been. The work of the living is to make sure the message was worth being.",
      janus: 2
    },
    {
      id: "janusname", ref: "ARCH-12", title: "Terminology note: the two-faced mark",
      date: "2006", body: "A stencil mark — a circle bisected by a vertical line — has recurred on equipment cases, invoices, and one funeral wreath across three decades of unattributed field operations. Operations by whom is a question the filing system politely declines to answer. Staff informally call the mark J.\u2009P. for Janus Pattern. The informality is departmental; the fear is personal.",
      janus: 2
    }
  ];

  /* ---------------- CLASSIFIED FILES ---------------- */
  TD.CLASSIFIED = [
    {
      id: "janus-cover", ref: "JANUS-0", title: "PROJECT JANUS — cover sheet", reqJanus: 3,
      body: "PROGRAM: JANUS\nSPONSOR: Office of Continuity (unregistered)\nOBJECTIVE: Applied chronological re-anchoring.\n\nA re-anchoring event is a lie with a receipt. JANUS exists to produce such receipts on demand: to move records, not people; to move days, not crowds; to move guilt, not blame.\n\nThe program is administered outside the departmental organigram. Personnel assigned to JANUS are not assigned to JANUS. This sheet is the only JANUS document held by the Division.\n\nThe Director is asked to initial receipt. The line for initials has been empty for twenty years."
    },
    {
      id: "anchor-log", ref: "JANUS-1", title: "Anchor Unit A-1 — field test log (excerpt)", reqJanus: 5,
      body: "UNIT: A-1 (series J-7). FIELD: Central Station, east service compound.\nNIGHT: 14\u201315 March. CREW: 3 (coveralls, unbadged).\n\n02:15 arrival. 02:17 PULSE issued at unlicensed power. Target: administrative token set, platform registry mirror.\nRESULT: record anchor displaced +72h. Secondary: personal effects of one (1) employee re-anchored \u221272h relative. Subject neutral. Pulse visible on network clocks as a \u201cdesynchronization event\u201d.\n\nNOTE (handwritten): diagrams of the pulse propagation look like a stencil we all pretend not to recognize."
    },
    {
      id: "halden-invoice", ref: "JANUS-2", title: "Invoice for works executed — damping station D-4", reqJanus: 6,
      body: "Contractor: HALDEN APPLIED CHRONOMETRY\nWorks: replacement of inhibition module, damping station D-4, East Yard.\nPart installed: A-1 series inhibition module (JANUS derivative).\nWarranty: void in the event of audit.\n\nBilled to: Office of Continuity.\nA receipt is attached. The receipt is blank. Halden has been billing a blank receipt to an office that does not exist, and everybody has been paying it, which tells you everything about how continuity is maintained."
    },
    {
      id: "excision-auth", ref: "JANUS-3", title: "Protocol EXCISION-1 — original authorization", reqCase: 4,
      body: "PROTOCOL: EXCISION-1 (single full deployment)\nWINDOW: 06:00\u201324:00, Monday 14 October.\nGROUND: mass civil casualty event, unrecoverable at scale.\n\nAuthorized: Acting Director R. Voss.\nCountersigned: Dr. A. Vale (technical basis).\nExecution: Office of Continuity.\n\nPost-action note, different ink: \u201cThe day is not gone. It is owed. Whoever helped me pencil this in helper's hour will one day ask me to undo it, and I will say yes, and that will be the end of me. \u2014 R.V.\u201d"
    },
    {
      id: "file9-index", ref: "JANUS-4", title: "File 9-JANUS — vault index card", reqCase: 5,
      body: "RE: PROJECT JANUS — Core Ledger, 2009\u20132012.\n\nThe ledger records every re-anchoring the Office of Continuity has bought: the misses as well as the hits. It names two sponsors for the original program.\n\nOne signature is R. Voss.\n\nThe other has been redacted in every copy of every index card, including this one, by a hand steadier than any clerk's. The redaction is scheduled to expire. No one knows who schedules redactions.\n\n(A second program, predating JANUS, is referenced only once: a margin note reading \u201cthe department before this one\u201d.)"
    }
  ];

  /* ---------------- RANKS ---------------- */
  TD.RANKS = [
    { name: "Junior Investigator", need: 0 },
    { name: "Investigator", need: 1 },
    { name: "Senior Investigator", need: 2 },
    { name: "Temporal Analyst", need: 3 },
    { name: "Special Operations Agent", need: 4, minAvg: 55 },
    { name: "Department Director", need: 5, occupied: true }
  ];

  TD.EVIDENCE_TYPES = ["document", "photo", "audio", "surveillance", "witness", "measurement", "object", "record", "comms"];
  TD.RELATIONS = ["supports", "contradicts", "causes", "results_from", "precedes", "follows", "possibly_related", "unknown"];
  TD.RELATION_LABELS = {
    supports: "SUPPORTS", contradicts: "CONTRADICTS", causes: "CAUSES", results_from: "RESULTS FROM",
    precedes: "TEMPORALLY PRECEDES", follows: "TEMPORALLY FOLLOWS", possibly_related: "POSSIBLY RELATED", unknown: "UNKNOWN"
  };
  TD.TIMESTAMP_TYPES = ["confirmed", "estimated", "witness", "conflicting", "unknown"];
  TD.MARKS = ["unverified", "fact", "suspicion", "contradiction"];
  if (typeof module !== "undefined" && module.exports) { module.exports = { META: TD.META, PERSONNEL: TD.PERSONNEL, ARCHIVE: TD.ARCHIVE, CLASSIFIED: TD.CLASSIFIED, RANKS: TD.RANKS }; }
})(typeof window !== "undefined" ? window : globalThis);

/* TIME DEPARTMENT — CASE 003 data */
(function (root) {
  "use strict";
  var CASE = {
    id: "TC-003", number: 3, difficulty: 2,
    title: "The House That Remembers",
    location: "9 Kessler Row, Hillcrest",
    dateOfAnomaly: "Ongoing \u2014 drift detected 2 October",
    severity: "I",
    brief:
      "Historical records place a two-storey house at 9 Kessler Row in 1987. Property records place it there in 2004. Its residents place it in their childhoods. An aerial photograph from 1991 places it somewhere it never physically existed, faintly and out of focus, with great patience.\n\nThe house was built once. The photographs are not forgeries. The residents are not lying. Somewhere in the middle, all three of those facts are going to have to learn to live with each other \u2014 and your job is to officiate.",
    objectives: [
      "Establish when the house at 9 Kessler Row physically existed.",
      "Determine the mechanism behind the 1980s photographic evidence.",
      "Determine whether the residents' memories were altered, and if not, where they came from.",
      "Assess the drift risk and register a containment or correction policy."
    ],
    evidence: [
      {
        id: "v1", name: "Property & permitting file, 9 Kessler Row", type: "record", icon: "▥",
        summary: "1986 sale to Kessler \u2014 1987 permit \u2014 1988 cancellation \u2014 2004 permit re-issued.",
        body: "Full administrative history of the parcel. 1986: plot sold to Robert Kessler. February 1987: construction permit issued for a two-storey dwelling, plan set by architect H. Bloom. August 1988: project cancelled, cited as \u2018ground conditions\u2019, with a marginal note: \u2018void anomaly \u2014 see survey.\u2019 The Kesslers did not sell. 2004: Kestrel Developments obtains a permit for a \u2018two-storey dwelling (as 1987 plan set)'; house completed 2005.",
        details: ["Full plan-set comparison (Laboratory): the 2004 permit references the SAME plan set as 1987 \u2014 not a copy redrawn, but the original sheets, retrieved from Bloom's archive by his son, who inherited the practice."]
      },
      {
        id: "v2", name: "Architectural plans, 1987 and 2004", type: "document", icon: "◈",
        summary: "Identical plans, including a hairline construction-joint sketch at the north upstairs window.",
        body: "Two plan sets, twenty years apart, drawn by different hands (Bloom, 1987; Bloom's son, supervising reuse in 2004). Same footprint, same facade, same 14.2 m foundation specification \u2014 retained in 2004 although code by then required only 3.5 m, with a pencilled note: \u2018keep the good bones the old man left, they're deeper than we need and fond of it.\u2019\n\nAt the north upstairs window, described as a \u2018construction joint\u2019, a hairline is drawn. It appears in both sets, in the same place, to the millimetre.",
        details: ["Full drafting comparison (Laboratory): the joint is an artefact of the foundation spec \u2014 a stress line the elder Bloom mapped from the ground report. The 2004 house was built with it. There is now a real hairline crack in the putty at that exact window of the real house. The plans were not copying the crack. They were prophecy with a ground report attached."]
      },
      {
        id: "v3", name: "Geological survey excerpt, Hillcrest (1978)", type: "record", icon: "◈",
        summary: "Chronomagnetic lens L-9, depth 12\u201318 m. \u2018No action recommended. Do not anchor.\u2019",
        body: "University geological survey, Hillcrest district. A subsurface formation at 12\u201318 m depth exhibits measurable temporal curvature: signals propagating through it arrive subtly elsewhere in their own past, faint and local. Classification: L-9. Energy extremely low.\n\nRecommendations, in order: (1) no action recommended; (2) do not irrigate; (3) do not detonate; (4) DO NOT ANCHOR. The fourth recommendation is underlined twice, in a hand neither surveyor has owned up to.",
        details: ["Full surveyor cross-check (Laboratory): technical review countersignature on the survey: A. Vale, 1978. The underlining is not in his hand. It is not in anyone's hand at the university. It is in the hand that files things at the Office of Continuity."],
        janus: true, key: true
      },
      {
        id: "v4", name: "Foundation pour record, February 1987", type: "record", icon: "▥",
        summary: "Poured to 14.2 m instead of the standard 3.5 m. Reason on file: \u2018void anomaly mitigation\u2019.",
        body: "Concrete pour records. The 1987 foundation shaft was spec'd to 3.5 m, then deepened on-site to 14.2 m after the excavation hit \u2018anomalous void ground\u2019 at 4 m. The deepening was signed off by the site engineer as void mitigation \u2014 i.e. the shaft was driven THROUGH the full thickness of the lens.\n\nA steel rebar cage, grounded to the municipal earth system, was set the full depth. In plain terms: someone built a metal spear into the lens and attached it to the ground.",
        details: ["Full structural review (Laboratory): grounded rebar driven through a chronomagnetic lens, filled with cured concrete and left abandoned for seventeen years is approximately how you build an accidental reflecting telescope for time. Nobody meant to. Nobody knows they did."]
      },
      {
        id: "v5", name: "Child's drawing, dated Summer 1989", type: "photo", icon: "🖼",
        summary: "Tessa, age 5, draws \u2018our new house\u2019 \u2014 including a crack in the north upstairs window.",
        body: "A crayon drawing on the back of a 1987 electricity bill. Two-storey house, bay window, garden; caption in a child's hand: \u2018our new house (I already live there)\u2019. The north upstairs window is drawn with a dark squiggle crossing the glass.\n\nThe drawing predates the house by 16 years. Tessa Kessler was 5. The Kesslers lived on the plot in a prefab; there were no stairs, no bay window and no upstairs in the prefab. When asked in 2004 why the drawn window had a crack, she said: \u201cbecause it does\u201d.",
        details: ["Full drawing audit (Laboratory): window geometry, bay proportions and roof pitch match the 1987 plan set within a child's tolerance. The squiggle matches the hairline construction joint's position exactly. Five-year-olds do not draft. Sites leak."],
        key: true
      },
      {
        id: "v6", name: "Family photographs, 1988\u20131993", type: "photo", icon: "🖼",
        summary: "A prefab on an empty lot \u2014 and, in the 1991 frame, a faint complete facade above the foundations.",
        body: "Eleven family prints. The Kesslers' prefab stands where the house was never yet built; the concrete foundation slab and stepped shaft are clearly visible, used by the children as a climbing frame. Tessa's mother's captions: \u2018the flat\u2019 (1988), \u2018our plot\u2019 (1990), and on the 1991 print, in a different, firmer hand: \u2018the house that will be\u2019.\n\nOn that 1991 print, above the empty foundations, there is a faint but complete double-exposure of the two-storey facade \u2014 all of it, but most clearly at the north upstairs window, where the exposure is strongest.",
        details: ["Full print analysis (Laboratory): the double exposure is not camera shake, not composite, not a lab artefact. Film grain runs continuous through both images: the two exposures were made through the same lens within roughly one second of each other, of two different states of the same empty lot."],
        key: true
      },
      {
        id: "v7", name: "Aerial survey photograph, 1991", type: "photo", icon: "🖼",
        summary: "A faint rectangular silhouette over a parcel officially empty. Catalogued as a printing artefact.",
        body: "Municipal aerial survey, run 1991. On the Hillcrest sheet, parcel 9 shows a faint rectangular structure with a pitched roof-line shadow. The survey catalogue notes: \u2018printing artefact \u2014 disregard\u2019. The parcel's own records say nothing stood there in 1991 but a prefab, which had by then been moved to the plot's south edge.",
        details: ["Full photographic analysis (Laboratory): the silhouette matches the north elevation and aspect of the 2004 facade at the same scale as the surrounding survey features. The survey camera was not printing anything. It was developing a photograph taken sixteen years early."]
      },
      {
        id: "v8", name: "Historical maps, 1972 and 1987", type: "document", icon: "◈",
        summary: "1987 survey map marks \u2018structure, single dwelling\u2019 at the parcel \u2014 over empty foundations.",
        body: "Two municipal map sheets. 1972: parcel empty. 1987 survey sheet: \u2018structure, single dwelling\u2019 marked at 9 Kessler Row, with the parcel shaded as if occupied. The cartographer of 1987, interviewed by archive staff some years ago, explained that he mapped \u2018what was on the ground\u2019: the foundation steps plus the prefab. He described the foundations the way you would describe a building, and drew them with a full footprint and a roof, because that is how the ground under his pen felt.",
        details: ["Full cartographic audit (Laboratory): the 1987 map's structure footprint matches the 2004 house exactly, not the prefab. The cartographer drew the future house from a hunch, a survey and a fever of at-homeness, and filed it as an occupied dwelling with a straight face."]
      },
      {
        id: "v9", name: "Neighbour interviews (Hillcrest, long-term residents)", type: "witness", icon: "☕",
        summary: "The prefab years, the children on the foundations, and one evening in '91 when the house was briefly lit.",
        body: "Three interviews. The retired postman: \u201cThe Kesslers lived on that plot all through the late eighties \u2014 not in the house, in the little cabin. The kids called the foundations \u2018the house that wasn't there yet\u2019 and jumped off the steps all summer, every summer, for years.\u201d\n\nA second neighbour, then a teenager: \u201cOne evening in ninety-one I cut through that lot and the house was THERE \u2014 not being built, THERE, windows lit, curtains, everything \u2014 for as long as it took me to walk past it. Maybe forty seconds. Empty slab when I turned around. I never told anyone because there is no good version of telling that story.\u201d",
        details: ["Full timeline reconstruction (Laboratory): the lit-house evening, per the neighbour's own dated diary from the time (she kept a weather diary), was the same week as the 1991 aerial run and the 1991 family photograph. The lens had a busy week."]
      },
      {
        id: "v10", name: "Resident interview: Tessa Kessler (now 40)", type: "witness", icon: "☏",
        summary: "\u201cBedroom with the crack\u201d and \u201cplaying on the stairs before there were stairs\u201d. Scanner says her memories are untouched.",
        body: "Tessa lives in the house now with her father. \u201cI remember the bedroom. The crack in the corner \u2014 it's there now, people think I remember it from somewhere else, but I remember it from somewhere. And before \u2014 before the house \u2014 I remember playing on the stairs.\u201d\n\nDivision specialist review: her memory profile shows NO artificial editing signature \u2014 no foreign anchors, no re-anchoring decay, no compression artefacts. Whatever she remembers, nobody installed it.",
        details: ["Full reconciliation (Laboratory): \u2018playing on the stairs\u2019 \u2014 the foundation shaft's steps, climbed by the children 1987\u20131993, photographed in v6. \u2018Bedroom crack\u2019 \u2014 the construction joint, drawn by Tessa at 5, built in 2004 by Bloom's son, and cracked in the putty since. Her memories are real experiences of the PLOT plus leaked impressions of the HOUSE; the family has spent twenty years filing both under one address."],
        key: true
      },
      {
        id: "v11", name: "Internal memo: Analyst J. Mercer", type: "comms", icon: "◉",
        summary: "\u201cThe reflection extends backward ~2y/yr. Re-survey scheduled. If it accelerates, this stops being somebody's charming photograph.\u201d",
        body: "MEMO, Temporal Data Analysis to case file:\n\n\u201cL-9 re-survey scheduled for November. Current drift: the reflected image extends backward at approximately 2 years per year \u2014 in 2016 the ghost appears in a 1991 aerial; extrapolated, it appears on maps from 1988, then 1984, and so on. Uncontained, by 2050 the house appears in photographs from 1910 and the parcel's own records will contradict its survey beyond tolerance.\n\nTwo containment routes are structurally viable (grout-lining through the existing shaft; excavation). Third option is monitoring, IF the drift is stable. It is not my job to say which of these is kinder. It is my job to say the drift is not stable.\u201d",
        details: ["Cross-reference: the phrase \u2018do not anchor\u2019 in the 1978 survey, the 14.2 m spear of grounded rebar, and the Office of Continuity's underlining in someone else's hand. Somebody has been aware of this lens for forty years and has preferred, for reasons of their own, that it stay exactly as it is."],
        key: true
      }
    ],
    scanner: [
      { target: "North upstairs window (putty joint)", signature: "fragmented", note: "Two coexisting assertions: manufactured 2004; reflected exposure consistent with 1991 and earlier. A window with two birthdays disagreeing politely.", yields: "sc1" },
      { target: "Parcel 9 subsurface (lens L-9)", signature: "unknown", note: "Signature UNKNOWN, low energy, artificially modified: the grounded rebar changes the lens's natural behaviour. Somebody's foot is on the pedal. Yields scan report R2.", yields: "sc2" },
      { target: "Tessa Kessler (memory profile)", signature: "normal", note: "Signature NORMAL. No artificial editing, no displacement, no compression. Her memories are home-made. The story is stranger than tampering.\u3010Modified by analyst\u3011", yields: "sc3" },
      { target: "Aerial survey plate, 1991", signature: "displaced", note: "The plate carries an assertion of 2007-era structures imaged in 1991 \u2014 backward-displaced by 16 years exactly, mirroring the family print's exposure.", yields: "sc4" },
      { target: "Prefab site (south edge)", signature: "normal", note: "Signature NORMAL. The cabin was just a cabin. The plot meanwhile had other ideas.", yields: "sc5" }
    ],
    timeline: [
      { id: "e1", label: "University survey flags chronomagnetic lens L-9 under Hillcrest", stamp: "1978", stampType: "confirmed", src: "v3" },
      { id: "e2", label: "Plot sold to Robert Kessler", stamp: "1986", stampType: "confirmed", src: "v1" },
      { id: "e3", label: "Construction permit issued; foundations poured to 14.2 m through the lens, grounded rebar set", stamp: "Feb 1987", stampType: "confirmed", src: "v4" },
      { id: "e4", label: "Project cancelled (\u2018ground conditions\u2019). Kesslers live on the plot in a prefab; children play on the foundation steps", stamp: "1988\u20131993", stampType: "confirmed", src: "v9" },
      { id: "e5", label: "Tessa, age 5, draws \u2018our new house\u2019 \u2014 with the crack in the north upstairs window", stamp: "Summer 1989", stampType: "witness", src: "v5" },
      { id: "e6", label: "Reflection week: family photo double-exposure, aerial silhouette, neighbour's lit house", stamp: "1991", stampType: "confirmed", src: "v6" },
      { id: "e7", label: "Kesslers move away; prefab removed; foundations abandoned, still grounded through the lens", stamp: "1993", stampType: "confirmed", src: "v1" },
      { id: "e8", label: "Kestrel Developments builds the house from the same plan set, keeping the 14.2 m foundation", stamp: "2004\u20132005", stampType: "confirmed", src: "v2" },
      { id: "e9", label: "Kesslers move back in \u2014 into the house Tessa drew at 5", stamp: "2005", stampType: "estimated", src: "v10" },
      { id: "e10", label: "Reflection drift quantified: ~2 years backward per year. Re-survey scheduled", stamp: "2 October", stampType: "confirmed", src: "v11" }
    ],
    trueOrder: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10"],
    causality: [
      { from: "e1", to: "e3", rel: "precedes", why: "The lens was located and documented; the pour went through it anyway \u2014 nobody on site, in 1987, knew the survey existed." },
      { from: "e3", to: "e6", rel: "causes", why: "Grounded rebar through the lens made the site a reflector. 1987 pour to 1991 reflection: four years of charge-up, then exposures." },
      { from: "e3", to: "e5", rel: "causes", why: "The leak ran both ways across the rebar: it showed Tessa, age 5, a house that did not exist, and it showed a 1991 camera a house built in 2004." },
      { from: "e8", to: "e9", rel: "precedes", why: "The Kesslers could only move \u2018back\u2019 into the house once the house was finally, actually, built." },
      { from: "e9", to: "e10", rel: "precedes", why: "Residential occupancy raised the site's energy slightly; the drift was measurable from 2011 and confirmed in the current survey." },
      { from: "e6", to: "e8", rel: "precedes", why: "The reflection BECAME the plan: Bloom's son, reusing his father's sheets, was also the surveyor's neighbour's photographer's subject. The future house partly authored its own blueprints." }
    ],
    interventions: [
      {
        id: "i1", label: "Grout-lining of lens L-9 through the foundation shaft",
        desc: "Inject a chronally inert grout up the 1987 shaft, encasing the rebar and damping the lens. The house stays. The reflector goes dark.",
        stability: 1.8,
        consequence: "Drift halts at once and slowly reverses; the ghost exposures fade from archive photographs over about a year \u2014 archivists will record the loss of the strangest honest images the Division owns. Tessa will keep her memories and lose the paperwork of them, and the house becomes, at last, only a house. She has asked that someone tell her when it happens. Nobody will, because it will happen to her photographs and not to her.",
        quality: 10
      },
      {
        id: "i2", label: "Excavate the 1987 foundations entirely",
        desc: "Remove the rebar and the shaft \u2014 the source of the reflection and of the house it is holding up.",
        stability: 1.1,
        consequence: "The reflector is permanently destroyed, and so is the structural foundation of the 2004 house, which was explicitly built to keep it. Tessa and her father are displaced for six months while the property is re-underpinned. The photographs, both ghostly and real, become the only evidence that any of it happened.",
        quality: 5
      },
      {
        id: "i3", label: "Do nothing; monitor the drift",
        desc: "Accept the anomaly as contained, file quarterly drift readings, revisit if the reflection accelerates.",
        stability: -0.5,
        consequence: "The Index pays mildly and continuously. The Kesslers keep their impossible photographs and their quiet certainty that the house was always theirs \u2014 which, by every humane accounting, it was. The drift is not stable. Somebody else's problem inherits a deadline.",
        quality: 3
      }
    ],
    report: [
      {
        id: "q1", prompt: "When did the house at 9 Kessler Row physically exist?",
        options: [
          { text: "Built 2004\u20132005 from the original 1987 plan set \u2014 and at no other time", w: 1, note: "Permits, pour records, completion certificates. The physical house is young; the evidence of it is old." },
          { text: "It existed in 1987 and was displaced forward", w: 0, note: "Displacement leaves gaps in the ground. The gap in the ground came first, and stayed empty." },
          { text: "It existed twice, in two overlapping timelines", w: 0.2, note: "Elegant, symmetrical, and unsupported by every anchor in the file. There is exactly one house, and it is currently under this one." },
          { text: "It never fully existed \u2014 the records are corrupted", w: 0.2, note: "Records this consistent are the opposite of corrupt. Also a family currently lives in it, which corrupts this theory nicely." }
        ]
      },
      {
        id: "q2", prompt: "What is the mechanism behind the 1980s photographic evidence?",
        options: [
          { text: "A backward temporal reflection \u2014 the 1987 foundations, driven through lens L-9 with grounded rebar, reflecting the future house into old cameras", w: 1, note: "Pour 1987, charge-up, reflection 1991, seventeen years before the real facade existed. The shaft is the telescope; the lens is the mirror." },
          { text: "Forgeries planted to obscure the true construction date", w: 0, note: "Nobody forges grain structure, and no forger on earth picks a serif font of silliness like \u2018printing artefact \u2014 disregard\u2019." },
          { text: "An ordinary printing artefact, as catalogued in 1991", w: 0.4, note: "The catalogue is writing the artefact's alibi, not its autopsy. Two independent cameras and a six-year-old's crayon disagree with the filing clerk." },
          { text: "Displaced cameras that photographed the future by being moved there", w: 0.2, note: "Nobody's camera took a holiday. The image came to the film; not the other way round." }
        ]
      },
      {
        id: "q3", prompt: "Were the residents' memories altered?",
        options: [
          { text: "No \u2014 their memories are real experiences of the PLOT, mixed with leaked impressions of the future house", w: 1, note: "Scanner: no editing signature, honest decay curves. The children played on foundations they remembered as stairs, and the site leaked them a bedroom before the house was up." },
          { text: "Yes \u2014 all residents were deliberately re-anchored", w: 0, note: "Re-anchoring leaves texture: foreign anchors, decay curves, seams. Scanners show none. Whoever did nothing did it very well." },
          { text: "Yes \u2014 mass broadcast memory alteration from the construction site", w: 0.2, note: "Mass alteration needs equipment a survey does not leave behind and a neighbours' association would have complained about." },
          { text: "No \u2014 but their memories prove nothing either way", w: 0.4, note: "Half right. The memories prove something affirmative: they came from the site, not from a story." }
        ]
      },
      {
        id: "q4", prompt: "The crack in Tessa's drawing (1989) matches the real construction joint because:",
        options: [
          { text: "The lens's reflection leaked the future house's image \u2014 and its flaw \u2014 into her impression of home", w: 1, note: "The leak ran both directions through the rebar: camera closures and five-year-olds, both equally qualified to receive a signal." },
          { text: "She copied the drawing from the architect's plans she found in the prefab", w: 0.4, note: "Nobody found the plans; no plans were stored on the plot. And the construction joint is a professional's mapping, in crayon, of a stress line." },
          { text: "It is a coincidence amplified by hindsight", w: 0.2, note: "Hindsight does not draw to the millimetre." },
          { text: "She remembered a crack from a previous, demolished house", w: 0, note: "There was no previous house. There was no previous anything except mud, a survey, and eventually a pencil." }
        ]
      },
      {
        id: "q5", prompt: "The principal risk if the site is left uncontained is:",
        options: [
          { text: "Backward drift \u2014 the reflected house appears ever earlier in the record, eventually contradicting the survey itself", w: 1, note: "~2 years back per year, unbounded. Mercer's memo puts it in 1910 by 2050, and errors do not stop out of politeness." },
          { text: "Forward drift \u2014 the house begins reflecting into OMITTED futures", w: 0.2, note: "Drift observed to date is backward only; the forward leak (the drawing, the map) requires people and cameras as receivers." },
          { text: "Collapse of the 2004 house due to foundation failure", w: 0.4, note: "A real, boring, practical risk \u2014 for the STRUCTURE, not the timeline. And the grout route fixes both at once." },
          { text: "No measurable risk \u2014 the anomaly is stable", w: 0, note: "\u2018The drift is not stable.\u2019 \u2014 Analyst Mercer, memo, 2 October." }
        ]
      }
    ],
    comms: [
      { id: "c1", trigger: { type: "start" }, from: "reed", text: "Kessler Row. A quiet one \u2014 nobody's suing, nobody's missing, the house treats its residents well. That's exactly the kind that ends up on my notebook's cover, so do it properly. Start with the ground. Ground never lies; it just takes forty years to answer." },
      { id: "c2", trigger: { type: "examined", id: "v4" }, from: "vale", text: "14.2 metres. Grounded rebar. In 1978 we recommended in writing: do not anchor. Nine years later the ground was anchored by accident, with one of the finest accidental instruments I have ever seen. I nearly put it in a paper. Then the Office flagged the survey, and one does not argue with an office one has never met." },
      { id: "c3", trigger: { type: "examined", id: "v5" }, from: "mercer", text: "She was FIVE. Look at the window in her drawing. Then look at the putty of the real north window \u2014 the analysis in your lab work. Same flaw, same corner, sixteen years apart. Either this child drafted the future or the future drafted the child, and I want you to notice which of those two sentences is more disturbing." },
      { id: "c4", trigger: { type: "examined", id: "v6" }, from: "cross", text: "I have handled that 1991 print more times than I will admit in minutes. The caption on the back is in Mrs. Kessler's hand \u2014 and \u2018the house that will be\u2019 is the only caption in that album written in ink rather than pencil. Some people gather their certainty early." },
      { id: "c5", trigger: { type: "hint" }, from: "vale", text: "Official consultation. Reflection requires a REFLECTOR and an EXPOSURE. Reflector: the rebar \u2014 poured 1987. Exposure: the house \u2014 built 2004. Both ends of the instrument are needed; that is why the ghost is loudest in 1991 photographs and quietest in the archives of the material world." },
      { id: "c6", trigger: { type: "hint" }, from: "mercer", text: "Official consultation #2. The drift is 2y/yr BACKWARD. If the idea of a house slipping earlier and earlier into photographs frightens you less than the structural fix, then note that a grout-lining damps the lens AND cures nobody's apartment. But file a line for the Kesslers with whomever you report: some solutions are a small housekeeping of grief." }
    ],
    truth: {
      headline: "One house. One lens. An accidental telescope pointed at the wrong end of time.",
      body: "In 1978 a university survey catalogued a chronomagnetic anomaly (lens L-9) twelve metres under Hillcrest, and recommended above all: do not anchor. Nine years later a family's cancelled house build left a 14.2-metre shaft of grounded steel and concrete driven straight through it.\n\nFrom 1987 to 1993 the Kesslers lived on the plot in a prefab. The site, now an accidental temporal reflector, began to leak. It leaked forwards into minds that lived on it \u2014 Tessa, 5, drew the house with its future crack and captioned it \u2018I already live there\u2019. It leaked backwards into film and photographic plates \u2014 the 1991 aerial, the family prints, one neighbour's forty seconds of a lit house \u2014 all showing, faintly, the house that would be completed in 2004.\n\nIn 2004 the architect's son reused his father's plan set \u2014 construction joint included \u2014 and built the real house over the instrument that had been imaging it for seventeen years. The family moved back in. Their childhood memories of \u2018the house\u2019 are genuine: prefab years, foundation steps, plus leaked impressions of a place they would one day occupy; misfiled, every one, under a single address.\n\nThe reflection drifts backward at roughly two years a year. Left alone, by mid-century the house appears in photographs from 1910, and the record contradicts itself beyond containment. Nobody's memory was altered, nobody travelled, and nothing was built twice \u2014 but a hillside spent forty years developing a photograph of a house, patiently, in a specialist hand — and the developer was gravity."
    }
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = CASE; }
  else { (root.TD = root.TD || {}).CASE_3 = CASE; }
})(typeof window !== "undefined" ? window : globalThis);

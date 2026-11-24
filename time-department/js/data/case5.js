/* TIME DEPARTMENT — CASE 005 data */
(function (root) {
  "use strict";
  var CASE = {
    id: "TC-005", number: 5, difficulty: 5,
    title: "The Last Telephone Call",
    location: "Department \u2014 Restricted Archive / Vault B corridor",
    dateOfAnomaly: "Today \u2014 03:11",
    severity: "III",
    brief:
      "At 03:11 this morning, Records Custodian R. Sattler received a telephone call. It came from his own extension. It lasted 26 seconds. It was, by every measurement the exchange can produce, a genuine telephone call \u2014 routed, logged, terminated.\n\nIt was also, per the carrier timestamp, placed 17 years from now.\n\nThe message warned him not to open a specific classified file. The file has been missing for 12 years. Sattler is scheduled to help unseal it tomorrow morning, under order, with the Director's live signature alongside his own. The Division has four questions. The building, it turns out, has considerably more.",
    objectives: [
      "Authenticate the call: establish from where, or from when, it was placed.",
      "Establish the call's channel, routing, and anchor.",
      "Establish who recorded the message, and in which year.",
      "Decide \u2014 on the record \u2014 what the Division should do with File 9-JANUS."
    ],
    evidence: [
      {
        id: "v1", name: "The 26-second recording", type: "audio", icon: "◉",
        summary: "\u201cSattler. Your number, your token, my mistake. File 9 must remain sealed.\u201d",
        body: "Transcript of call, 03:11, 26 seconds. An older male voice, unhurried, faintly hoarse:\n\n\u201cSattler. Your number, your token \u2014 my mistake. Don't open the file. File 9 must remain sealed. Opening the ledger completes the circuit. We ran out of tomorrows. Do not let them digitize it. \u2014 M.\u201d\n\nThe last 2.5 seconds are a carrier tone: a pure, unmusical note that the exchange's engineers describe, unhappily, as \u2018the sound of a line being folded up neat\u2019.",
        details: ["Full waveform inspection (Laboratory): the message contains ZERO room tone. Any recording makes a room audible. This one was assembled in something quieter than a room: no hum, no air, no electricity audible. Just a voice and a decision. It ends with the speaker's initials in the salutation \u2014 nobody signs a hoax."]
      },
      {
        id: "v2", name: "Audio lab analysis", type: "measurement", icon: "◈",
        summary: "Voice matches no current employee. Phonetic aging projection: M. Cross \u2014 91%. Background: a distance wall clock, fast by 6%.",
        body: "Voiceprint comparison across current personnel: no match above 40% (noise floor). Phonemic ageing model applied (proprietary, verified twice): the voice is consistent, at 91% confidence, with M. CROSS aged approximately 17 years.\n\nBackground layer: a mechanical clock ticking at 1.06\u00d7 standard rate \u2014 not drifting, running fast, steadily, like something keeping time in a hurry. Beneath that, once, barely, a second voice \u2014 four syllables, unresolved: \u2018\u2026seventeen years\u2026\u2019.",
        details: ["Full palace of acoustics (Laboratory): the clock's 1.06\u00d7 rate matches the drive signature of the vault lobby regulator \u2014 the one that has been 'fast' since the day Vault B was sealed. If the ticking is the vault's clock, then the recording was made standing quietly INSIDE the department's own most sealed room."],
        janus: true, key: true
      },
      {
        id: "v3", name: "Exchange log \u2014 the impossible routing", type: "record", icon: "▥",
        summary: "The call carries a timestamp 17 years ahead and no caller header. Trunk identifiers loop back on themselves mid-call.",
        body: "Exchange log, 03:11. The call's routing table shows it entering through a trunk slot that maps to Sattler's own extension; no external line, no handshake, no caller-ID header. The carrier timestamp field, which exchanges are incapable of falsifying because they cannot reach it, reads a date 17 years ahead of today.\n\nThe routing trace closes on itself: the trunk ID at entry equals the trunk ID at termination. The exchange did not receive this call. It caught it, the way a bell jar catches a moth.",
        details: ["Full routing audit (Laboratory): for a call to USE an extension as its ingress, that extension must be registered as an anchor with the exchange \u2014 not a person, not a line; a token. There is one token in this building attached to a records custodian, and it is currently very busy pretending to be a wall socket."]
      },
      {
        id: "v4", name: "Vault B access log (12 years)", type: "record", icon: "▥",
        summary: "Two entries in twelve years: Vale, transfer in. Cross, annual seal check. Seal intact throughout.",
        body: "VAULT B ACCESS LOG.\n\nEntry 1: 12 years ago \u2014 transfer IN, File 9-JANUS, authorised and executed A. VALE, under preservation clause 9-c.\nEntry 2 through 13: annual seal inspections, performed by M. CROSS (archive supervisor), every year without exception. Each inspection notes: \u2018seal intact\u2019. Each inspection takes 40 minutes.\n\nTwelve years. Two hundred and forty tokens of nothing. Every seal checked, nobody bothering to break one. Whatever the Office of Continuity wanted destroyed 12 years ago, it is still in there, and someone has been standing politely in front of it, once a year, for an annual sign-off nobody asked anybody to perform.",
        details: ["Full chamber review (Laboratory): inspection notes attach a small annex each year, in Cross's handwriting: \u2018audible regulator acceleration behind the west wall \u2014 maintenance notified \u2014 no fault found\u2019. Twelve consecutive years of 'no fault found'. Either the wall is fine, or the wall is the instrument."]
      },
      {
        id: "v5", name: "Sattler's statement", type: "witness", icon: "☏",
        summary: "\u201cThe line was already open. Like the call had been waiting for me to pick up.\u201d",
        body: "\u201cIt was my ringtone. My own desk line. I don't take calls at 03:11 \u2014 nobody does. I picked it up anyway because it kept ringing, which desk phones don't do.\u201d\n\nSattler cannot identify the voice. \u201cIt was like a voice I HAVE heard \u2014 and then again not. Like hearing your own house described by a stranger.\u201d He did not recognize the message. He has never heard the name File 9 out loud in nine years of service, and until today did not have clearance for its index card.",
        details: ["Full reconciliation (Laboratory): the message said \u2018your number, your token, my mistake\u2019. Sattler's token anchors the call. His word \u2018mistake\u2019 \u2014 not yours, not ours \u2014 is the first thing in this case the future has admitted to."]
      },
      {
        id: "v6", name: "Vault transfer memo \u2014 A. Vale", type: "document", icon: "◈",
        summary: "\u201cSome things are safer unread. \u2014 A.V.\u201d",
        body: "MEMO, records section, 12 years ago:\n\n\u201cRe: File 9-JANUS. Transferred to Vault B under preservation clause 9-c. The clause exists for exactly one file in the history of this Division, and this is the one. If the Office of Continuity requisitions this file, they may quote the clause at me. They wrote the clause. They cannot pretend not to.\n\nNot misplaced. Not hidden. FILED. somewhere it can be found by anyone who genuinely needs it, which is fewer people than the numerator suggests.\n\nSome things are safer unread. \u2014 A.V.\u201d",
        details: ["Full clause review (Laboratory): preservation clause 9-c requires positivity of intent \u2014 i.e. the transfer must be logged with a REASON. Vale's line is compressed, deliberate and \u2014 for a man who files caveats like other people file alibis \u2014 the most nakedly human sentence he has ever submitted to a records system."],
        janus: true, key: true
      },
      {
        id: "v7", name: "Vault index card \u2014 File 9-JANUS", type: "document", icon: "◈",
        summary: "Cover card. \u2018Opening requires two live signatures: Director and Records Custodian.\u2019",
        body: "Index card, cover face, kept outside Vault B (the inside of a locked vault is no place for instructions about the vault):\n\nFILE 9-JANUS \u2014 PROJECT JANUS CORE LEDGER, 2009\u20132012.\nACCESS: TOTAL SEAL. Opening requires two live signatures: THE DIRECTOR and THE RECORDS CUSTODIAN, simultaneously, in person.\n\nWhich means Sattler's digitization order, scheduled tomorrow morning, has all the signatures it needs to become real. Somebody built a schedule around two living people's names. Somebody also built a telephone call around them. Only one of those two things arrives before the other.",
        details: ["Full chamber review (Laboratory): the index card names the ledger's Sponsor as 'Office of Continuity' \u2014 the same body that appears in the D-4 invoice, the excursion purge order, and precisely nowhere on the organigram."],
        janus: true, key: true
      },
      {
        id: "v8", name: "The digitization order", type: "document", icon: "▤",
        summary: "Scheduled for tomorrow, 06:00. Signed by the Director. Originated by the Office of Continuity.",
        body: "MEMO, records section, today, 02:40:\n\n\u201cPer request of the OFFICE OF CONTINUITY, File 9-JANUS (Vault B) is to be unsealed and digitized in its entirety. Signatures required: DIRECTOR (live) and RECORDS CUSTODIAN (live). Slot reserved: 06:00 tomorrow, vault lobby.\u201d\n\nSattler has been on shift since 22:00. The Director's office has not contacted him regarding scope, handling or the meaning of 'in its entirety'. Whoever filed this order did not do so through any departmental workflow: the document originates from the exchange of memos in a room the Division does not have.",
        details: ["Full palace of bureaucracy review (Laboratory): the order's origination stamp shows the same routing block used on the D-4 maintenance invoice and the 2009 purge summary. One sponsor. Three operations. Fourteen years of patience."]
      },
      {
        id: "v9", name: "Vault lobby regulator \u2014 service history", type: "measurement", icon: "◈",
        summary: "The regulator clock has run 6% fast since the day Vault B was sealed. Twelve years. Nobody has ever adjusted it.",
        body: "VAULT LOBBY REGULATOR (mechanical, master-weight, sealed housing). Service log: wound every 7 days \u2014 never adjusted. Runs 1.06\u00d7 standard rate, measured annually by maintenance and logged, in twelve years, twelve times: 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06, 1.06.\n\nNot drifting. Not oscillating. SET. The clock has been keeping time for somewhere else \u2014 for a place where an hour is 3.6 minutes heavier \u2014 and it has never once, in twelve years, been asked WHICH place.",
        details: ["Full chamber review (Laboratory): 1.06\u00d7 is not a chronostasis signature (that would be <1.0). It is a LOOP signature \u2014 the tick of a clock standing at the mouth of a closed channel where the far end is slightly more expensive to reach than the near end. There is a room somewhere in this building that is 6% harder to get to than the rest of everything."],
        janus: true, key: true
      },
      {
        id: "v10", name: "Token audit \u2014 Sattler T-0911", type: "measurement", icon: "◈",
        summary: "One phantom session at 03:11, 26 seconds. The token authenticated \u2018from the future\u2019 without leaving the key cabinet.",
        body: "Full token audit, T-0911. In nine years of use, T-0911 has authenticated 4,101 sessions, all local, all logged. On the night of the call there is one additional session: 26 seconds, code path: CHANNEL-HANDSHAKE, token never physically unclipped from the key cabinet.\n\nA session without a body. The token did not go anywhere; something borrowed it \u2014 the way you lend a library book to a voice that will not take no for an answer.",
        details: ["Full palace of cryptography (Laboratory): the phantom session used the token's WITNESS key \u2014 the cryptographic shard the Division uses for cross-checks, never for access. Someone very far away, and very patient, borrowed yesterday's key to knock on today."]
      },
      {
        id: "v11", name: "Cross interview", type: "witness", icon: "☏",
        summary: "\u201cI have never recorded anything for this Department.\u201d Twelve years of seal checks. She already knew you would ask.",
        body: "Chief Archivist, formal interview, on the record:\n\n\u201cI have never recorded anything for this Department. I check a seal once a year because it is my job and I do it thoroughly. File 9? Filed under J? I could not tell you what's inside. I have opened the vault 12 times in 12 years and the file has never ONCE asked me to do anything except keep its paperwork dry.\u201d\n\nShe complements the interview by not mentioning \u2014 not once, on the record, in a fifteen-minute conversation with a temporal investigator \u2014 that her voiceprint matches the unknown caller at 91%.",
        details: ["Full palace of reading people (Laboratory): Ms. Cross, asked on tape whether she would recognize a future version of her own work, answered \u2014 after four full seconds \u2014 \u201cI archive only what exists.\u201d It is a beautiful answer. It is also a full stop. Ask her again in seventeen years."]
      }
    ],
    scanner: [
      { target: "Sattler's extension (line 4-C)", signature: "duplicate", note: "Two coexisting assertions of the same endpoint \u2014 today's line and a 17-year-distant twin sharing one anchor. A duplicate is how a phone sounds when it has been in two Decembers at once.", yields: "sc1" },
      { target: "File 9-JANUS (vault seal)", signature: "fragmented", note: "Seal signature FRAGMENTED \u2014 not broken, not tampered: frayed. Something has been tugging gently at this seal, from the far side of a closed channel, for twelve years.", yields: "sc2" },
      { target: "Vault B regulator clock", signature: "displaced", note: "Signature DISPLACED, forward, +6% annually accumulating. The clock is not fast. It is PATIENT. It has been racing a future that is never quite today.", yields: "sc3" },
      { target: "Exchange trunk slot 4-C2", signature: "missing", note: "Signature MISSING \u2014 for 26 seconds at 03:11, the slot existed in the exchange and could not be found in it. A held breath, measured by switching gear.", yields: "sc4" },
      { target: "M. Cross (voiceprint anchor)", signature: "normal", note: "Signature NORMAL \u2014 today's Cross is exactly, boringly, verifiably herself. The 91% is not a match to HER. It is a match to her, aged.", yields: "sc5" }
    ],
    timeline: [
      { id: "e1", label: "File 9-JANUS sealed under directorial order; dual-signature requirement set", stamp: "2009\u20132012 (ledger period)", stampType: "confirmed", src: "v7" },
      { id: "e2", label: "Office of Continuity purges classified records; File 9 unreachable \u2014 Vale has already moved it to Vault B", stamp: "12 years ago", stampType: "confirmed", src: "v6" },
      { id: "e3", label: "Vault B regulator clock begins running 6% fast. It has never been corrected", stamp: "day of transfer", stampType: "confirmed", src: "v9" },
      { id: "e4", label: "Cross performs the first of twelve annual seal checks", stamp: "11 years ago", stampType: "confirmed", src: "v4" },
      { id: "e5", label: "Office of Continuity files digitization order for File 9; slot reserved 06:00 tomorrow", stamp: "today, 02:40", stampType: "confirmed", src: "v8" },
      { id: "e6", label: "The 26-second call arrives on Sattler's own extension, carrier-stamped 17 years ahead", stamp: "today, 03:11", stampType: "confirmed", src: "v1" },
      { id: "e7", label: "Phantom token session on T-0911 \u2014 channel handshake, no body", stamp: "today, 03:11", stampType: "confirmed", src: "v10" },
      { id: "e8", label: "Sattler does not open the file. The Division is engaged", stamp: "today, 03:12", stampType: "witness", src: "v5" }
    ],
    trueOrder: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"],
    causality: [
      { from: "e1", to: "e2", rel: "precedes", why: "The ledger's contents made it a target a decade before anyone came for it; Vale's sealing order is why the purge could not reach it." },
      { from: "e2", to: "e3", rel: "causes", why: "The transfer is the moment the vault acquired a 6% fast clock \u2014 the loop channel's mouth. The room has had one foot in the future ever since." },
      { from: "e3", to: "e6", rel: "causes", why: "The channel needs a patient clock at its mouth; the 03:11 call arrived THROUGH the regulator's six stolen percent." },
      { from: "e4", to: "e6", rel: "precedes", why: "Twelve years of seal checks kept the vault's interior calm and anchorable \u2014 annual, rhythmic, exactly the kind of regular attention a channel needs to stay quiet. The inspections were the tuning." },
      { from: "e5", to: "e6", rel: "causes", why: "The digitization order is why the call came LAST NIGHT. The future has a deadline; it wrote to the past about it at the last hour the past could still use." },
      { from: "e6", to: "e8", rel: "causes", why: "The warning is the only reason File 9 is still sealed. Remove the call and the digitization is simply tomorrow's chore." }
    ],
    interventions: [
      {
        id: "i1", label: "Countermand the digitization; re-seal File 9 under triple lock",
        desc: "Suspend the Office's order, re-seal the file with a third key held by the Division, and archive the call as evidence of an externally-channeled operation.",
        stability: 2.2,
        consequence: "Tomorrow morning's slot dissolves; the Director countersigns the suspension without meeting your eyes, which \u2014 for Voss \u2014 is a signed confession. The file stays as it has been for twelve years: present, unread, and marginally safer. The future that made the call is not prevented by any of this \u2014 the caller never claimed it would be. \u2018We ran out of tomorrows\u2019 is not a promise; it is a request filed by people no longer supplied with them.",
        quality: 10
      },
      {
        id: "i2", label: "Open the ledger under lab precautions \u2014 single reader, shielded room",
        desc: "Defy the warning for intelligence value: Faraday cradle, single reader, mechanical instruments only, 20-minute exposure cap.",
        stability: -3.5,
        consequence: "You read the first 11 pages before the cradle's instruments die in sequence, oldest first, like a power switch being reached by a hand that was already in the room. The ledger names two sponsors for the original Program: R. VOSS \u2014 and a second name that is not a name, scratched through on every page with the same steady hand. The city clock outside stutters for 26 seconds. Nineteen exchanges report phantom routing. The regulator in the vault lobby now runs 12% fast; something two rooms away from you has doubled its bet. You got the truth. The truth got a courier.",
        quality: 2
      },
      {
        id: "i3", label: "Trace the loop channel to its far endpoint",
        desc: "Instrument the exchange and the vault lobby; attempt to localize where, in the future, the channel lands.",
        stability: 0.3,
        consequence: "You localize the far endpoint to a single clock chamber adjacent to Vault B \u2014 not a room that will be built, a room that ALREADY exists on the far side of a door the blueprints never had. Its coordinates match nothing and the closest physical analogue in today's building is the wall behind the regulator, on which, when the instruments are cold, the paint is faintly warmer than anywhere else in the corridor. The channel is real. The wall is listening. You have learned exactly enough to be responsible for that.",
        quality: 5
      },
      {
        id: "i4", label: "Do nothing; let the digitization proceed",
        desc: "Treat the call as unauthenticated noise. Sign the schedule. Open the file at 06:00 with two live signatures, as ordered.",
        stability: -2.0,
        consequence: "The first four pages digitize normally. Pages five onward arrive in the scan queue BLANK \u2014 not redacted: never written, or written somewhere it hasn't finished happening yet. The Directorate closes the operation and files the blank as \u2018legacy paper degradation\u2019. The regulator clock is now 30% fast and improving. Sattler tendered his resignation that afternoon; it is dated, in his own hand, three days ago.",
        quality: 0
      }
    ],
    report: [
      {
        id: "q1", prompt: "From where \u2014 or from when \u2014 was the call placed?",
        options: [
          { text: "From the far side of a closed temporal channel: the future, logged 17 years ahead, arriving through the vault channel", w: 1, note: "Carrier timestamp, impossible routing, phantom token session, and a lobby clock running 6% fast for twelve years. A phone call is a place; this one has an address." },
          { text: "From inside the Department \u2014 today, disguised", w: 0.4, note: "No device, no signature, no operator alive today can forge an exchange timestamp the exchange itself cannot reach." },
          { text: "From an external hostile service with quantum switching", w: 0.2, note: "Nobody else on earth has Sattler's token, and the call would have had to steal it anyway. The token wasn't stolen. It was borrowed." },
          { text: "From nowhere \u2014 the call is an elaborate fabrication", w: 0, note: "The exchange does not fabricate; it files. The moth is real. Somebody merely installed a very patient bell jar." }
        ]
      },
      {
        id: "q2", prompt: "What served as the channel's anchor?",
        options: [
          { text: "Sattler's custodian token, T-0911", w: 1, note: "\u201cYour number, your token, my mistake.\u201d The most reliable anchor in any correspondence archive is the token nobody thinks about." },
          { text: "Sattler himself \u2014 his person, not his token", w: 0.4, note: "He was asleep. The vault channel does not negotiate with sleepers; it files with their instruments." },
          { text: "The vault's regulator clock", w: 0.6, note: "The clock is the mouth of the channel \u2014 the door, not the anchor. Anchors are what you hand through it." },
          { text: "An external repeater in District 9", w: 0, note: "The routing never touched District 9. It never touched, in fact, any room where something could have been CARRIED. The instrument did the travelling." }
        ]
      },
      {
        id: "q3", prompt: "Who made the recording?",
        options: [
          { text: "A future member of this Department \u2014 evidence consistent with M. Cross, aged 17 years", w: 1, note: "91% aged-match on the phonetic model. Twelve years of patient annual seal checks. A voice that signs with an initial it trained itself to drop." },
          { text: "An aged Dr. Vale", w: 0.4, note: "Vale signs everything in full, in triplicate, with his rejection rate attached. Initials alone are not in his hand." },
          { text: "Sattler's own future self", w: 0.2, note: "The phonetic model would have matched the subject at 100% if the sender were Sattler. And Sattler's future self does not call himself 'M'." },
          { text: "An unidentified external party", w: 0.6, note: "The voice is nobody's today. But the background sound is the VAULT'S OWN CLOCK \u2014 and the vault has only ever had one conscientious annual visitor." }
        ]
      },
      {
        id: "q4", prompt: "What does the message actually warn against?",
        options: [
          { text: "Opening the JANUS core ledger \u2014 the act of unsealing completes a circuit", w: 1, note: "\u201cOpening the ledger completes the circuit.\u201d The danger is not possession. It is the reading \u2014 the circuit needs a pair of live signatures to close." },
          { text: "Destroying the file", w: 0, note: "The purge tried that twelve years ago. The warning concerns a different, more polite form of destruction." },
          { text: "Digitizing the file \u2014 i.e. making it copyable", w: 0.6, note: "Digitization is the ORDER tomorrow morning; the warning is about the unsealing it requires. The two are the same event wearing different coats, but the circuit is the signatures, not the scanning." },
          { text: "Sattler keeping the file in his custody", w: 0.2, note: "His custody keeps it exactly where its only protector put it. The message thanks him for the mistake of being reliable." }
        ]
      },
      {
        id: "q5", prompt: "Who filed the digitization order?",
        options: [
          { text: "The Office of Continuity \u2014 an unregistered internal actor present at every anomaly in this series", w: 1, note: "The same routing block as the D-4 invoice, the 2009 purge, and a certain burned memo. It is not an office. It is a signature pattern." },
          { text: "The Director, acting alone", w: 0.4, note: "Voss's signature is on the order as a REQUIRED SIGNATURE, not as an author. Her office was informed at 02:40, like everyone else was." },
          { text: "An external contractor (Halden Applied Chronometry)", w: 0.2, note: "Halden builds. It does not requisition. You do not ask the mason to sign the eviction notice." },
          { text: "Sattler's own section, in error", w: 0, note: "Records sections live in terror of being wrong on paper. Nothing about this order is in error. It is the most punctual document in the building." }
        ]
      }
    ],
    comms: [
      { id: "c1", trigger: { type: "start" }, from: "voss", text: "Investigator. You will have heard about the call. Note that I am unsealing this file four days after it was filed to my desk \u2014 not on the morning it was delivered. I am aware of what that says. Proceed. \u2014 E.V." },
      { id: "c2", trigger: { type: "examined", id: "v2" }, from: "mercer", text: "91%. I ran the aging model twice and a third time out of spite. It is her. I told Cross I was running it and she said, and I quote, 'Am I going to be alive?' I said the model has an error margin. She said 'Everything does', and started checking a seal I have never seen her check twice." },
      { id: "c3", trigger: { type: "examined", id: "v6" }, from: "reed", text: "Vale's memo. Clause 9-c. I chased that clause once, three years ago. It does not exist in the records act it cites. It exists in exactly one place: the front page of the Vault B transfer ledger, authored by the same hand that wrote the memo. Vale wrote himself a law and then lived inside it for twelve years. Careful who you learn law from." },
      { id: "c4", trigger: { type: "examined", id: "v9" }, from: "vale", text: "The regulator. You will be tempted to adjust it. DON'T. A clock that is 6% fast is a door that is 6% ajar; the building needs the draft. I have wound it every seventh day for twelve years and I am the only one who has ever noticed that the winding schedule is in my own handwriting and I do not remember starting it." },
      { id: "c5", trigger: { type: "hint" }, from: "cross", text: "Official consultation. The call needed three things: a channel (the vault), an anchor (his token), and a dead man's switch of the ordinary kind \u2014 a schedule with two live signatures on it. Your entire investigation is deciding which of those three things to pull. Choose like someone who intends to still be here in seventeen years." },
      { id: "c6", trigger: { type: "hint" }, from: "voss", text: "Official consultation #2, and the last one I will authorise on this file. The Office of Continuity requisitioned this file in 2009 and could not destroy it; it requisitioned again last night and could not OPEN it. Ask yourself what changed in twelve years. The answer is on the index card, and it is not the Director's signature. It is yours. It was always going to be yours. Good luck. \u2014 E.V." }
    ],
    truth: {
      headline: "The warning came from this Department's future. The danger is the reading, not the file.",
      body: "File 9-JANUS is the core ledger of Project Janus \u2014 the office that exists nowhere, buying re-anchoring from Halden, excising days, sealing vaults. Twelve years ago Dr. Adrian Vale moved the ledger into Vault B under a preservation clause he appears to have written himself, saving it from the Office of Continuity's purge. The vault has been checked annually by Miriam Cross and never opened; the lobby regulator has run 6% fast since the day it was sealed, because the vault became the near end of a closed temporal channel \u2014 a door, patient, ajar, waiting.\n\nSeventeen years from tonight, the unsealing of the ledger completes a counter-resonance circuit \u2014 the event an older, unhurried voice in the recording describes as \u2018we ran out of tomorrows\u2019. Whoever made that recording did it from the vault's far side, standing behind a wall that has been quietly warm for years. The phonetic ageing model puts the voice at M. Cross, aged seventeen years, at 91% confidence. The Division's archivist, asked on the record, answers only: \u201cI archive only what exists.\u201d\n\nThe call was routed through the vault channel and anchored on the most reliable anchor any correspondence archive owns: Records Custodian R. Sattler's token, borrowed for 26 seconds by a future that needed exactly one minute of his attention \u2014 the minute before his morning shift, the morning before he was scheduled to unseal the ledger with two live signatures, his and the Director's. The Office of Continuity requisitioned the file in 2009 and could not destroy it. It requisitioned it again last night and could not open it. The difference, in both cases, is a woman with a vault key and a man with a token who happened to pick up a phone.\n\nTomorrow morning the digitization order can be countermanded. The file can be re-sealed under a third key. It can probably be re-sealed forever. What nobody in this Division can do, on any instrument yet built, is prevent \u2014 not postpone \u2014 the event that made a person seventeen years from now shout quietly down a telephone for twenty-six seconds. That event is in the ledger. The ledger must remain sealed for it to stay there. This is not the last case the Department will ever solve. It is the last one it will be able to close."
    }
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = CASE; }
  else { (root.TD = root.TD || {}).CASE_5 = CASE; }
})(typeof window !== "undefined" ? window : globalThis);

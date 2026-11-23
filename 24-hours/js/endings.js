/* ============================================================
   24 HOURS — story layer part 4: ending evaluation + epilogues
   ============================================================ */
"use strict";

STORY.evaluateEnding = function(){
  const met = !!S.flags.met_alex;
  const fraud = has("fraud_link")||has("manifest_seen");
  const debt = has("jonas_debt")||has("debt_note")||has("jonas_debt_hint");
  if(S.flags.doc_sold || S.flags.final_bill_brandt) return "wrong_person";
  if(!met){
    if(has("knows_quiet_place")||has("alex_witness")||fraud) return "too_late";
    return "unknown";
  }
  if(has("publish")) return "alternative";
  if(S.flags.final_press && fraud) return "truth";
  if(fraud && debt) return "truth";
  if(has("helped_mara_night")||has("helped_sofia")||has("final_alex_flees")) return "sacrifice";
  return "too_late";
};

STORY.ENDINGS = {

  truth: {
    num:"ENDING 01", title:"THE TRUTH", tone:"rare",
    text:function(){
      let p1="At 23:41 a tram sighs past the lower quay. Alex talks and you listen, and the folder passes from his city to yours. There is no ceremony. Two friends on a cold bench, dividing the last bread of a very long day.";
      let p2="At 06:14, the Vespera Herald runs the story under a headline Nadia has been sharpening for two years: 'THE SCHEDULE OF A THEFT — two years of altered manifests at Kessler Logistics, and the men who signed them.' Customs opens the file it had politely ignored. Brandt is detained before his second coffee. Sera is harder — Sera is always harder — but with the payments mapped by a witness who has stopped being afraid, his quiet stops being for sale.";
      let p3="Jonas testifies. It costs him the job, the ironed shirts, and the last denial he owned. It buys him back his brother. On the 23rd of November the café keeps a corner table and someone sings the right year, finally, and nobody hides anything anywhere, including behind a bench on the Vodna quay.";
      if(has("helped_mara_night")) p3="Jonas testifies. It costs him the job and the last denial he owned. It buys him back his brother. Mara keeps the café; its corner table now comes with a story she tells only people she likes. On the 23rd of November someone sings the right year, finally, and nobody hides anything anywhere.";
      return p1+"\n\n"+p2+"\n\n"+p3+"\n\nYou did not do everything today. Nobody can. You did enough of the right things, at the cost of everything else, which is the entire price of the truth.";
    },
    fates:function(){
      return "— Alex: safe; witness for the customs case; still slow-walks past the yard, now with a lawyer.\n— Jonas: unemployed, cooperating, lighter. 'I'll fix it' is finally true.\n— Mara & Sofia: keep saying what they saw until it has legal weight.\n— Nadia: byline of the year. Sleeps with the window open anyway.\n— Brandt: detained. His handshake is in evidence.\n— Sera: sells the shop in one afternoon. The fox keeps the glasses.\n— Devin: trades testimony for a Friday he actually takes off.";
    }
  },

  too_late: {
    num:"ENDING 02", title:"TOO LATE", tone:"bad",
    text:function(){
      if(S.flags.met_alex){
        return "You found him. You sat on the bench, you heard the shape of it — and somehow the shape never became a fact. Too many of the day's doors were guessed at, closed politely, left unopened in their turns.\n\nAlex hands you the folder because there is nobody else. \"We're not done,\" he says. But he says it like a man practicing.\n\nThe truth is now a folder in your hands, without names attached, without the men who signed it, without the story that would make anyone care. By morning it is a problem you own, delayed past the hour when problems are cheap.";
      }
      if(has("brandt_told") && !has("knows_station_meet")){
        return "You learned everything. The yard. The envelope. The manifests. You told Alex at 23:0X that Brandt knows — and Alex told you, very calmly, that the bench stopped being safe an hour before you knew it was.\n\nHe does not blame you out loud. He just re-plans his entire life in front of you, and at 23:52 he does the thing you were supposed to prevent: he becomes untraceable for a week.\n\nThe information was never the hard part. The hard part was today's schedule, and the number of hours in it, and you found that out at the exact hour it stopped being fixable.";
      }
      return "You knew. That's the cruel version — you knew. The bench, the hour, the boy: all of it was on your schedule from morning, and the day was simply full of everything else, and everything else won.\n\nAt 23:41 Alex waits with the river. At 23:58 he stops waiting. At 06:20 he takes the early train out of Vespera with one bag and no forwarding address, and the city absorbs his absence the way it absorbs everything: completely, by lunch.\n\nThe swans get fed by strangers now.";
    },
    fates:function(){
      return S.flags.met_alex
        ? "— Alex: alive, exposed, unhired. The folder ferments in your drawer.\n— Jonas: still owes. Still ironed. Still silent.\n— Mara: keeps your coffee order alive, like a small protest.\n— Brandt: promoted. The section number gains a number.\n— Sera: expands. Quiet is a growth market.\n— Nadia: keeps the half-file. Half is her favorite size for unsolved."
        : "— Alex: untraceable — for a week, he hoped. It ran long.\n— Jonas: finds out from a lawyer what his brother tried to carry alone.\n— Mara: closes the café on time, every night, watching the door.\n— Sofia: keeps 'the quiet place' between her teeth, out of loyalty.\n— Brandt & Sera: untouched. The city called it 'procedural'.";
    }
  },

  wrong_person: {
    num:"ENDING 03", title:"THE WRONG PERSON", tone:"bad",
    text:function(){
      if(S.flags.doc_sold){
        return "At the bench, Alex talks, and somewhere past the second sentence he understands what your emptied hands mean. He doesn't raise his voice. He asks who, exactly, and in what drawer.\n\n\"You sold it,\" he says. 'To the shop. My proof. In a drawer.'\n\nThe folder is already filed, under 'acquisitions of the afternoon'. The word for what you did with your day is 'commerce'. The word for what Alex does now is 'leaves.' Some lessons arrive with their own goodbye.";
      }
      if(S.flags.final_bill_brandt){
        return "At the bench, you make the quiet deal out loud: folder to Brandt, debt to zero, Jonas to sleep. Alex is quiet so long the river fills the gap.\n\n\"He'll sign the debt away,\" Alex agrees, eventually. 'That's the thing about men like Brandt — they honor exactly as much as they fear.'\n\nBy Thursday, Brandt honors a document that never existed, Sera's collector is told the account is 'municipal' now, and the manifests are ash in a yard that produces its own weather of smoke. Your brother-in-law-safe. Your friend: gone by the weekend train. You chose the person you could reach over the person you could have saved.";
      }
      return "At the bench there is no Alex. There is Devin, on time, holding Alex's lighter like a receipt for the evening.\n\nThe bench was watched. Of course it was watched — you personally delivered the news that made it worth watching. Somewhere behind the tram lines, a boy who spent all day planning travel schedules for other people's freight is now planning his own, permanently, from a city with a different name.\n\nYou told one man one thing on one afternoon. It's astonishing, later, how far one sentence can travel when its payer is willing to buy the ticket.";
    },
    fates:function(){
      return "— Alex: moved. Twice. Then a third time, quieter.\n— Jonas: debt 'restructured' — Sera's word for a longer leash.\n— Mara: stays. Somebody has to say Alex's name out loud in this town.\n— Brandt: unexamined, unhurried, excellent.\n— Sera: satisfied customer. You.\n— Nadia: keeps the half-file. Two years is a long time to stay unfinishable.";
    }
  },

  alternative: {
    num:"ENDING 04", title:"THE ALTERNATIVE", tone:"good",
    text:function(){
      return "You went to the Herald before you went to the bench, and that single re-ordering of hours changed the ending of the day.\n\nAt 00:01 the presses run cold. At 06:14 the story is everywhere: manifests, timestamps, photographs, names. Vespera wakes up to its own reflection and does not blink first.\n\nAt 06:20, Alex takes no train at all — he takes the protection of writers, lawyers, and one customs officer who waited a decade for cover, and he becomes something the grey coat did not plan for: unnecessary to protect. Timetables protect better than friends; they cannot be ambushed on a bench.\n\nBrandt is detained by breakfast. Sera's shop develops a sudden termite problem — of police. And the two of you feed the swans at noon, in full daylight, like the teenagers who wrote on that bench with a borrowed fork.";
    },
    fates:function(){
      return "— Alex: safe, subpoenaed, insufferable about it. Correctly.\n— Jonas: testifies in a suit he already owned. Compounding, at last, in his favor.\n— Nadia: the story, the byline, the promotion she refuses.\n— Mara: names a coffee after you. It is mostly foam.\n— Sofia: night shifts, same as ever, less alone.\n— Brandt: 'assisting authorities with their inquiries', indefinitely.\n— Sera: sells the shop in one afternoon. The fox keeps the glasses.";
    }
  },

  sacrifice: {
    num:"ENDING 05", title:"THE SACRIFICE", tone:"bitter",
    text:function(){
      return "The evening went to someone else's catastrophe — and you were there for all of it, hands used, name remembered by people you will now be lucky enough to know for decades.\n\nSo at 23:0X you sit on the swans' bench with nothing but yourself, and it turns out that was the payment Alex actually required.\n\nHe doesn't bring out the folder at first. He checks the quay behind you twice and asks: 'Are they safe? All of them?'. You say yes, and your voice holds, and that testimony has no signatures but stands.\n\nThe manifests come out eventually. When they do, it's clear neither of you has a plan anymore — only the morning, and Nadia's doorbell, and the first stop being Jonas's floor. It is not the clean version of the truth. It is the version you could afford, and you paid for it with the part of the day where nobody was watching.";
    },
    fates:function(){
      return "— Alex: safe, unproven, and stubborn. The folder survived its day.\n— Jonas: hears everything at breakfast. His shoulders drop an inch he never gets back.\n— Mara: covered for you twice now. Keeps a list, keeps a grin.\n— Sofia: owes you a shift and repays it in coffee, not money. Same as ever.\n— Brandt & Sera: unhurried — but now two people with a bench and a plan disagree with that.";
    }
  },

  unknown: {
    num:"ENDING 06", title:"THE UNKNOWN", tone:"bad",
    text:function(){
      return "Midnight arrives the way it does in cities that don't require your participation: everywhere at once, for everyone.\n\nYou spent the day where the day took you — coffee, corridors, conversations that were only ever rehearsal for conversations. The note in the hall stayed a riddle. The swans went unfed by anyone specific. Somewhere across the city, a friend with a plan C and no plan for the plan failing sat on a cold bench by himself, and after a while, stood up.\n\nAt 06:20 he leaves. You find out eventually, the way you find out everything in this city: late, secondhand, too well-packed to unfold.\n\nThe worst endings aren't dramatic. They're administrative.";
    },
    fates:function(){
      return "— Alex: moved on. The word his brother uses later is 'protected', and it takes Jonas years to forgive the word.\n— Jonas: never learns what his brother tried to carry, which is its own sentence.\n— Mara: keeps your chair free at the corner table. Habit outlives hope.\n— Sofia: still has 'the quiet place' between her teeth, out of loyalty, out of grief.\n— Brandt & Sera: procedural. Onwards. Unexamined, unexpressed, unhurried.";
    }
  }
};

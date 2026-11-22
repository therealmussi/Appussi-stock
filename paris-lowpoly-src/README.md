# Paris Low-Poly — Open World 3D 🗼🚗

Gioco open-world d'azione e guida in stile GTA low-poly ambientato a Parigi,
sviluppato con **Three.js**, fisica arcade custom e **Web Audio API** procedurale.

## Avvio in locale

```bash
cd paris-lowpoly-src
npm install
npm run dev
```

Poi apri **http://localhost:5173** nel browser (Chrome/Edge/Firefox).

Build di produzione:

```bash
npm run build
npm run preview     # serve la cartella dist/ su http://localhost:4173
```

## Comandi

| Tasto | Azione |
|---|---|
| `W A S D` | Muoviti a piedi / guida |
| `SHIFT` | Scatto (a piedi) |
| `E` oppure `F` | Entra / esci dal veicolo (anche auto in traffico) |
| `SPAZIO` | Salto (a piedi) / Freno a mano - derapata (in auto) |
| `H` | Clacson |
| `R` | Radio di bordo: spenta → French Touch Electro → Classica Parigina |
| `MOUSE` | Rotazione telecamera in terza persona |

## Il mondo

- Griglia di boulevard con marciapiedi, lampioni, alberi e palazzi haussmanniani
  con tetti mansardati e caffè con tavolini.
- La **Senna** attraversa la città con 5 ponti percorribili e i box dei bouquinistes lungo le banchine.
- **Torre Eiffel** con il Champ-de-Mars e **Arco di Trionfo** sulla Place de l'Étoile (rotonda trafficata).
- Ciclo **giorno/notte** dinamico (~5 minuti): al calar della sera si accendono
  i lampioni e i fari delle auto.

## Gameplay

- Veicoli con fisiche diverse: *Citroën Amie* (utilitaria), *Bugatti Riviera* (sportiva),
  *Furgone Bagagère* e i veicoli della **Gendarmerie**.
- Traffico IA che segue le corsie e si ferma davanti agli ostacoli,
  pedoni che camminano sui marciapiedi e scappano dalle auto.
- **Stelle di sospetto**: speronare auto o investire pedoni fa salire le stelle (1–5):
  la polizia ti insegue con sirene lampeggianti. Seminala restando oltre 75 m
  dal loro raggio per 6 secondi per azzerarle. Se ti prendono a piedi: multa da 100 €.

## Missioni (nei cerchi luminosi)

1. **📦 Corriere Espresso** (cerchio azzurro): consegna il pacco entro 75 s → +150 €.
2. **🏁 Corsa Clandestina** (cerchio giallo): gara a 6 checkpoint contro 3 rivali → fino a +300 €.
3. **🚨 Fuga dalla Gendarmerie** (cerchio rosso): sopravvivi 60 s con 3 stelle,
   poi raggiungi il rifugio al Champ-de-Mars → +250 €.

## Note tecniche

- Fisica di guida arcade custom (scorrimento laterale, derapata col freno a mano)
  e collisioni cerchio/AABB contro gli edifici, nessuna dipendenza di fisica esterna.
- Audio interamente sintetizzato con Web Audio API: motore, frenata, clacson,
  sirena e le due stazioni radio generative.
- Minimappa circolare in tempo reale con monumenti, traffico, polizia e missioni.

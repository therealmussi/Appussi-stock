# THE IMPOSSIBLE ROOM

Versione statica completa e giocabile, servita da GitHub Pages:
https://therealmussi.github.io/Appussi-stock/the-impossible-room/

Gioco puzzle in prima persona in un edificio non-euclideo: porte impossibili,
gravità che cambia per stanza, stanze ricorsive, oggetti che ridimensionano
con la osservazione. Otto capitoli, salvataggio automatico, audio interamente
procedurale (nessun asset esterno, nessuna dipendenza, nessun build step).

Sorgente completo (engine WebGL scritto a mano, level kit, test di
integrazione headless che completano tutte le 8 stanze) in
[`the-impossible-room-src/`](../the-impossible-room-src/).

## Controlli

`W A S D` muoviti · mouse per guardare · `E` interagisci · `Spazio` salta ·
`Shift` corri · `Esc` pausa.

## Sviluppo

Non modificare questi file a mano per la logica di gioco: il sorgente
autoritativo è in `the-impossible-room-src/` (`npm test` lancia l'harness
che gioca l'intera campagna da terminale).

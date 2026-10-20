# CORE ARENA 3D — Produktvision

**Status:** Produktbrief für neues 3D-Experiment; Stand 20.10.2026. Verbindlich für den ersten Agentenplan. Nicht automatisch als Auftrag für einen Full Rewrite zu lesen.

## 1. Das Spiel in einem Absatz

Core Arena 3D ist ein **Desktop-first, browserfähiger Singleplayer-Arena-Shooter gegen Bot-Teams** im Geist von Quake III und Unreal Tournament: schnelles, präzises Movement, aktives Maus-Aiming, spürbare Sprünge zwischen begehbaren Höhen, hochwertige taktisch lesbare Arenen, unterscheidbare Waffen, Health-/Armor-/Munitionskontrolle, Teamkämpfe und kurze Objectives. Das langfristige Alleinstellungsmerkmal ist eine **kompakte Arena-Liga mit Rivalenteams, Aufstieg und verhaltensbasiertem Wingman-Recruitment**. Die Perspektive ist leicht geneigtes 3D-Top-Down, nicht Third Person oder FPS. **Lesbarkeit und Spielgefühl stehen über Contentmenge.**

## 2. Vier nicht verhandelbare Säulen

1. **Skill statt Stat-Grind.** Treffer entstehen aus Aim, Timing, Bewegung, Positionierung und Map-Kenntnis. Kosmetische Fighters haben gleiche Spielwerte; Recruitment verändert Bot-Verhalten/Rolle statt HP, Schaden oder Geschwindigkeit.
2. **3D-Höhen sind echte Spielmechanik.** Boden und höhere Plattformen sind begehbare, physisch korrekte Flächen. Sprünge ermöglichen Flanken/Positionswechsel; Projektilbahnen, Sichtlinien und Bots müssen 3D-Höhe verstehen. Niemals grafische und physische Hindernisse auseinanderlaufen lassen.
3. **Intuitive Kamera und Steuerung.** Die **gerade orthografische Schräge** aus V5 ist Standard (lange Map-Kante parallel zum Bildschirm). Per V alternativ isometrische Ansicht. WASD bildschirmbezogen, Mausziel & Linksklick, Space springen, Shift sprinten. Kamera verfolgt flüssig und vermittelt Deckung und Höhe. Bei Kamerawechsel bleibt WASD intuitiv.
4. **Fairer schneller Kampf.** Spielbare, unterschiedliche Waffen; klare Treffer-/Schaden-/Armor-Rückmeldung; Bots dürfen auf Easy nicht wie Aimbots treffen und müssen Objectives wirklich verfolgen. Klares Spielfeld, kaum HUD-Überladung.

## 3. Produktloop

### Erste Spielminute

Ein Klick bis zu einem Trainings-/Qualifier-Match; kurze, *aktionbestätigte* Einführung in Movement, Zielen, erste Waffe, Pickup und Sprung. Möglichst wenig Menünavigation.

### Quick Play und Custom Match

- Team Deathmatch (TDM), Classic Capture the Flag (CTF) und One Flag als **Produktvision**.
- Teams langfristig 1v1 bis 4v4; anfangs **2v2** (Spieler + 1 Verbündeter gegen 2 Bots).
- Matches kurz (Richtwert 90–180 s je nach Modus).
- Schwierigkeitsgrade Easy / Normal / Hard, getrennt einstellbare Botkonfiguration später.
- Anfangs gegen Bots, **kein Online-Multiplayer**.

### Karriere/Liga

- Callsign, Teamidentität, Captain-Skin, Wingman.
- Qualifier → Proving Circuit → Contender Circuit → später Apex Circuit.
- Kurze Saison, Rivalenteams, Tabelle, Ergebnisse, Aufstieg, Unlocks.
- Wingman-Recruitment nach Rivalensiegen. Unterschiedliche KI-Rollen: offensiv, defensiv, objective-fokussiert, Allrounder. **Keine Statuswertvorteile.**
- Erst aufbauen, wenn die 3D-Matches nachweislich Spaß machen; keine große Menüarbeit am Anfang.

## 4. Kampf und Waffen

Original als Gameplay-Referenz: `https://github.com/emfau88/CTF-3.0` (README, `src/core/`, Tests, Waffenkatalog). Beinhaltet u. a. Arc Lash (Starter), Rocket Launcher, Railgun, Pulse Repeater, Ricochet Disc, Lob Grenade und Shardcaster. **Nicht alle sofort portieren**: erste Waffen müssen unterschiedlich spielbar sein und 3D-Sichtlinien/Deckung respektieren. Beim Zielen auf E1/E2 darf der Schuss nicht versehentlich auf den E0-Boden gehen. Projektilgeschwindigkeit, Splash und Treffer sowie Sprungmechanik gehören in den Gameplay-Core, nicht in den Renderer.

## 5. Level-/Art-Direction

**Look-Referenz:** `references/Core_Arena_3D_Obsidian_Garden_V5.html`

- Überwiegend **dunkelgrauer/antrazitfarbener Stein**, neutrales Metall, passende Boden- und Wandtexturen, **sattgrüne Vegetation**, dezentes Messing, sparsame technische Leuchtakzente; nicht alles blaugrün/türkis färben.
- Helle, klare Materialtrennung, erkennbare Plattformhöhen und Bodenkontakt; keine überstrahlten mintweißen Pflanzen.
- Moderne, hochwertige 3D-Optik, aber Gameplay und FPS wichtiger als teure Details.
- Arena muss klare Ränder, ausreichende Korridorbreite, lesbare Deckungen und Flanken aufweisen; gebogene Pflanztröge verwenden **passende sichtbare und physische Formen**.
- Langfristig drei atmosphärisch **unterschiedliche** Premium-Arenen analog zu **Helix Canopy** (überwachsener Sci-Fi-Biodom), **Temple of the Drowned Sun** (Tempel) und **Foundry Circuit** (Industrie). Nicht drei bloße Farbvarianten einer Map.
- **Erster Vertical Slice: nur eine hochwertige, gut spielbare Map**, inspiriert von V5/Helix Canopy. Mehrere klar definierte Höhen E0/E1/E2. Layout darf nach Playtesting vereinfacht werden.

## 6. Bots und Teamspiel

Bot-KI ist kritisch: gute Bewegung allein reicht nicht. Gegner müssen schießen, ausweichen, Deckung/Loot sinnvoll einsetzen, den Weg zwischen den Höhen beherrschen und später CTF-Flags realistisch angreifen/verteidigen. Bot-Zielauswahl/Objective-Priorität muss höher gewichtet werden als zielloses Deathmatch. Fairness: Reaktionszeit, Aim-Streuung, Zielhaltezeit und Entscheidungstakt je nach Schwierigkeit. Kein durchgehendes Perfect Tracking.

## 7. Plattform und Technik

- **Desktop-first**: Tastatur + Maus, WebGL, Chrome/Edge in 16:9; Browser live auslieferbar.
- 3D-Renderer: **Three.js** als produktionsgeeignete TypeScript/Vite-App; 2D-Phaser-Renderer des Originals nicht blind weiterverwenden.
- Gameplay-Simulation möglichst **rendererunabhängig und testbar**; alte, wirklich portable Regeln und Tests selektiv evaluieren und übertragen.
- Zunächst keine aufwändige Mobile-Steuerung; höchstens rudimentäre Compatibility ohne Qualitätsversprechen.
- **Steam** ist eine spätere Distributionsoption für denselben Web/JS-Build (Desktop-Wrapper evaluieren, erst nach Produktvalidierung). Keine Engine-Migration nach Unity als Teil dieses Vorhabens.
- Audio ist im bestehenden Spiel bereits vorhanden, Rechte/Provenienz vor Übernahme prüfen.

## 8. Explizit NICHT im ersten MVP

Online-Multiplayer, Accounts, Cloud, großes Charakter-RPG, Stat-Upgrades, Shop, Monetarisierung, vollständige 7-Map-Portierung, sieben Waffen auf einmal, Apex-Karriere, Steam-Paketierung, umfangreicher Mobile-Umbau, Core-Raid/Heist-PvE-Nebenvision, neue kostenpflichtige Assetpakete. Kein unkontrollierter Feature-Creep.

## 9. Qualitätsdefinition für das erste echte Spiel

Ein **real spielbares 2v2-TDM-Match** auf einer fertigen 3D-Arena: Kampf/Bewegung fühlt sich gut an; Health, Schaden, Tod, Respawn, Score und Timer funktionieren; mindestens zwei klar unterschiedliche Waffen einschließlich Pickup; drei Höhen mit glaubhaften Sprüngen; Sichtlinien, Deckung, Treffer, Kamerabewegung und Bot-Traversal funktionieren. Ein außenstehender Spieler erkennt ohne Erklärung, wo er laufen, springen, zielen und schießen soll. GitHub Pages-/Vite-Build und automatisierte Kernregeln inklusive Browser-Smoketest vorhanden. Danach CTF/One Flag und erst später Karriere.

## 10. Bindende Hinweise für den Agenten

Die V5-Datei ist **visuelle und interaktive Referenz**, aber kein Produktionscode, den man nur in Module teilen muss. CTF-3.0 ist **Feature-/Regel-Referenz**, kein Copy-&-Paste-3D-Motor. Die alte Release-Roadmap regelt die 2D-Version; für das neue 3D-Experiment ist dieser Brief die initiale Vision. Wenn bestehende Regeln der echten 3D-Spielbarkeit entgegenstehen, mit Begründung und kleinem Vergleichsvorschlag zurückmelden, statt still zu verändern. Fortschritt an spielbaren, nachweisbaren Meilensteinen messen.

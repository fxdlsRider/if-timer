# TODO für nächste Session

## WICHTIG: Code-Refactoring erforderlich

### TimerCircle.jsx ist zu groß (734 Zeilen)
**Problem:** Wir haben vereinbart, max. 300 Zeilen pro Datei zu haben.

**Lösung:** TimerCircle.jsx in separate State-Komponenten aufteilen:

1. **TimerPreRun.jsx** (~200 Zeilen)
   - State 1: Timer nicht laufend
   - Zeigt Kreis mit einstellbarem Ziel
   - "START" Button
   - Notification Banner (macOS only)

2. **TimerRunning.jsx** (~200 Zeilen)
   - State 2: Timer läuft
   - Zeigt Fortschrittskreis
   - Zeit verbleibend / verstrichene Zeit
   - "STOP" Button
   - FastingInfo (Started/Goal buttons)
   - Fasting Levels Indicator

3. **TimerCompletion.jsx** (~200 Zeilen)
   - State 3: Timer beendet (erfolgreich oder abgebrochen)
   - Zeigt Zusammenfassung
   - Grüner Kreis (Erfolg) oder Roter Kreis (Abbruch < 1h)
   - Started/Stopped Zeiten (editierbar)
   - "START" Button für neuen Fast

4. **TimerCircle.jsx** (~150 Zeilen)
   - Bleibt als Container/Orchestrator
   - Handhabt State-Switching
   - Verwaltet Modals (StopFastingModal, ChangeGoalModal)
   - Delegiert Rendering an Sub-Komponenten

### Vorteile
- Bessere Wartbarkeit
- Einhaltung der 300-Zeilen-Regel
- Klarere Trennung der Verantwortlichkeiten
- Einfacheres Testen einzelner States

### Vorgehen
1. Zuerst aktuelle Änderungen testen und committen
2. Dann schrittweise refactorn:
   - TimerCompletion.jsx erstellen und testen
   - TimerRunning.jsx erstellen und testen
   - TimerPreRun.jsx erstellen und testen
   - TimerCircle.jsx bereinigen
3. Alle Tests durchführen
4. Commit mit aussagekräftiger Message

---

## Aktueller Stand (Ende dieser Session)

### Erfolgreich implementiert:
- ✅ Supabase SELECT Policy hinzugefügt → Leaderboard funktioniert
- ✅ Timer-Synchronisation zwischen Geräten funktioniert
- ✅ "Abbruch" Anzeige bei Fasts < 1 Stunde implementiert
  - Roter Kreis statt grün
  - "Abbruch" Text statt "Well done!"
  - "Try again!" Motivation
- ✅ StopFastingModal als React Portal (fixes grauer Hintergrund Bug)

### Noch zu testen:
- Abbruch-Funktion bei < 1 Stunde Fast
- Portal-Modal Backdrop über gesamten Bildschirm

### Nächste Features/Fixes nach Refactoring:
- Localhost Auth-Session Problem untersuchen (Timer sync funktioniert nicht auf localhost wenn von Vercel angemeldet)

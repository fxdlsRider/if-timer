# Claude Code - Session Workflow

## 🚀 Anfang der Session

**Kommando:**
```
Lese CLAUDE_ONBOARDING.md
```

Das Dokument enthält automatisch:
- Git-Kommandos zum Prüfen des Status
- Verweise auf `conventions.md`, `progress.md`, `vision-alignment.md`
- Alle wichtigen Infos zum Starten
- Aktuellen Projekt-Status
- Design-Entscheidungen
- Folder-Struktur

---

## ✅ Ende der Session

### Immer ausführen:
```
Fasse zusammen, was wir gemacht haben und update progress.md
```

**`progress.md`** ist das Session-Log:
- Nach jeder Session updaten
- Alle Commits dokumentieren
- Alle Änderungen festhalten
- Detaillierter Verlauf

---

### Nur bei größeren Änderungen:
```
Update auch CLAUDE_ONBOARDING.md
```

**`CLAUDE_ONBOARDING.md`** nur updaten bei:
- ✅ Projekt-Phase wechselt (z.B. Phase 1 → Phase 2)
- ✅ Neue dauerhafte Design-Entscheidungen
- ✅ Architektur-Änderungen
- ✅ Neue wichtige Conventions
- ✅ Signifikanter Fortschritt (z.B. 75% → 85%)

**NICHT updaten bei:**
- ❌ Kleine Bug-Fixes
- ❌ Einzelne Feature-Implementierungen
- ❌ Routine-Updates

---

## 📊 Zusammenfassung

| Dokument | Zweck | Update-Frequenz |
|----------|-------|-----------------|
| **CLAUDE_ONBOARDING.md** | Onboarding-Guide für neue Sessions | Bei großen Änderungen |
| **progress.md** | Detailliertes Session-Log | Nach jeder Session |
| **conventions.md** | Coding Standards & Regeln | Selten (nur bei Convention-Änderungen) |
| **vision-alignment.md** | Projekt-Vision | Selten (nur bei Vision-Änderungen) |

---

## 💡 Workflow-Beispiel

### Session Start:
```
User: "Lese CLAUDE_ONBOARDING.md"
Claude: [Liest Dokument, prüft Git-Status, liest Conventions/Progress/Vision]
Claude: "Bereit! Was möchtest du heute umsetzen?"
```

### Session End (normale Session):
```
User: "Fasse zusammen, was wir gemacht haben und update progress.md"
Claude: [Updated nur progress.md mit allen Details der Session]
```

### Session End (große Änderung):
```
User: "Fasse zusammen, was wir gemacht haben und update progress.md und CLAUDE_ONBOARDING.md"
Claude: [Updated progress.md + CLAUDE_ONBOARDING.md wegen Phase-Wechsel/Architektur-Änderung]
```

---

**Letzte Aktualisierung:** 2025-11-09

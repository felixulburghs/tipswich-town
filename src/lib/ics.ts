import type { Match } from '../types'

// Een .ics-bestand is gewone tekst die elke agenda-app (Google, Apple, Outlook) begrijpt.
// Regels moeten eindigen op \r\n (CRLF), zo wil de standaard (RFC 5545) het.

/** Tijdzone-blok voor België: wintertijd CET (+1), zomertijd CEST (+2). */
const TIJDZONE_BRUSSEL = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Brussels',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

const MATCHDUUR_MINUTEN = 60

/** Komma's, puntkomma's en backslashes moeten in ICS-tekst ge-escaped worden. */
function escape(tekst: string): string {
  return tekst.replace(/[\\,;]/g, (t) => '\\' + t)
}

/** "2026-10-17" + "22:00" (+ minuten) → "20261017T220000". Rekent in UTC zodat er geen tijdzone tussenkomt. */
function icsTijd(datum: string, uur: string, extraMinuten = 0): string {
  const d = new Date(`${datum}T${uur}:00Z`)
  d.setUTCMinutes(d.getUTCMinutes() + extraMinuten)
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15)
}

function titelVan(match: Match): string {
  return `Tipswich Town – ${match.tegenstander} (${match.thuis ? 'thuis' : 'uit'})`
}

/**
 * Link die Google Agenda opent met de match al ingevuld (werkt in de browser én opent de app op gsm).
 * "dates" gebruikt hetzelfde formaat als ICS; "ctz" zegt Google dat die tijden Belgische tijd zijn.
 */
export function googleAgendaUrl(match: Match): string {
  if (!match.datum || !match.uur) throw new Error(`Match tegen ${match.tegenstander} heeft geen datum of uur`)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titelVan(match),
    dates: `${icsTijd(match.datum, match.uur)}/${icsTijd(match.datum, match.uur, MATCHDUUR_MINUTEN)}`,
    ctz: 'Europe/Brussels',
    location: match.locatie,
    details: 'UP THE TIPS!',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export function maakIcs(match: Match): string {
  if (!match.datum || !match.uur) throw new Error(`Match tegen ${match.tegenstander} heeft geen datum of uur`)
  const titel = titelVan(match)
  const nuUtc = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tipswich Town//Speelschema//NL',
    'CALSCALE:GREGORIAN',
    ...TIJDZONE_BRUSSEL,
    'BEGIN:VEVENT',
    `UID:${match.datum}-${match.tegenstander.replace(/\W/g, '')}@tipswich-town`,
    `DTSTAMP:${nuUtc}`,
    `DTSTART;TZID=Europe/Brussels:${icsTijd(match.datum, match.uur)}`,
    `DTEND;TZID=Europe/Brussels:${icsTijd(match.datum, match.uur, MATCHDUUR_MINUTEN)}`,
    `SUMMARY:${escape(titel)}`,
    `LOCATION:${escape(match.locatie)}`,
    'DESCRIPTION:UP THE TIPS!',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Laat de browser het .ics-bestand downloaden; de gsm biedt dan aan om het in de agenda te zetten. */
export function downloadIcs(match: Match) {
  const blob = new Blob([maakIcs(match)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tipswich-${match.datum}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

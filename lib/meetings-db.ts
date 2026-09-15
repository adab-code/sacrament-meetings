import type { SacramentMeeting } from "./types";

export const WARD_NAME = "Provo 1st Ward";

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function toISODate(date: Date): string {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mostRecentSunday(from: Date = new Date()): Date {
  const d = startOfDay(from);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getSunday(weeksFromNow: number, from: Date = new Date()): Date {
  const d = mostRecentSunday(from);
  d.setDate(d.getDate() + weeksFromNow * 7);
  return d;
}

const seeds: Array<Omit<SacramentMeeting, "id">> = [
  {
    date: toISODate(getSunday(-3)),
    meetingType: "testimony",
    presiding: "Bishop Aaron Smith",
    conducting: "Brother Michael Johnson",
    openingHymn: { number: 41, title: "Let Zion in Her Beauty Rise" },
    openingPrayer: "Sister Emma Clark",
    wardBusiness: [{ description: "Reading of a statement of thanks" }],
    stakeBusiness: false,
    sacramentHymn: { number: 193, title: "I Stand All Amazed" },
    speakers: [],
    closingHymn: { number: 152, title: "God Be with You Till We Meet Again" },
    closingPrayer: "Brother Luke Anderson",
    announcements: ["Interviews held in the bishop's office after the meeting."],
  },
  {
    date: toISODate(getSunday(-2)),
    meetingType: "regular",
    presiding: "Bishop Aaron Smith",
    conducting: "Sister Laura Hall",
    openingHymn: { number: 2, title: "The Spirit of God" },
    openingPrayer: "Sister Rachel Green",
    wardBusiness: [{ description: "Sustaining of new Primary president" }],
    stakeBusiness: false,
    sacramentHymn: { number: 169, title: "In Remembrance of Thy Suffering" },
    speakers: [
      { name: "Sister Brown", topic: "Faith in Jesus Christ", type: "speaker" },
      { name: "Youth Choir", topic: "", type: "musical-number" },
      { name: "Brother Thomas Anderson", topic: "Covenants and Ordinances", type: "speaker" },
    ],
    closingHymn: { number: 31, title: "O God, Our Help in Ages Past" },
    closingPrayer: "Brother Davis",
    announcements: ["Ward temple night: next Sunday evening."],
  },
  {
    date: toISODate(getSunday(-1)),
    meetingType: "general",
    presiding: "Bishop Aaron Smith",
    conducting: "Bishop Aaron Smith",
    openingHymn: { number: 100, title: "Nearer, My God, to Thee" },
    openingPrayer: "Brother Chris Evans",
    wardBusiness: [],
    stakeBusiness: true,
    sacramentHymn: { number: 171, title: "In Humility, Our Savior" },
    speakers: [
      { name: "Sister Julia Martinez", topic: "The Sacrament", type: "speaker" },
      { name: "Brother Ryan Lewis", topic: "Service", type: "speaker" },
      { name: "Relief Society Choir", topic: "", type: "musical-number" },
    ],
    closingHymn: { number: 85, title: "How Firm a Foundation" },
    closingPrayer: "Sister Jessica King",
    announcements: ["Welcome new ward members who moved in this week."],
  },
  {
    date: toISODate(getSunday(0)),
    meetingType: "regular",
    presiding: "Bishop Aaron Smith",
    conducting: "Brother Michael Johnson",
    openingHymn: { number: 241, title: "Count Your Blessings" },
    openingPrayer: "Sister Emily Davis",
    wardBusiness: [
      { description: "Sustaining of Brother Peter Clark as ward clerk" },
      { description: "Release of Brother James Wilson with thanks" },
    ],
    stakeBusiness: false,
    sacramentHymn: { number: 141, title: "Jesus, the Very Thought of Thee" },
    speakers: [
      { name: "Brother James Wilson", topic: "Faith in Jesus Christ", type: "speaker" },
      { name: "Sister Megan Taylor", topic: "Standing in Holy Places", type: "speaker" },
    ],
    closingHymn: { number: 166, title: "Abide with Me!" },
    closingPrayer: "Sister Laura Hall",
    announcements: [
      "Young Women fundraiser this Saturday from 9:00 AM to 12:00 PM.",
      "Institute classes begin next Tuesday at 7:00 PM.",
    ],
  },
  {
    date: toISODate(getSunday(1)),
    meetingType: "stake",
    presiding: "President Nathan Roberts",
    conducting: "Bishop Aaron Smith",
    openingHymn: { number: 1, title: "The Morning Breaks" },
    openingPrayer: "Brother David Brown",
    wardBusiness: [],
    stakeBusiness: true,
    sacramentHymn: { number: 167, title: "God Is Love" },
    speakers: [
      { name: "Sister Sarah Thompson", topic: "Repentance", type: "speaker" },
      { name: "Stake Choir", topic: "", type: "musical-number" },
    ],
    closingHymn: { number: 152, title: "God Be with You Till We Meet Again" },
    closingPrayer: "Sister Hannah Miller",
    announcements: ["Stake conference broadcast will follow the meeting."],
  },
  {
    date: toISODate(getSunday(2)),
    meetingType: "regular",
    presiding: "Bishop Aaron Smith",
    conducting: "Brother Michael Johnson",
    openingHymn: { number: 145, title: "Prayer Is the Soul's Sincere Desire" },
    openingPrayer: "Brother Peter Clark",
    wardBusiness: [{ description: "Announcement of ward conference date" }],
    stakeBusiness: false,
    sacramentHymn: { number: 174, title: "While of These Emblems We Partake" },
    speakers: [
      { name: "Brother Thomas Anderson", topic: "Scripture Study", type: "speaker" },
      { name: "Sister Emma Clark", topic: "Pondering", type: "speaker" },
      { name: "Priests Quorum", topic: "", type: "musical-number" },
    ],
    closingHymn: { number: 85, title: "How Firm a Foundation" },
    closingPrayer: "Brother Luke Anderson",
    announcements: ["Ward cleanup day this Saturday, breakfast at 8:00 AM."],
  },
];

const meetings: SacramentMeeting[] = seeds.map((seed, index) => ({
  ...seed,
  id: index + 1,
}));

let nextId = meetings.length + 1;

export function getMeetings(date?: string | null): SacramentMeeting[] {
  if (date) {
    return meetings.filter((meeting) => meeting.date === date);
  }
  return meetings;
}

export function getMeetingById(id: number): SacramentMeeting | null {
  return meetings.find((meeting) => meeting.id === id) ?? null;
}

export function addMeeting(
  input: Omit<SacramentMeeting, "id">
): SacramentMeeting {
  const meeting: SacramentMeeting = { ...input, id: nextId };
  nextId += 1;
  meetings.push(meeting);
  return meeting;
}

export function updateMeeting(
  id: number,
  patch: Partial<Omit<SacramentMeeting, "id">>
): SacramentMeeting | null {
  const index = meetings.findIndex((meeting) => meeting.id === id);
  if (index === -1) {
    return null;
  }
  meetings[index] = { ...meetings[index], ...patch };
  return meetings[index];
}

export function deleteMeeting(id: number): SacramentMeeting | null {
  const index = meetings.findIndex((meeting) => meeting.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = meetings.splice(index, 1);
  return removed;
}
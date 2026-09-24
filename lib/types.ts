// Modelo de dominio de una reunión sacramental.
// Cada interfaz refleja una columna o estructura de la tabla "meetings" de Neon.

export type MeetingType =
  | "testimony"
  | "regular"
  | "stake"
  | "general"
  | "special";

// Etiquetas legibles por el usuario para cada tipo de reunión.
export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  testimony: "Testimony",
  regular: "Regular",
  stake: "Stake",
  general: "General",
  special: "Special",
};

export interface Hymn {
  number: number;
  title: string;
}

export interface SpeakerItem {
  name: string;
  topic: string;
  type: "speaker" | "musical-number";
}

export interface WardBusinessItem {
  description: string;
}

export interface SacramentMeeting {
  id: number;
  date: string; // ISO date string: 'YYYY-MM-DD'
  meetingType: MeetingType;
  presiding: string;
  conducting: string;
  announcements?: string[];
  openingHymn: Hymn;
  openingPrayer: string;
  wardBusiness: WardBusinessItem[];
  stakeBusiness: boolean;
  sacramentHymn: Hymn;
  speakers: SpeakerItem[];
  closingHymn: Hymn;
  closingPrayer: string;
}
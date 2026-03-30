export interface Plot {
  id: string;
  lat: number;
  lng: number;
  societyName?: string;
  unitNumber?: string;
  ownerName: string;
  ownerNumber: string;
  details: string;
  documents: { name: string; url: string }[];
}

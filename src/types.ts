export interface Plot {
  id: string;
  lat: number;
  lng: number;
  societyName?: string;
  unitNumber?: string;
  contactName: string;
  contactNumber: string;
  details: string;
  size: number;
  sizeUnit: 'SBU' | 'Carpet Area';
  locality: string;
  propertyTag: 'Owner' | 'Broker';
  documents: { name: string; url: string }[];
  authorUid: string;
}

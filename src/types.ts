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
  pricePerSqyd?: number;
  totalPrice?: number;
  locality: string;
  propertyTag: 'Owner' | 'Broker';
  documents: { name: string; url: string }[];
  externalLink?: string;
  authorUid: string;
}

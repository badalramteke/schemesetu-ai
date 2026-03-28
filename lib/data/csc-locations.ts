export interface CSCLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  whatsapp: string;
  address: string;
}

export const cscLocations: CSCLocation[] = [
  { "id": "csc-01", "name": "Digital Seva Kendra - Metro", "lat": 28.6139, "lng": 77.2090, "whatsapp": "+919876543210", "address": "Near Connaught Place, Delhi" },
  { "id": "csc-02", "name": "Rural Digital Connect", "lat": 19.0760, "lng": 72.8777, "whatsapp": "+919123456789", "address": "Opp. Railway Station, Mumbai" },
  { "id": "csc-03", "name": "Gramin Suvidha Center", "lat": 13.0827, "lng": 80.2707, "whatsapp": "+919012345678", "address": "Anna Nagar Main Road, Chennai" },
  { "id": "csc-04", "name": "E-Seva Jan Seva Kendra", "lat": 22.5726, "lng": 88.3639, "whatsapp": "+919887766554", "address": "Salt Lake Sector V, Kolkata" },
  { "id": "csc-05", "name": "Tech-Village Services", "lat": 12.9716, "lng": 77.5946, "whatsapp": "+918877665544", "address": "Near MG Road, Bengaluru" },
  { "id": "csc-06", "name": "Adarsh Digital Point", "lat": 17.3850, "lng": 78.4867, "whatsapp": "+917766554433", "address": "Jubilee Hills Checkpost, Hyderabad" },
  { "id": "csc-07", "name": "Smart Village Hub", "lat": 23.0225, "lng": 72.5714, "whatsapp": "+916655443322", "address": "Navrangpura Market, Ahmedabad" },
  { "id": "csc-08", "name": "Bharat Digital Kendra", "lat": 26.8467, "lng": 80.9462, "whatsapp": "+919900881122", "address": "Hazratganj, Lucknow" },
  { "id": "csc-09", "name": "Coastal Digital Seva", "lat": 15.2993, "lng": 73.9857, "whatsapp": "+918811223344", "address": "Near Bus Stand, Margao, Goa" },
  { "id": "csc-10", "name": "Himalayan E-Portal", "lat": 30.7333, "lng": 76.7794, "whatsapp": "+917722334455", "address": "Sector 17 Market, Chandigarh" }
];

export const BACKEND_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', BACKEND_URL);


export const CONTRACTOR_TYPES = [
  "Grey Structure",
  "Finishing", 
  "Interior",
  "Exterior",
  "Landscaping",
  "Painting",
  "Tiling",
  "General",
  "Electrical",
  "Plumbing",
  "Masonry",
  "Carpentry",
  "Roofing",
  "Other"
] as const;

export const PAYMENT_TERMS = [
  "Daily",
  "Weekly", 
  "Bi-Weekly",
  "Milestone",
  "Monthly"
] as const;

// export const BACKEND_URL = 'https://urban-crm-backend.vercel.app';
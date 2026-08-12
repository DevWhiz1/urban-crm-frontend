export const BACKEND_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', BACKEND_URL);


export const CONTRACTOR_TYPES = [
    { value: 'greyStructure', label: 'Grey Structure' },
    { value: 'finishing', label: 'Finishing' },
    { value: 'interior', label: 'Interior' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'painting', label: 'Painting' },
    { value: 'tiling', label: 'Tiling' },
    { value: 'general', label: 'General' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'masonry', label: 'Masonry' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'bricks', label: 'Bricks' },
    { value: 'steel', label: 'Steel' },
    { value: 'plaster', label: 'Plaster' },
    { value: 'woodwork', label: 'Woodwork' },
    { value: 'concreteMixer', label: 'Concrete Mixer' },
    { value: 'excavation', label: 'Excavation' },
    { value: 'boring', label: 'Boring' },
    { value: 'other', label: 'Other' },
] as const;

export const PAYMENT_TERMS = [
  "Daily",
  "Weekly", 
  "Bi-Weekly",
  "Milestone",
  "Monthly"
] as const;

// export const BACKEND_URL = 'https://urban-crm-backend.vercel.app';
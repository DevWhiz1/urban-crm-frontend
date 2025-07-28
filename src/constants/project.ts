export const PROJECT_CATEGORIES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'other', label: 'Other' }
] as const;

export const PROJECT_TYPES = [
  { value: 'labourRate', label: 'Labour Rate Only' },
  { value: 'withMaterial', label: 'With Material' }
] as const;

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'pending', label: 'Pending' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
] as const;
import { ProjectFormData, ProjectFormErrors } from '../types/project';

export const validateProjectForm = (data: ProjectFormData): ProjectFormErrors => {
  const errors: ProjectFormErrors = {};

  // Required fields
  if (!data.name.trim()) {
    errors.name = 'Project name is required';
  }

  if (!data.customer.trim()) {
    errors.customer = 'Customer selection is required';
  }

  if (!data.location.trim()) {
    errors.location = 'Location is required';
  }

  if (!data.projectCategory.trim()) {
    errors.projectCategory = 'Project category is required';
  }

  if (!data.projectType.trim()) {
    errors.projectType = 'Project type is required';
  }

  // Conditional validations based on project type
  if (data.projectType === 'withMaterial') {
    if (!data.ratePerSquareFoot.trim()) {
      errors.ratePerSquareFoot = 'Rate per square foot is required for material projects';
    } else if (isNaN(parseFloat(data.ratePerSquareFoot)) || parseFloat(data.ratePerSquareFoot) <= 0) {
      errors.ratePerSquareFoot = 'Please enter a valid rate per square foot';
    }
  }

  if (data.projectType === 'labourRate') {
    if (!data.labouRate.trim()) {
      errors.labouRate = 'Labour rate is required for labour rate projects';
    } else if (isNaN(parseFloat(data.labouRate)) || parseFloat(data.labouRate) <= 0) {
      errors.labouRate = 'Please enter a valid labour rate';
    }
  }

  // Common area validation
  if (data.totalCoverageArea.trim() && (isNaN(parseFloat(data.totalCoverageArea)) || parseFloat(data.totalCoverageArea) <= 0)) {
    errors.totalCoverageArea = 'Please enter a valid coverage area';
  }

  if (data.totalArea.trim() && (isNaN(parseFloat(data.totalArea)) || parseFloat(data.totalArea) <= 0)) {
    errors.totalArea = 'Please enter a valid total area';
  }

  // Date validations
  if (data.startDate && data.estimatedDuration) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.estimatedDuration);
    
    if (endDate <= startDate) {
      errors.estimatedDuration = 'Estimated completion date must be after start date';
    }
  }

  // File validations
  if (data.drawings.some(url => url.trim() && !isValidUrl(url.trim()))) {
    errors.drawings = 'Please enter valid URLs for drawings';
  }

  if (data.contracts.some(url => url.trim() && !isValidUrl(url.trim()))) {
    errors.contracts = 'Please enter valid URLs for contracts';
  }

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const hasProjectErrors = (errors: ProjectFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const calculateTotalCost = (ratePerSquareFoot: number, totalCoverageArea: number): number => {
  return ratePerSquareFoot * totalCoverageArea;
};

export const calculateTotalLabourCost = (labouRate: number, totalCoverageArea: number): number => {
  return labouRate * totalCoverageArea;
};

export const formatPKRCurrency = (amount: string): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2
  }).format(num);
};
import { z } from 'zod';

export const employeeSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  cnic: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  address: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  employmentType: z.enum(['Permanent', 'Contract', 'Daily Wage', 'Intern']),
  joiningDate: z.string().min(1, 'Joining Date is required'),
  salary: z.number().optional(),
  status: z.enum(['Active', 'On Leave', 'Resigned', 'Terminated', 'Inactive']).optional(),
  emergencyContact: z.string().optional(),
  role: z.enum([
    'Super Admin',
    'Admin',
    'Project Manager',
    'Site Engineer',
    'Civil Engineer',
    'Site Supervisor',
    'Accountant',
    'Sales',
    'Guard',
    'Support Staff',
  ]),
});

export const validateEmployeeForm = (data: any) => {
  try {
    employeeSchema.parse(data);
    const errors: Record<string, string> = {};

    if (!data.employmentType) {
      errors.employmentType = 'Employment type is required';
    }

    if (data.password && !data.email) {
      errors.email = 'Email is required when setting up a system login password';
    }

    return errors;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return errors;
    }
    return { general: 'An unexpected error occurred' };
  }
};

export const hasEmployeeErrors = (errors: Record<string, string>) => {
  return Object.keys(errors).length > 0;
};

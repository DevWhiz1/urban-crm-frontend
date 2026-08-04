import { z } from 'zod';

export const expenseSchema = z.object({
  expenseType: z.enum(['Company', 'Project', 'Employee']),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  project: z.string().optional(),
  employee: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.expenseType === 'Project' && !data.project) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Project is required for Project Expenses',
      path: ['project'],
    });
  }
  if (data.expenseType === 'Employee' && !data.employee) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Employee is required for Employee Expenses',
      path: ['employee'],
    });
  }
});

export const validateExpenseForm = (data: any) => {
  try {
    expenseSchema.parse(data);
    return {};
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

export const hasExpenseErrors = (errors: Record<string, string>) => {
  return Object.keys(errors).length > 0;
};

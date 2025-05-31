import { toast } from 'sonner';

export const showErrorToast = (message: string) => {
  toast.error(message);
  console.error(message);
};

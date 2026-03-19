import { useMutation } from '@tanstack/react-query';
import type { ServerAuditResponse } from '../utils/useAuditStore';

const AUDIT_ENDPOINT = 'http://localhost:3000/api/v1/audit';

export type AuditFilesPayload = {
  bolData: File[];
  placardData: File[];
  intrierData: File[];
  exterierData: File[];
};

const appendFilesToFormData = (formData: FormData, key: string, files: File[]) => {
  files.forEach((file) => {
    formData.append(key, file);
  });
};

const createAuditRequest = async (payload: AuditFilesPayload): Promise<ServerAuditResponse> => {
  const formData = new FormData();

  appendFilesToFormData(formData, 'bol', payload.bolData);
  appendFilesToFormData(formData, 'placard', payload.placardData);
  appendFilesToFormData(formData, 'intrier', payload.intrierData);
  appendFilesToFormData(formData, 'exterier', payload.exterierData);

  const response = await fetch(AUDIT_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create audit');
  }

  return response.json() as Promise<ServerAuditResponse>;
};

export const useCreateAuditMutation = () =>
  useMutation({
    mutationFn: createAuditRequest,
  });
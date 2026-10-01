import { apiClient } from './apiClient';

export interface IssueReportResponse {
  reportId: string;
  userEmail: string;
  userRole: string;
  issueType: string;
  description: string;
  status: string;
  attachments?: string[];
  createdAt: string;
  message: string;
}

export const submitIssueReport = async (formData: FormData): Promise<IssueReportResponse> => {
  return apiClient<IssueReportResponse>('/issues/report', {
    method: 'POST',
    body: formData,
  });
};

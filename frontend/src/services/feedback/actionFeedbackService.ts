import { voiceAssistantService } from '../audio/voiceAssistantService';
import { soundEffectService } from '../audio/soundEffectService';
import { Role } from '../../types';

export type ActionEventType =
  | 'LOGIN_SUCCESS'
  | 'RESUME_UPLOAD_SUCCESS'
  | 'APPLICATION_SUBMITTED'
  | 'JOB_DRAFT_SAVED'
  | 'JOB_SUBMITTED_FOR_APPROVAL'
  | 'JOB_PUBLISHED'
  | 'JOB_UPDATED'
  | 'JOB_CLOSED'
  | 'JOB_REOPENED'
  | 'RECRUITER_VERIFIED'
  | 'RECRUITER_REJECTED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED';

export interface ActionFeedbackPayload {
  eventType: ActionEventType;
  title: string;
  headline?: string;
  description: string;
  voiceText?: string;
  chimeType?: 'success' | 'action' | 'none';
  severity?: 'success' | 'info' | 'warning';
  entityData?: {
    id?: string | number;
    title?: string;
    companyName?: string;
    recruiterName?: string;
    location?: string;
    employmentType?: string;
    salary?: string;
    deadline?: string;
    status?: string;
    applicantCount?: number;
    userName?: string;
    userEmail?: string;
  };
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    primary?: boolean;
  }>;
  autoDismissMs?: number;
}

type FeedbackListener = (payload: ActionFeedbackPayload | null) => void;

class ActionFeedbackService {
  private listeners: Set<FeedbackListener> = new Set();
  private currentFeedback: ActionFeedbackPayload | null = null;
  private lastTriggeredKey: string = '';
  private lastTriggeredTime: number = 0;

  public subscribe(listener: FeedbackListener): () => void {
    this.listeners.add(listener);
    if (this.currentFeedback) {
      listener(this.currentFeedback);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(payload: ActionFeedbackPayload | null): void {
    this.currentFeedback = payload;
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error notifying feedback listener:', err);
      }
    });
  }

  public dismiss(): void {
    this.notify(null);
  }

  /**
   * Trigger an action feedback event with voice, sound, and visual presentation.
   * Prevents duplicate announcements caused by quick re-renders or duplicate callbacks.
   */
  public trigger(payload: ActionFeedbackPayload): void {
    const dedupeKey = `${payload.eventType}:${payload.entityData?.id || payload.title}`;
    const now = Date.now();
    if (this.lastTriggeredKey === dedupeKey && now - this.lastTriggeredTime < 2000) {
      return;
    }
    this.lastTriggeredKey = dedupeKey;
    this.lastTriggeredTime = now;

    // 1. Play appropriate audio chime
    if (payload.chimeType === 'success') {
      soundEffectService.playSuccessChime();
    } else if (payload.chimeType === 'action') {
      soundEffectService.playActionChime();
    }

    // 2. Natural voice announcement
    if (payload.voiceText) {
      voiceAssistantService.speak(payload.voiceText, { interrupt: true });
    }

    // 3. Emit payload for visual overlay banner
    this.notify(payload);
  }

  // --- Convenience helper triggers adhering strictly to business specs ---

  /**
   * Successful user login across Candidate, Recruiter, and Admin portals.
   * Emits role-aware feedback and voice greeting when cinematic intro is disabled.
   */
  public loginSuccess(user: { name?: string; role: Role }): void {
    const greeting = voiceAssistantService.getRoleGreeting(user, user.role);
    this.trigger({
      eventType: 'LOGIN_SUCCESS',
      headline: `${user.role.toUpperCase()} SESSION ESTABLISHED`,
      title: greeting.headline,
      description: greeting.subtitle,
      voiceText: greeting.voiceText,
      chimeType: 'success',
      severity: 'success',
      entityData: {
        userName: greeting.displayName || undefined,
        status: 'ACTIVE',
      },
      autoDismissMs: 5000,
    });
  }

  /**
   * Candidate submits job application
   */
  public applicationSubmitted(data: {
    jobTitle: string;
    companyName?: string;
    applicationId?: string | number;
    jobId?: string | number;
    onViewApplications?: () => void;
    onBrowseJobs?: () => void;
  }): void {
    this.trigger({
      eventType: 'APPLICATION_SUBMITTED',
      headline: 'APPLICATION SUBMITTED SUCCESSFULLY',
      title: 'Your application has been received',
      description: "You're one step closer to your next opportunity.",
      voiceText:
        'Your application has been submitted successfully. Good luck with your next opportunity.',
      chimeType: 'success',
      severity: 'success',
      entityData: {
        id: data.applicationId,
        title: data.jobTitle,
        companyName: data.companyName,
      },
      actions: [
        {
          label: 'View My Applications',
          href: '/candidate/applications',
          onClick: data.onViewApplications,
          primary: true,
        },
        {
          label: 'Browse More Jobs',
          href: '/candidate/jobs',
          onClick: data.onBrowseJobs,
        },
      ],
      autoDismissMs: 8000,
    });
  }

  /**
   * Candidate uploads resume
   */
  public resumeUploaded(fileName?: string): void {
    this.trigger({
      eventType: 'RESUME_UPLOAD_SUCCESS',
      headline: 'YOUR RESUME IS READY FOR THE NEXT STEP',
      title: 'Resume Uploaded Successfully',
      description: fileName
        ? `"${fileName}" has been safely parsed and attached to your candidate profile.`
        : 'Your resume has been uploaded and registered to your profile.',
      voiceText: 'Your resume has been uploaded successfully.',
      chimeType: 'action',
      severity: 'success',
      autoDismissMs: 6000,
    });
  }

  /**
   * Recruiter publishes job opening
   */
  public jobPublished(job: {
    id: string | number;
    title: string;
    companyName?: string;
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    deadline?: string;
    status: string;
    applicantCount?: number;
    onViewPosting?: () => void;
    onViewApplicants?: () => void;
  }): void {
    const formatInr = (num?: number) =>
      num ? `₹${num.toLocaleString('en-IN')}` : '';

    let salaryStr = '';
    if (job.salaryMin && job.salaryMax) {
      salaryStr = `${formatInr(job.salaryMin)} - ${formatInr(job.salaryMax)}`;
    } else if (job.salaryMin) {
      salaryStr = `From ${formatInr(job.salaryMin)}`;
    }

    this.trigger({
      eventType: 'JOB_PUBLISHED',
      headline: 'YOUR NEXT GREAT HIRE STARTS HERE',
      title: 'JOB POSTED SUCCESSFULLY',
      description:
        'Your job opening is now published and ready to receive eligible applications.',
      voiceText:
        'Congratulations! Your job has been posted successfully. Your next great hire starts here.',
      chimeType: 'success',
      severity: 'success',
      entityData: {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        employmentType: job.employmentType,
        salary: salaryStr,
        deadline: job.deadline,
        status: job.status,
        applicantCount: job.applicantCount ?? 0,
      },
      actions: [
        {
          label: 'View Job Details',
          href: `/recruiter/jobs/${job.id}`,
          onClick: job.onViewPosting,
          primary: true,
        },
        {
          label: 'Manage All Jobs',
          href: '/recruiter/jobs',
        },
      ],
      autoDismissMs: 10000,
    });
  }

  /**
   * Recruiter submits job for administrator approval
   */
  public jobSubmittedForApproval(job: { id: string | number; title: string }): void {
    this.trigger({
      eventType: 'JOB_SUBMITTED_FOR_APPROVAL',
      headline: 'JOB SUBMITTED FOR APPROVAL',
      title: 'Awaiting Admin Review',
      description: `"${job.title}" has been submitted for administrator verification before becoming publicly visible.`,
      voiceText: 'Your job has been submitted for administrator approval.',
      chimeType: 'action',
      severity: 'info',
      entityData: {
        id: job.id,
        title: job.title,
        status: 'PENDING_APPROVAL',
      },
      autoDismissMs: 6000,
    });
  }

  /**
   * Recruiter saves job draft
   */
  public jobDraftSaved(job: { id?: string | number; title: string }): void {
    this.trigger({
      eventType: 'JOB_DRAFT_SAVED',
      headline: 'DRAFT SAVED SUCCESSFULLY',
      title: 'Job Draft Saved',
      description: `"${job.title}" has been saved as a draft. You can finish and submit it at any time.`,
      voiceText: 'Your job draft has been saved.',
      chimeType: 'action',
      severity: 'info',
      entityData: {
        id: job.id,
        title: job.title,
        status: 'DRAFT',
      },
      autoDismissMs: 5000,
    });
  }

  /**
   * Recruiter updates job details
   */
  public jobUpdated(job: { id: string | number; title: string }): void {
    this.trigger({
      eventType: 'JOB_UPDATED',
      headline: 'JOB DETAILS UPDATED',
      title: 'Update Recorded',
      description: `Changes to "${job.title}" have been successfully saved to the platform.`,
      voiceText: 'Your job details have been updated successfully.',
      chimeType: 'action',
      severity: 'success',
      entityData: {
        id: job.id,
        title: job.title,
      },
      autoDismissMs: 5000,
    });
  }

  /**
   * Recruiter closes job
   */
  public jobClosed(job: { id: string | number; title: string }): void {
    this.trigger({
      eventType: 'JOB_CLOSED',
      headline: 'JOB CLOSED SUCCESSFULLY',
      title: 'Listing Closed',
      description: `"${job.title}" has been closed and is no longer accepting candidate applications.`,
      voiceText: 'The job has been closed successfully.',
      chimeType: 'action',
      severity: 'info',
      entityData: {
        id: job.id,
        title: job.title,
        status: 'CLOSED',
      },
      autoDismissMs: 5000,
    });
  }

  /**
   * Recruiter reopens job
   */
  public jobReopened(job: { id: string | number; title: string }): void {
    this.trigger({
      eventType: 'JOB_REOPENED',
      headline: 'JOB REOPENED SUCCESSFULLY',
      title: 'Listing Reopened',
      description: `"${job.title}" is now open and actively receiving applications again.`,
      voiceText: 'The job has been reopened successfully.',
      chimeType: 'action',
      severity: 'success',
      entityData: {
        id: job.id,
        title: job.title,
        status: 'ACTIVE',
      },
      autoDismissMs: 5000,
    });
  }

  /**
   * Admin approves/verifies recruiter
   */
  public recruiterVerified(recruiter: {
    id: string | number;
    name: string;
    companyName?: string;
  }): void {
    this.trigger({
      eventType: 'RECRUITER_VERIFIED',
      headline: 'RECRUITER VERIFIED SUCCESSFULLY',
      title: 'Verification Complete',
      description: `${recruiter.name}${recruiter.companyName ? ` (${recruiter.companyName})` : ''} is now verified and may access platform recruitment capabilities.`,
      voiceText: 'Recruiter verification has been completed successfully.',
      chimeType: 'success',
      severity: 'success',
      entityData: {
        id: recruiter.id,
        recruiterName: recruiter.name,
        companyName: recruiter.companyName,
        status: 'VERIFIED',
      },
      autoDismissMs: 7000,
    });
  }

  /**
   * Admin rejects recruiter verification
   */
  public recruiterRejected(recruiter: {
    id: string | number;
    name: string;
    reason?: string;
  }): void {
    this.trigger({
      eventType: 'RECRUITER_REJECTED',
      headline: 'VERIFICATION DECISION RECORDED',
      title: 'Decision Recorded',
      description: `The application status for ${recruiter.name} has been updated. The recruiter will receive notification with the recorded rationale.`,
      voiceText: 'The recruiter verification decision has been recorded.',
      chimeType: 'action',
      severity: 'info',
      entityData: {
        id: recruiter.id,
        recruiterName: recruiter.name,
        status: 'REJECTED',
      },
      autoDismissMs: 6000,
    });
  }

  /**
   * Admin suspends/reactivates user
   */
  public userStatusChanged(user: {
    name: string;
    action: 'suspended' | 'reactivated';
  }): void {
    const isSuspended = user.action === 'suspended';
    this.trigger({
      eventType: isSuspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      headline: isSuspended ? 'USER ACCOUNT SUSPENDED' : 'USER ACCOUNT REACTIVATED',
      title: isSuspended ? 'Account Suspended' : 'Account Reactivated',
      description: `User account for ${user.name} has been ${user.action}.`,
      voiceText: isSuspended
        ? `Account for ${user.name} has been suspended.`
        : `Account for ${user.name} has been reactivated.`,
      chimeType: 'action',
      severity: isSuspended ? 'warning' : 'info',
      autoDismissMs: 5000,
    });
  }
}

export const actionFeedbackService = new ActionFeedbackService();

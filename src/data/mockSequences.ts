import { AutomatedSequence } from '../types';

export const INITIAL_SEQUENCES: AutomatedSequence[] = [
  {
    id: 'SEQ-001',
    name: 'New Student Onboarding Sequence',
    triggerType: 'new_enrollment',
    description: 'Sends welcome package, LMS login guide, and WhatsApp batch group link immediately upon course enrollment.',
    stepsCount: 3,
    activeStudents: 142,
    status: 'active',
    delay: 'Immediate (0 mins)',
    templateText: 'Welcome to OnlineClass Edu, {{student_name}}! 🎓 Your Student ID is {{student_id}}. Log in to LMS at lms.onlineclass.edu. Join your batch WhatsApp group: {{group_link}}'
  },
  {
    id: 'SEQ-002',
    name: 'Missed Live Class Recording Alert',
    triggerType: 'missed_class',
    description: 'Triggers 4 hours after a missed live Zoom session to deliver the direct HD recording link and slides.',
    stepsCount: 2,
    activeStudents: 38,
    status: 'active',
    delay: '4 Hours Post-Class',
    templateText: 'Hi {{student_name}}, we missed you in today\'s {{course_name}} live session! The HD recording & lecture slides are now ready in your LMS portal: {{recording_url}}'
  },
  {
    id: 'SEQ-003',
    name: 'Upcoming Installment Fee Reminder',
    triggerType: 'payment_reminder',
    description: 'Automated friendly reminder sent 3 days before an installment due date to prevent LMS access pauses.',
    stepsCount: 2,
    activeStudents: 56,
    status: 'active',
    delay: '3 Days Before Due Date',
    templateText: 'Hello {{student_name}}, your installment of {{amount}} for {{course_name}} is due on {{due_date}}. Pay seamlessly via {{payment_link}}'
  },
  {
    id: 'SEQ-004',
    name: 'LMS Recording Upload Broadcaster',
    triggerType: 'recording_uploaded',
    description: 'Broadcast notification to all batch students as soon as new lecture recording is processed on LMS.',
    stepsCount: 1,
    activeStudents: 210,
    status: 'active',
    delay: 'Immediate upon LMS Webhook',
    templateText: '📢 Recording Alert: Today\'s {{course_name}} session video has been uploaded to LMS. Log in now to review notes & bookmark key timestamps.'
  }
];

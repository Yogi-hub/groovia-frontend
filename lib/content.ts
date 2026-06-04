// content.ts
// All user-facing UI strings. Edit here to change wording without touching component logic.

export const UI_CONTENT = {
  welcomeMessage: 'Welcome! Please attach your resume to begin.',
  uploadIndicator: '📎 Resume uploaded',
  intentPrompt: 'What would you like to do next?',
  inputPlaceholder: 'Ask about your career...',
  disclaimer:
    'This is AI-generated content based on publicly available information. It is not legal advice. Always consult a qualified immigration professional before making decisions.',
  errors: {
    backendUnreachable: 'Error: Could not connect to backend.',
    noResponse: 'No response received.',
  },
  tooltips: {
    attachResume: 'Attach resume (PDF or DOCX)',
    resumeAlreadyUploaded: 'Resume already uploaded',
  },
} as const;

export const INTENT_OPTIONS = [
  { label: '📊 Generate a Career Report', message: 'I want to generate a career report.' },
  { label: '🤝 Find me a Mentor',         message: 'I want to find a mentor.'           },
  { label: '💬 Ask a Question',           message: 'I just want to ask some questions.' },
] as const;

export const UI_CONTENT = {
  welcomeMessage: "Hi, I'm Groovia. Attach your resume below and we'll get started.",
  uploadIndicator: '📎 Resume uploaded',
  intentPrompt: 'What would you like to do next?',
  inputPlaceholder: 'Ask about your career...',
  inputPlaceholderLocked: 'Sign in to continue…',
  disclaimer:
    'This is AI-generated content based on publicly available information. It is not legal advice. Always consult a qualified immigration professional before making decisions.',
  signInToContinue: 'Sign in to continue the conversation',
  errors: {
    backendUnreachable: 'Error: Could not connect to backend.',
    noResponse: 'No response received.',
  },
  tooltips: {
    attachResume: 'Attach resume (PDF or DOCX)',
    resumeAlreadyUploaded: 'Resume already uploaded',
  },
  chatIntro: {
    title: "Hi, I'm Groovia.",
    description:
      "I help people find the right destination, connect with mentors who have lived the journey or legal advice. Attach your resume and we'll get started.",
    features: [
      'Discover 3–5 countries that fit your skills and budget.',
      "Book meeting with real mentors who've already made themove.",
    ],
  },
  sidebar: {
    newChat: 'New chat',
    chat: 'Chat',
    mentors: 'Mentors',
    account: 'Account',
    history: 'Recent chats',
    historyEmpty: 'No previous chats yet.',
    signIn: 'Sign in',
    signOut: 'Sign out',
  },
  signupModal: {
    title: 'Save your progress to continue',
    subtitle:
      'Create a free account (or sign in) to keep your report, conversation and country recommendations.',
    createAccount: 'Create free account',
    haveAccount: 'I already have an account',
    requireAccount: 'We need an account before continuing.',
  },
} as const;

export const INTENT_OPTIONS = [
  { label: '📊 Generate a Career Report', message: 'I want to generate a career report.' },
  { label: '🤝 Find me a Mentor',         message: 'I want to find a mentor.'           },
  { label: '💬 Ask a Question',           message: 'I just want to ask some questions.' },
] as const;

type TranslationKey =
  | 'nav.home' | 'nav.safety' | 'nav.opportunities' | 'nav.quiz' | 'nav.report'
  | 'nav.checklist' | 'nav.contact' | 'nav.language' | 'nav.darkMode'
  | 'nav.lightMode' | 'common.loading' | 'common.error' | 'common.search'
  | 'common.searchPlaceholder' | 'common.allCategories' | 'common.allDifficulties'
  | 'common.beginner' | 'common.intermediate' | 'common.advanced' | 'common.minRead'
  | 'common.lastUpdated' | 'common.share' | 'common.print' | 'common.backToHub'
  | 'common.wasThisHelpful' | 'common.yes' | 'common.no' | 'common.thankYou'
  | 'common.commentOptional' | 'common.submit' | 'common.viewGuide' | 'common.readMore'
  | 'common.sources' | 'common.guideCount' | 'common.noResults' | 'common.tryAgain'
  | 'home.tagline' | 'home.aboutTitle' | 'home.aboutP1' | 'home.aboutP2' | 'home.aboutP3'
  | 'home.whoFor' | 'home.whoFor1' | 'home.whoFor2' | 'home.whoFor3'
  | 'home.featuredTitle' | 'home.scamAlertTitle' | 'home.onboardingTitle'
  | 'home.onboardingSubtitle' | 'home.onboardingStart' | 'home.onboardingResult'
  | 'home.onboardingRecommend' | 'home.isocCredit' | 'home.fellowshipCredit'
  | 'safety.title' | 'safety.subtitle' | 'opportunities.title' | 'opportunities.subtitle'
  | 'guide.problemSummary' | 'guide.realWorldExample' | 'guide.protectionTips'
  | 'guide.testYourself' | 'guide.checkAnswer' | 'guide.nextQuestion' | 'guide.correct'
  | 'guide.incorrect' | 'guide.explanation' | 'guide.quizComplete'
  | 'quiz.title' | 'quiz.subtitle' | 'quiz.real' | 'quiz.fake' | 'quiz.correct'
  | 'quiz.wrong' | 'quiz.explanation' | 'quiz.next' | 'quiz.score' | 'quiz.restart'
  | 'quiz.warningSigns' | 'quiz.start' | 'quiz.question' | 'quiz.of'
  | 'report.title' | 'report.subtitle' | 'report.channel' | 'report.message'
  | 'report.messagePlaceholder' | 'report.notes' | 'report.notesPlaceholder'
  | 'report.consent' | 'report.submit' | 'report.success' | 'report.anonymized'
  | 'checklist.title' | 'checklist.subtitle' | 'checklist.question' | 'checklist.yes'
  | 'checklist.no' | 'checklist.result' | 'checklist.low' | 'checklist.medium'
  | 'checklist.high' | 'checklist.restart' | 'checklist.legitimate'
  | 'checklist.likelyScam' | 'checklist.proceed'
  | 'contact.title' | 'contact.subtitle' | 'contact.suggestTitle' | 'contact.name'
  | 'contact.email' | 'contact.topic' | 'contact.details' | 'contact.contributor'
  | 'contact.organization' | 'contact.submit' | 'contact.success'
  | 'contact.newsletterTitle' | 'contact.newsletterSubtitle' | 'contact.contactMethod'
  | 'contact.emailChannel' | 'contact.whatsappChannel' | 'contact.signup' | 'contact.signupSuccess'
  | 'footer.tagline' | 'footer.isoc' | 'footer.fellowship' | 'footer.copyright';

const translations: Record<'en', Record<TranslationKey, string>> = {
  en: {
    'nav.home': 'Home / About',
    'nav.safety': 'Online Safety Hub',
    'nav.opportunities': 'Opportunities Hub',
    'nav.quiz': 'Spot the Scam',
    'nav.report': 'Report a Suspicious Message',
    'nav.checklist': 'Opportunity Checklist',
    'nav.contact': 'Contact / Get Involved',
    'nav.language': 'English',
    'nav.darkMode': 'Dark Mode',
    'nav.lightMode': 'Light Mode',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong. Please try again.',
    'common.search': 'Search',
    'common.searchPlaceholder': 'Search guides... e.g. "is this SMS real"',
    'common.allCategories': 'All Categories',
    'common.allDifficulties': 'All Levels',
    'common.beginner': 'Beginner',
    'common.intermediate': 'Intermediate',
    'common.advanced': 'Advanced',
    'common.minRead': 'min read',
    'common.lastUpdated': 'Last updated',
    'common.share': 'Share',
    'common.print': 'Print / PDF',
    'common.backToHub': 'Back to Hub',
    'common.wasThisHelpful': 'Was this helpful?',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.thankYou': 'Thank you for your feedback!',
    'common.commentOptional': 'Optional comment',
    'common.submit': 'Submit',
    'common.viewGuide': 'Read Guide',
    'common.readMore': 'Read more',
    'common.sources': 'Sources',
    'common.guideCount': 'guides published',
    'common.noResults': 'No guides found. Try a different search or filter.',
    'common.tryAgain': 'Please try again.',
    'home.tagline': 'A knowledge hub for online safety and digital opportunities in Malawi',
    'home.aboutTitle': 'About Beyond Access Africa',
    'home.aboutP1': 'Beyond Access Africa is a knowledge hub built for first-time and underserved internet users in Malawi. We help you stay safe online and find real digital opportunities to improve your life and income.',
    'home.aboutP2': 'The hub is organized around two pillars: Online Safety (protecting yourself from scams, phishing, and misinformation) and Digital Opportunities (finding real remote work, freelancing, and learning online).',
    'home.aboutP3': 'This project is part of the Internet Society (ISOC) fellowship program, created to build digital resilience in communities that are coming online for the first time.',
    'home.whoFor': 'Who is this for?',
    'home.whoFor1': 'First-time internet users who want to understand how to stay safe online.',
    'home.whoFor2': 'People looking for real online income and learning opportunities.',
    'home.whoFor3': 'Community facilitators and partner organizations who want trusted materials to share.',
    'home.featuredTitle': 'Featured Guide',
    'home.scamAlertTitle': 'This Week\'s Most Reported Scams',
    'home.onboardingTitle': 'What are you most worried about online?',
    'home.onboardingSubtitle': 'Answer one question and we\'ll recommend the most relevant guides for you.',
    'home.onboardingStart': 'Get Started',
    'home.onboardingResult': 'Based on your answer, we recommend these guides:',
    'home.onboardingRecommend': 'Recommended for you',
    'home.isocCredit': 'An Internet Society (ISOC) Fellowship Project',
    'home.fellowshipCredit': 'Built as part of the ISOC fellowship to promote digital resilience in Malawi.',
    'safety.title': 'Online Safety Hub',
    'safety.subtitle': 'Guides to help you spot scams, protect your accounts, and stay safe online.',
    'opportunities.title': 'Opportunities Hub',
    'opportunities.subtitle': 'Guides to help you find real online work, learn new skills, and build digital income.',
    'guide.problemSummary': 'The Problem',
    'guide.realWorldExample': 'Real-World Example',
    'guide.protectionTips': 'Protection Tips',
    'guide.testYourself': 'Test Yourself',
    'guide.checkAnswer': 'Check Answer',
    'guide.nextQuestion': 'Next Question',
    'guide.correct': 'Correct!',
    'guide.incorrect': 'Not quite.',
    'guide.explanation': 'Explanation',
    'guide.quizComplete': 'Quiz complete!',
    'quiz.title': 'Spot the Scam',
    'quiz.subtitle': 'Can you tell a real message from a scam? Test yourself with real examples.',
    'quiz.real': 'Real',
    'quiz.fake': 'Scam',
    'quiz.correct': 'Correct!',
    'quiz.wrong': 'Not quite right.',
    'quiz.explanation': 'Explanation',
    'quiz.next': 'Next',
    'quiz.score': 'Your Score',
    'quiz.restart': 'Try Again',
    'quiz.warningSigns': 'Warning Signs',
    'quiz.start': 'Start Quiz',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'report.title': 'Report a Suspicious Message',
    'report.subtitle': 'Not sure if a message is real? Paste it here. Your report helps us build a local warning archive and create new guides. All reports are anonymized.',
    'report.channel': 'How did you receive it?',
    'report.message': 'Paste the message or link',
    'report.messagePlaceholder': 'Copy and paste the suspicious SMS, email, or message here...',
    'report.notes': 'Any notes? (optional)',
    'report.notesPlaceholder': 'e.g. what they asked for, when it happened...',
    'report.consent': 'I consent to this message being used anonymously to help others.',
    'report.submit': 'Submit Report',
    'report.success': 'Thank you! Your report has been submitted anonymously and will help others stay safe.',
    'report.anonymized': 'Your personal details are never stored. Only the message content is saved.',
    'checklist.title': 'Opportunity Checklist',
    'checklist.subtitle': 'Not sure if an online job or income offer is real? Answer these questions to get a risk score.',
    'checklist.question': 'Question',
    'checklist.yes': 'Yes',
    'checklist.no': 'No',
    'checklist.result': 'Your Risk Assessment',
    'checklist.low': 'Low Risk',
    'checklist.medium': 'Medium Risk',
    'checklist.high': 'High Risk — Likely Scam',
    'checklist.restart': 'Start Over',
    'checklist.legitimate': 'This opportunity looks legitimate. Proceed with normal caution.',
    'checklist.likelyScam': 'This opportunity shows strong scam signs. Be very careful and do not send any money.',
    'checklist.proceed': 'This opportunity has some warning signs. Verify carefully before proceeding.',
    'contact.title': 'Contact / Get Involved',
    'contact.subtitle': 'Are you a partner, co-facilitator, or guide contributor? We\'d love to hear from you.',
    'contact.suggestTitle': 'Suggest a Topic or Contribute a Guide',
    'contact.name': 'Your name (optional)',
    'contact.email': 'Your email (optional)',
    'contact.topic': 'Topic or guide idea',
    'contact.details': 'Tell us more',
    'contact.contributor': 'I\'d like to contribute a guide',
    'contact.organization': 'Organization (optional)',
    'contact.submit': 'Submit',
    'contact.success': 'Thank you! Your suggestion has been received.',
    'contact.newsletterTitle': 'Get New Guide Alerts',
    'contact.newsletterSubtitle': 'Sign up to be notified when we publish new guides. No account needed.',
    'contact.contactMethod': 'Email or WhatsApp number',
    'contact.emailChannel': 'Email',
    'contact.whatsappChannel': 'WhatsApp',
    'contact.signup': 'Sign Up',
    'contact.signupSuccess': 'You\'re signed up! We\'ll let you know when new guides are published.',
    'footer.tagline': 'Building digital resilience in Malawi',
    'footer.isoc': 'Internet Society Fellowship Project',
    'footer.fellowship': 'Beyond Access Africa is an ISOC fellowship project promoting online safety and digital opportunity for underserved communities.',
    'footer.copyright': 'Beyond Access Africa. Content is free to share for educational purposes.',
  },
};

export function useTranslation() {
  const t = (key: TranslationKey): string => translations.en[key] ?? key;
  return { t };
}

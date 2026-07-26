export default [
  {
    heading: 'Main',
  },
  {
    title: 'Dashboard',
    to: { name: 'root' },
    icon: { icon: 'ri-home-line' },
  },
  {
    heading: 'Quiz',
  },
  {
    title: 'New Quiz (Upload)',
    to: { name: 'quiz-new' },
    icon: { icon: 'ri-add-circle-line' },
  },
  {
    title: 'My Quizzes',
    to: { name: 'quiz-page' },
    icon: { icon: 'ri-questionnaire-line' },
  },
  {
    title: 'Quiz History',
    to: { name: 'quiz-history-page' },
    icon: { icon: 'ri-history-line' },
  },
  {
    heading: 'Admin',
  },
  {
    title: 'Users',
    to: { name: 'user-page' },
    icon: { icon: 'ri-user-3-line' },
  },
]

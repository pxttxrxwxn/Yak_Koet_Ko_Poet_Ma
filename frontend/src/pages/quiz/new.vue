<script setup lang="ts">
import { useQuizStore } from '@/stores/use-quiz-store'
import type { CreateQuizBody } from '@/models'

const quizStore = useQuizStore()
const router = useRouter()

const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const uploadProgress = ref(0)
const isGenerating = ref(false)
const currentStep = ref(0)
const generationError = ref<string | null>(null)
const questionCount = ref(10) // Default to 10 questions

const fileInput = ref<HTMLInputElement | null>(null)

function getFileIcon(filename: string | undefined): string {
  if (!filename)
    return 'ri-file-text-line'
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.pdf')
    return 'ri-file-pdf-fill'
  if (ext === '.pptx' || ext === '.ppt')
    return 'ri-file-ppt-fill'
  if (ext === '.docx' || ext === '.doc')
    return 'ri-file-word-fill'
  return 'ri-file-text-fill'
}

function getFileColor(filename: string | undefined): string {
  if (!filename)
    return 'secondary'
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.pdf')
    return '#f40000'
  if (ext === '.pptx' || ext === '.ppt')
    return '#e74c3c'
  if (ext === '.docx' || ext === '.doc')
    return '#0003b4'
  if (ext === '.txt')
    return '#009f98'
  return 'secondary'
}

const steps = [
  'Reading document content (PDF/PPTX parsing)...',
  'Analyzing concepts and learning outcomes...',
  'Generating realistic practice questions...',
  'Assembling your custom exam quiz...',
]

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0)
    handleFile(e.dataTransfer.files[0])
}

function triggerBrowse() {
  fileInput.value?.click()
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0)
    handleFile(target.files[0])
}

const fileContentText = ref('')

interface TopicDetails {
  name: string
  icon: string
  color: string
  keywords: string[]
}

const topics: Record<string, TopicDetails> = {
  ux: {
    name: 'UI/UX & Design',
    icon: 'ri-palette-line',
    color: 'primary',
    keywords: ['ux', 'ui', 'design', 'experience', 'usability', 'wireframe', 'prototype', 'heuristic', 'persona', 'interaction'],
  },
  db: {
    name: 'Database & SQL',
    icon: 'ri-database-2-line',
    color: 'success',
    keywords: ['db', 'database', 'sql', 'query', 'index', 'nosql', 'oracle', 'mysql', 'postgres', 'mongodb', 'acid', 'join', 'normalization', 'transaction'],
  },
  network: {
    name: 'Network & Security',
    icon: 'ri-shield-keyhole-line',
    color: 'error',
    keywords: ['network', 'security', 'internet', 'http', 'tcp', 'ip', 'dns', 'firewall', 'cyber', 'hack', 'ssl', 'tls', 'port', 'ddos', 'cryptography'],
  },
  prog: {
    name: 'Programming & Code',
    icon: 'ri-code-s-slash-line',
    color: 'info',
    keywords: ['prog', 'code', 'python', 'javascript', 'js', 'ts', 'java', 'c++', 'rust', 'golang', 'compiler', 'algorithm', 'develop', 'variable', 'function', 'class', 'object', 'loop', 'array'],
  },
  science: {
    name: 'Science & Biology',
    icon: 'ri-microscope-line',
    color: 'teal',
    keywords: ['science', 'bio', 'physic', 'chem', 'atom', 'molecule', 'cell', 'organism', 'gravity', 'space', 'planet', 'laboratory', 'mitochondria', 'light', 'water', 'genetic', 'evolution'],
  },
  math: {
    name: 'Mathematics & Statistics',
    icon: 'ri-function-line',
    color: 'deep-orange',
    keywords: ['math', 'algebra', 'calculus', 'geometry', 'equation', 'arithmetic', 'number', 'theorem', 'matrix', 'statistic', 'probability', 'derivative', 'integral', 'triangle', 'fraction'],
  },
  history: {
    name: 'History & Social Studies',
    icon: 'ri-ancient-gate-line',
    color: 'amber',
    keywords: ['history', 'ancient', 'war', 'world war', 'culture', 'society', 'revolution', 'civilization', 'empire', 'historical', 'president', 'pyramid', 'mural', 'century'],
  },
  english: {
    name: 'English & Language',
    icon: 'ri-translate-2',
    color: 'blue',
    keywords: ['english', 'language', 'grammar', 'vocab', 'literature', 'writing', 'word', 'sentence', 'linguistic', 'synonym', 'antonym', 'conjunction', 'noun', 'pronoun', 'verb', 'adjective'],
  },
  cooking: {
    name: 'Cooking & Culinary',
    icon: 'ri-restaurant-2-line',
    color: 'deep-purple',
    keywords: ['cooking', 'food', 'culinary', 'recipe', 'bake', 'chef', 'kitchen', 'ingredient', 'dish', 'cuisine', 'fry', 'boil', 'roast', 'grill', 'yeast'],
  },
  business: {
    name: 'Business & Marketing',
    icon: 'ri-briefcase-4-line',
    color: 'blue-grey',
    keywords: ['business', 'finance', 'marketing', 'economy', 'market', 'stock', 'investment', 'management', 'money', 'sales', 'roi', 'product', 'price', 'promotion', 'inflation'],
  },
  music: {
    name: 'Music & Art',
    icon: 'ri-music-2-line',
    color: 'pink',
    keywords: ['music', 'art', 'painting', 'song', 'instrument', 'drawing', 'artist', 'melody', 'sculpture', 'gallery', 'piano', 'guitar', 'brass', 'allegro', 'cubism', 'surrealism'],
  },
  sports: {
    name: 'Sports & Fitness',
    icon: 'ri-run-line',
    color: 'light-green',
    keywords: ['sport', 'fitness', 'health', 'football', 'basketball', 'soccer', 'workout', 'exercise', 'athlete', 'training', 'diet', 'vitamin', 'body', 'gym', 'match'],
  },
  geography: {
    name: 'Geography & Earth',
    icon: 'ri-map-2-line',
    color: 'cyan',
    keywords: ['geography', 'map', 'earth', 'country', 'continent', 'river', 'mountain', 'climate', 'nation', 'capital', 'ocean', 'desert', 'volcano', 'lake'],
  },
}

const fallbackTopic: TopicDetails = {
  name: 'General Knowledge',
  icon: 'ri-global-line',
  color: 'secondary',
  keywords: [],
}

const detectedTopicKey = computed(() => {
  if (!selectedFile.value)
    return 'general'
  const searchText = (`${selectedFile.value.name} ${fileContentText.value}`).toLowerCase()

  let bestTopic = 'general'
  let maxMatches = 0

  for (const [key, topic] of Object.entries(topics)) {
    let matches = 0
    for (const keyword of topic.keywords) {
      if (searchText.includes(keyword))
        matches++
    }
    if (matches > maxMatches) {
      maxMatches = matches
      bestTopic = key
    }
  }

  return bestTopic
})

const detectedTopicDetails = computed(() => {
  return topics[detectedTopicKey.value] || fallbackTopic
})

function handleFile(file: File) {
  // Validate extension
  const allowedExtensions = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt']
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExtensions.includes(fileExtension)) {
    generationError.value = `Unsupported file format. Please upload one of: ${allowedExtensions.join(', ')}`
    return
  }

  selectedFile.value = file
  generationError.value = null

  if (fileExtension === '.txt') {
    const reader = new FileReader()
    reader.onload = (e) => {
      fileContentText.value = (e.target?.result as string) || ''
    }
    reader.readAsText(file)
  }
  else {
    fileContentText.value = ''
  }
}

function startSimulation() {
  isGenerating.value = true
  uploadProgress.value = 0
  currentStep.value = 0

  // 1. Simulate file upload progress
  const uploadInterval = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 10
    }
    else {
      clearInterval(uploadInterval)
      // 2. Simulate AI processing steps
      runAISteps()
    }
  }, 150)
}

function runAISteps() {
  const stepInterval = setInterval(async () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
    else {
      clearInterval(stepInterval)
      // 3. Generate Quiz and submit to API
      await generateQuiz()
    }
  }, 1000)
}

// Mock question generator based on filename keywords
function getMockQuestions(topicKey: string, filename: string, count: number) {
  let pool: Array<{ question: string; options: string[]; correctAnswer: number }> = []

  if (topicKey === 'ux') {
    pool = [
      {
        question: 'What does UX stand for in the context of product design?',
        options: ['User Experience', 'User Explanation', 'User Expansion', 'Unit Extension'],
        correctAnswer: 0,
      },
      {
        question: 'Which of the following is one of Jakob Nielsen\'s 10 usability heuristics?',
        options: ['Vibrant color schemes', 'Consistency and standards', 'Infinite scroll integration', 'Complex authentication'],
        correctAnswer: 1,
      },
      {
        question: 'What is the primary purpose of creating a low-fidelity wireframe?',
        options: ['To define final typography and brand colors', 'To plan layout, hierarchy, and content structure quickly', 'To write backend database models', 'To run Google SEO keyword analysis'],
        correctAnswer: 1,
      },
    ]
  }
  else if (topicKey === 'db') {
    pool = [
      {
        question: 'Which SQL join returns all records when there is a match in either left or right table?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
        correctAnswer: 3,
      },
      {
        question: 'What does the \'A\' in ACID database transaction properties represent?',
        options: ['Atomicity', 'Availability', 'Authentication', 'Algorithm'],
        correctAnswer: 0,
      },
      {
        question: 'What is the main operational advantage of database indexing?',
        options: ['Reduces physical server storage usage', 'Speeds up data search queries dramatically', 'Enforces strict foreign key constraints', 'Encrypts database column values'],
        correctAnswer: 1,
      },
    ]
  }
  else if (topicKey === 'network') {
    pool = [
      {
        question: 'Which layer of the standard OSI model is responsible for routing packets across networks?',
        options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
        correctAnswer: 2,
      },
      {
        question: 'What protocol runs on secure web port 443 by default?',
        options: ['HTTP', 'HTTPS', 'FTP', 'SSH'],
        correctAnswer: 1,
      },
      {
        question: 'What is the primary function of the Domain Name System (DNS)?',
        options: ['To map user-friendly domain names to numeric IP addresses', 'To serve HTML files to clients', 'To distribute web server loads', 'To route packets through subnets'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'prog') {
    pool = [
      {
        question: 'What is a closure in modern JavaScript?',
        options: ['A function combined with its lexical surrounding state scope', 'A method to forcefully break out of a loop', 'A secure API gateway routing system', 'A style declaration in CSS preprocessors'],
        correctAnswer: 0,
      },
      {
        question: 'Which data structure follows a Last-In, First-Out (LIFO) operational protocol?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Search Tree'],
        correctAnswer: 1,
      },
      {
        question: 'What is the evaluated output of `typeof null` in standard JavaScript runtime?',
        options: ['\'null\'', '\'undefined\'', '\'object\'', '\'string\''],
        correctAnswer: 2,
      },
    ]
  }
  else if (topicKey === 'science') {
    pool = [
      {
        question: 'Which intracellular organelle is colloquially referred to as the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
        correctAnswer: 2,
      },
      {
        question: 'What is the chemical symbol of the element Gold?',
        options: ['Gd', 'Go', 'Ag', 'Au'],
        correctAnswer: 3,
      },
      {
        question: 'What atmospheric gas do plants primarily absorb during the process of photosynthesis?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen Gas', 'Hydrogen Gas'],
        correctAnswer: 1,
      },
    ]
  }
  else if (topicKey === 'math') {
    pool = [
      {
        question: 'What is the derivative of x^2 with respect to x?',
        options: ['2x', 'x', '2', 'x^2/2'],
        correctAnswer: 0,
      },
      {
        question: 'What is the value of pi to two decimal places?',
        options: ['3.14', '3.12', '3.16', '3.18'],
        correctAnswer: 0,
      },
      {
        question: 'Solve for x: 2x + 5 = 15.',
        options: ['5', '10', '7.5', '20'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'history') {
    pool = [
      {
        question: 'Who was the first President of the United States?',
        options: ['George Washington', 'Thomas Jefferson', 'John Adams', 'Abraham Lincoln'],
        correctAnswer: 0,
      },
      {
        question: 'In which year did World War II end?',
        options: ['1945', '1918', '1939', '1950'],
        correctAnswer: 0,
      },
      {
        question: 'The ancient pyramids of Giza are located in which country?',
        options: ['Egypt', 'Greece', 'Italy', 'Mexico'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'english') {
    pool = [
      {
        question: 'Which of the following is a synonym for \'benevolent\'?',
        options: ['Kind', 'Cruel', 'Greedy', 'Lazy'],
        correctAnswer: 0,
      },
      {
        question: 'Identify the conjunction in the sentence: "I wanted to go, but it was raining."',
        options: ['but', 'to', 'wanted', 'raining'],
        correctAnswer: 0,
      },
      {
        question: 'What is the term for a word that is spelled the same as another word but has a different meaning?',
        options: ['Homonym', 'Synonym', 'Antonym', 'Acronym'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'cooking') {
    pool = [
      {
        question: 'What is the primary ingredient in traditional Japanese tofu?',
        options: ['Soybeans', 'Rice flour', 'Wheat gluten', 'Milk'],
        correctAnswer: 0,
      },
      {
        question: 'Which cooking technique involves cooking food gently in liquid just below the boiling point?',
        options: ['Poaching', 'Frying', 'Roasting', 'Grilling'],
        correctAnswer: 0,
      },
      {
        question: 'What is the main leavening agent used in traditional bread making?',
        options: ['Yeast', 'Baking powder', 'Baking soda', 'Cream of tartar'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'business') {
    pool = [
      {
        question: 'What does "ROI" stand for in business and finance?',
        options: ['Return on Investment', 'Rate of Interest', 'Risk of Inflation', 'Revenue of Industry'],
        correctAnswer: 0,
      },
      {
        question: 'Which of the following describes the "4 Ps" of marketing?',
        options: ['Product, Price, Place, Promotion', 'Plan, Process, People, Performance', 'Profit, Production, Publicity, Purchase', 'Position, Promotion, Publicity, Planning'],
        correctAnswer: 0,
      },
      {
        question: 'What is a bear market in stock trading?',
        options: ['A market where prices are falling, encouraging selling', 'A market where prices are rising, encouraging buying', 'A market with low transaction volume', 'A market exclusive to commodity trading'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'music') {
    pool = [
      {
        question: 'How many keys are there on a standard piano?',
        options: ['88', '76', '64', '100'],
        correctAnswer: 0,
      },
      {
        question: 'Who is widely regarded as the pioneer of Cubism in modern art?',
        options: ['Pablo Picasso', 'Claude Monet', 'Vincent van Gogh', 'Salvador Dali'],
        correctAnswer: 0,
      },
      {
        question: 'Which instrument belongs to the brass family?',
        options: ['Trumpet', 'Flute', 'Violin', 'Clarinet'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'sports') {
    pool = [
      {
        question: 'How long is a standard association football (soccer) match, excluding extra time?',
        options: ['90 minutes', '80 minutes', '60 minutes', '100 minutes'],
        correctAnswer: 0,
      },
      {
        question: 'What is the maximum number of players allowed on the court for one team in basketball?',
        options: ['5', '6', '7', '11'],
        correctAnswer: 0,
      },
      {
        question: 'Which vitamin is primarily produced when human skin is exposed to sunlight?',
        options: ['Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin B12'],
        correctAnswer: 0,
      },
    ]
  }
  else if (topicKey === 'geography') {
    pool = [
      {
        question: 'What is the capital city of Australia?',
        options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
        correctAnswer: 0,
      },
      {
        question: 'Which is the largest ocean on Earth?',
        options: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
        correctAnswer: 0,
      },
      {
        question: 'What is the longest river in the world?',
        options: ['Nile River', 'Amazon River', 'Yangtze River', 'Mississippi River'],
        correctAnswer: 0,
      },
    ]
  }
  else {
    pool = [
      {
        question: 'Which planet in our solar system is the largest?',
        options: ['Jupiter', 'Saturn', 'Earth', 'Mars'],
        correctAnswer: 0,
      },
      {
        question: 'Who wrote the famous play "Romeo and Juliet"?',
        options: ['William Shakespeare', 'Charles Dickens', 'Mark Twain', 'Jane Austen'],
        correctAnswer: 0,
      },
      {
        question: 'What is the capital city of France?',
        options: ['Paris', 'London', 'Rome', 'Berlin'],
        correctAnswer: 0,
      },
    ]
  }

  // Shuffle the base pool to introduce variety
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5)
  const resultQuestions: typeof pool = []

  // Fill from pool
  for (let i = 0; i < Math.min(count, shuffledPool.length); i++)
    resultQuestions.push(shuffledPool[i])

  // If count is greater than pool size, generate procedural questions
  if (count > shuffledPool.length) {
    const needed = count - shuffledPool.length
    for (let i = 0; i < needed; i++) {
      const idx = shuffledPool.length + i
      const cleanFilename = filename.substring(0, filename.lastIndexOf('.'))

      if (topicKey === 'ux') {
        resultQuestions.push({
          question: `Procedural UI/UX Quiz #${idx}: In prototyping for user test iteration ${idx + 1} (based on ${cleanFilename}), what is the main risk of using extremely high-fidelity mockups too early?`,
          options: ['Users may focus too much on small visual details like colors rather than structural workflow usability', 'The prototype runs too slow on standard servers', 'CSS compilation will fail in Vite', 'The database transaction fails to commit'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'db') {
        resultQuestions.push({
          question: `Procedural Database Quiz #${idx}: Suppose you execute an aggregate search on table 'Records_${idx}' in database context of '${cleanFilename}'. Which index type is most appropriate to optimize equality matches?`,
          options: ['B-Tree Index', 'Spatial Index', 'Full-Text Index', 'Inverted Index'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'network') {
        resultQuestions.push({
          question: `Procedural Network Quiz #${idx}: In securing web endpoint /api/v1/data/${idx} associated with '${cleanFilename}', which method is best suited to prevent brute-force authentication attacks?`,
          options: ['Implementing rate limiting and temporary IP lockout policies', 'Increasing server port number values', 'Adding a custom CSS stylesheet', 'Creating database views'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'prog') {
        const a = Math.floor(Math.random() * 20) + 1
        const b = Math.floor(Math.random() * 20) + 1
        resultQuestions.push({
          question: `Procedural Coding Quiz #${idx}: Based on ${cleanFilename} code patterns, what is the evaluated output of the JavaScript statement: \`let x = ${a} + ${b} + "px";\`?`,
          options: [`"${a + b}px"`, `"${a}${b}px"`, 'NaN', 'Error'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'science') {
        resultQuestions.push({
          question: `Procedural Science Quiz #${idx}: In a scientific context of '${cleanFilename}' with sample #${idx}, which organelle is responsible for synthesising proteins?`,
          options: ['Ribosome', 'Lysosome', 'Vacuole', 'Cytoplasm'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'math') {
        resultQuestions.push({
          question: `Procedural Math Quiz #${idx}: In solving equation set #${idx} from '${cleanFilename}', what is the value of 2 raised to the power of ${idx % 5 + 3}?`,
          options: [`${2 ** (idx % 5 + 3)}`, `${2 ** (idx % 5 + 3) + 2}`, `${2 ** (idx % 5 + 3) - 2}`, `${2 ** (idx % 5 + 3) * 2}`],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'history') {
        resultQuestions.push({
          question: `Procedural History Quiz #${idx}: Under the historical study of '${cleanFilename}', who was the leader of the Allied forces in Europe during World War II?`,
          options: ['Dwight D. Eisenhower', 'Winston Churchill', 'Franklin D. Roosevelt', 'Douglas MacArthur'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'english') {
        resultQuestions.push({
          question: `Procedural Language Quiz #${idx}: In the grammatical structure studied in '${cleanFilename}', what is the correct plural form of the word 'phenomenon'?`,
          options: ['Phenomena', 'Phenomenons', 'Phenomenas', 'Phenomenones'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'cooking') {
        resultQuestions.push({
          question: `Procedural Cooking Quiz #${idx}: In preparing a dish from the recipe file '${cleanFilename}' at step #${idx}, what does it mean to "fold" an ingredient into a batter?`,
          options: ['Gently combining a light ingredient with a heavier mixture without deflating it', 'Stirring vigorously with a whisk', 'Boiling the mixture at high heat', 'Baking the mixture for 10 minutes'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'business') {
        resultQuestions.push({
          question: `Procedural Business Quiz #${idx}: Based on marketing ideas from '${cleanFilename}', what is the term for a market structure dominated by only a small number of large sellers?`,
          options: ['Oligopoly', 'Monopoly', 'Perfect Competition', 'Monopsony'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'music') {
        resultQuestions.push({
          question: `Procedural Music & Art Quiz #${idx}: In studying art compositions in '${cleanFilename}', which term refers to the relative lightness or darkness of a color?`,
          options: ['Value', 'Hue', 'Saturation', 'Chroma'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'sports') {
        resultQuestions.push({
          question: `Procedural Sports Quiz #${idx}: In the athletic context of '${cleanFilename}', which organ system is responsible for transporting oxygen throughout the body during exercise?`,
          options: ['Cardiovascular system', 'Nervous system', 'Digestive system', 'Endocrine system'],
          correctAnswer: 0,
        })
      }
      else if (topicKey === 'geography') {
        resultQuestions.push({
          question: `Procedural Geography Quiz #${idx}: In mapping location coordinate #${idx} in '${cleanFilename}', what is the term for the imaginary line that divides the Earth into Northern and Southern hemispheres?`,
          options: ['The Equator', 'The Prime Meridian', 'The Tropic of Cancer', 'The Tropic of Capricorn'],
          correctAnswer: 0,
        })
      }
      else {
        resultQuestions.push({
          question: `Procedural General Knowledge Quiz #${idx}: Referring to the context of '${cleanFilename}', what is the boiling point of pure water in degrees Fahrenheit?`,
          options: ['212°F', '100°F', '32°F', '180°F'],
          correctAnswer: 0,
        })
      }
    }
  }

  return resultQuestions
}

async function generateQuiz() {
  if (!selectedFile.value)
    return

  const filename = selectedFile.value.name
  const baseName = filename.substring(0, filename.lastIndexOf('.'))
  const cleanTitle = baseName.replace(/[-_]/g, ' ')

  const mockQuestions = getMockQuestions(detectedTopicKey.value, filename, questionCount.value)

  const body: CreateQuizBody = {
    title: `Quiz: ${cleanTitle}`,
    description: `Auto-generated exam prep quiz from the uploaded study file "${filename}".`,
    questions: JSON.stringify(mockQuestions),
    source: filename,
  }

  try {
    const created = await quizStore.createQuiz(body)
    isGenerating.value = false
    selectedFile.value = null
    fileContentText.value = ''
    // Redirect to the newly created quiz
    router.push({ name: 'quiz-id', params: { id: created.id } })
  }
  catch (err: any) {
    generationError.value = `Failed to create quiz: ${err.message}`
    isGenerating.value = false
  }
}

function resetUpload() {
  selectedFile.value = null
  fileContentText.value = ''
  isGenerating.value = false
  generationError.value = null
}
</script>

<template>
  <VRow justify="center">
    <VCol cols="12" md="8" lg="6">
      <VCard class="pa-4">
        <template #title>
          <div class="d-flex align-center gap-2 pa-2">
            <VIcon icon="ri-ai-generate" color="primary" size="28" />
            <span class="text-h5 font-weight-bold">AI Quiz Generator</span>
          </div>
        </template>

        <VCardSubtitle class="px-4 pb-4">
          Upload your PDFs or PPTXs study materials to generate practice multiple-choice exam sheets in seconds.
        </VCardSubtitle>

        <VDivider class="mb-4" />

        <VCardText>
          <!-- Error Area -->
          <VAlert
            v-if="generationError"
            type="error"
            class="mb-4"
            closable
            @click:close="generationError = null"
          >
            {{ generationError }}
          </VAlert>

          <!-- Upload Interface -->
          <div v-if="!selectedFile && !isGenerating">
            <div
              class="drop-zone d-flex flex-column align-center justify-center py-10 px-4 cursor-pointer"
              :class="{ dragging: isDragging }"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="triggerBrowse"
            >
              <VIcon icon="ri-upload-cloud-2-line" size="64" color="primary" class="mb-4 animate-bounce" />
              <h3 class="text-h6 text-center font-weight-medium mb-1">
                Drag and drop your study files here
              </h3>
              <p class="text-caption text-medium-emphasis text-center mb-4">
                or click to browse from your device
              </p>

              <VChipGroup column class="justify-center">
                <VChip size="small" variant="flat" color="#f40000" class="text-white" label>
                  PDF
                </VChip>
                <VChip size="small" variant="flat" color="#e74c3c" class="text-white" label>
                  PPTX / PPT
                </VChip>
                <VChip size="small" variant="flat" color="#0003b4" class="text-white" label>
                  DOCX / DOC
                </VChip>
                <VChip size="small" variant="flat" color="#009f98" class="text-white" label>
                  TXT
                </VChip>
              </VChipGroup>

              <!-- Hidden input file -->
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
                @change="onFileSelect"
              >
            </div>
          </div>

          <!-- Configuration Interface -->
          <div v-else-if="selectedFile && !isGenerating" class="py-4">
            <!-- File Info Card with Premium Glassmorphism styling -->
            <VCard variant="outlined" class="file-details-card mb-6 pa-4 border-dashed rounded-lg bg-light-primary">
              <div class="d-flex align-center gap-4">
                <VIcon :icon="getFileIcon(selectedFile.name)" :color="getFileColor(selectedFile.name)" size="48" />
                <div class="flex-grow-1 text-truncate">
                  <h4 class="text-subtitle-1 font-weight-bold text-truncate mb-0">
                    {{ selectedFile.name }}
                  </h4>
                  <div class="d-flex align-center gap-2 mt-1">
                    <VChip size="x-small" :color="getFileColor(selectedFile.name)" variant="flat" label>
                      {{ selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toUpperCase() }}
                    </VChip>
                    <span class="text-caption text-medium-emphasis">
                      {{ selectedFile.size > 1024 * 1024
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(selectedFile.size / 1024).toFixed(2)} KB` }}
                    </span>
                  </div>
                </div>
                <VBtn icon="ri-close-line" variant="text" size="small" color="secondary" @click="resetUpload" />
              </div>

              <!-- Topic Detected Badge -->
              <VDivider class="my-3 border-opacity-25" />
              <div class="d-flex align-center gap-2 flex-wrap">
                <span class="text-caption text-medium-emphasis font-weight-medium">หัวข้อวิชาที่ตรวจพบ:</span>
                <VChip
                  size="small"
                  :color="detectedTopicDetails.color"
                  variant="elevated"
                  class="font-weight-bold"
                >
                  <VIcon start :icon="detectedTopicDetails.icon" size="16" class="mr-1" />
                  {{ detectedTopicDetails.name }}
                </VChip>
              </div>
            </VCard>

            <!-- Question Slider Config -->
            <div class="slider-config-container pa-5 border rounded-lg bg-surface">
              <div class="d-flex align-center gap-2 mb-4">
                <VIcon icon="ri-list-settings-line" color="primary" size="20" />
                <span class="text-subtitle-1 font-weight-bold">ตั้งค่าจำนวนข้อสอบ</span>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-6">
                เลือกจำนวนคำถามที่ต้องการให้ AI สร้างจากการอ่านเอกสารฉบับนี้ (สามารถเลือกได้ตั้งแต่ 1 ถึง 100 ข้อ)
              </p>

              <!-- Slider & Text Field Alignment -->
              <div class="d-flex align-center gap-6 py-2">
                <!-- Vue Slider-Rail -->
                <div class="flex-grow-1">
                  <VSlider
                    v-model="questionCount"
                    :min="1"
                    :max="100"
                    :step="1"
                    hide-details
                    thumb-label="always"
                    color="primary"
                    track-color="secondary"
                    class="custom-slider-rail"
                  />
                  <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-2 px-1">
                    <span>1 ข้อ</span>
                    <span>50 ข้อ</span>
                    <span>100 ข้อ</span>
                  </div>
                </div>

                <!-- Bounded Text Input -->
                <div class="text-field-container">
                  <VTextField
                    v-model.number="questionCount"
                    type="number"
                    :min="1"
                    :max="100"
                    density="compact"
                    variant="outlined"
                    suffix="ข้อ"
                    hide-details
                    class="font-weight-bold text-center-input"
                    style="inline-size: 100px;"
                    @blur="() => {
                      if (!questionCount || questionCount < 1) questionCount = 1;
                      if (questionCount > 100) questionCount = 100;
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-4 mt-6">
              <VBtn
                variant="outlined"
                color="secondary"
                class="flex-grow-1 py-6"
                @click="resetUpload"
              >
                เลือกไฟล์ใหม่
              </VBtn>

              <VBtn
                color="primary"
                class="flex-grow-1 py-6"
                @click="startSimulation"
              >
                สร้างข้อสอบ
                <VIcon end icon="ri-arrow-right-line" />
              </VBtn>
            </div>
          </div>

          <!-- Generation Interface -->
          <div v-else class="text-center py-6">
            <VIcon :icon="getFileIcon(selectedFile?.name)" :color="getFileColor(selectedFile?.name)" size="48" class="mb-3" />
            <h3 class="text-h6 font-weight-bold mb-1">
              {{ selectedFile?.name }}
            </h3>

            <!-- Topic Chip in generating state -->
            <div class="d-flex justify-center mb-3">
              <VChip
                size="small"
                :color="detectedTopicDetails.color"
                variant="flat"
                class="font-weight-medium"
              >
                <VIcon start :icon="detectedTopicDetails.icon" size="14" class="mr-1" />
                {{ detectedTopicDetails.name }}
              </VChip>
            </div>

            <p class="text-caption text-medium-emphasis mb-6">
              File Size: {{ (selectedFile?.size ?? 0) > 1024 * 1024
                ? `${((selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB`
                : `${((selectedFile?.size ?? 0) / 1024).toFixed(2)} KB` }}
              &bull; Target Questions: {{ questionCount }}
            </p>

            <!-- Upload Progress Stage -->
            <div v-if="uploadProgress < 100" class="mb-6">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Uploading study material...</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <VProgressLinear
                v-model="uploadProgress"
                color="primary"
                height="10"
                rounded
                striped
              />
            </div>

            <!-- AI Generating Stage -->
            <div v-else class="text-start max-w-400 mx-auto">
              <div class="d-flex align-center justify-center gap-3 mb-6">
                <VProgressCircular indeterminate color="primary" size="24" />
                <span class="text-subtitle-2 font-weight-bold text-primary">AI กำลังอ่านและวิเคราะห์เพื่อสร้างข้อสอบ {{ questionCount }} ข้อ...</span>
              </div>

              <v-slide-y-transition group>
                <div
                  v-for="(step, idx) in steps"
                  :key="idx"
                  class="d-flex align-center gap-2 mb-3 text-body-2"
                  :class="{
                    'text-success font-weight-medium': currentStep > idx,
                    'text-primary font-weight-bold': currentStep === idx,
                    'text-disabled': currentStep < idx,
                  }"
                >
                  <VIcon
                    :icon="currentStep > idx ? 'ri-checkbox-circle-fill' : currentStep === idx ? 'ri-play-circle-line' : 'ri-checkbox-blank-circle-line'"
                    size="18"
                    :color="currentStep > idx ? 'success' : currentStep === idx ? 'primary' : 'disabled'"
                  />
                  <span>{{ step }}</span>
                </div>
              </v-slide-y-transition>
            </div>

            <VBtn
              variant="text"
              color="error"
              size="small"
              class="mt-6"
              :disabled="uploadProgress === 100 && currentStep === steps.length"
              @click="resetUpload"
            >
              Cancel Process
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed rgb(var(--v-theme-primary) 0.35);
  border-radius: 12px;
  background: rgb(var(--v-theme-primary) 0.02);
  transition: all 0.25s ease-in-out;
}

.drop-zone:hover, .drop-zone.dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-primary) 0.06);
  box-shadow: 0 4px 20px rgb(var(--v-theme-primary) 0.1);
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.max-w-400 {
  max-inline-size: 400px;
}

.border-dashed {
  border-style: dashed !important;
  border-color: rgb(var(--v-theme-primary) 0.3) !important;
}

.bg-light-primary {
  background-color: rgb(var(--v-theme-primary) 0.04) !important;
}

.text-center-input :deep(input) {
  text-align: center;
}

.custom-slider-rail :deep(.v-slider-track__background) {
  opacity: 0.2;
}

.custom-slider-rail :deep(.v-slider-track__fill) {
  background: #ffb347 !important;
}

.file-details-card {
  transition: all 0.3s ease;
}

.file-details-card:hover {
  background-color: rgb(var(--v-theme-primary) 0.08) !important;
  transform: translateY(-2px);
}
</style>

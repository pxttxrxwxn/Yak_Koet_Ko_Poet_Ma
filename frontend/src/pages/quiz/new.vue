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
  if (!filename) return 'ri-file-text-line'
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.pdf') return 'ri-file-pdf-fill'
  if (ext === '.pptx' || ext === '.ppt') return 'ri-file-ppt-fill'
  if (ext === '.docx' || ext === '.doc') return 'ri-file-word-fill'
  return 'ri-file-text-fill'
}

function getFileColor(filename: string | undefined): string {
  if (!filename) return 'secondary'
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase()
  if (ext === '.pdf') return 'error'
  if (ext === '.pptx' || ext === '.ppt') return 'warning'
  if (ext === '.docx' || ext === '.doc') return 'info'
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
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0])
  }
}

function triggerBrowse() {
  fileInput.value?.click()
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

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
  // Do not start simulation immediately, let user configure questions count first
}

function startSimulation() {
  isGenerating.value = true
  uploadProgress.value = 0
  currentStep.value = 0

  // 1. Simulate file upload progress
  const uploadInterval = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 10
    } else {
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
    } else {
      clearInterval(stepInterval)
      // 3. Generate Quiz and submit to API
      await generateQuiz()
    }
  }, 1000)
}

// Mock question generator based on filename keywords
function getMockQuestions(filename: string, count: number) {
  const name = filename.toLowerCase()
  let pool: Array<{question: string, options: string[], correctAnswer: number}> = []
  
  if (name.includes('ux') || name.includes('ui') || name.includes('design') || name.includes('experience')) {
    pool = [
      {
        question: 'What does UX stand for in the context of product design?',
        options: ['User Experience', 'User Explanation', 'User Expansion', 'Unit Extension'],
        correctAnswer: 0
      },
      {
        question: "Which of the following is one of Jakob Nielsen's 10 usability heuristics?",
        options: ['Vibrant color schemes', 'Consistency and standards', 'Infinite scroll integration', 'Complex authentication'],
        correctAnswer: 1
      },
      {
        question: 'What is the primary purpose of creating a low-fidelity wireframe?',
        options: ['To define final typography and brand colors', 'To plan layout, hierarchy, and content structure quickly', 'To write backend database models', 'To run Google SEO keyword analysis'],
        correctAnswer: 1
      },
      {
        question: 'Why is maintaining a high color contrast ratio important for UI/UX?',
        options: ['It speeds up browser rendering speeds', 'It guarantees accessibility compliance (WCAG) for users with visual impairments', 'It minimizes server data usage', 'It prevents CSS grid layout overflow errors'],
        correctAnswer: 1
      },
      {
        question: 'What is A/B testing primarily used for in UX design?',
        options: ['To compare two versions of a webpage to see which performs better', 'To compile TypeScript classes into JavaScript', 'To back up databases in two servers', 'To write unit tests for backend routers'],
        correctAnswer: 0
      },
      {
        question: "What is Fitts's Law in human-computer interaction?",
        options: ['The time to acquire a target is a function of the distance to and size of the target', 'The user memory capacity is limited to seven items', 'The speed of computing doubles every eighteen months', 'Simple designs are always better than complex ones'],
        correctAnswer: 0
      },
      {
        question: 'What is the primary purpose of creating User Personas in design?',
        options: ['To represent the goals and behaviors of a hypothesized group of users', 'To recruit employees for the design team', 'To list legal requirements for app deployment', 'To estimate development costs'],
        correctAnswer: 0
      },
      {
        question: 'What does Information Architecture (IA) focus on?',
        options: ['Structuring and organizing content so users can find information easily', 'Optimizing database schemas', 'Deploying cloud hosting servers', 'Configuring routers and firewalls'],
        correctAnswer: 0
      },
      {
        question: 'What is a "dark pattern" in UI design?',
        options: ['A user interface designed to trick users into doing things they might not want to do', 'A styling mode used in night-mode designs', 'A programming pattern used in terminal commands', 'A encryption method for database tables'],
        correctAnswer: 0
      },
      {
        question: 'What does mobile-first design prioritize?',
        options: ['Designing for smaller screens first and scaling up to larger displays', 'Developing mobile apps exclusively', 'Decreasing database connection limits', 'Minimizing backend container sizes'],
        correctAnswer: 0
      },
      {
        question: 'What is Usability Testing?',
        options: ['Evaluating a product by testing it with representative users', 'Writing unit tests for JavaScript functions', 'Checking web hosting server uptime', 'Measuring database indexing efficiency'],
        correctAnswer: 0
      },
      {
        question: 'What does "card sorting" help UX designers with?',
        options: ['Structuring menu navigation and content hierarchy', 'Sorting database rows alphabetically', 'Shuffling options in game loops', 'Bundling CSS assets in Vite'],
        correctAnswer: 0
      },
      {
        question: 'What is the recommended minimum touch target size for mobile UI elements?',
        options: ['48x48 pixels or dp', '12x12 pixels', '100x100 pixels', '5x5 pixels'],
        correctAnswer: 0
      },
      {
        question: 'What does Interaction Design (IxD) focus on?',
        options: ['Creating engaging interfaces with logical behaviors and feedback loops', 'Connecting databases to API endpoints', 'Writing backup cron jobs', 'Compiling TypeScript variables'],
        correctAnswer: 0
      },
      {
        question: 'What is the role of Visual Hierarchy in UI?',
        options: ['Guiding the user\'s attention to key elements in order of importance', 'Sorting folders in the file structure', 'Enforcing type declarations in TypeScript', 'Optimizing web crawler indexing'],
        correctAnswer: 0
      }
    ]
  } else if (name.includes('db') || name.includes('database') || name.includes('sql') || name.includes('query')) {
    pool = [
      {
        question: 'Which SQL join returns all records when there is a match in either left or right table?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
        correctAnswer: 3
      },
      {
        question: "What does the 'A' in ACID database transaction properties represent?",
        options: ['Atomicity', 'Availability', 'Authentication', 'Algorithm'],
        correctAnswer: 0
      },
      {
        question: 'What is the main operational advantage of database indexing?',
        options: ['Reduces physical server storage usage', 'Speeds up data search queries dramatically', 'Enforces strict foreign key constraints', 'Encrypts database column values'],
        correctAnswer: 1
      },
      {
        question: 'Which database normal form requires removing transitive dependencies?',
        options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
        correctAnswer: 2
      },
      {
        question: 'In NoSQL database design, what is a document-oriented database typically stored as?',
        options: ['CSV files', 'Excel Sheets', 'JSON or BSON documents', 'SQL raw tables'],
        correctAnswer: 2
      },
      {
        question: 'What is a "foreign key" constraint in a relational database?',
        options: ['A key used to link two tables together and enforce referential integrity', 'An encrypted field in user passwords', 'A key used for indexing API endpoints', 'A command used to access external servers'],
        correctAnswer: 0
      },
      {
        question: 'What does a database transaction log record?',
        options: ['All modifications made to the database before they are permanently written', 'A list of registered developers', 'The layout style changes of the web app', 'The CPU utilization history of the database cluster'],
        correctAnswer: 0
      },
      {
        question: 'What is the primary function of the SQL GROUP BY clause?',
        options: ['To group rows that have the same values into summary rows', 'To join two tables horizontally', 'To sort rows in ascending order', 'To create a backup database table'],
        correctAnswer: 0
      },
      {
        question: 'What is a database deadlock?',
        options: ['A situation where two or more transactions are waiting for each other to release locks', 'A deleted database record', 'An expired database session token', 'A database server that is powered off'],
        correctAnswer: 0
      },
      {
        question: 'In database scaling, what is sharding?',
        options: ['Horizontal partitioning of data across multiple database instances', 'Duplicating database tables for backup', 'Creating memory cache buffers', 'Adding secondary indexes to a column'],
        correctAnswer: 0
      },
      {
        question: 'Which SQL clause is used to filter aggregate data after grouping?',
        options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
        correctAnswer: 0
      },
      {
        question: 'What does a database trigger do?',
        options: ['Executes a set of SQL commands automatically in response to certain events on a table', 'Speeds up server boots', 'Triggers a webhook call to external domains', 'Initializes database schemas on app load'],
        correctAnswer: 0
      },
      {
        question: 'What is database denormalization?',
        options: ['Adding redundant data intentionally to improve read query performance', 'Normalizing tables to 3NF', 'Splitting tables into micro-tables', 'Encrypting schema declarations'],
        correctAnswer: 0
      },
      {
        question: 'What does the "I" in ACID database properties stand for?',
        options: ['Isolation', 'Index', 'Integrity', 'Intersection'],
        correctAnswer: 0
      },
      {
        question: 'Which storage engine in MySQL supports ACID transactions and foreign keys by default?',
        options: ['InnoDB', 'MyISAM', 'Memory', 'CSV'],
        correctAnswer: 0
      }
    ]
  } else if (name.includes('network') || name.includes('security') || name.includes('internet') || name.includes('http')) {
    pool = [
      {
        question: 'Which layer of the standard OSI model is responsible for routing packets across networks?',
        options: ['Physical Layer', 'Data Link Layer', 'Network Layer', 'Transport Layer'],
        correctAnswer: 2
      },
      {
        question: 'What protocol runs on secure web port 443 by default?',
        options: ['HTTP', 'HTTPS', 'FTP', 'SSH'],
        correctAnswer: 1
      },
      {
        question: 'What is the primary function of the Domain Name System (DNS)?',
        options: ['To map user-friendly domain names to numeric IP addresses', 'To serve HTML files to clients', 'To distribute web server loads', 'To route packets through subnets'],
        correctAnswer: 0
      },
      {
        question: 'Which HTTP status code represents an "Unauthorized" client access error?',
        options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
        correctAnswer: 1
      },
      {
        question: 'What is a DDoS attack designed to achieve?',
        options: ['To steal database credentials', 'To overwhelm a server with traffic, making it unavailable to users', 'To bypass firewall rules', 'To infect files with malware'],
        correctAnswer: 1
      },
      {
        question: 'Which Transport Layer protocol guarantees delivery of packets through handshakes?',
        options: ['TCP', 'UDP', 'ICMP', 'IP'],
        correctAnswer: 0
      },
      {
        question: 'What is a SQL Injection (SQLi) vulnerability?',
        options: ['An attack where malicious SQL statements are inserted into entry fields for execution', 'A database indexing crash', 'An unauthorized export of table logs', 'An administrative access command'],
        correctAnswer: 0
      },
      {
        question: 'What is the main function of a network Firewall?',
        options: ['To monitor and filter incoming and outgoing traffic based on security rules', 'To host web server pages', 'To cache static image files', 'To assign dynamic IP addresses'],
        correctAnswer: 0
      },
      {
        question: 'What does the "S" in HTTPS stand for?',
        options: ['Secure', 'Speed', 'Socket', 'System'],
        correctAnswer: 0
      },
      {
        question: 'What happens in a Man-in-the-Middle (MitM) security attack?',
        options: ['An attacker intercepts and relays communications between two parties who believe they are talking directly', 'A server CPU spikes to 100% capacity', 'A database lock gets released early', 'A domain name mapping expires'],
        correctAnswer: 0
      },
      {
        question: 'What is the core purpose of public-key cryptography (asymmetric encryption)?',
        options: ['To encrypt data with a public key such that only the matching private key can decrypt it', 'To share passwords openly on Github', 'To index search engines faster', 'To speed up TLS handshakes'],
        correctAnswer: 0
      },
      {
        question: 'What is a Virtual Private Network (VPN) primarily used for?',
        options: ['Creating an encrypted, secure connection over a less secure network like the internet', 'Hosting web pages locally', 'Scaling up database memory storage', 'Caching CDN assets at the edge'],
        correctAnswer: 0
      },
      {
        question: 'Which HTTP method is standard for sending user passwords during authentication?',
        options: ['POST', 'GET', 'HEAD', 'OPTIONS'],
        correctAnswer: 0
      },
      {
        question: 'What is CORS in the context of modern web browsers?',
        options: ['Cross-Origin Resource Sharing', 'Cache Object Routing System', 'Common Object Request Services', 'Client Options Recovery Setup'],
        correctAnswer: 0
      },
      {
        question: 'What is Phishing?',
        options: ['A deceptive practice to steal credentials/sensitive data by posing as a trustworthy entity', 'A technique to index code comments', 'A method of automated regression testing', 'A system deployment script'],
        correctAnswer: 0
      }
    ]
  } else if (name.includes('prog') || name.includes('code') || name.includes('python') || name.includes('javascript') || name.includes('js') || name.includes('ts')) {
    pool = [
      {
        question: 'What is a closure in modern JavaScript?',
        options: ['A function combined with its lexical surrounding state scope', 'A method to forcefully break out of a loop', 'A secure API gateway routing system', 'A style declaration in CSS preprocessors'],
        correctAnswer: 0
      },
      {
        question: 'Which data structure follows a Last-In, First-Out (LIFO) operational protocol?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Search Tree'],
        correctAnswer: 1
      },
      {
        question: 'What is the evaluated output of `typeof null` in standard JavaScript runtime?',
        options: ["'null'", "'undefined'", "'object'", "'string'"],
        correctAnswer: 2
      },
      {
        question: 'What does the JavaScript `async` keyword prepended to a function definition guarantee?',
        options: ['The function block executes synchronously', 'The function implicitly returns a Promise', 'The function runs on a separate worker thread', 'The function overrides parent class methods'],
        correctAnswer: 1
      },
      {
        question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST) on average?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1
      },
      {
        question: 'What is the key functional difference between double equals (==) and triple equals (===) in JavaScript?',
        options: ['=== checks both value and type equality, whereas == performs type coercion before comparison', '== checks strict equality, === checks loose equality', '=== only works for primitive data strings', '== compiles faster than ==='],
        correctAnswer: 0
      },
      {
        question: 'What does the `__init__` method represent in Python classes?',
        options: ['An initializer/constructor method that runs when an object is instantiated', 'An index setup decorator', 'A method to delete variables', 'A library import command'],
        correctAnswer: 0
      },
      {
        question: 'What is a software Memory Leak?',
        options: ['A condition where a program fails to release discarded memory resources, leading to potential exhaustion', 'A database backup file failure', 'An unauthorized export of server logs', 'A slow disk write rate'],
        correctAnswer: 0
      },
      {
        question: 'What does the array `map()` method do in modern JavaScript?',
        options: ['Creates a new array populated with the results of calling a function on every element', 'Reorders/sorts elements in place', 'Filters out elements failing a condition', 'Reduces the array to a single value'],
        correctAnswer: 0
      },
      {
        question: 'What is Recursion in computer science?',
        options: ['A programming technique where a function calls itself directly or indirectly', 'A loop that never terminates', 'An import statement referencing external packages', 'A style sheet reset helper'],
        correctAnswer: 0
      },
      {
        question: 'What is the main role of interfaces in TypeScript?',
        options: ['To define type shapes and structural contracts for compile-time checking', 'To handle express database queries', 'To compile SCSS files into CSS stylesheet', 'To register route URLs in servers'],
        correctAnswer: 0
      },
      {
        question: 'What is runtime Garbage Collection (GC)?',
        options: ['An automatic memory management system that reclaims allocated memory no longer referenced', 'A deletion of temporary scratch files', 'A lint rules checking step', 'A security scan script'],
        correctAnswer: 0
      },
      {
        question: 'In Git version control, what does `cherry-pick` do?',
        options: ['Applies changes from a specific commit of another branch onto the current branch', 'Deletes local branches completely', 'Clones a remote repo into subfolders', 'Merges pull requests into main'],
        correctAnswer: 0
      },
      {
        question: 'What does `Promise.all` guarantee?',
        options: ['Returns a single Promise that resolves when all input promises resolve, or rejects if any rejects', 'Runs promises one by one sequentially', 'Runs promises in worker threads', 'Retries failed requests up to 3 times'],
        correctAnswer: 0
      },
      {
        question: 'What is the average-case time complexity of sorting an array using QuickSort?',
        options: ['O(n log n)', 'O(n^2)', 'O(log n)', 'O(n)'],
        correctAnswer: 0
      }
    ]
  } else if (name.includes('science') || name.includes('bio') || name.includes('physic') || name.includes('chem')) {
    pool = [
      {
        question: 'Which intracellular organelle is colloquially referred to as the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'],
        correctAnswer: 2
      },
      {
        question: 'What is the chemical symbol of the element Gold?',
        options: ['Gd', 'Go', 'Ag', 'Au'],
        correctAnswer: 3
      },
      {
        question: 'What atmospheric gas do plants primarily absorb during the process of photosynthesis?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen Gas', 'Hydrogen Gas'],
        correctAnswer: 1
      },
      {
        question: 'What is the approximate speed of light travelling in a vacuum environment?',
        options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
        correctAnswer: 0
      },
      {
        question: 'What is the approximate pH level of pure distilled water at room temperature?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2
      },
      {
        question: "What is the most abundant gas in Earth's atmosphere by volume percentage?",
        options: ['Nitrogen (approx. 78%)', 'Oxygen (approx. 21%)', 'Argon (approx. 0.9%)', 'Carbon Dioxide'],
        correctAnswer: 0
      },
      {
        question: 'What physical force pulls objects towards the physical center of the Earth?',
        options: ['Gravity', 'Electromagnetism', 'Strong Nuclear Force', 'Centrifugal Force'],
        correctAnswer: 0
      },
      {
        question: 'Which human organ is responsible for pumping blood throughout the circulatory system?',
        options: ['Heart', 'Brain', 'Lungs', 'Liver'],
        correctAnswer: 0
      },
      {
        question: 'What is the chemical formula for water?',
        options: ['H2O', 'CO2', 'O2', 'NaCl'],
        correctAnswer: 0
      },
      {
        question: 'What are the classic three states of matter commonly found on Earth?',
        options: ['Solid, Liquid, Gas', 'Solid, Liquid, Plasma', 'Plasma, Quark, Gas', 'Gas, Liquid, Energy'],
        correctAnswer: 0
      },
      {
        question: 'Which planet in our solar system is widely referred to as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter', 'Mercury'],
        correctAnswer: 0
      },
      {
        question: 'What is the process of a liquid turning into a gaseous state called?',
        options: ['Evaporation', 'Condensation', 'Sublimation', 'Freezing'],
        correctAnswer: 0
      },
      {
        question: 'Which scientist formulated the laws of motion and universal gravitation?',
        options: ['Sir Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Marie Curie'],
        correctAnswer: 0
      },
      {
        question: 'What is the fundamental molecular unit of genetic inheritance in living organisms?',
        options: ['Gene', 'Protein', 'Cell', 'Chromosome'],
        correctAnswer: 0
      },
      {
        question: 'What is the primary source of thermal and light energy for Earth?',
        options: ['The Sun', 'Earth\'s Core', 'Moonlight', 'Atmospheric Friction'],
        correctAnswer: 0
      }
    ]
  } else {
    // Default general knowledge / web development questions
    pool = [
      {
        question: 'Who is the author and creator of the Vue.js JavaScript framework?',
        options: ['Evan You', 'Dan Abramov', 'Rich Harris', 'Jordan Walke'],
        correctAnswer: 0
      },
      {
        question: 'What is Hono in the modern Javascript web development ecosystem?',
        options: ['A database object-relational mapper (ORM)', 'A lightweight, fast, and multi-runtime web framework', 'A frontend component styling design system', 'A build bundle bundler tool'],
        correctAnswer: 1
      },
      {
        question: 'Which Cloudflare service provides key-value data storage at the edge?',
        options: ['Cloudflare D1', 'Cloudflare Workers KV', 'Cloudflare Pages', 'Cloudflare R2'],
        correctAnswer: 1
      },
      {
        question: 'What is the default port for local development servers using Vite?',
        options: ['3000', '8080', '5173', '8787'],
        correctAnswer: 2
      },
      {
        question: 'Which architecture separating layers of concern is implemented in this template backend?',
        options: ['MVC Architecture', 'Monolithic Spaghetti Design', 'Clean Architecture', 'Microservices Distributed System'],
        correctAnswer: 2
      },
      {
        question: 'What does CSS stand for in web styling?',
        options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Structure', 'Complex Style Sheets'],
        correctAnswer: 0
      },
      {
        question: 'Which HTML tag is used to reference external JavaScript code files?',
        options: ['<script>', '<link>', '<js>', '<code-source>'],
        correctAnswer: 0
      },
      {
        question: 'What is the Document Object Model (DOM) in web development?',
        options: ['An interface/programming API representing HTML/XML documents as nodes in a tree structure', 'A hosting repository standard', 'A database relational table setup', 'A stylesheets preprocessor'],
        correctAnswer: 0
      },
      {
        question: 'What is a Progressive Web App (PWA)?',
        options: ['A web app that utilizes modern capabilities to deliver an app-like experience to users', 'An application compiled to assembly language', 'A database that scales dynamically at runtime', 'A stylesheet designed with Tailwind CSS'],
        correctAnswer: 0
      },
      {
        question: 'What is npm?',
        options: ['Node Package Manager', 'Network Protocol Method', 'Node Process Monitor', 'New Product Marketplace'],
        correctAnswer: 0
      },
      {
        question: 'What does the HTTP status code 404 signify?',
        options: ['The server could not find the requested resource path', 'The request was unauthorized', 'The request was forbidden by admin rules', 'An internal server error occurred'],
        correctAnswer: 0
      },
      {
        question: 'What is the primary benefit of writing Semantic HTML elements?',
        options: ['It defines meaning clearly for both browser interpreters and accessibility screen readers', 'It speeds up page load times dramatically', 'It encrypts form submissions automatically', 'It prevents CSS grid styling overrides'],
        correctAnswer: 0
      },
      {
        question: 'What is the role of tools like Vite or Webpack in modern setups?',
        options: ['To bundle assets/modules and provide development server utilities', 'To run PostgreSQL databases', 'To deploy physical server hardware', 'To compile Python backend scripts'],
        correctAnswer: 0
      },
      {
        question: 'What does SSR stand for in single page application frameworks?',
        options: ['Server-Side Rendering', 'Secure Socket Routing', 'Simple Search Result', 'System Storage Recovery'],
        correctAnswer: 0
      },
      {
        question: 'Which CSS layout system is optimized for one-dimensional layouts?',
        options: ['Flexbox', 'CSS Grid', 'Float layout', 'Absolute positioning'],
        correctAnswer: 0
      }
    ]
  }

  // Shuffle the base pool to introduce variety
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5)
  const resultQuestions: typeof pool = []

  // Fill from pool
  for (let i = 0; i < Math.min(count, shuffledPool.length); i++) {
    resultQuestions.push(shuffledPool[i])
  }

  // If count is greater than pool size, generate procedural questions
  if (count > shuffledPool.length) {
    const needed = count - shuffledPool.length
    for (let i = 0; i < needed; i++) {
      const idx = shuffledPool.length + i
      if (name.includes('ux') || name.includes('ui') || name.includes('design') || name.includes('experience')) {
        resultQuestions.push({
          question: `Procedural UI/UX Quiz #${idx}: In prototyping for user test iteration ${idx + 1}, what is the main risk of using extremely high-fidelity mockups too early?`,
          options: ['Users may focus too much on small visual details like colors rather than structural workflow usability', 'The prototype runs too slow on standard servers', 'CSS compilation will fail in Vite', 'The database transaction fails to commit'],
          correctAnswer: 0
        })
      } else if (name.includes('db') || name.includes('database') || name.includes('sql') || name.includes('query')) {
        resultQuestions.push({
          question: `Procedural Database Quiz #${idx}: Suppose you execute an aggregate search on table 'Records_${idx}'. Which index type is most appropriate to optimize equality matches?`,
          options: ['B-Tree Index', 'Spatial Index', 'Full-Text Index', 'Inverted Index'],
          correctAnswer: 0
        })
      } else if (name.includes('network') || name.includes('security') || name.includes('internet') || name.includes('http')) {
        resultQuestions.push({
          question: `Procedural Network Quiz #${idx}: In securing web endpoint /api/v1/data/${idx}, which method is best suited to prevent brute-force authentication attacks?`,
          options: ['Implementing rate limiting and temporary IP lockout policies', 'Increasing server port number values', 'Adding a custom CSS stylesheet', 'Creating database views'],
          correctAnswer: 0
        })
      } else if (name.includes('prog') || name.includes('code') || name.includes('python') || name.includes('javascript') || name.includes('js') || name.includes('ts')) {
        const a = Math.floor(Math.random() * 20) + 1
        const b = Math.floor(Math.random() * 20) + 1
        resultQuestions.push({
          question: `Procedural Coding Quiz #${idx}: What is the evaluated output of the JavaScript statement: \`let x = ${a} + ${b} + "px";\`?`,
          options: [`"${a + b}px"`, `"${a}${b}px"`, `NaN`, `Error`],
          correctAnswer: 0
        })
      } else if (name.includes('science') || name.includes('bio') || name.includes('physic') || name.includes('chem')) {
        resultQuestions.push({
          question: `Procedural Science Quiz #${idx}: In a biological study with cell sample #${idx}, what organelle is key for synthesized proteins?`,
          options: ['Ribosome', 'Lysosome', 'Vacuole', 'Cytoplasm'],
          correctAnswer: 0
        })
      } else {
        resultQuestions.push({
          question: `Procedural Web Dev Quiz #${idx}: When managing state values in a complex component workspace #${idx}, which hook pattern is best for centralized reactive state?`,
          options: ['Pinia Store or Vue ref/reactive global state', 'Raw Window variable declarations', 'Locally stored CSV sheets', 'Writing raw HTML elements to document body'],
          correctAnswer: 0
        })
      }
    }
  }

  return resultQuestions
}

async function generateQuiz() {
  if (!selectedFile.value) return

  const filename = selectedFile.value.name
  const baseName = filename.substring(0, filename.lastIndexOf('.'))
  const cleanTitle = baseName.replace(/[-_]/g, ' ')
  
  const mockQuestions = getMockQuestions(filename, questionCount.value)
  
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
    // Redirect to the newly created quiz
    router.push({ name: 'quiz-id', params: { id: created.id } })
  } catch (err: any) {
    generationError.value = `Failed to create quiz: ${err.message}`
    isGenerating.value = false
  }
}

function resetUpload() {
  selectedFile.value = null
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
              :class="{ 'dragging': isDragging }"
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
                <VChip size="small" variant="flat" color="primary" label>PDF</VChip>
                <VChip size="small" variant="flat" color="warning" label>PPTX / PPT</VChip>
                <VChip size="small" variant="flat" color="info" label>DOCX / DOC</VChip>
                <VChip size="small" variant="flat" color="secondary" label>TXT</VChip>
              </VChipGroup>

              <!-- Hidden input file -->
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
                @change="onFileSelect"
              />
            </div>
          </div>

          <!-- Configuration Interface -->
          <div v-else-if="selectedFile && !isGenerating" class="py-4">
            <!-- File Info Card with Premium Glassmorphism styling -->
            <VCard variant="outlined" class="file-details-card mb-6 pa-4 border-dashed rounded-lg bg-light-primary">
              <div class="d-flex align-center gap-4">
                <VIcon :icon="getFileIcon(selectedFile.name)" :color="getFileColor(selectedFile.name)" size="48" />
                <div class="flex-grow-1 text-truncate">
                  <h4 class="text-subtitle-1 font-weight-bold text-truncate mb-0">{{ selectedFile.name }}</h4>
                  <div class="d-flex align-center gap-2 mt-1">
                    <VChip size="x-small" :color="getFileColor(selectedFile.name)" variant="flat" label>
                      {{ selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toUpperCase() }}
                    </VChip>
                    <span class="text-caption text-medium-emphasis">
                      {{ selectedFile.size > 1024 * 1024 
                        ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
                        : (selectedFile.size / 1024).toFixed(2) + ' KB' }}
                    </span>
                  </div>
                </div>
                <VBtn icon="ri-close-line" variant="text" size="small" color="secondary" @click="resetUpload" />
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
                    style="width: 100px;"
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
            <h3 class="text-h6 font-weight-bold mb-1">{{ selectedFile?.name }}</h3>
            <p class="text-caption text-medium-emphasis mb-6">
              File Size: {{ (selectedFile?.size ?? 0) > 1024 * 1024 
                ? ((selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(2) + ' MB'
                : ((selectedFile?.size ?? 0) / 1024).toFixed(2) + ' KB' }}
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
                    'text-disabled': currentStep < idx 
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
  border: 2px dashed rgba(var(--v-theme-primary), 0.35);
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.02);
  transition: all 0.25s ease-in-out;
}

.drop-zone:hover, .drop-zone.dragging {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.1);
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
  max-width: 400px;
}

.border-dashed {
  border-style: dashed !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.bg-light-primary {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.text-center-input :deep(input) {
  text-align: center;
}

.custom-slider-rail :deep(.v-slider-track__background) {
  opacity: 0.2;
}

.file-details-card {
  transition: all 0.3s ease;
}

.file-details-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateY(-2px);
}
</style>

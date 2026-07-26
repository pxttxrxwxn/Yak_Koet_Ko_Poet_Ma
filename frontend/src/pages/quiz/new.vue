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

const fileInput = ref<HTMLInputElement | null>(null)

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
  startSimulation()
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
function getMockQuestions(filename: string) {
  const name = filename.toLowerCase()
  
  if (name.includes('ux') || name.includes('ui') || name.includes('design') || name.includes('experience')) {
    return [
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
      }
    ]
  }
  
  if (name.includes('db') || name.includes('database') || name.includes('sql') || name.includes('query')) {
    return [
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
      }
    ]
  }

  if (name.includes('network') || name.includes('security') || name.includes('internet') || name.includes('http')) {
    return [
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
        options: ['To map user-friendly domain names to numeric IP addresses', 'To serve HTML files to clients', 'To distribute web server loads'],
        correctAnswer: 1
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
      }
    ]
  }

  if (name.includes('prog') || name.includes('code') || name.includes('python') || name.includes('javascript') || name.includes('js') || name.includes('ts')) {
    return [
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
      }
    ]
  }

  if (name.includes('science') || name.includes('bio') || name.includes('physic') || name.includes('chem')) {
    return [
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
      }
    ]
  }

  // Default general knowledge / web development questions
  return [
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
    }
  ]
}

async function generateQuiz() {
  if (!selectedFile.value) return

  const filename = selectedFile.value.name
  const baseName = filename.substring(0, filename.lastIndexOf('.'))
  const cleanTitle = baseName.replace(/[-_]/g, ' ')
  
  const mockQuestions = getMockQuestions(filename)
  
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
          <div v-if="!isGenerating && !selectedFile">
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

          <!-- Generation Interface -->
          <div v-else class="text-center py-6">
            <VIcon icon="ri-file-text-line" color="primary" size="48" class="mb-3" />
            <h3 class="text-h6 font-weight-bold mb-1">{{ selectedFile?.name }}</h3>
            <p class="text-caption text-medium-emphasis mb-6">
              File Size: {{ (selectedFile?.size ?? 0) > 1024 * 1024 
                ? ((selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(2) + ' MB'
                : ((selectedFile?.size ?? 0) / 1024).toFixed(2) + ' KB' }}
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
                <span class="text-subtitle-2 font-weight-bold text-primary">AI is analyzing and generating...</span>
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
</style>

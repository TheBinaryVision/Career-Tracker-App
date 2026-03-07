// ============================================================
//  roadmap-data.js — FULL SYLLABUS VERSION
//  Every skill has topics, every topic has subtopics (checklist)
//  Structure: Phase > Skill > Topics > Subtopics
// ============================================================

const PHASES = [
  {
    id: 1, emoji: '🧱', title: 'Foundation', duration: 'Month 1–2', color: '#3b82f6',
    goal: 'Learn to think like a developer',
    skills: [
      {
        name: 'HTML & CSS',
        desc: 'Build and style web pages',
        time: '2 weeks',
        topics: [
          {
            name: 'HTML Basics',
            subtopics: [
              'What is HTML & how browsers work',
              'HTML document structure (DOCTYPE, html, head, body)',
              'Headings: h1–h6',
              'Paragraphs, spans, divs',
              'Links: a tag',
              'Images: img tag',
              'Lists: ul, ol, li',
              'Tables: table, tr, td, th',
              'Forms: input, textarea, button, select',
              'Semantic tags: header, nav, main, section, article, footer',
              'HTML attributes (id, class, style, data-*)',
              'HTML comments',
            ]
          },
          {
            name: 'CSS Basics',
            subtopics: [
              'What is CSS & how to link it',
              'Selectors: element, class, id, universal',
              'Colors: named, hex, rgb, hsl',
              'Typography: font-size, font-family, font-weight, line-height',
              'Box model: margin, padding, border, width, height',
              'Background: color, image, repeat, size',
              'Display: block, inline, inline-block, none',
              'Visibility & opacity',
              'CSS comments',
              'CSS variables (--custom-property)',
            ]
          },
          {
            name: 'CSS Layout',
            subtopics: [
              'Position: static, relative, absolute, fixed, sticky',
              'Float & clear (legacy — know it exists)',
              'Flexbox: display:flex, flex-direction, justify-content, align-items, flex-wrap, gap',
              'CSS Grid: grid-template-columns, grid-template-rows, grid-gap, grid-area',
              'z-index & stacking context',
              'Overflow: hidden, scroll, auto',
            ]
          },
          {
            name: 'CSS Responsive Design',
            subtopics: [
              'What is responsive design',
              'Media queries: @media (max-width: ...)',
              'Mobile-first vs desktop-first',
              'Viewport meta tag',
              'Relative units: %, vw, vh, em, rem',
              'Responsive images',
              'CSS transitions: transition property',
              'CSS animations: @keyframes, animation',
            ]
          },
          {
            name: 'Practice Project',
            subtopics: [
              'Build a static personal portfolio page',
              'Make it fully responsive on mobile',
              'Deploy it on Netlify',
            ]
          }
        ]
      },
      {
        name: 'JavaScript Basics',
        desc: 'Variables, functions, logic, DOM',
        time: '3 weeks',
        topics: [
          {
            name: 'JS Fundamentals',
            subtopics: [
              'What is JavaScript & how it runs in browser',
              'Variables: var, let, const — differences',
              'Data types: string, number, boolean, null, undefined, object, array',
              'Operators: arithmetic, comparison, logical, assignment',
              'String methods: length, slice, split, join, includes, replace, toUpperCase',
              'Number methods: toFixed, parseInt, parseFloat, Math.round, Math.random',
              'Type coercion & typeof',
              'Template literals (backticks)',
              'Comments: // and /* */',
            ]
          },
          {
            name: 'Control Flow',
            subtopics: [
              'if / else if / else',
              'Ternary operator',
              'Switch statement',
              'for loop',
              'while loop',
              'do...while loop',
              'for...of loop (arrays)',
              'for...in loop (objects)',
              'break & continue',
            ]
          },
          {
            name: 'Functions',
            subtopics: [
              'Function declaration vs expression',
              'Parameters & arguments',
              'Return values',
              'Arrow functions: () => {}',
              'Default parameters',
              'Rest parameters (...args)',
              'Scope: global, local, block',
              'Hoisting',
              'Closures (basic understanding)',
              'Callback functions',
            ]
          },
          {
            name: 'Arrays & Objects',
            subtopics: [
              'Array creation & access',
              'Array methods: push, pop, shift, unshift, splice, slice',
              'Array methods: map, filter, reduce, find, findIndex, some, every',
              'Array spread operator [...arr]',
              'Object creation & access',
              'Object methods: Object.keys, Object.values, Object.entries',
              'Object spread: {...obj}',
              'Destructuring: arrays and objects',
              'Nested objects & arrays',
              'JSON: JSON.stringify, JSON.parse',
            ]
          },
          {
            name: 'DOM Manipulation',
            subtopics: [
              'What is the DOM',
              'Selecting elements: getElementById, querySelector, querySelectorAll',
              'Reading & changing content: innerHTML, textContent',
              'Changing styles: element.style',
              'Adding & removing classes: classList.add, remove, toggle',
              'Creating elements: createElement, appendChild, removeChild',
              'Event listeners: addEventListener (click, input, submit, keydown)',
              'Event object: e.target, e.preventDefault',
              'Form data: getting input values',
            ]
          },
          {
            name: 'Async JavaScript',
            subtopics: [
              'What is asynchronous code',
              'setTimeout & setInterval',
              'Promises: .then, .catch, .finally',
              'async / await',
              'try / catch / finally for error handling',
              'fetch API: GET request',
              'fetch API: POST request with body & headers',
              'Working with JSON responses',
            ]
          },
          {
            name: 'ES6+ Modern JS',
            subtopics: [
              'Modules: import / export (ESM)',
              'Optional chaining: obj?.property',
              'Nullish coalescing: value ?? fallback',
              'Logical assignment: ||=, &&=, ??=',
              'Symbol type (basic)',
              'Map & Set data structures',
            ]
          },
          {
            name: 'Practice Projects',
            subtopics: [
              'Build a to-do list app (vanilla JS)',
              'Build a weather app using OpenWeatherMap API',
              'Build a quiz app with score tracking',
            ]
          }
        ]
      },
      {
        name: 'Git & GitHub',
        desc: 'Save and share your code',
        time: '3 days',
        topics: [
          {
            name: 'Git Basics',
            subtopics: [
              'What is version control & why it matters',
              'Install Git on Windows',
              'git config (name & email setup)',
              'git init — initialize a repo',
              'git status — see what changed',
              'git add — stage files',
              'git commit -m "message" — save a snapshot',
              'git log — view history',
              'git diff — see changes',
              '.gitignore — ignoring files',
            ]
          },
          {
            name: 'Branching & Merging',
            subtopics: [
              'git branch — create & list branches',
              'git checkout / git switch — change branches',
              'git merge — combine branches',
              'Merge conflicts — what they are & how to resolve',
              'git stash — temporarily save uncommitted work',
            ]
          },
          {
            name: 'GitHub',
            subtopics: [
              'Create a GitHub account',
              'Create a repository on GitHub',
              'git remote add origin <url>',
              'git push — upload your code',
              'git pull — download latest changes',
              'git clone — copy a repo locally',
              'README.md — what it is & how to write one',
              'GitHub Pages — deploy a static site for free',
              'Pull Requests (PRs) — basic understanding',
              'Forking a repository',
            ]
          }
        ]
      },
      {
        name: 'Command Line',
        desc: 'Navigate your computer like a developer',
        time: '2 days',
        topics: [
          {
            name: 'Terminal Basics',
            subtopics: [
              'Open Command Prompt & PowerShell on Windows',
              'pwd / cd — print & change directory',
              'ls / dir — list files',
              'mkdir — make a folder',
              'rm / del — delete a file',
              'cp / copy — copy files',
              'mv / move — move or rename files',
              'clear / cls — clear terminal',
              'Tab autocomplete',
              'Up arrow — previous commands history',
              'Running scripts: node file.js, python file.py',
              'Install WSL (Windows Subsystem for Linux) — recommended',
            ]
          }
        ]
      }
    ],
    project: 'Build your personal portfolio website',
    milestone: 'You can build a real webpage from scratch',
    resources: [
      { name: '🆓 The Odin Project', url: 'https://www.theodinproject.com' },
      { name: '🆓 freeCodeCamp', url: 'https://www.freecodecamp.org' },
      { name: '🆓 MDN Web Docs', url: 'https://developer.mozilla.org' },
      { name: '🆓 JavaScript.info', url: 'https://javascript.info' },
    ]
  },

  {
    id: 2, emoji: '⚛️', title: 'Frontend', duration: 'Month 3–4', color: '#06b6d4',
    goal: 'Build beautiful, interactive apps',
    skills: [
      {
        name: 'React.js',
        desc: "World's most popular UI framework",
        time: '4 weeks',
        topics: [
          {
            name: 'React Fundamentals',
            subtopics: [
              'What is React & why use it (Virtual DOM)',
              'Create React App vs Vite setup',
              'JSX — writing HTML inside JavaScript',
              'JSX rules: className, self-closing tags, expressions {}',
              'Components: function components',
              'Props — passing data into components',
              'Props destructuring',
              'Children prop',
              'Rendering lists with Array.map()',
              'Conditional rendering: && and ternary',
              'Keys in lists — why they matter',
              'Fragments: <> </>',
            ]
          },
          {
            name: 'React Hooks',
            subtopics: [
              'useState — state variables',
              'Updating state: value form & function form',
              'useEffect — side effects & lifecycle',
              'useEffect dependency array',
              'useEffect cleanup function',
              'useRef — DOM references & mutable values',
              'useContext — global state basics',
              'useMemo — memoizing expensive calculations',
              'useCallback — memoizing functions',
              'Custom hooks — building your own',
            ]
          },
          {
            name: 'React Patterns',
            subtopics: [
              'Lifting state up',
              'Controlled vs uncontrolled components',
              'Controlled form inputs',
              'Event handling in React',
              'Component composition',
              'Prop drilling & when to avoid it',
              'Context API for global state',
            ]
          },
          {
            name: 'React Router',
            subtopics: [
              'Install react-router-dom',
              'BrowserRouter, Routes, Route setup',
              'Link & NavLink components',
              'useNavigate hook',
              'useParams hook — dynamic routes',
              'useLocation hook',
              'Protected routes (auth guard)',
              '404 catch-all route',
            ]
          },
          {
            name: 'Practice Project',
            subtopics: [
              'Build a multi-page React app',
              'Use useState & useEffect together',
              'Fetch data from a public API',
              'Add React Router for navigation',
            ]
          }
        ]
      },
      {
        name: 'Tailwind CSS',
        desc: 'Style fast, look professional',
        time: '1 week',
        topics: [
          {
            name: 'Tailwind Core',
            subtopics: [
              'What is utility-first CSS',
              'Install Tailwind in a Vite/React project',
              'Typography: text-sm, font-bold, text-gray-500',
              'Spacing: p-4, m-2, px-6, py-3, gap-4',
              'Colors: bg-blue-500, text-white, border-gray-200',
              'Flexbox: flex, items-center, justify-between, flex-col',
              'Grid: grid, grid-cols-3, col-span-2',
              'Sizing: w-full, h-screen, max-w-lg',
              'Borders: border, rounded, rounded-lg, rounded-full',
              'Shadows: shadow, shadow-lg, shadow-xl',
              'Hover & focus states: hover:bg-blue-600, focus:ring',
              'Responsive prefixes: sm:, md:, lg:, xl:',
              'Dark mode: dark:bg-gray-900',
              'Custom config: tailwind.config.js',
            ]
          }
        ]
      },
      {
        name: 'REST APIs',
        desc: 'Connect your app to the internet',
        time: '1 week',
        topics: [
          {
            name: 'API Concepts',
            subtopics: [
              'What is an API & REST architecture',
              'HTTP methods: GET, POST, PUT, PATCH, DELETE',
              'HTTP status codes: 200, 201, 400, 401, 403, 404, 500',
              'Request headers: Content-Type, Authorization',
              'Request body & query parameters',
              'JSON format deep dive',
            ]
          },
          {
            name: 'Fetching Data in React',
            subtopics: [
              'fetch() API — GET request',
              'fetch() — POST request with JSON body',
              'Handling loading states in React',
              'Handling errors gracefully',
              'Axios library — install & use',
              'Axios vs fetch comparison',
              'API keys — .env files & security',
              'CORS — what it is and how to fix it',
            ]
          }
        ]
      },
      {
        name: 'State Management',
        desc: 'Handle complex app data',
        time: '2 weeks',
        topics: [
          {
            name: 'Advanced State',
            subtopics: [
              'Derived state — computing from existing state',
              'Reducer pattern with useReducer',
              'Context API — createContext, Provider, useContext',
              'Zustand — lightweight global state library',
              'When to use local vs global state',
              'State immutability — never mutate directly',
              'React.memo — prevent unnecessary re-renders',
              'Lazy loading: React.lazy & Suspense',
              'React DevTools — profiling performance',
            ]
          }
        ]
      }
    ],
    project: 'Build a real-time weather app using a live API',
    milestone: 'You can build interactive, data-driven web apps',
    resources: [
      { name: '🆓 React Docs (official)', url: 'https://react.dev' },
      { name: '🆓 Tailwind Docs', url: 'https://tailwindcss.com/docs' },
      { name: '🆓 Scrimba React Course', url: 'https://scrimba.com/learn/learnreact' },
    ]
  },

  {
    id: 3, emoji: '⚙️', title: 'Backend', duration: 'Month 5–6', color: '#8b5cf6',
    goal: 'Make apps live, fast & always-on',
    skills: [
      {
        name: 'Node.js + Express',
        desc: 'Build your own server and APIs',
        time: '3 weeks',
        topics: [
          {
            name: 'Node.js Fundamentals',
            subtopics: [
              'What is Node.js & how it differs from browser JS',
              'CommonJS modules: require & module.exports',
              'ES Modules in Node: import/export',
              'Built-in modules: fs, path, os, http',
              'npm — Node Package Manager',
              'package.json & package-lock.json',
              'node_modules & .gitignore',
              'npm scripts: start, dev, build',
              'nodemon — auto-restart on file changes',
              'Environment variables: process.env & dotenv',
            ]
          },
          {
            name: 'Express.js',
            subtopics: [
              'What is Express & why use it',
              'Install Express & create a server',
              'Routes: app.get, app.post, app.put, app.delete',
              'Route parameters: req.params',
              'Query strings: req.query',
              'Request body: req.body with express.json()',
              'Response methods: res.json, res.send, res.status',
              'Middleware concept',
              'Custom middleware functions',
              'Error handling middleware (4 arguments)',
              'Router: express.Router() — split routes into files',
              'CORS middleware: cors package',
              'Serving static files: express.static',
            ]
          },
          {
            name: 'REST API Design',
            subtopics: [
              'RESTful conventions & resource naming',
              'CRUD mapped to HTTP methods',
              'HTTP status codes best practices',
              'Structuring an Express project (routes/, controllers/, models/)',
              'API versioning: /api/v1/',
              'Testing APIs with Postman or Thunder Client',
            ]
          }
        ]
      },
      {
        name: 'MongoDB',
        desc: 'Store and retrieve real data',
        time: '2 weeks',
        topics: [
          {
            name: 'MongoDB Basics',
            subtopics: [
              'What is NoSQL & when to use it',
              'MongoDB Atlas — cloud setup (free tier)',
              'Collections & Documents',
              'BSON & JSON',
            ]
          },
          {
            name: 'Mongoose ODM',
            subtopics: [
              'Install Mongoose & connect to Atlas',
              'Mongoose Schema & Model',
              'CRUD: create, find, findById, findByIdAndUpdate, deleteOne',
              'Query filters & operators: $gt, $lt, $in, $or',
              'Population — references between collections',
              'Validation in Mongoose schema',
              'Indexes in MongoDB',
            ]
          },
          {
            name: 'SQL Fundamentals (PostgreSQL)',
            subtopics: [
              'What is a relational database',
              'Databases, tables, rows, columns',
              'Data types: VARCHAR, INTEGER, BOOLEAN, TIMESTAMP',
              'CREATE TABLE, INSERT INTO, SELECT, UPDATE, DELETE',
              'WHERE, ORDER BY, LIMIT clauses',
              'Primary keys & foreign keys',
              'Joins: INNER JOIN, LEFT JOIN',
              'Aggregates: COUNT, SUM, AVG, GROUP BY',
            ]
          }
        ]
      },
      {
        name: 'WebSockets',
        desc: 'Real-time: chat, live updates',
        time: '2 weeks',
        topics: [
          {
            name: 'Real-Time Concepts',
            subtopics: [
              'HTTP polling vs WebSockets vs Server-Sent Events',
              'What is a WebSocket connection',
              'When to use real-time (chat, notifications, live scores)',
            ]
          },
          {
            name: 'Socket.io',
            subtopics: [
              'Install socket.io (server) & socket.io-client (client)',
              'Server setup with Express + Socket.io',
              'io.on("connection") — handle new connections',
              'socket.emit — send event to one client',
              'io.emit — broadcast to all clients',
              'socket.on — listen for events',
              'Rooms: socket.join, io.to(room).emit',
              'socket.on("disconnect") — handle disconnects',
              'Build: real-time chat app',
              'Build: live notification system',
            ]
          }
        ]
      },
      {
        name: 'Authentication',
        desc: 'Login systems, JWT, sessions',
        time: '1 week',
        topics: [
          {
            name: 'Auth Concepts',
            subtopics: [
              'Authentication vs Authorization',
              'Password hashing with bcrypt',
              'Sessions vs Tokens',
              'What is JWT (JSON Web Token)',
              'JWT structure: header.payload.signature',
            ]
          },
          {
            name: 'Implementing Auth',
            subtopics: [
              'Register endpoint: hash password & save user',
              'Login endpoint: compare hash & issue JWT',
              'jwt.sign — create a token',
              'jwt.verify — validate a token',
              'Auth middleware — protect private routes',
              'Storing JWT: localStorage vs httpOnly cookies',
              'OAuth2 basics — Google login flow',
              'Firebase Auth as a full solution',
            ]
          }
        ]
      }
    ],
    project: 'Build a real-time chat application',
    milestone: 'You can build full apps with live data and user accounts',
    resources: [
      { name: '🆓 Node.js Docs', url: 'https://nodejs.org/en/docs' },
      { name: '🆓 Express Docs', url: 'https://expressjs.com' },
      { name: '🆓 MongoDB University', url: 'https://university.mongodb.com' },
      { name: '🆓 Socket.io Docs', url: 'https://socket.io/docs' },
    ]
  },

  {
    id: 4, emoji: '🤖', title: 'AI Integration', duration: 'Month 7–8', color: '#f59e0b',
    goal: 'Make your apps intelligent',
    skills: [
      {
        name: 'OpenAI / Claude API',
        desc: 'Add AI chat, summarization, generation',
        time: '2 weeks',
        topics: [
          {
            name: 'LLM Fundamentals',
            subtopics: [
              'What are Large Language Models (LLMs)',
              'Tokens — what they are & why they matter for cost',
              'Temperature & top_p — controlling randomness',
              'Context window — limits of memory',
              'System prompt vs user prompt',
              'OpenAI models: GPT-4o, GPT-4o-mini',
              'Anthropic Claude models: Haiku, Sonnet, Opus',
            ]
          },
          {
            name: 'OpenAI API',
            subtopics: [
              'Get OpenAI API key',
              'Install openai npm package',
              'chat.completions.create — basic call',
              'Messages array: system, user, assistant roles',
              'Streaming responses: stream: true',
              'Function calling / tool use',
              'Image generation: DALL-E API',
              'Embeddings API',
              'Rate limits & cost management',
            ]
          },
          {
            name: 'Claude (Anthropic) API',
            subtopics: [
              'Get Anthropic API key',
              'Install @anthropic-ai/sdk',
              'messages.create — basic call',
              'System prompts in Claude',
              'Streaming with Claude',
              'Tool use / function calling',
              'Vision: sending images to Claude',
              'Claude vs GPT — when to use which',
            ]
          },
          {
            name: 'Practice',
            subtopics: [
              'Build an AI chatbot with conversation history',
              'Build a document summarizer',
              'Build a code explainer tool',
            ]
          }
        ]
      },
      {
        name: 'Prompt Engineering',
        desc: 'Get the best results from AI',
        time: '1 week',
        topics: [
          {
            name: 'Core Techniques',
            subtopics: [
              'Zero-shot prompting',
              'Few-shot prompting (examples in prompt)',
              'Chain-of-thought prompting',
              'Role prompting: "You are a..."',
              'Output formatting: JSON mode, XML tags',
              'Temperature tuning for different tasks',
              'Prompt injection risks & defenses',
              'System prompt design patterns',
              'Iterative prompt refinement',
            ]
          }
        ]
      },
      {
        name: 'Vercel AI SDK',
        desc: 'Build AI-powered apps fast',
        time: '3 weeks',
        topics: [
          {
            name: 'AI SDK Basics',
            subtopics: [
              'Install ai & @ai-sdk/openai',
              'generateText — single response',
              'streamText — streaming response',
              'useChat hook (React) — full chat UI in minutes',
              'useCompletion hook',
              'Multi-model support: switch between OpenAI / Claude / Google',
              'Tool calling with AI SDK',
              'maxTokens, temperature settings',
            ]
          },
          {
            name: 'Advanced Patterns',
            subtopics: [
              'AI with file uploads (PDFs, images)',
              'Structured output with Zod schema',
              'generateObject — get typed JSON from AI',
              'Multi-step AI agents',
              'Caching AI responses',
            ]
          }
        ]
      },
      {
        name: 'Vector Databases',
        desc: 'Let AI search your own data (RAG)',
        time: '2 weeks',
        topics: [
          {
            name: 'Embeddings & Semantic Search',
            subtopics: [
              'What are embeddings (vectors)',
              'Semantic search vs keyword search',
              'OpenAI embeddings API: text-embedding-3-small',
              'Cosine similarity — how vector search works',
            ]
          },
          {
            name: 'Vector DB Tools',
            subtopics: [
              'Pinecone — setup & upsert vectors',
              'Supabase pgvector — free alternative',
              'Chroma — local vector store',
              'Store documents as vectors',
              'Query: find most similar documents',
              'RAG (Retrieval Augmented Generation) pattern',
              'Build: Q&A bot over your own PDF',
              'Chunking strategies for long documents',
            ]
          }
        ]
      }
    ],
    project: 'Build an AI-powered study assistant app',
    milestone: 'You can add AI features to any web application',
    resources: [
      { name: '🆓 OpenAI Docs', url: 'https://platform.openai.com/docs' },
      { name: '🆓 Anthropic Docs', url: 'https://docs.anthropic.com' },
      { name: '🆓 Vercel AI SDK', url: 'https://sdk.vercel.ai' },
      { name: '🆓 Pinecone Docs', url: 'https://docs.pinecone.io' },
    ]
  },

  {
    id: 5, emoji: '🚀', title: 'Ship It', duration: 'Month 9–12', color: '#10b981',
    goal: 'Go from developer to professional',
    skills: [
      {
        name: 'Deployment',
        desc: 'Put your apps live on the internet',
        time: '1 week',
        topics: [
          {
            name: 'Frontend Deployment',
            subtopics: [
              'Vercel — deploy React/Next.js apps',
              'Netlify — deploy static sites',
              'GitHub Actions basics — CI/CD pipeline',
              'Environment variables on Vercel/Netlify',
              'Custom domains — connecting your domain',
              'HTTPS & SSL certificates (auto on Vercel/Netlify)',
            ]
          },
          {
            name: 'Backend Deployment',
            subtopics: [
              'Railway — deploy Node.js server',
              'Render — free Node.js hosting',
              'Environment variables in production',
              'Logs & monitoring basics',
              'Docker basics — what containers are',
              'Dockerfile — basic structure',
              'Database hosting: MongoDB Atlas, Supabase, Neon',
            ]
          }
        ]
      },
      {
        name: 'Build 3 Real Projects',
        desc: 'Your portfolio is your resume',
        time: '6 weeks',
        topics: [
          {
            name: 'Project 1 — Full Stack App',
            subtopics: [
              'Plan your app (problem, features, tech stack)',
              'Design database schema',
              'Build backend API with Express + MongoDB',
              'Build frontend with React + Tailwind',
              'Add authentication',
              'Deploy to Vercel + Railway',
              'Write a README with screenshots',
              'Push to GitHub with clean commits',
            ]
          },
          {
            name: 'Project 2 — Real-Time App',
            subtopics: [
              'App with WebSocket feature (chat, live feed)',
              'At least 2 users interact in real time',
              'Mobile responsive design',
              'Deployed & publicly accessible',
            ]
          },
          {
            name: 'Project 3 — AI-Powered SaaS',
            subtopics: [
              'Integrate at least one LLM (OpenAI or Claude)',
              'Unique use case — not just a basic chatbot',
              'Uses a real database',
              'Has user authentication',
              'Launch publicly & share on LinkedIn',
              'Write a case study about what you built',
            ]
          }
        ]
      },
      {
        name: 'System Design Basics',
        desc: 'Think about scale and architecture',
        time: '2 weeks',
        topics: [
          {
            name: 'Core Concepts',
            subtopics: [
              'Client-server architecture',
              'Monolith vs Microservices',
              'Load balancing basics',
              'Caching: what it is & when to use (Redis basics)',
              'CDN — Content Delivery Networks',
              'Database scaling: vertical vs horizontal',
              'SQL vs NoSQL — when to choose which',
              'Message queues (basic concept)',
              'Rate limiting — why APIs need it',
              'REST vs GraphQL vs gRPC',
            ]
          },
          {
            name: 'Design Practice',
            subtopics: [
              'Design a URL shortener (like bit.ly)',
              'Design a chat system',
              'Design a notification system',
              'Design a file upload service',
            ]
          }
        ]
      },
      {
        name: 'Interview Prep (DSA)',
        desc: 'Crack technical interviews',
        time: '4 weeks',
        topics: [
          {
            name: 'Data Structures',
            subtopics: [
              'Arrays — operations & time complexity',
              'Strings — manipulation & patterns',
              'Hash Maps / Objects — O(1) lookup',
              'Sets — uniqueness problems',
              'Linked Lists — singly & doubly',
              'Stacks (LIFO) & Queues (FIFO)',
              'Trees — binary trees, BST',
              'Graphs — adjacency list/matrix',
              'Heaps (Priority Queue)',
            ]
          },
          {
            name: 'Algorithms',
            subtopics: [
              'Big O Notation — time & space complexity',
              'Linear search & Binary search',
              'Merge sort & Quick sort',
              'Two pointers technique',
              'Sliding window technique',
              'Recursion fundamentals',
              'Depth First Search (DFS)',
              'Breadth First Search (BFS)',
              'Dynamic Programming: memoization basics',
              'Greedy algorithms basics',
            ]
          },
          {
            name: 'LeetCode Practice',
            subtopics: [
              'Solve 20 Easy problems',
              'Solve 15 Medium problems',
              'Two Sum — must know',
              'Valid Parentheses — must know',
              'Reverse Linked List — must know',
              'Maximum Subarray (Kadane\'s algorithm)',
              'Binary Search problems (5+)',
              'Tree traversal problems (5+)',
              'Practice explaining your thinking out loud',
            ]
          },
          {
            name: 'Job Search & Interview Skills',
            subtopics: [
              'Write a strong developer resume (1 page)',
              'Build LinkedIn profile with projects & skills',
              'Practice: "Tell me about yourself" (2 min)',
              'Practice: "Why do you want this role?"',
              'Practice behavioral questions (STAR method)',
              'Mock interview with a friend or online tool',
              'Contribute to 1 open source project',
              'Cold outreach to developers on LinkedIn',
            ]
          }
        ]
      }
    ],
    project: 'Build and launch a full AI-powered SaaS app',
    milestone: 'You have a portfolio that gets you hired',
    resources: [
      { name: '🆓 LeetCode', url: 'https://leetcode.com' },
      { name: '🆓 NeetCode', url: 'https://neetcode.io' },
      { name: '🆓 Roadmap.sh', url: 'https://roadmap.sh' },
      { name: '🆓 System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
    ]
  }
];

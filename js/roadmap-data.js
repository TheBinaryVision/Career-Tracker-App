// ============================================================
//  roadmap-data.js  —  All phases / skills data
// ============================================================

const PHASES = [
  {
    id:1, emoji:'🧱', title:'Foundation', duration:'Month 1–2', color:'#3b82f6',
    goal:'Learn to think like a developer',
    skills:[
      { name:'HTML & CSS',       desc:'Build and style web pages',           time:'2 weeks' },
      { name:'JavaScript Basics',desc:'Variables, functions, logic, DOM',    time:'3 weeks' },
      { name:'Git & GitHub',     desc:'Save and share your code',            time:'3 days'  },
      { name:'Command Line',     desc:'Navigate your computer like a dev',   time:'2 days'  },
    ],
    project:'Build your personal portfolio website',
    milestone:'You can build a real webpage from scratch',
    resources:[
      { name:'🆓 The Odin Project',  url:'https://www.theodinproject.com' },
      { name:'🆓 CS50 Harvard',      url:'https://cs50.harvard.edu' },
      { name:'🆓 freeCodeCamp',      url:'https://www.freecodecamp.org' },
    ]
  },
  {
    id:2, emoji:'⚛️', title:'Frontend', duration:'Month 3–4', color:'#06b6d4',
    goal:'Build beautiful, interactive apps',
    skills:[
      { name:'React.js',          desc:"World's most popular UI framework", time:'4 weeks' },
      { name:'Tailwind CSS',      desc:'Style fast, look professional',      time:'1 week'  },
      { name:'REST APIs',         desc:'Connect your app to the internet',   time:'1 week'  },
      { name:'React Hooks',       desc:'Make apps dynamic and responsive',   time:'2 weeks' },
    ],
    project:'Build a real-time weather app using a live API',
    milestone:'You can build interactive, data-driven web apps',
    resources:[
      { name:'🆓 React Docs',       url:'https://react.dev' },
      { name:'🆓 JavaScript.info',  url:'https://javascript.info' },
      { name:'🆓 Scrimba',          url:'https://scrimba.com' },
    ]
  },
  {
    id:3, emoji:'⚙️', title:'Backend', duration:'Month 5–6', color:'#8b5cf6',
    goal:'Make apps live, fast & always-on',
    skills:[
      { name:'Node.js + Express', desc:'Build your own server and APIs',     time:'3 weeks' },
      { name:'SQL + MongoDB',     desc:'Store and retrieve real data',       time:'3 weeks' },
      { name:'WebSockets',        desc:'Real-time: chat, live updates',      time:'2 weeks' },
      { name:'Authentication',    desc:'Login systems, JWT, sessions',       time:'1 week'  },
    ],
    project:'Build a real-time chat application',
    milestone:'You can build full apps with live data and accounts',
    resources:[
      { name:'🆓 Node.js Docs',     url:'https://nodejs.org' },
      { name:'🆓 MongoDB Uni',      url:'https://university.mongodb.com' },
      { name:'🆓 Socket.io Docs',   url:'https://socket.io' },
    ]
  },
  {
    id:4, emoji:'🤖', title:'AI Integration', duration:'Month 7–8', color:'#f59e0b',
    goal:'Make your apps intelligent',
    skills:[
      { name:'OpenAI / Claude API', desc:'Add AI chat, summarization',      time:'2 weeks' },
      { name:'Prompt Engineering',  desc:'Get the best from AI models',     time:'1 week'  },
      { name:'Vercel AI SDK',       desc:'Build AI-powered workflows',      time:'3 weeks' },
      { name:'Vector Databases',    desc:"Let AI search your own data",     time:'2 weeks' },
    ],
    project:'Build an AI-powered study assistant',
    milestone:'You can add AI features to any web application',
    resources:[
      { name:'🆓 OpenAI Docs',      url:'https://platform.openai.com/docs' },
      { name:'🆓 Vercel AI SDK',    url:'https://sdk.vercel.ai' },
      { name:'🆓 Anthropic Docs',   url:'https://docs.anthropic.com' },
    ]
  },
  {
    id:5, emoji:'🚀', title:'Ship It', duration:'Month 9–12', color:'#10b981',
    goal:'Go from developer to professional',
    skills:[
      { name:'Deployment (Vercel)',  desc:'Put your apps live online',       time:'1 week'  },
      { name:'3 Real Projects',      desc:'Your portfolio is your resume',   time:'6 weeks' },
      { name:'System Design',        desc:'Think about scale & architecture',time:'2 weeks' },
      { name:'Interview Prep (DSA)', desc:'Crack technical interviews',      time:'4 weeks' },
    ],
    project:'Build and launch one full AI-powered SaaS app',
    milestone:'You have a portfolio that gets you hired',
    resources:[
      { name:'🆓 Vercel',           url:'https://vercel.com' },
      { name:'🆓 LeetCode',         url:'https://leetcode.com' },
      { name:'🆓 Roadmap.sh',       url:'https://roadmap.sh' },
    ]
  }
];

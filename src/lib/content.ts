// All website copy lives here, taken from "Enlight Wisdom Website Content.docx".
// In headlines, words wrapped in *asterisks* are set in the italic serif accent.
// Edit text here and every section updates.

export const site = {
  name: "Enlight Wisdom",
  tagline: "Enlighting to shine",
  seoTitle: "Enlight Wisdom | Robotics & AI Automation Company in Chennai",
  seoDescription:
    "Enlight Wisdom builds robotics, AI and automation solutions for businesses and runs certified robotics, AI and coding programmes for schools and colleges. Based in Chennai.",
  accreditation: "AA00222",
  address:
    "No 104/1, Manickam Nagar, Ajax, Thiruvottiyur, Chennai, Tamil Nadu 600019, India",
  phoneDisplay: "+91 73959 14690",
  phoneRaw: "917395914690",
  email: "connect@enlightwisdom.com",
  // Add the real profile URLs here. Any entry left empty is hidden on the site.
  social: [
    { name: "LinkedIn", href: "https://www.linkedin.com/company/enlightwisdom/about/" },
    { name: "YouTube", href: "https://www.youtube.com/@enlightwisdom259/featured" },
    { name: "Instagram", href: "https://www.instagram.com/enlightwisdom_/" },
    { name: "Facebook", href: "https://www.facebook.com/Enlightwisdom" },
  ],
};

export const nav = [
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "education", label: "Education" },
  { id: "partners", label: "Partners" },
  { id: "team", label: "Team" },
];

export const hero = {
  headlineA: "Machines that work.",
  headlineB: "Minds that build them.",
  sub: "Enlight Wisdom creates robotics and AI automation for businesses, and trains the next generation of engineers in schools and colleges.",
  ctaBusiness: "Automate my business",
  ctaStudents: "Teach my students",
};

export const divisions = {
  title: "Two divisions. *One spark.*",
  intro:
    "The engineers who automate industry are the same people who teach in classrooms. Each side sharpens the other.",
  automation: {
    name: "Robotics & AI Automation division",
    short: "Automation",
    body: "We give repetitive work to robots. Custom robotics, AI, process automation and software for your business, plus ready-made products from our own lab.",
    points: [
      { k: "Services", v: "robotics, AI, AIoT, IoT, automation, RPA and software" },
      { k: "Products", v: "Shiken, SIARC, FIACC, ErgoTrack and Carisk" },
    ],
  },
  education: {
    name: "Education division",
    short: "Education",
    body: "We turn curious students into builders. Future technology programmes in robotics, AI and coding for schools and colleges.",
    points: [
      { k: "", v: "Centres of Excellence" },
      { k: "", v: "Internships and career guidance" },
      { k: "", v: "Certified and value-added courses" },
    ],
  },
};

export const about = {
  label: "About the company",
  headline: "Built by engineers. *Shared in classrooms.*",
  body: "Enlight Wisdom is a Chennai-based robotics and AI automation company with a dedicated education division. We build intelligent systems for businesses, and we train the students who will build the next ones.",
  split: [
    {
      t: "Robotics & AI Automation",
      d: "Custom robotics, AI, process automation, IoT and software for businesses, plus five ready-made products from our own lab.",
    },
    {
      t: "Education",
      d: "STREAM-based robotics, AI and coding for schools and colleges, with certified courses, internships and career guidance.",
    },
  ],
  why: [
    { t: "We build what we teach.", d: "The engineers who deliver automation for industry also run our classrooms." },
    { t: "Hands-on, always.", d: "Real projects and internships, not just theory." },
    {
      t: "Certified and recognised.",
      d: "Government of India and international certification, with TNSDC, AICRA, MSME and WITBLOX, and recognition from Amazon Startup programmes.",
    },
    { t: "Led by experts.", d: "Robotics engineers, curriculum specialists and long-serving educators." },
  ],
  glance: [
    { k: "Based in", v: "Chennai, Tamil Nadu, India" },
    { k: "Founder", v: "Bezaleel S (Beslee), M.Tech Robotics" },
    { k: "Products", v: "Shiken, SIARC, FIACC, ErgoTrack, Carisk" },
    { k: "Serves", v: "Businesses, schools, colleges and partner centres" },
    { k: "Accreditation", v: "AA00222" },
  ],
};

export type ServiceIcon = "arm" | "brain" | "bot" | "chip" | "code" | "aiot" | "flow";
export const services = {
  label: "Services, built for your business",
  headline: "Let the robots take the *repetitive stuff.*",
  intro:
    "Our engineers study how your work flows, find where automation pays back first, then build, deploy and support a system made just for you.",
  cta: "Book a consultation",
  items: [
    {
      icon: "arm" as ServiceIcon,
      name: "Robotics & industrial automation",
      d: "Robots and automated workflows built around your product and your floor, to cut cost and raise output.",
      tags: ["Process study", "Robotic workflows", "Integration", "Team training"],
    },
    {
      icon: "brain" as ServiceIcon,
      name: "AI & machine learning",
      d: "Models that turn your data into predictions, inspections and decisions.",
      tags: ["Prediction", "Computer vision", "Language and text", "Deployment"],
    },
    {
      icon: "bot" as ServiceIcon,
      name: "Robotic process automation",
      d: "Software bots that take over repetitive back-office work, so your people can focus on decisions.",
      tags: ["Finance and admin", "Reconciliation", "Reporting"],
    },
    {
      icon: "chip" as ServiceIcon,
      name: "IoT & embedded systems",
      d: "Sensors, controllers and connected devices that see, report and act.",
      tags: ["Sensors", "Firmware", "Live dashboards"],
    },
    {
      icon: "code" as ServiceIcon,
      name: "App, web & software development",
      d: "Mobile apps, websites and business software, delivered on time and within budget.",
      tags: ["iOS and Android", "Websites", "Custom software", "Cloud hosting"],
    },
    {
      icon: "aiot" as ServiceIcon,
      name: "AIoT (AI + IoT)",
      d: "Connected devices with AI built in, so machines and sensors can analyse data as it arrives and act on it.",
      tags: ["Smart sensors", "Real-time analysis", "Live dashboards"],
    },
    {
      icon: "flow" as ServiceIcon,
      name: "Automation solutions",
      d: "End-to-end automation for your operations, from the factory floor to the back office, to cut manual effort and cost.",
      tags: ["Process study", "Workflow design", "Integration", "Support"],
    },
  ],
  processTitle: "From first chat to *first shift.*",
  process: [
    { t: "Discover", d: "We learn your process, goals and limits." },
    { t: "Design", d: "We propose the right solution and a clear plan." },
    { t: "Build", d: "We develop and test the system." },
    { t: "Deploy", d: "We install, integrate and train your team." },
    { t: "Support", d: "We monitor, improve and scale with you." },
  ],
};

export type ProductId = "shiken" | "amr" | "ergotrack" | "carisk";
export const products = {
  label: "Products, ready to use",
  headline: "Built in-house. *Ready to switch on.*",
  intro:
    "Unlike our custom services, these are finished products from our own lab. Pick one, see it running, and put it to work.",
  items: [
    {
      id: "shiken" as ProductId,
      name: "Shiken",
      what: "AI proctor software",
      d: "AI-powered proctoring that helps institutions run online exams fairly. It monitors sessions and flags suspicious activity for review, so invigilators can focus on the cases that matter.",
      tags: ["Online exams", "Schools and colleges", "Exam integrity"],
      demoHint: "Move your cursor away from the screen. Watch Shiken flag it.",
    },
    {
      id: "amr" as ProductId,
      name: "SIARC and FIACC",
      what: "Autonomous mobile robots (AMR) for warehouse and household",
      d: "Robots that find their own way around. Our AMR range covers two settings: warehouses, where goods need to keep moving, and households, where everyday tasks need a helping hand.",
      tags: ["Warehouses", "Households", "Self-navigating"],
      demoHint: "Click anywhere on the floor. The robot plans its own route.",
    },
    {
      id: "ergotrack" as ProductId,
      name: "ErgoTrack",
      what: "AI employee monitor for stores",
      d: "AI-based monitoring designed for stores. It gives managers a clearer view of how the shop floor is running, so they can support their teams and improve service.",
      tags: ["Retail stores", "Floor visibility", "Store operations"],
      demoHint: "Hover over a zone to see how the floor is running.",
    },
    {
      id: "carisk" as ProductId,
      name: "Carisk",
      what: "AI oral caries detection app",
      d: "An AI-powered app that helps detect oral caries, the clinical term for tooth decay, early, so problems are caught and treated sooner.",
      tags: ["Dental screening", "Early detection", "Mobile app"],
      demoHint: "Drag the scanner across the teeth, or press Scan.",
    },
  ],
};

export const education = {
  label: "Education division",
  headline: "Classrooms that *build robots.*",
  intro:
    "The education division delivers future technology programmes in STREAM-based robotics, AI and coding to schools and colleges, taught by working engineers, with Government of India and international certification.",
  schools: {
    title: "For schools",
    sub: "Fun, hands-on and built into the school year.",
    formats: [
      { t: "After-school programmes", d: "Activities that extend learning beyond the school day." },
      { t: "Workshops", d: "Focused sessions that spark curiosity about technology." },
      { t: "Full-year curriculum", d: "Courses built into the academic year for a deeper dive." },
      {
        t: "Centre of Excellence Lab",
        d: "A dedicated lab approved by AICRA and STEM, with training for teachers and students.",
      },
    ],
    courseGroups: [
      {
        name: "Courses",
        courses: [
          "Robotics & AI",
          "Coding",
          "AR/VR",
          "Python & ML",
          "Internet of Things",
          "Game Designing",
          "Drone Technology",
          "3D Printing",
          "App / Web Development",
          "Jolly Phonics",
          "Soft Skills",
        ],
      },
    ],
    gains:
      "What a school gains: enhanced curriculum, teacher training, global recognition, an innovative learning space and career readiness.",
    cta: "Partner with us",
    interest: "Programmes for a school",
    photo: "/photos/schools.jpg",
  },
  colleges: {
    title: "For colleges",
    sub: "Industry skills before graduation day.",
    formats: [
      {
        t: "Centre of Excellence",
        d: "Hands-on AI training: machine learning, language processing, computer vision and deep learning.",
      },
      {
        t: "Internship programmes",
        d: "Real projects in machine learning, AI, big data, app development and web design.",
      },
      { t: "Value-added courses", d: "Full-year or semester courses, customised to your department." },
      { t: "Certification", d: "Government of India and international certificates that add prestige." },
    ],
    courseGroups: [
      {
        name: "Engineering",
        courses: [
          "Robotics with AI & ML",
          "Artificial Intelligence",
          "Machine Learning",
          "Data Science",
          "RPA",
          "Big Data & Hadoop",
          "Full Stack Developer",
          "Android Apps",
          "ROS",
        ],
      },
      {
        name: "Electrical, embedded and industrial",
        courses: [
          "UAV Technology",
          "Embedded Systems",
          "IoT with Arduino",
          "ARM & AVR",
          "Automation Engineer",
          "Industrial Robotics",
          "MATLAB",
          "VLSI",
        ],
      },
      {
        name: "Arts, science and career",
        courses: [
          "Office & Excel using AI",
          "Digital Marketing",
          "Tally ERP",
          "Accounting & Finance",
          "Campus to Corporate",
          "Soft Skills",
        ],
      },
    ],
    gains: "",
    cta: "Request a proposal",
    interest: "Programmes for a college",
    photo: "/photos/colleges.jpg",
  },
  // Real photos from Enlight Wisdom sessions (from enlightwisdom.com)
  classroom: [
    { src: "/photos/class/class-8.jpg", w: 1400, h: 1050, alt: "Students building with a robotics kit" },
    { src: "/photos/class/class-1.jpg", w: 270, h: 200, alt: "A technology talk for a full school hall" },
    { src: "/photos/class/class-6.jpg", w: 1400, h: 1867, alt: "Two students wiring a circuit at a laptop" },
    { src: "/photos/class/class-3.jpg", w: 270, h: 200, alt: "A hands-on robotics session in a classroom" },
    { src: "/photos/class/class-9.jpg", w: 1400, h: 1867, alt: "A trainer guiding a young student through a build" },
    { src: "/photos/class/class-2.jpg", w: 270, h: 200, alt: "Students in a workshop with the trainers" },
    { src: "/photos/class/class-5.jpg", w: 1024, h: 768, alt: "A teacher training session with a projector" },
    { src: "/photos/class/class-4.jpg", w: 270, h: 200, alt: "Young learners in an activity room" },
  ],
  alsoTitle: "Also offered",
  also: [
    {
      t: "Career guidance",
      d: "Educational consultants help students choose the right college and career path.",
      interest: "Something else",
      msg: "I'd like career guidance for a student.",
    },
    {
      t: "Internships",
      d: "Real projects in AI, big data, app and web development that employers value.",
      interest: "Internships",
      msg: "I'm interested in an internship.",
    },
    {
      t: "Partner centres",
      d: "Educational centres can join us to offer STREAM robotics, coding, AI and soft-skills training.",
      interest: "Becoming a partner centre",
      msg: "Our centre would like to become a partner centre.",
    },
  ],
};

export type Partner = { group: string; name: string; note?: string; logo?: string };
export const partners: { headline: string; intro: string; items: Partner[] } = {
  headline: "Good company *to keep.*",
  intro: "Schools, institutions and partners who build with us. Drag, swipe or use the arrows.",
  items: [
    { group: "Our clients", name: "READ", logo: "/photos/partners/read.png" },
    { group: "Our clients", name: "Sree Academy" },
    { group: "Our clients", name: "HETA", logo: "/photos/partners/heta.png" },
    { group: "Our clients", name: "Destino of Dance" },
    { group: "Our clients", name: "Versatile Academy" },
    { group: "Our clients", name: "Dr. M.G.R. Institute", note: "Educational and Research Institute" },
    { group: "Our clients", name: "Phonic Champs", logo: "/photos/partners/phonic-champs.png" },
    { group: "Our MOU partners", name: "WitBlox", logo: "/photos/partners/witblox.png" },
    { group: "Our MOU partners", name: "AICRA" },
    { group: "Our MOU partners", name: "Hash Robotics", logo: "/photos/partners/hash-robotics.png" },
    { group: "Our MOU partners", name: "STEM.org", note: "Certified Educational Instructor" },
    { group: "Our MOU partners", name: "MSME", logo: "/photos/partners/msme.png" },
    { group: "Our MOU partners", name: "St Joseph Engineering College" },
    { group: "Our MOU partners", name: "KCG College" },
    { group: "Our MOU partners", name: "SRM University" },
    { group: "Our MOU partners", name: "SRM Valliammal" },
    { group: "Our MOU partners", name: "Adi Sankara Institute of Technology" },
  ],
};

export const proof = {
  label: "Why Enlight Wisdom",
  headline: "Built. Taught. *Proven.*",
  intro:
    "We build and teach the same technology, so what we bring to a factory floor and a classroom has been tested in practice.",
  stats: [
    { n: 5000, suffix: "+", label: "School students inspired through hands-on learning", per: 100, unit: "students" },
    { n: 8000, suffix: "+", label: "College students upskilled in emerging technologies", per: 100, unit: "students" },
    { n: 3000, suffix: "+", label: "Interns turning ideas into real projects", per: 100, unit: "interns" },
    { n: 20, suffix: "+", label: "IT and automation solutions delivered", per: 1, unit: "solution" },
  ],
  points: [
    { t: "Engineer-led.", d: "Our founder and technical team are M.Tech robotics engineers and trainers." },
    { t: "Hands-on by default.", d: "We build, test and deploy. Students work on real projects, not just theory." },
    { t: "Certified.", d: "Government of India and international certification for our courses." },
    { t: "Seasoned mentors.", d: "Working engineers and long-serving educators guide every programme." },
  ],
  recognition:
    "Partnered and accredited with TNSDC, AICRA, MSME and WITBLOX. Recognised by Amazon Startup and TNSDC. Accreditation No. AA00222.",
  badges: ["TNSDC", "AICRA", "MSME", "WITBLOX", "Amazon Startup"],
};

export const team = {
  headline: "The humans *behind the robots.*",
  intro: "Robotics engineers, curriculum specialists and educators with decades of combined experience.",
  members: [
    { name: "Bezaleel S (Beslee)", role: "Managing Director and Founder", profile: "M.Tech Robotics", photo: "/photos/team/beslee.jpg" },
    { name: "Abraham", role: "Educational and Technical Advisor", profile: "B.Tech Ed, MBA", photo: "/photos/team/abraham.jpg" },
    { name: "Caroline Cynthia", role: "Curriculum Specialist", profile: "Computer Science Engineer", photo: "/photos/team/caroline.jpg" },
    { name: "Surya Narayanan", role: "Lead Technical Consultant", profile: "M.Tech Robotics", photo: "/photos/team/surya.jpg" },
    { name: "Vinodhini", role: "Educational Advisory", profile: "M.A., B.Ed.", photo: "/photos/team/vinodhini.jpg" },
    { name: "Vaishali", role: "Operations Manager", profile: "MBA", photo: "/photos/team/vaishali.jpg" },
  ],
};

export const contact = {
  headline: "Got a process to automate or *a class to inspire?*",
  sub: "Tell us what you have in mind. We reply within a working day.",
  interests: [
    "Automation services for my business",
    "A product demo",
    "Programmes for a school",
    "Programmes for a college",
    "Internships",
    "Becoming a partner centre",
    "Something else",
  ],
};

export const footer = {
  text: "Robotics and AI automation for business. Certified technology education for schools and colleges. Enlighting to shine.",
  line: "Empowering the Next Generation. Accreditation No. AA00222",
};

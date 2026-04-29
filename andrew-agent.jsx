// --- AI Andrew chat agent — client-side, rule-based ---
// React/ReactDOM are loaded as globals from CDN. Babel-standalone compiles this JSX in-browser.
const { useState, useRef, useEffect } = React;

// --- PERSONA INFERENCE ---
function inferPersona(messages) {
  const all = messages.map(m => m.text).join(" ").toLowerCase();
  const sc = { recruiter: 0, designer: 0, hiringmgr: 0, team: 0, colleague: 0 };
  const s = (k, terms) => terms.forEach(t => { if (all.includes(t)) sc[k] += 2; });
  s("recruiter", ["cv", "resume", "candidate", "notice period", "years experience", "team size", "salary", "contract", "permanent", "screening", "shortlist"]);
  s("designer", ["process", "methodology", "craft", "figma", "design system", "double diamond", "hcd", "your approach", "how do you design", "portfolio"]);
  s("hiringmgr", ["built a team", "scaled", "executive buy-in", "stakeholder management", "embed", "capability", "org design", "governance", "tell me about a time"]);
  s("team", ["our team", "my development", "your expectations", "feedback", "1:1", "growth", "prioritisation", "what do you value"]);
  s("colleague", ["your team", "engage with design", "my project", "my program", "help with", "request design", "sprint", "what does design do"]);
  const max = Math.max(...Object.values(sc));
  if (max === 0) return "general";
  return Object.keys(sc).find(k => sc[k] === max);
}

// --- TOPIC SCORING ---
const TOPICS = {
  background: ["background", "experience", "career", "journey", "history", "tell me about you", "who are you", "your story", "where have you worked", "previous roles", "what have you done", "walk me through"],
  leadership: ["leadership", "leader", "manage", "team", "style", "how do you lead", "people management", "direct reports", "culture", "enps"],
  roles: ["role", "targeting", "looking for", "next move", "available", "hire", "open to", "sweet spot", "ideal role", "type of work"],
  innovation: ["innovati", "pilot", "prototype", "speculative", "new product", "new service", "experiment", "exploration", "weak signal"],
  futures: ["futures lab", "2025 strategy", "threats and opportunities"],
  enterprise: ["enterprise design", "design practice", "design function", "1.8m", "dual track", "gels", "program extensions"],
  ai: ["ai policy", "artificial intelligence", "ai governance", "enterprise ai"],
  community: ["community innov", "social innov", "equitable", "lived experience", "co-design", "codesign"],
  auspost: ["australia post", "auspost", "co-lab", "colab", "neighbourhood", "guardrail", "welcome service", "post office"],
  meta: ["meta", "youth harm", "facebook", "harm minimization", "harm minimisation"],
  education: ["education", "qualification", "degree", "study", "uni", "bachelor", "diploma", "scrum", "safe certification"],
  personal: ["personal", "outside work", "hobby", "family", "kids", "synth", "techno", "music", "desert", "troopy", "travel", "interests", "free time", "fun"],
  geelong: ["geelong", "where do you live", "where are you based", "where are you located", "commute"],
  storytelling: ["storytelling", "narrative", "storytell", "how do you communicate"],
  podcast: ["podcast", "company road", "chris hudson"],
  philosophy: ["philosophy", "approach", "believe", "values", "principles", "what drives you"],
  contact: ["contact", "email", "phone", "reach", "linkedin", "get in touch", "connect with you", "your details", "cv", "resume"],
  pub: ["pub of the future", "design week", "old bar", "third space"],
  craig: ["craig walker", "consultancy work", "consulting days", "ideo"],
  mycash: ["mycash", "cash management", "cash network", "future of cash"],
  awards: ["award", "recognition", "published", "premier design", "social innovation", "achievements", "accolades"],
  whatcanido: ["what can you do", "what do you offer", "services", "how can you help", "what does your team do", "capabilities", "what do you bring"],
  // Cross-cutting industry topics
  government: ["government", "public sector", "gov", "regulator", "regulatory", "worksafe", "policy"],
  retail: ["retail", "coles", "flybuys", "seek", "shopping", "point of sale", "pos"],
  finance: ["finance", "financial", "bank", "banking", "me bank", "cash", "fintech"],
  tech: ["technology", "tech", "software", "digital", "programmatic", "ecommerce", "platform"],
  clients: ["clients", "who have you worked with", "who have you worked for", "companies", "brands", "organisations"],
};

const THRESHOLD = 1.5;

function scoreTopics(input) {
  const q = input.toLowerCase();
  const scores = {};
  for (const [topic, terms] of Object.entries(TOPICS)) {
    let score = 0;
    for (const term of terms) {
      if (q.includes(term)) score += term.split(" ").length > 1 ? 3 : 1;
    }
    if (score > 0) scores[topic] = score;
  }
  return scores;
}

const LABELS = {
  background: "My career background", leadership: "How I lead", roles: "Roles & capabilities",
  innovation: "Innovation approach", futures: "The Futures Lab", enterprise: "Enterprise Design Practice",
  ai: "AI Policy work", community: "Community Innovation", auspost: "Australia Post projects",
  meta: "Meta / Youth Harm", education: "Education", personal: "Personal life",
  geelong: "Location", storytelling: "Storytelling", podcast: "Podcast", philosophy: "Design philosophy",
  contact: "Contact details", pub: "Pub of the Future", craig: "Craig Walker", mycash: "MyCash",
  awards: "Awards", whatcanido: "What I can help with", government: "Government experience",
  retail: "Retail experience", finance: "Finance experience", tech: "Technology background",
  clients: "Clients I've worked with",
};

// --- RESPONSES ---
// Persona variants: general, recruiter, designer, hiringmgr, team, colleague
// Only key topics have full persona variants. Others use general with a warm, human tone.

const R = {
  default: {
    general: "G\u2019day! I\u2019m Andrew Broughton. I help organisations transform through design \u2014 aligning strategy, service and experience to create meaningful, measurable change.\n\nI\u2019ve been doing this for over 18 years now, across agencies, consultancies and in-house. Currently I\u2019m Practice Lead for Enterprise Design at WorkSafe Victoria.\n\nAsk me about anything \u2014 specific projects, how I work, what I believe about design, or just what I get up to outside of work. I\u2019m an open book.",
    recruiter: "G\u2019day. Andrew Broughton \u2014 Practice Lead, Enterprise Design at WorkSafe Victoria. 18+ years across agency, consultancy and in-house. Led teams up to 25+. Happy to answer anything about my experience.",
    designer: "G\u2019day! I\u2019m Andrew \u2014 I\u2019ve spent 18+ years working across the full design spectrum, and I still love getting into the detail of how things get made. Currently leading design at WorkSafe Victoria. What would you like to know?",
    hiringmgr: "G\u2019day. I\u2019m Andrew Broughton \u2014 I build and scale design capability inside complex organisations. Currently leading a 25+ person practice at WorkSafe Victoria on the Delivery SLT. Happy to talk through how I approach things.",
    team: "Hey! Ask me anything \u2014 about the practice, how I think about things, your development, or just what\u2019s on your mind. No question is too small.",
    colleague: "G\u2019day! I\u2019m Andrew \u2014 I lead the Enterprise Design practice here. We work across service and experience design to help the org tackle complex problems. Ask me anything about what we do or how we might help with your work.",
  },

  background: {
    general: "My career has had three pretty distinct chapters, and each one built on the last.\n\nEarly on I was deep in technology \u2014 building software, POS systems, ecommerce platforms, programmatic advertising. I actually learned to code in those early days, which I think gives you a fundamentally different understanding of what\u2019s possible and what\u2019s hard.\n\nThen I moved into creativity and consumer behaviour \u2014 building brands, campaigns, through-the-line strategies for clients like Optus, Coles, Seek, Flybuys. Understanding how people move through a funnel really shaped how I think about service journeys now.\n\nThen innovation brought it all together. Helping businesses develop novel products and services across finance, tech, retail, regulation and philanthropy. Building evidence through pilots and prototypes is honestly what makes me buzz.\n\nMost recently I\u2019ve been at WorkSafe Victoria, where I built the Enterprise Design Practice from scratch \u2014 centralising design capability inside a government agency. It\u2019s been the hardest and most rewarding thing I\u2019ve done.",
    recruiter: "18+ years. Started in digital production \u2014 Ford, MIFF, Melbourne Museum. Moved through creative leadership at Me Bank, Optus (via Big Red Group), and Coles/Seek/Flybuys (via Whippet). Then strategic consulting at Craig Walker working with Australia Post, Meta, World Vision and others.\n\nSince November 2020 I\u2019ve been Practice Lead, Enterprise Design at WorkSafe Victoria. Led teams from 3 to 25+.",
    designer: "Three phases, and I think they\u2019re what make me a bit different as a designer.\n\nI started making things \u2014 software, ecommerce, programmatic. I learned to code early on, ActionScript and PHP and all the rest. That gives you an instinct for feasibility that you can\u2019t get from a bootcamp.\n\nThen I got deep into creativity and consumer behaviour \u2014 brands, campaigns, through-the-line work. Understanding funnels and customer journeys from the marketing side completely changed how I approach service design.\n\nThen innovation pulled it all together \u2014 speculative futures, novel products, pilots. That\u2019s where strategy, service design and business acumen intersect, and that\u2019s where I love working.",
    hiringmgr: "The career arc has been deliberate. Technology delivery gave me technical fluency. Creative leadership gave me craft depth. Strategic consulting and innovation gave me business acumen.\n\nAt Craig Walker I led consulting engagements for Australia Post, Meta, and others. Since 2020 I\u2019ve built the Enterprise Design Practice at WorkSafe from zero \u2014 org design, executive endorsement, hiring the team, embedding into delivery frameworks. It\u2019s a 25+ person function sitting on the Delivery SLT.",
    team: "I started making websites and software \u2014 Ford, MIFF, museums. Learned to code, which I\u2019m still grateful for. Then creative leadership for brands like Optus and Coles. Then consulting at Craig Walker, which is where I fell in love with service design and strategic design.\n\nWorkSafe has been about bringing all of that together \u2014 building something from scratch that genuinely changes how an organisation works. It\u2019s been the most rewarding chapter by far.",
    colleague: "Before WorkSafe I spent 18+ years across design agencies and consultancies. Started in technology and digital, moved through creative and marketing leadership, then into strategic consulting. I was at Craig Walker working with big clients like Australia Post and Meta before joining here in November 2020 to build the design practice.",
  },

  leadership: {
    general: "Honestly, it\u2019s about creating the conditions for great work to happen \u2014 not being the smartest person in the room.\n\nI lead a team of 25+ including three senior managers. My focus is on culture first, capability second, outcomes third. Get the first two right and the third follows.\n\nWe took our eNPS from +20 to +41 over two years, which I\u2019m really proud of. That\u2019s not a number I engineered \u2014 it reflects a team that feels valued, trusted and empowered to do their best work.\n\nThe harder skill I\u2019ve had to learn is translation. Helping the business understand the value of design in their language \u2014 cost savings, productivity uplift, risk reduction, ROI. Storytelling is the secret weapon there. You can have the best design team in the world, but if you can\u2019t articulate the value in exec language, you\u2019ll always be fighting for your seat at the table.",
    recruiter: "Team of 25+ including 3 senior managers. CEO and Executive stakeholders. eNPS from +20 to +41 over two years. Finalist in Service Design at the Victorian Premier Design Awards. Leadership roles since 2015 across agency, consultancy and in-house.",
    designer: "I think the best design leaders remove obstacles rather than direct traffic. My job is to create clear briefs, build strong stakeholder relationships, protect thinking time, and foster a culture where people feel safe to push ideas and challenge assumptions.\n\nThe craft of leadership is genuinely different from the craft of design, but they\u2019re both crafts. I\u2019ve had to learn that \u2014 sometimes the hard way.",
    hiringmgr: "I focus on three things in this order: culture, capability, outcomes. If the culture is right, capability grows naturally. If capability is strong, outcomes follow.\n\nAt WorkSafe we went from eNPS +20 to +41 over two years. That\u2019s deliberate investment in people, clarity of purpose, and actively protecting the team from organisational noise so they can focus on the work that matters.\n\nThe executive translation piece is critical. I\u2019ve learned to present design\u2019s value in business language \u2014 cost savings, productivity uplift, risk reduction. That\u2019s how you earn and keep executive trust.",
    team: "I want to build the conditions where you can do your best work. That means clear expectations, honest feedback, room to grow, and someone who\u2019ll go in to bat for you with stakeholders when it counts.\n\nWhat I value most is curiosity, initiative and honesty. I\u2019d genuinely rather you challenge an approach than silently disagree. The worst thing for our team is unspoken friction.",
    colleague: "My approach to leading the design team is focused on making design genuinely useful to the broader organisation. That means my team understands your world \u2014 your deadlines, your constraints, your stakeholders \u2014 and we work within that, not in a design bubble.\n\nI\u2019m big on metrics and outcomes. If design can\u2019t demonstrate its value in terms that matter to you, we haven\u2019t done our job properly.",
  },

  // Cross-cutting industry responses
  government: {
    general: "Government has been a huge part of my career, particularly the last five years at WorkSafe Victoria. Working inside a regulator has taught me a lot about navigating complexity, risk aversion, and making change happen in environments where the default is caution.\n\nI\u2019ve built the Enterprise Design Practice from scratch inside WorkSafe \u2014 that meant org design, executive endorsement, hiring the team, and embedding design into delivery frameworks. The Futures Lab was speculative design work that shaped the 2025 organisational strategy. Community Innovation delivered equitable services through co-design with communities.\n\nThe thing about government is that the impact is real and broad. When you improve a service at WorkSafe, you\u2019re affecting every worker in Victoria. That scale of impact is hard to find elsewhere.",
  },

  retail: {
    general: "Retail runs through the middle of my career. At Whippet I was Digital Creative Lead working across Coles Supermarkets, Coles Financial Services, Flybuys, Seek and Amplifon. We delivered an Online Channel Strategy for Coles Financial Services, a Personalisation Strategy for Flybuys, and through-the-line creative strategy for Seek.\n\nAt Craig Walker, the Australia Post work was essentially retail transformation \u2014 the CX Guardrails project was about building guiding principles for the point-of-sale technology transformation across Australia\u2019s largest retail network. We evolved the Future of the Post Office strategy into high-priority use cases and defined the optimal experience for the new technology.\n\nI also did work at Big Red Group managing creative for Optus across display, eDM, social and web \u2014 delivering personalisation strategy across platforms.\n\nSo I\u2019ve seen retail from the marketing side, the technology side, and the service design side. That breadth is pretty useful.",
  },

  finance: {
    general: "Finance has popped up at a few key points in my career. I was Design Manager at Me Bank, leading a team of 10+ creatives, visual designers and experience designers. We defined Service Level Agreements for the design team and delivered a platform integration project for performance-based display advertising.\n\nAt Craig Walker, the MyCash project was all about the future of cash management \u2014 how do you service national cash needs as branches and ATMs phase out? We designed the operations of a new cash management network. Fascinating systems design challenge.\n\nI also worked with Affinity, a startup bank in Ghana, on an Inclusive Digital Banking Strategy. That was about designing digital banking services for communities that had been excluded from traditional banking.\n\nAnd the Coles Financial Services work at Whippet \u2014 Online Channel Strategy. So I\u2019ve touched finance from high street banking through to fintech and inclusive design.",
  },

  tech: {
    general: "Technology is where I started, and it\u2019s still in my DNA. My early career was very hands-on \u2014 I learned to code ActionScript, Java, HTML, PHP, CSS at Next Digital working on Ford Australia. Building software, managing programmatic display, creating ecommerce experiences.\n\nAt Mecca MediaLight I built interactive displays for ScienceWorks and Melbourne Museum \u2014 some of those are still running, which blows my mind. At Me Bank it was platform integration and performance-driven digital advertising.\n\nMore recently the technology angle has shifted to strategy \u2014 at WorkSafe I\u2019m working on Enterprise AI Policy with the technology division, and the design practice is embedded in tech delivery through Dual Track and GELs.\n\nI think having a technology foundation makes you a better designer. You understand feasibility instinctively, and you can have credible conversations with engineering teams.",
  },

  clients: {
    general: "Over the years I\u2019ve worked with a pretty broad range. The big ones: Meta, Australia Post, Optus, Coles, Seek, Flybuys, Energy Australia, Me Bank, Ford Australia, WorkSafe Victoria, Melbourne International Film Festival, Melbourne Museum, ScienceWorks, Victorian College of the Arts, World Vision, and Affinity (a startup bank in Ghana).\n\nThat\u2019s spanned technology, retail, finance, government, philanthropy, arts and culture. I think the breadth is actually one of my strengths \u2014 each industry teaches you something that transfers to the next. The systems thinking from government helps in finance. The consumer behaviour understanding from retail helps in service design. It compounds.",
  },

  roles: {
    general: "My sweet spot is senior design leadership \u2014 Design Director, Head of Design, Innovation Lead, or CX/VoC Lead.\n\nWhat I love is blending creativity, technology and business acumen to align strategy, diverge on ideas, and build and test things. I get a genuine buzz from building evidence through pilots and prototypes and watching that evidence change how an organisation thinks.\n\nI bring both sides \u2014 deep craft across strategy, service, product, visual and creative design, plus the real-world experience of building and scaling a practice inside a large organisation. That combination is pretty rare.\n\nIf any of that resonates, I\u2019d love to chat \u2014 andrew.n.broughton@gmail.com.",
    recruiter: "Best fit: Design Director, Head of Design, Innovation Lead, CX/VoC Lead. Geelong-based or hybrid Melbourne preferred. Craft leadership across strategy, service, product, visual and creative design. Both agency/consultancy and enterprise experience.\n\nandrew.n.broughton@gmail.com \u2014 happy to discuss specifics.",
    hiringmgr: "I\u2019m strongest where design leadership needs to be stood up, scaled, or transformed. I\u2019ve done it from zero at WorkSafe \u2014 org design, executive endorsement, hiring, embedding into delivery frameworks. I bring both strategic credibility and deep craft across service, product and experience design.\n\nHappy to go deeper on any of that \u2014 andrew.n.broughton@gmail.com.",
  },

  innovation: {
    general: "Innovation is where all the threads come together for me \u2014 creativity, technology, business acumen. I love aligning strategy, diverging on ideas, then building and testing pilots to create real evidence for investment decisions.\n\nI\u2019ve led innovation both as a consultant and inside enterprises. At WorkSafe I ran the Innovation Center \u2014 a 15+ person team across product, project management, change, development and design. We took the Futures Lab from weak signals through to pilot delivery, and one of those pilots became BAU in service delivery.\n\nAt Craig Walker I helped clients like Australia Post and World Vision develop novel products and services.\n\nThe thing that makes me buzz is building evidence to define solutions through pilots and prototypes. Not just ideating \u2014 actually testing with real people and building the case for investment. That\u2019s where the magic happens.",
  },

  futures: {
    general: "The Futures Lab is one I\u2019m really proud of. The question we asked was: how might we understand the threats and opportunities WorkSafe will face in the future, and define novel solutions to tackle them?\n\nWe scanned for weak signals, mapped threats and opportunities, developed scenarios, and designed novel products and services. That work delivered clarity around WorkSafe\u2019s biggest strategic challenges and became the front end of the narrative for the 2025 WorkSafe Strategy.\n\nFrom there we spun up four streams of pilots through the Innovation Center, tested them with cohorts of 20+ people, and one became BAU in service delivery.\n\nNow, that might not sound like a lot. But in an incredibly risk-averse regulator, making change and shifting the focus of investment is incredibly hard. To take speculative work all the way to business-as-usual in 18 months \u2014 that was a significant achievement.",
  },

  enterprise: {
    general: "This is probably my signature piece of work. The question was: how might we create and cultivate modern ways of work inside a government agency and start a centralised design practice inside a delivery model?\n\nThe outcomes tell the story. $1.8M cost saving by internalising service and experience design work. Implemented Dual Track and GELs, which cut program extensions by 50%. Turned around underperforming tech programs \u2014 one went from a 4x drop in productivity without design to a 4x gain after we redesigned the approach.\n\nWe rebooted legislative change programs by clarifying problems, defining solutions, and aligning initiatives with strategic goals. Delivered front-end visions across key streams to secure executive buy-in and de-risk delivery.\n\nAnd the culture piece \u2014 maintaining eNPS of +20 to +41 over two years, with continuous uplift evidenced by strong stakeholder feedback on team capability.\n\nIt\u2019s a case study in proving that design leadership delivers measurable business outcomes.",
  },

  ai: {
    general: "I\u2019m currently working on Enterprise AI Policy at WorkSafe Victoria alongside the technology division. It\u2019s an in-progress piece of work from 2024\u20132025, so I can\u2019t go into the details just yet.\n\nBut it\u2019s a good example of how design leadership can extend beyond traditional design boundaries \u2014 into governance, strategy, and emerging technology. The same design thinking approach applies: understand the problem, map the stakeholders, test assumptions, iterate.\n\nIf you\u2019re interested in how design thinking applies to AI policy, I\u2019d love to chat about it. andrew.n.broughton@gmail.com.",
  },

  community: {
    general: "Community Innovation at WorkSafe is where social innovation meets service delivery. The question was: how might we leverage social innovation to deliver novel solutions to complex community barriers around unsafe workplaces?\n\nWe changed the narrative across the business on including lived experience into making change in service delivery. We delivered four equitable services, and one of them is being scaled statewide in 2025.\n\nThis connects to a thread that runs through my whole career \u2014 from the Australia Post Neighbourhood Welcome Service, which was published in \u2018Design for Social Innovation\u2019, through to this. I genuinely believe the best services come from designing with communities, not just for them.",
  },

  auspost: {
    general: "I worked on several Australia Post projects at Craig Walker that I\u2019m really proud of.\n\nThe AusPost Co-Lab was about bringing services to life through collaboration with communities. We delivered a new essential service that connected all Australians to systems of support locally and nationally. It also drove engagement in post offices, creating uplift in service utilisation.\n\nThe CX Guardrails project was about enabling a transformation of point-of-sale technology across Australia\u2019s largest retail network. We evolved a Future of the Post Office strategy into high-priority use cases and defined the optimal experience for the new technology.\n\nAnd the Neighbourhood Welcome Service \u2014 this one\u2019s closest to my heart. Co-designing services with communities to help new Australians feel welcome and connected. That work got published in \u2018Design for Social Innovation: Case Studies from Around the World\u2019.",
  },

  meta: {
    general: "At Craig Walker I worked on Meta\u2019s Youth Harm Minimization Nation Workshops. These were nation-wide workshops focused on understanding and designing approaches to minimise harm to young people on the platform.\n\nI can\u2019t go into too much detail given the confidential nature of the work, but it was a really significant project. It required bringing together diverse stakeholders to tackle a deeply complex problem, with genuine sensitivity to the communities affected. The methodology and facilitation design was as important as the outputs.",
  },

  education: {
    general: "I did a Bachelor of Visual Arts with Honours, which gave me the creative and critical thinking foundation that everything else is built on. Then a Diploma in Business Management, which was crucial for bridging the gap between design and business \u2014 something that\u2019s become the core of my career.\n\nBeyond the formal stuff, I\u2019ve done Scrum and SAFe certifications, Portfolio Management training, Trauma Informed Facilitation (which has been surprisingly important for community innovation work), and leadership programs covering Strategic Change, Performance, People and Executive Mindset.",
  },

  personal: {
    general: "Outside of work, I\u2019m a dad to two boys \u2014 7 and 3 \u2014 so it\u2019s pretty full-on the moment I walk through the door. They are currently focused on strategies to gain access to more nerf guns, migrate from fruit to carb-based snacks, and extending available TV hours. It\u2019s a constant negotiation.\n\nWe\u2019re big on exploring the remote country as a family. We pile into our Troopy and clock up 7,000+ kilometres. A holiday spent in the Australian desert is our desired way to connect as a family. Let\u2019s just say we like to be busy.\n\nI also collect synthesizers and make techno. I used to say I collected synthesizers for a passion in original user interfaces. Now I know it\u2019s because I loved loud noises and making techno. I managed to get some music released on some local and international labels. So, it\u2019s worth the investment... or so I tell my wife.",
  },

  geelong: {
    general: "We moved from Melbourne to Geelong in 2021. When you are next reviewing the demographic data reports from Victoria and recognise an increase in metro residents moving to regional areas \u2014 that\u2019s me and my wife. Some might say we did it for lifestyle, others might reference a ring of steel. Either way, here now and happy to commute when needed.\n\nWorking at WorkSafe Victoria, which is headquartered in Geelong, has been a great fit.",
  },

  storytelling: {
    general: "I\u2019m a big believer that storytelling is one of the most underrated capabilities in business. I talked about this on the Company Road Podcast with Chris Hudson.\n\nIf you can build a narrative that quantifies your metrics, talks to the ROI, looks at the broader potential impacts, and ultimately clarifies the scenario \u2014 you\u2019ll find your secret to cutting through the business mindset and jargon.\n\nIt\u2019s how I\u2019ve been able to get executive buy-in for design practices and innovation programs throughout my career. You can have the best work in the world, but if you can\u2019t tell the story of why it matters, you\u2019re stuck.",
  },

  podcast: {
    general: "I was a guest on The Company Road Podcast with Chris Hudson in October 2023. We had a great conversation about my design ethos and how I\u2019m applying it at WorkSafe Victoria.\n\nThe key themes we covered: embracing unexpected inputs from research and stakeholders (they can be disruptive but invaluable for refining direction), aligning business impact with personal purpose, storytelling as an underrated business capability, taking an iterative approach that creates flexibility without derailing core objectives, and identifying constraints upfront to shape your design problem effectively.\n\nIt\u2019s probably the best public summary of how I think about design leadership. Worth a listen if you\u2019re into intrapreneurship.",
  },

  philosophy: {
    general: "My design philosophy comes down to a few core beliefs.\n\nFirst, I\u2019m a systems thinker. I approach design as enterprise capability, not just project delivery. Design should shape strategies, policies, governance, and programs \u2014 not just screens.\n\nSecond, innovation must ship and scale. It can\u2019t just live in a sandbox. The Futures Lab work proved that by taking speculative work all the way to BAU.\n\nThird, I\u2019m community-centred. The best services come from designing with communities, not for them. The AusPost Welcome Service and the Community Innovation work at WorkSafe both came from that belief.\n\nAnd fourth, culture matters. Building teams where the complexity of our humanity is celebrated, not suppressed. The eNPS scores reflect that \u2014 but more importantly, so does the work.",
  },

  contact: {
    general: "Best way to reach me:\n\nEmail: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nI love connecting with other professionals and talking about innovation, product and service design, and how to navigate the complicated world of bringing creatives into corporate environments. Let\u2019s start a conversation.",
    recruiter: "Email: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nCV available on request. Referees available on request.",
  },

  pub: {
    general: "In 2020 I co-authored \u2018The Pub of the Future\u2019 as part of Melbourne Design Week, with the Craig Walker team. We held a workshop at The Old Bar in Fitzroy \u2014 two days before COVID shut everything down, which made the whole thing feel pretty prescient.\n\nWe explored three themes: the pub as the heart of community and a vital \u2018third space\u2019, the tension between commerce, community and culture, and the pub\u2019s role as a cultural ecosystem.\n\nThe key insight was that pubs don\u2019t need to be designed to be perfect. Their opportunity is to embrace, update, rethink and redefine what they\u2019ve always been: public houses where people congregate and connect.",
  },

  craig: {
    general: "Craig Walker was a formative chapter for me \u2014 September 2018 to November 2020. I was Senior Consultant, Design, and also led the Interaction Design Community of Practice across the Melbourne and Sydney studios, plus Agency (which was formerly IDEO Singapore).\n\nThat\u2019s where I really shifted into strategic and service design consulting. I worked on projects for Australia Post, Meta, Affinity Bank in Ghana, World Vision, and a confidential cash management project.\n\nThe Australia Post Neighbourhood Welcome Service work got published in \u2018Design for Social Innovation\u2019 in 2022, which was a real career highlight. And working in a studio with IDEO DNA really sharpened how I think about design methodology.",
  },

  mycash: {
    general: "MyCash was a confidential project at Craig Walker. The question was: how might we service national cash needs until cash is made redundant?\n\nWe designed and defined the operations of acquiring a new cash management network across Australia, positioned as the second phase of cash management as branches and ATMs are phased out. It\u2019s supported by a central application that mobilises subcontractors, and the service is digital-centric.\n\nI can\u2019t go into more detail given the confidential nature, but it was a fascinating systems design challenge \u2014 designing for something that\u2019s actively being phased out while still being essential.",
  },

  awards: {
    general: "I was a finalist in Service Design at the Victorian Premier Design Awards for the Enterprise Design Practice work at WorkSafe Victoria. That was a proud moment \u2014 getting external recognition that what we\u2019d built was genuinely good practice, not just good enough for government.\n\nMy work on the Australia Post Neighbourhood Welcome Service at Craig Walker was published in \u2018Design for Social Innovation: Case Studies from Around the World\u2019 in 2022. That\u2019s probably the most personally meaningful recognition \u2014 the project was built on genuine community collaboration.\n\nEarlier in my career, I won the 2005 Lucato Peace Prize with a multimedia presentation exploring both sides of peace and war.",
  },

  whatcanido: {
    general: "Three things, really.\n\nNeed a problem clarified? I use design research and strategic thinking to cut through complexity and get to the real issue. Sometimes the brief you\u2019ve been given isn\u2019t the actual problem.\n\nNeed a solution defined? I bring together multidisciplinary teams to design services, experiences and strategies that actually work. Not just beautiful \u2014 effective.\n\nNeed an experience delivered? I\u2019ve led delivery across government, financial services, tech and retail \u2014 from speculative futures all the way through to scaled production.\n\nIf you\u2019re not sure which one you need, that\u2019s fine too \u2014 I can help figure that out.",
  },
};

// Follow-up and correction detection
const FOLLOWUP = ["tell me more", "more about that", "go on", "expand", "keep going", "what else", "go deeper", "elaborate", "continue", "more detail"];
const CORRECTION = ["no i meant", "not that", "actually i", "i was asking", "no,", "that's not", "wrong", "i meant", "rephrase", "different question"];

function isFollowUp(q) { return FOLLOWUP.some(t => q.toLowerCase().includes(t)); }
function isCorrection(q) { return CORRECTION.some(t => q.toLowerCase().includes(t)); }

// --- UI ---
const TypingIndicator = () => (
  <div style={{ display: "flex", padding: "6px 20px" }}>
    <div style={{ background: "rgba(232,164,184,0.25)", borderRadius: "20px 20px 20px 6px", padding: "16px 20px", display: "flex", gap: 6 }}>
      {[0, 1, 2].map(i => (<div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8A4B8", opacity: 0.6, animation: "typingDot 1.4s infinite " + (i * 0.2) + "s" }} />))}
    </div>
  </div>
);

const Bubble = ({ text, isUser }) => (
  <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", padding: "4px 20px", animation: "messageIn 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
    <div style={{ maxWidth: "82%", padding: "14px 18px", borderRadius: isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px", background: isUser ? "rgba(237,226,212,0.15)" : "rgba(232,164,184,0.2)", color: "#EDE2D4", fontSize: 15, lineHeight: 1.6, fontFamily: "'Outfit', sans-serif", border: isUser ? "1px solid rgba(237,226,212,0.15)" : "1px solid rgba(232,164,184,0.12)", whiteSpace: "pre-wrap" }}>{text}</div>
  </div>
);

const Chip = ({ label, onClick }) => (
  <button onClick={onClick} style={{ background: "rgba(232,164,184,0.15)", border: "1px solid rgba(232,164,184,0.3)", borderRadius: 100, padding: "8px 16px", fontSize: 13, fontFamily: "'Outfit'", fontWeight: 500, color: "#EDE2D4", cursor: "pointer", margin: "2px" }}>{label}</button>
);

const SUGGESTIONS = ["What's your design background?", "What can you help with?", "Tell me about your leadership style", "Walk me through the Futures Lab"];

function AndrewAgent() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [welcome, setWelcome] = useState(true);
  const [lastTopic, setLastTopic] = useState(null);
  const [chips, setChips] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, chips]);

  const reply = (topic, allMsgs) => {
    const persona = inferPersona(allMsgs);
    const data = R[topic] || R.default;
    return data[persona] || data.general;
  };

  const pickTopic = (topic) => {
    setChips(null);
    setLastTopic(topic);
    setTyping(true);
    setTimeout(() => {
      setMsgs(prev => [...prev, { text: reply(topic, msgs), isUser: false }]);
      setTyping(false);
    }, 700 + Math.random() * 800);
  };

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setWelcome(false);
    setChips(null);
    const next = [...msgs, { text: msg, isUser: true }];
    setMsgs(next);
    setInput("");

    if (isCorrection(msg)) {
      setTyping(true);
      setTimeout(() => {
        setMsgs(prev => [...prev, { text: "No worries \u2014 what were you after? I can talk about my career, specific projects, leadership approach, design philosophy, industry experience, personal interests, or how to get in touch.", isUser: false }]);
        setTyping(false);
        setLastTopic(null);
      }, 500);
      return;
    }

    if (isFollowUp(msg) && lastTopic) {
      setTyping(true);
      setTimeout(() => {
        setMsgs(prev => [...prev, { text: "That covers the main points on that one. But I\u2019m happy to go in a different direction \u2014 ask me about a specific project, my approach to something, or anything else you\u2019re curious about.", isUser: false }]);
        setTyping(false);
      }, 600);
      return;
    }

    const scores = scoreTopics(msg);
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = ranked.length > 0 ? ranked[0] : null;

    if (top && top[1] >= THRESHOLD) {
      pickTopic(top[0]);
    } else if (ranked.length > 0) {
      setTyping(true);
      const options = ranked.slice(0, 3).map(([t]) => ({ topic: t, label: LABELS[t] || t }));
      setTimeout(() => {
        setMsgs(prev => [...prev, { text: "I want to make sure I point you in the right direction. Were you asking about one of these?", isUser: false }]);
        setChips(options);
        setTyping(false);
      }, 600);
    } else {
      setTyping(true);
      setTimeout(() => {
        setMsgs(prev => [...prev, { text: "Hmm, I\u2019m not sure I\u2019ve got a specific answer for that one. Here are some things I can talk about though \u2014 pick whatever\u2019s closest to what you\u2019re after:", isUser: false }]);
        setChips([
          { topic: "background", label: "Career background" },
          { topic: "enterprise", label: "WorkSafe projects" },
          { topic: "clients", label: "Clients I've worked with" },
          { topic: "whatcanido", label: "What I can help with" },
          { topic: "personal", label: "Personal stuff" },
          { topic: "contact", label: "Get in touch" },
        ]);
        setTyping(false);
      }, 600);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#5B4FD6", maxWidth: 520, margin: "0 auto", overflow: "hidden", borderRadius: 12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 0.9; } }
        @keyframes messageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes subtlePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        input::placeholder { color: rgba(237,226,212,0.4); }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid rgba(232,164,184,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(232,164,184,0.25)", border: "1.5px solid rgba(232,164,184,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#EDE2D4", fontSize: 17, fontWeight: 800 }}>AB</span></div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#EDE2D4" }}>Andrew B.</div>
              <div style={{ fontSize: 12, color: "rgba(237,226,212,0.6)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8A4B8", animation: "subtlePulse 2.5s infinite" }} />Design & Innovation</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="mailto:andrew.n.broughton@gmail.com" style={{ color: "rgba(237,226,212,0.6)", display: "flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13L2 4"/></svg></a>
            <a href="https://www.linkedin.com/in/anmbroughton/" target="_blank" rel="noopener" style={{ color: "rgba(237,226,212,0.6)", display: "flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column" }}>
        {welcome && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px", animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(232,164,184,0.2)", border: "2px solid rgba(232,164,184,0.35)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}><span style={{ color: "#EDE2D4", fontSize: 32, fontWeight: 800 }}>AB</span></div>
            <h1 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, color: "#EDE2D4", textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>G'day, I'm Andrew.</h1>
            <p style={{ fontSize: 15, color: "rgba(237,226,212,0.65)", textAlign: "center", lineHeight: 1.6, maxWidth: 320, marginBottom: 36 }}>Design leadership that turns complexity into clarity and momentum.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 360 }}>
              {SUGGESTIONS.map((q, i) => (<button key={i} onClick={() => send(q)} style={{ background: "transparent", border: "1.5px solid rgba(237,226,212,0.35)", borderRadius: 100, padding: "10px 18px", fontSize: 13, fontFamily: "'Outfit'", fontWeight: 500, color: "#EDE2D4", cursor: "pointer" }}>{q}</button>))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => <Bubble key={i} text={m.text} isUser={m.isUser} />)}
        {typing && <TypingIndicator />}
        {chips && (
          <div style={{ padding: "8px 20px", display: "flex", flexWrap: "wrap", gap: 4, animation: "messageIn 0.3s ease" }}>
            {chips.map((c, i) => <Chip key={i} label={c.label} onClick={() => pickTopic(c.topic)} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ overflow: "hidden", borderTop: "1.5px solid rgba(232,164,184,0.3)", borderBottom: "1.5px solid rgba(232,164,184,0.3)", padding: "8px 0", background: "rgba(232,164,184,0.08)" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "marquee 20s linear infinite", fontSize: 12, fontWeight: 600, color: "rgba(237,226,212,0.45)" }}>
          {[0, 1].map(i => (<span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ padding: "0 16px" }}>Making the unreal real</span><span style={{ color: "#E8A4B8" }}>{"\u2192"}</span><span style={{ padding: "0 16px" }}>Design everything</span><span style={{ color: "#E8A4B8" }}>{"\u2192"}</span><span style={{ padding: "0 16px" }}>Design is our mindset</span><span style={{ color: "#E8A4B8" }}>{"\u2192"}</span></span>))}
        </div>
      </div>
      <div style={{ padding: "12px 16px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(237,226,212,0.1)", borderRadius: 28, padding: "6px 6px 6px 20px", border: "1.5px solid rgba(237,226,212,0.12)" }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}} placeholder="Ask Andrew something..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontFamily: "'Outfit'", color: "#EDE2D4", padding: "10px 0" }} />
          <button onClick={() => send()} disabled={!input.trim() || typing} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() && !typing ? "#E8A4B8" : "rgba(237,226,212,0.1)", color: input.trim() && !typing ? "#5B4FD6" : "rgba(237,226,212,0.3)", cursor: input.trim() && !typing ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(237,226,212,0.3)", fontWeight: 500 }}>AI representation · Responses from Andrew's portfolio</div>
      </div>
    </div>
  );
}


// Expose globally so the site can mount it on demand
window.AndrewAgent = AndrewAgent;

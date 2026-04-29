// --- AI Andrew chat agent — client-side, rule-based ---
const { useState, useRef, useEffect } = React;
function inferPersona(messages) {
  const all = messages.map(m => m.text).join(" ").toLowerCase();
  const sc = { recruiter: 0, designer: 0, hiringmgr: 0, team: 0, colleague: 0 };
  const s = (k, terms) => terms.forEach(t => { if (all.includes(t)) sc[k] += 2; });
  s("recruiter", ["cv","resume","candidate","notice period","years experience","team size","salary","contract","permanent","screening","shortlist"]);
  s("designer", ["process","methodology","craft","figma","design system","double diamond","hcd","your approach","how do you design","portfolio"]);
  s("hiringmgr", ["built a team","scaled","executive buy-in","stakeholder management","embed","capability","org design","governance","tell me about a time"]);
  s("team", ["our team","my development","your expectations","feedback","1:1","growth","prioritisation","what do you value"]);
  s("colleague", ["your team","engage with design","my project","my program","help with","request design","sprint","what does design do"]);
  const max = Math.max(...Object.values(sc));
  if (max === 0) return "general";
  return Object.keys(sc).find(k => sc[k] === max);
}
const TOPICS = {
  background: ["background","experience","career","journey","history","tell me about you","who are you","your story","where have you worked","previous roles","what have you done","walk me through"],
  leadership: ["leadership","leader","manage","team","style","how do you lead","people management","direct reports","culture","enps"],
  roles: ["role","targeting","looking for","next move","available","hire","open to","sweet spot","ideal role","type of work"],
  innovation: ["innovati","pilot","prototype","speculative","new product","new service","experiment","exploration","weak signal"],
  innovationcentre: ["innovation cent","innovation center","ventures","products and services","three areas","how is innovation structured"],
  futures: ["futures lab","2025 strategy","threats and opportunities","return to work","future of data","robotics safety","mental health injuries"],
  emergingfutures: ["emerging futures","foresight","environmental scan","future of work","scenario model","future trends","systemic change"],
  enterprise: ["enterprise design","design practice","design function","1.8m","dual track","gels","program extensions"],
  designprocess: ["design process","methodology","how do you work","double diamond","discovery","execution","dvf","desirability","feasibility","viability","how does design work","clarify","immerse","scope"],
  ai: ["ai policy","artificial intelligence","ai governance","enterprise ai"],
  community: ["community innov","social innov","equitable","lived experience","co-design","codesign","multicultural","safety cards","safe support","worker safety","culturally diverse","eccv"],
  neighbourhood: ["neighbourhood welcome","welcome service","welcome pack","welcome space","community connector","footscray","nws"],
  auspost: ["australia post","auspost","co-lab","colab","guardrail","post office"],
  meta: ["meta","youth harm","facebook","harm minimization","harm minimisation"],
  education: ["education","qualification","degree","study","uni","bachelor","diploma","scrum","safe certification"],
  personal: ["personal","outside work","hobby","family","kids","synth","techno","music","desert","troopy","travel","interests","free time","fun","mr bronson","bad party","100% silk"],
  geelong: ["geelong","where do you live","where are you based","where are you located","commute"],
  storytelling: ["storytelling","narrative","storytell","how do you communicate"],
  podcast: ["podcast","company road","chris hudson"],
  philosophy: ["philosophy","approach","believe","values","principles","what drives you","manifesto","mindset"],
  evolutionofdesign: ["evolution of design","how has design changed","design evolved","design as a discipline","stages of design","civic design","social innovation design"],
  designautonomy: ["autonomy","ownership","trust","empower","agency","self-directed","how do you give autonomy"],
  contact: ["contact","email","phone","reach","linkedin","get in touch","connect with you","your details","cv","resume"],
  pub: ["pub of the future","pub","design week","old bar","third space"],
  craig: ["craig walker","consultancy work","consulting days","ideo"],
  mycash: ["mycash","cash management","cash network","future of cash"],
  awards: ["award","recognition","published","premier design","social innovation","achievements","accolades"],
  whatcanido: ["what can you do","what do you offer","services","how can you help","what does your team do","capabilities","what do you bring"],
  government: ["government","public sector","gov","regulator","regulatory","worksafe","policy"],
  retail: ["retail","coles","flybuys","seek","shopping","point of sale","pos"],
  finance: ["finance","financial","bank","banking","me bank","cash","fintech"],
  tech: ["technology","tech","software","digital","programmatic","ecommerce","platform"],
  clients: ["clients","who have you worked with","who have you worked for","companies","brands","organisations"],
};
const THRESHOLD = 1.5;
function scoreTopics(input) {
  const q = input.toLowerCase(); const scores = {};
  for (const [topic, terms] of Object.entries(TOPICS)) {
    let score = 0;
    for (const term of terms) { if (q.includes(term)) score += term.split(" ").length > 1 ? 3 : 1; }
    if (score > 0) scores[topic] = score;
  }
  return scores;
}
const LABELS = {
  background:"My career background",leadership:"How I lead",roles:"Roles & capabilities",
  innovation:"Innovation approach",innovationcentre:"The Innovation Centre",futures:"The Futures Lab",
  emergingfutures:"Emerging Futures",enterprise:"Enterprise Design Practice",
  designprocess:"Design process & methodology",ai:"AI Policy work",community:"Community Innovation",
  neighbourhood:"Neighbourhood Welcome Service",auspost:"Australia Post projects",
  meta:"Meta / Youth Harm",education:"Education",personal:"Personal life",
  geelong:"Location",storytelling:"Storytelling",podcast:"Podcast",
  philosophy:"Design philosophy",evolutionofdesign:"Evolution of design",
  designautonomy:"Design autonomy",contact:"Contact details",pub:"Pub of the Future",
  craig:"Craig Walker",mycash:"MyCash",awards:"Awards",whatcanido:"What I can help with",
  government:"Government experience",retail:"Retail experience",finance:"Finance experience",
  tech:"Technology background",clients:"Clients I've worked with",
};
const R = {
  default: {
    general: "G’day! I’m Andrew Broughton. I help organisations transform through design — aligning strategy, service and experience to create meaningful, measurable change.\n\nI’ve been doing this for over 18 years now, across agencies, consultancies and in-house. Currently I’m Practice Lead for Enterprise Design at WorkSafe Victoria.\n\nAsk me about anything — specific projects, how I work, what I believe about design, or just what I get up to outside of work. I’m an open book.",
    recruiter: "G’day. Andrew Broughton — Practice Lead, Enterprise Design at WorkSafe Victoria. 18+ years across agency, consultancy and in-house. Led teams up to 25+. Happy to answer anything about my experience.",
    designer: "G’day! I’m Andrew — I’ve spent 18+ years working across the full design spectrum, and I still love getting into the detail of how things get made. Currently leading design at WorkSafe Victoria. What would you like to know?",
    hiringmgr: "G’day. I’m Andrew Broughton — I build and scale design capability inside complex organisations. Currently leading a 25+ person practice at WorkSafe Victoria on the Delivery SLT. Happy to talk through how I approach things.",
    team: "Hey! Ask me anything — about the practice, how I think about things, your development, or just what’s on your mind. No question is too small.",
    colleague: "G’day! I’m Andrew — I lead the Enterprise Design practice here. We work across service and experience design to help the org tackle complex problems. Ask me anything about what we do or how we might help with your work.",
  },
  background: {
    general: "My career has had three pretty distinct chapters, and each one built on the last.\n\nEarly on I was deep in technology — building software, POS systems, ecommerce platforms, programmatic advertising. I actually learned to code in those early days, which gives you a fundamentally different understanding of what’s possible and what’s hard.\n\nThen I moved into creativity and consumer behaviour — building brands, campaigns, through-the-line strategies for clients like Optus, Coles, Seek, Flybuys. Understanding how people move through a funnel really shaped how I think about service journeys now.\n\nThen innovation brought it all together. Helping businesses develop novel products and services across finance, tech, retail, regulation and philanthropy. Building evidence through pilots and prototypes is honestly what makes me buzz.\n\nMost recently I’ve been at WorkSafe Victoria, where I built the Enterprise Design Practice from scratch — centralising design capability inside a government agency. It’s been the hardest and most rewarding thing I’ve done.",
    recruiter: "18+ years. Started in digital production — Ford, MIFF, Melbourne Museum. Moved through creative leadership at Me Bank, Optus (via Big Red Group), and Coles/Seek/Flybuys (via Whippet). Then strategic consulting at Craig Walker working with Australia Post, Meta, World Vision and others.\n\nSince November 2020 I’ve been Practice Lead, Enterprise Design at WorkSafe Victoria. Led teams from 3 to 25+.",
    designer: "Three phases. I started making things — software, ecommerce, programmatic. I learned to code early on, ActionScript and PHP. That gives you an instinct for feasibility you can’t get from a bootcamp.\n\nThen creativity and consumer behaviour — brands, campaigns, through-the-line. Understanding funnels completely changed how I approach service design.\n\nThen innovation pulled it together — speculative futures, novel products, pilots. That’s where strategy, service design and business acumen intersect.",
    hiringmgr: "The career arc has been deliberate. Technology delivery gave me technical fluency. Creative leadership gave me craft depth. Strategic consulting and innovation gave me business acumen.\n\nAt Craig Walker I led consulting for Australia Post, Meta, and others. Since 2020 I’ve built the Enterprise Design Practice at WorkSafe from zero — org design, executive endorsement, hiring the team, embedding into delivery. A 25+ person function on the Delivery SLT.",
    team: "I started making websites and software — Ford, MIFF, museums. Learned to code, which I’m still grateful for. Then creative leadership for Optus and Coles. Then Craig Walker, where I fell in love with service design.\n\nWorkSafe has been about building something from scratch that genuinely changes how an organisation works. Most rewarding chapter by far.",
    colleague: "Before WorkSafe I spent 18+ years across design agencies and consultancies. Started in technology, moved through creative and marketing leadership, then strategic consulting. I was at Craig Walker with Australia Post and Meta before joining here in November 2020 to build the design practice.",
  },
  leadership: {
    general: "Honestly, it’s about creating the conditions for great work to happen — not being the smartest person in the room.\n\nI lead a team of 25+ including three senior managers. My focus is culture first, capability second, outcomes third. Get the first two right and the third follows.\n\nWe took eNPS from +20 to +41 over two years. That’s not a number I engineered — it reflects a team that feels valued, trusted and empowered.\n\nThe harder skill I’ve had to learn is translation. Helping the business understand design’s value in their language — cost savings, productivity uplift, risk reduction. Storytelling is the secret weapon there.",
    recruiter: "Team of 25+ including 3 senior managers. CEO and Executive stakeholders. eNPS +20 to +41 over two years. Vic Premier Design Awards finalist. Leadership since 2015.",
    designer: "Best design leaders remove obstacles rather than direct traffic. Clear briefs, strong stakeholder relationships, room to think, and a culture where people push ideas.\n\nThe craft of leadership is different from the craft of design, but they’re both crafts.",
    hiringmgr: "Culture, capability, outcomes — in that order. eNPS +20 to +41 over two years. Deliberate investment in people, clarity of purpose, protecting the team from noise.\n\nTranslation is critical — cost savings, productivity uplift, risk reduction. That earns executive trust.",
    team: "I want to build conditions where you do your best work. Clear expectations, honest feedback, room to grow, someone in your corner with stakeholders.\n\nI value curiosity, initiative, honesty. Challenge an approach rather than silently disagree.",
    colleague: "Making design useful to the broader org. My team understands your world — deadlines, constraints, stakeholders — and works within that.\n\nIf design can’t demonstrate value in your terms, we haven’t done our job.",
  },
  designprocess: {
    general: "Our design practice at WorkSafe operates in two modes: Discovery and Execution.\n\nDiscovery clarifies the problem space and proposes desirable, feasible and viable solutions. We use design research and service design to deliver clear recommendations. Execution works within cross-functional teams to bring solutions to market.\n\nThe process: Clarify, Immerse, Scope, Test, Deliver. Every solution gets evaluated through three lenses — Desirability (should we build it?), Feasibility (can we build it?), Viability (will it sustain?). You need all three to create valued experiences.\n\nWe scale the approach based on what’s known. Unknown problem, unknown solution? Full Double Diamond. Known problem, unknown solution? Initiate sprint. Everything understood? Straight to Execution.\n\nCapabilities span strategic design, design research, service design, strategic experience design, interaction design, and design systems. We match the right capability to the right challenge.\n\nFive principles drive it all: deliver value (outcomes over outputs), show through doing, design is our mindset not our vocabulary, look for the worst (ambiguity is our heaven), and build trust through de-risking.",
    designer: "Two modes — Discovery and Execution. Discovery splits into Identify (problem discovery/definition) and Initiate (solution design/validation). Execution is the Build phase.\n\nFour project approaches: full Double Diamond for ambiguous problems, Identify Sprints for broad questions, Initiate Sprints when the problem is clear but solutions aren’t, and Execution when both are understood.\n\nMethods in Discovery: stakeholder mapping, qualitative/quantitative research, expert interviews, co-design, personas, current-state mapping, prototyping, synthesis, gap analysis. In Execution: wireframing, IA, high-res prototyping, user testing, UI design.\n\nThe DVF model is central — Desirability, Feasibility, Viability. Everything through all three lenses.",
    colleague: "Our design process works in two modes. Discovery clarifies what the real problem is and proposes solutions — this is where we add the most value early, before significant investment. Execution works within delivery teams to build and ship.\n\nWe evaluate everything through three lenses: desirable for users, technically feasible, and viable for the business. If your project has ambiguity about what to build or who it’s for, Discovery is where we start.",
  },
  innovation: { general: "Innovation is where all the threads come together — creativity, technology, business acumen. I love aligning strategy, diverging on ideas, then building and testing pilots to create real evidence for investment.\n\nAt WorkSafe I ran the Innovation Center — 15+ people across product, project management, change, development and design. The operating model works across three layers: strategic alignment with WorkSafe, experimentation in the lab, and impact in community.\n\nThe lab operates a flat structure — removing waterfall blockers. The principle: we only ask you consult with who your decision will impact.\n\nThree design modes: strategic design, human-centred design, and business delivery. We take work from environmental scans and ecosystem insights through to evidence-based future solutions. Building that evidence is what makes me buzz." },
  innovationcentre: { general: "The Innovation Centre at WorkSafe is structured across three areas.\n\nFutures Lab — research and design to identify emerging trends, then experiments with workers to measure real community impact.\n\nVentures — partners with the innovation ecosystem to build and scale worker wellbeing products and services.\n\nProducts & Services — uncovers, tests and validates new safety solutions through human-centred design.\n\nThe goal: deliver future solutions to the wicked problems WorkSafe will face. Strategic design aligned to business, experimentation in community, creation of preferable futures.\n\nThe lab runs a flat structure — we only ask you consult with who your decision will impact. No waterfall blockers around decision-making." },
  futures: { general: "The Futures Lab uses strategic alignment to the business to create time and space for design to thrive. The goal: deliver potential future solutions to the wicked problems WorkSafe will face.\n\nWe scanned for weak signals, mapped threats and opportunities, developed scenarios, and designed novel products and services. That work became the front end of the 2025 WorkSafe Strategy.\n\nFour key challenge areas drove the work. Return to work in the modern economy — leveraging new ways of working after injury. The future of data in prevention — using AI and data to prevent injuries at scale. Accelerating safety via robotics — removing people from high-risk work. And reducing conflict to prevent mental health injuries — addressing root causes of bullying and harassment.\n\nThe futures spectrum moves from probable to plausible to preferable, spanning past, now, near and future. The design function creates qualitative learnings in problem spaces then asks ‘what if?’ to divert the probable future to a preferable one.\n\nWe spun up four pilot streams, tested with cohorts of 20+, and one became BAU. In a risk-averse regulator, taking speculative work to business-as-usual in 18 months was significant." },
  emergingfutures: { general: "The Emerging Futures work anticipated systemic change rather than reacting to current issues.\n\nMethodology: environmental scan of 80+ reports on workforce trends, tech developments, health systems and social change. Expert interviews across academia, industry and government. Synthesis into themes, trends and scenarios.\n\nThree themes emerged. Changing community — migration, ageing workforce, identity complexity. Changing work — gig economy, remote work, increased autonomy. System interdependencies — tech, health, community and industry intersecting in ways that propagate risk.\n\nDesign response: foresight, scenarios, provocations, experiments. The key insight: design shapes the future rather than reacting to it." },
  enterprise: { general: "My signature piece. How might we create modern ways of work inside a government agency and start a centralised design practice inside a delivery model?\n\n$1.8M cost saving by internalising design. Dual Track and GELs cut program extensions by 50%. Turned around underperforming tech programs — 4x productivity drop without design, 4x gain after redesign.\n\nRebooted legislative change programs by clarifying problems and aligning with strategic goals. Front-end visions across key streams to secure executive buy-in.\n\neNPS +20 to +41 over two years. Design is now understood, desired, and business critical at WorkSafe. We’ve been asked to partner with the executive, define problems, and clarify solutions. That’s the real outcome." },
  ai: { general: "Currently working on Enterprise AI Policy at WorkSafe alongside the technology division (2024–2025). Can’t share details yet.\n\nA good example of design leadership extending beyond traditional boundaries — into governance, strategy, emerging tech. Same approach: understand the problem, map stakeholders, test assumptions, iterate.\n\nandrew.n.broughton@gmail.com if you want to discuss design thinking applied to AI policy." },
  community: { general: "Community Innovation tackled a critical challenge. Multicultural workers face disproportionate unsafe conditions — language barriers, cultural differences, systemic distrust, limited access to clear safety information. COVID amplified everything.\n\nWe used community-based participatory design with 50+ community members, partnering with the Ethnic Communities’ Council of Victoria. All engagement in-language.\n\nSix insights: inadequate safety training in English only; language as a fundamental safety barrier; cultural perception of safety as optional; fear preventing reporting due to job loss or visa risks; cultural safety gaps; reliance on informal networks over formal systems.\n\nThree solutions. COVID Safety Cards — multilingual, visual, translated into 18+ languages, distributed via trader walks across metro Melbourne. Safe Support — a tool for structured safety conversations in in-home work where workers, clients and families sign commitments. Worker Safety Starter Kit — modular education on rights and responsibilities for community orgs to distribute.\n\nFive principles: every interaction culturally safe; participant safety is number one; invest in true partnerships; lean into co-creation over consultation; create equitable experiences across communities.\n\nKey insight: workplace safety isn’t purely compliance. It’s cultural, psychological, systemic — requiring trust-based, community-led solutions." },
  neighbourhood: { general: "The Neighbourhood Welcome Service is closest to my heart. How might we help people feel welcomed and connected within their neighbourhood?\n\nAustralia is increasingly diverse while experiencing rising loneliness. Australia Post saw an opportunity to act as a community connector through its national network.\n\nWe co-designed through the Footscray Co-Lab — a pop-up lab using open days, service safaris, workshops, live prototyping, and community engagement. What we built: welcome packs, welcome spaces within post offices, community connectors, and an advocacy model.\n\nExperience flow: awareness, post office entry, Welcome Pack, Welcome Space, ongoing community participation.\n\nDelivered an end-to-end service model, 70+ design assets, and a scalable framework. Published in ‘Design for Social Innovation’.\n\nWorking closely with community created space for unexpected, compelling leads. The lab attracted significant interest from leadership across Australia Post and was likely to expand to multiple locations.\n\nKey insight: social connection has to be designed through systems, spaces and relationships." },
  auspost: { general: "Several Australia Post projects at Craig Walker.\n\nCo-Lab — a pop-up lab in Footscray using co-design to create and test new services. Open days, service safaris, workshops, live prototyping. Delivered a new essential service connecting Australians to local and national support systems.\n\nCX Guardrails — guiding principles for POS technology transformation across Australia’s largest retail network. Evolved Future of the Post Office strategy into use cases and optimal experiences.\n\nNeighbourhood Welcome Service — co-designed with communities to welcome new Australians. Published in ‘Design for Social Innovation’. Ask me about that one specifically for the full story." },
  meta: { general: "Meta’s Youth Harm Minimization Nation Workshops at Craig Walker. Nation-wide workshops on minimising harm to young people on the platform.\n\nConfidential, but a significant project requiring diverse stakeholders tackling a deeply complex problem with genuine sensitivity to affected communities. Methodology and facilitation design was as important as the outputs." },
  education: { general: "Bachelor of Visual Arts with Honours at the University of Ballarat — the creative and critical thinking foundation. Cert 4 Small Business Management at RMIT — bridging design and business, which became core to my career.\n\nScrum certification (Scrumology / Kane Mar), SAFe, Portfolio Management, Trauma Informed Facilitation, and leadership programs in Strategic Change, Performance, People and Executive Mindset.\n\nStarted with a Cert 4 Visual Arts at Brighton Bay before university. The combination of creative foundations and business training has been the most valuable thing in my career." },
  personal: { general: "Dad to two boys — 7 and 3. They’re focused on nerf gun acquisition, carb-based snack migration, and extending TV hours. Constant negotiation.\n\nWe explore remote Australia as a family — pile into our Troopy, clock 7,000+ km. Desert holidays are how we connect. Let’s just say we like to be busy.\n\nI make electronic music under the moniker Mr Bronson. Signed to LA-based label 100% Silk, co-founded Bad Party Records out of Fitzroy. Latest LP is Trans Pacific. I collect synthesizers — I used to say it was for original user interfaces, but honestly I just love loud noises and making techno. Worth the investment... or so I tell my wife.\n\nI also used to captain the Old Bar Unicorns in the Renegade Football League — a gender-inclusive footy team in metro Melbourne." },
  geelong: { general: "Moved from Melbourne to Geelong in 2021. Some say lifestyle, others say ring of steel. Either way, here now and happy to commute.\n\nWorkSafe Victoria is headquartered in Geelong, which has been a great fit." },
  storytelling: { general: "Storytelling is one of the most underrated capabilities in business. I talked about this on the Company Road Podcast.\n\nIf you can build a narrative that quantifies metrics, talks to ROI, and clarifies the scenario — that’s your secret to cutting through business jargon.\n\nIt’s how I’ve gotten executive buy-in for design practices and innovation programs. You can have the best work in the world, but if you can’t tell the story of why it matters, you’re stuck." },
  podcast: { general: "Guest on The Company Road Podcast with Chris Hudson, October 2023. Design ethos and applying it at WorkSafe.\n\nKey themes: embracing unexpected inputs, aligning impact with purpose, storytelling as a business capability, iterative flexibility, and identifying constraints upfront to shape the design problem.\n\nProbably the best public summary of how I think about design leadership." },
  philosophy: { general: "We’ve codified this into a practice manifesto at WorkSafe. We are evolving. Design is evolving. We have proven we can clarify problems and define solutions. We’ve designed visions and futures. All for the good of the Victorian working community — not for financial gain.\n\nDesign is understood. Design is desired. Design is now business critical. We’ve been asked to partner with the executive and help define problems and clarify solutions. This is our opportunity for meaningful impact — to design social innovation, to design reform.\n\nPersonally: systems thinker. Design as enterprise capability, not project delivery. Innovation must ship and scale. Community-centred — design with people, not for them. Culture matters.\n\nFive practice principles: deliver value (outcomes over outputs), show through doing, design is our mindset not vocabulary, look for the worst (ambiguity is our heaven — make the unreal real), build trust.\n\nI operate across three modes: practice (how design works), methods (how design is done), foresight (where design acts next)." },
  evolutionofdesign: { general: "Four stages, and my career tracked through all of them.\n\nCreative design — visual output and execution. My early career.\n\nProduct and communications design — UX/UI, marketing effectiveness. My middle career.\n\nDesign as a professional service — working with business to define value. Craig Walker.\n\nSocial innovation and civic design — system level, influencing policy and public services. WorkSafe.\n\nThe core shift: output delivery to system shaping. Design is becoming infrastructure for decision-making across organisations and society." },
  designautonomy: {
    general: "Autonomy is the degree to which designers feel genuine ownership over their work.\n\nIt’s not something you hand over. It’s created through three conditions: trust, transparency, and clear expectations. Any one missing and it breaks down.\n\nMy job: enable decision-making, advocate for designers, provide structure without constraint. That balance is the hardest to get right.\n\nKey insight: autonomy is not given — it’s created through alignment and trust. When your team understands the why, they don’t need you to dictate the how.",
    team: "Autonomy matters to me. I want you to feel real ownership over your work.\n\nWhat makes it work: trust, transparency, clear expectations. If you know what we’re achieving and why, you shouldn’t need me hovering over the how. My job is structure that helps without constraining, and advocacy when you need support.\n\nIf the balance isn’t right — too much direction or not enough clarity — tell me.",
  },
  contact: {
    general: "Email: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nI love connecting with other professionals and talking about innovation, product and service design, and bringing creatives into corporate environments. Let’s start a conversation.",
    recruiter: "Email: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nCV and referees available on request.",
  },
  pub: { general: "Melbourne Design Week 2020 with the Craig Walker team. Workshop at The Old Bar in Fitzroy — two days before COVID shut everything down.\n\nFour lenses: pubs as urban design hubs, creative ecosystems supporting artists and culture, spaces for social connection (the quintessential third space), and sustainability — environmental and economic pressures.\n\nKey insight: the value of pubs lies not just in commerce but in facilitating community and culture. They need to embrace what they’ve always been: public houses where people connect." },
  craig: { general: "September 2018 to November 2020. Senior Consultant, Design. IxD Community of Practice Lead across Melbourne, Sydney and Agency (formerly IDEO Singapore).\n\nThe shift into strategic and service design consulting. Projects for Australia Post, Meta, Affinity in Ghana, World Vision, and confidential cash management work.\n\nThe AusPost Neighbourhood Welcome Service got published in ‘Design for Social Innovation’ 2022. Working in a studio with IDEO DNA sharpened how I think about methodology." },
  mycash: { general: "Confidential project at Craig Walker. How might we service national cash needs as branches and ATMs phase out?\n\nDesigned operations of a new cash management network — digital-centric, central app mobilising subcontractors. Fascinating systems design challenge — designing for something actively being phased out while still essential." },
  awards: { general: "Finalist in Service Design at the Victorian Premier Design Awards — Enterprise Design Practice at WorkSafe. External recognition that it was genuinely good practice, not just good enough for government.\n\nPublished in ‘Design for Social Innovation: Case Studies from Around the World’ (2022) — AusPost Neighbourhood Welcome Service. Most personally meaningful recognition.\n\n2005 Lucato Peace Prize — multimedia presentation exploring peace and war." },
  whatcanido: { general: "Three things.\n\nNeed a problem clarified? Design research and strategic thinking to cut through complexity. Sometimes the brief you’ve been given isn’t the actual problem.\n\nNeed a solution defined? Multidisciplinary teams designing services, experiences and strategies that work. Not just beautiful — effective.\n\nNeed an experience delivered? Government, financial services, tech and retail — from speculative futures to scaled production.\n\nNot sure which? I can help figure that out." },
  government: { general: "Government has been huge, particularly five years at WorkSafe. Working inside a regulator taught me about navigating complexity, risk aversion, and making change where the default is caution.\n\nBuilt the Enterprise Design Practice from scratch — org design, executive endorsement, hiring, embedding into delivery. Futures Lab shaped the 2025 strategy. Community Innovation delivered equitable services through co-design.\n\nThe impact in government is real and broad. Improving a service at WorkSafe affects every worker in Victoria." },
  retail: { general: "Retail runs through the middle of my career. At Whippet: Coles Supermarkets, Coles Financial Services, Flybuys, Seek, Amplifon. Online Channel Strategy, Personalisation Strategy, through-the-line creative.\n\nAt Craig Walker: Australia Post CX Guardrails — POS technology transformation across Australia’s largest retail network.\n\nBig Red Group: Optus creative across display, eDM, social, web.\n\nSeen retail from the marketing side, technology side, and service design side." },
  finance: { general: "Design Manager at Me Bank — team of 10+, SLAs, platform integration.\n\nMyCash at Craig Walker — future of cash management as branches phase out. Systems design challenge.\n\nAffinity in Ghana — Inclusive Digital Banking Strategy for communities excluded from traditional banking.\n\nColes Financial Services at Whippet. Touched finance from high street to fintech to inclusive design." },
  tech: { general: "Technology is where I started. Learned to code ActionScript, Java, HTML, PHP, CSS at Next Digital on Ford Australia. Built interactive displays for ScienceWorks and Melbourne Museum — some still running.\n\nNow shifted to strategy — Enterprise AI Policy at WorkSafe, design practice embedded in tech delivery through Dual Track and GELs.\n\nHaving a technology foundation makes you a better designer. Feasibility instinct and credible engineering conversations." },
  clients: { general: "Meta, Australia Post, Optus, Coles, Seek, Flybuys, Energy Australia, Me Bank, Ford Australia, WorkSafe Victoria, MIFF, Melbourne Museum, ScienceWorks, VCA, World Vision, Affinity (Ghana).\n\nThat’s tech, retail, finance, government, philanthropy, arts and culture. Each industry teaches something that transfers. Systems thinking from government helps in finance. Consumer behaviour from retail helps in service design. It compounds." },
  roles: {
    general: "Sweet spot: Design Director, Head of Design, Innovation Lead, CX/VoC Lead.\n\nI love blending creativity, technology and business acumen to align strategy, diverge on ideas, and build and test things. Building evidence through pilots is what makes me buzz.\n\nBoth sides — deep craft across strategy, service, product, visual and creative, plus building and scaling a practice inside a large org. That combination is rare.\n\nandrew.n.broughton@gmail.com if that resonates.",
    recruiter: "Best fit: Design Director, Head of Design, Innovation Lead, CX/VoC Lead. Geelong or hybrid Melbourne. Agency/consultancy and enterprise experience.\n\nandrew.n.broughton@gmail.com.",
    hiringmgr: "Strongest where design leadership needs to be stood up, scaled, or transformed. Done it from zero — org design, exec endorsement, hiring, embedding into delivery. Strategic credibility and craft depth.\n\nandrew.n.broughton@gmail.com.",
  },
};
const FOLLOWUP = ["tell me more","more about that","go on","expand","keep going","what else","go deeper","elaborate","continue","more detail"];
const CORRECTION = ["no i meant","not that","actually i","i was asking","no,","that's not","wrong","i meant","rephrase","different question"];
function isFollowUp(q) { return FOLLOWUP.some(t => q.toLowerCase().includes(t)); }
function isCorrection(q) { return CORRECTION.some(t => q.toLowerCase().includes(t)); }
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
  const reply = (topic, allMsgs) => { const persona = inferPersona(allMsgs); const data = R[topic] || R.default; return data[persona] || data.general; };
  const pickTopic = (topic) => { setChips(null); setLastTopic(topic); setTyping(true); setTimeout(() => { setMsgs(prev => [...prev, { text: reply(topic, msgs), isUser: false }]); setTyping(false); }, 700 + Math.random() * 800); };
  const send = (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setWelcome(false); setChips(null);
    const next = [...msgs, { text: msg, isUser: true }];
    setMsgs(next); setInput("");
    if (isCorrection(msg)) { setTyping(true); setTimeout(() => { setMsgs(prev => [...prev, { text: "No worries — what were you after? I can talk about my career, specific projects, leadership approach, design philosophy, industry experience, personal interests, or how to get in touch.", isUser: false }]); setTyping(false); setLastTopic(null); }, 500); return; }
    if (isFollowUp(msg) && lastTopic) { setTyping(true); setTimeout(() => { setMsgs(prev => [...prev, { text: "That covers the main points on that one. But I’m happy to go in a different direction — ask me about a specific project, my approach to something, or anything else you’re curious about.", isUser: false }]); setTyping(false); }, 600); return; }
    const scores = scoreTopics(msg);
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = ranked.length > 0 ? ranked[0] : null;
    if (top && top[1] >= THRESHOLD) { pickTopic(top[0]); }
    else if (ranked.length > 0) { setTyping(true); const options = ranked.slice(0, 3).map(([t]) => ({ topic: t, label: LABELS[t] || t })); setTimeout(() => { setMsgs(prev => [...prev, { text: "I want to make sure I point you in the right direction. Were you asking about one of these?", isUser: false }]); setChips(options); setTyping(false); }, 600); }
    else { setTyping(true); setTimeout(() => { setMsgs(prev => [...prev, { text: "Hmm, I’m not sure I’ve got a specific answer for that one. Here are some things I can talk about though — pick whatever’s closest:", isUser: false }]); setChips([{topic:"background",label:"Career background"},{topic:"enterprise",label:"WorkSafe projects"},{topic:"designprocess",label:"How I work"},{topic:"clients",label:"Clients"},{topic:"personal",label:"Personal stuff"},{topic:"contact",label:"Get in touch"}]); setTyping(false); }, 600); }
  };
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#5B4FD6", overflow: "hidden", borderRadius: 12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 0.9; } }
        @keyframes messageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes subtlePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        input::placeholder { color: rgba(237,226,212,0.4); }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid rgba(232,164,184,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(232,164,184,0.25)", border: "1.5px solid rgba(232,164,184,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#EDE2D4", fontSize: 17, fontWeight: 800 }}>AB</span></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#EDE2D4" }}>Andrew B.</div>
            <div style={{ fontSize: 12, color: "rgba(237,226,212,0.6)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8A4B8", animation: "subtlePulse 2.5s infinite" }} />Design & Innovation</div>
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
        {chips && (<div style={{ padding: "8px 20px", display: "flex", flexWrap: "wrap", gap: 4, animation: "messageIn 0.3s ease" }}>{chips.map((c, i) => <Chip key={i} label={c.label} onClick={() => pickTopic(c.topic)} />)}</div>)}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 16px 28px", borderTop: "1.5px solid rgba(232,164,184,0.3)" }}>
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
window.AndrewAgent = AndrewAgent;

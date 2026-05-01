// AI Andrew chat agent - client-side, rule-based
const { useState, useRef, useEffect } = React;

function inferPersona(messages) {
  var all = messages.map(function(m) { return m.text; }).join(" ").toLowerCase();
  var sc = { recruiter: 0, designer: 0, hiringmgr: 0, team: 0, colleague: 0 };
  function s(k, terms) { terms.forEach(function(t) { if (all.includes(t)) sc[k] += 2; }); }
  s("recruiter", ["cv","resume","candidate","notice period","years experience","team size","salary","contract","permanent","screening","shortlist"]);
  s("designer", ["process","methodology","craft","figma","design system","double diamond","hcd","your approach","how do you design","portfolio"]);
  s("hiringmgr", ["built a team","scaled","executive buy-in","stakeholder management","embed","capability","org design","governance","tell me about a time"]);
  s("team", ["our team","my development","your expectations","feedback","1:1","growth","prioritisation","what do you value"]);
  s("colleague", ["your team","engage with design","my project","my program","help with","request design","sprint","what does design do"]);
  var max = Math.max.apply(null, Object.values(sc));
  if (max === 0) return "general";
  return Object.keys(sc).find(function(k) { return sc[k] === max; });
}

var TOPICS = {
  background: ["background","experience","career","journey","history","tell me about you","who are you","who is andrew","your story","where have you worked","previous roles","what have you done","walk me through"],
  leadership: ["leadership","leader","manage","team","style","how do you lead","people management","direct reports","culture","enps"],
  roles: ["role","targeting","looking for","next move","available","hire","open to","sweet spot","ideal role","type of work"],
  innovation: ["innovati","pilot","prototype","speculative","new product","new service","experiment","exploration","weak signal"],
  innovationcentre: ["innovation cent","innovation center","ventures","products and services","three areas","how is innovation structured"],
  futures: ["futures lab","2025 strategy","threats and opportunities","return to work","future of data","robotics safety","mental health injuries"],
  emergingfutures: ["emerging futures","foresight","environmental scan","future of work","scenario model","future trends","systemic change"],
  enterprise: ["enterprise design","design practice","design function","1.8m","dual track","gels","program extensions"],
  designprocess: ["design process","methodology","how do you work","double diamond","discovery","execution","dvf","desirability","feasibility","viability","how does design work","clarify","immerse","scope","how do you approach"],
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
  philosophy: ["philosophy","approach","believe","values","principles","what drives you","manifesto","mindset","passionate","passion"],
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
  clients: ["clients","who have you worked with","who have you worked for","companies","brands","organisations","what have you worked on","projects","portfolio"]
};

var THRESHOLD = 1.5;

function scoreTopics(input) {
  var q = input.toLowerCase();
  var scores = {};
  Object.keys(TOPICS).forEach(function(topic) {
    var score = 0;
    TOPICS[topic].forEach(function(term) {
      if (q.includes(term)) score += term.split(" ").length > 1 ? 3 : 1;
    });
    if (score > 0) scores[topic] = score;
  });
  return scores;
}

var LABELS = {
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
  tech:"Technology background",clients:"Clients I've worked with"
};

var R = {
  "default": {
    general: "G\u2019day! I\u2019m Andrew Broughton. I help organisations transform through design \u2014 aligning strategy, service and experience to create meaningful, measurable change.\n\nI\u2019ve been doing this for over 18 years now, across agencies, consultancies and in-house. Currently I\u2019m Practice Lead for Enterprise Design at WorkSafe Victoria.\n\nAsk me about anything \u2014 specific projects, how I work, what I believe about design, or just what I get up to outside of work. I\u2019m an open book.",
    recruiter: "G\u2019day. Andrew Broughton \u2014 Practice Lead, Enterprise Design at WorkSafe Victoria. 18+ years across agency, consultancy and in-house. Led teams up to 25+. Happy to answer anything about my experience.",
    designer: "G\u2019day! I\u2019m Andrew \u2014 I\u2019ve spent 18+ years working across the full design spectrum, and I still love getting into the detail of how things get made. Currently leading design at WorkSafe Victoria. What would you like to know?",
    hiringmgr: "G\u2019day. I\u2019m Andrew Broughton \u2014 I build and scale design capability inside complex organisations. Currently leading a 25+ person practice at WorkSafe Victoria on the Delivery SLT. Happy to talk through how I approach things.",
    team: "Hey! Ask me anything \u2014 about the practice, how I think about things, your development, or just what\u2019s on your mind. No question is too small.",
    colleague: "G\u2019day! I\u2019m Andrew \u2014 I lead the Enterprise Design practice here. We work across service and experience design to help the org tackle complex problems."
  },
  background: {
    general: "My career has had three pretty distinct chapters, and each one built on the last.\n\nEarly on I was deep in technology \u2014 building software, POS systems, ecommerce platforms, programmatic advertising. I actually learned to code in those early days, which gives you a fundamentally different understanding of what\u2019s possible and what\u2019s hard.\n\nThen I moved into creativity and consumer behaviour \u2014 building brands, campaigns, through-the-line strategies for clients like Optus, Coles, Seek, Flybuys.\n\nThen innovation brought it all together. Helping businesses develop novel products and services across finance, tech, retail, regulation and philanthropy. Building evidence through pilots and prototypes is honestly what makes me buzz.\n\nMost recently I\u2019ve been at WorkSafe Victoria, where I built the Enterprise Design Practice from scratch. It\u2019s been the hardest and most rewarding thing I\u2019ve done.",
    recruiter: "18+ years. Started in digital production \u2014 Ford, MIFF, Melbourne Museum. Creative leadership at Me Bank, Optus (Big Red Group), Coles/Seek/Flybuys (Whippet). Strategic consulting at Craig Walker \u2014 Australia Post, Meta, World Vision.\n\nPractice Lead, Enterprise Design at WorkSafe Victoria since Nov 2020. Teams from 3 to 25+.",
    designer: "Three phases. Started making things \u2014 software, ecommerce, programmatic. Learned to code early, which gives you feasibility instinct.\n\nThen creativity and consumer behaviour \u2014 brands, campaigns, through-the-line. Understanding funnels changed how I approach service design.\n\nThen innovation \u2014 speculative futures, novel products, pilots. Where strategy, service design and business acumen intersect.",
    hiringmgr: "Deliberate arc. Technology delivery gave technical fluency. Creative leadership gave craft depth. Strategic consulting gave business acumen.\n\nAt Craig Walker: Australia Post, Meta, others. Since 2020: Enterprise Design Practice at WorkSafe from zero \u2014 org design, executive endorsement, hiring, embedding into delivery. 25+ person function on the Delivery SLT.",
    team: "Started making websites \u2014 Ford, MIFF, museums. Then creative leadership for Optus and Coles. Then Craig Walker, where I fell in love with service design.\n\nWorkSafe has been about building something from scratch that genuinely changes how an organisation works.",
    colleague: "Before WorkSafe: 18+ years across design agencies and consultancies. Technology, creative leadership, then strategic consulting at Craig Walker with Australia Post and Meta. Here since November 2020 building the design practice."
  },
  leadership: {
    general: "Honestly, it\u2019s about creating the conditions for great work \u2014 not being the smartest person in the room.\n\n25+ people including three senior managers. Culture first, capability second, outcomes third. Team engagement scores increased significantly over two years.\n\nThe harder skill: translation. Helping the business understand design\u2019s value \u2014 cost savings, productivity uplift, risk reduction. Storytelling is the secret weapon.",
    recruiter: "Team of 25+ including 3 senior managers. CEO/Executive stakeholders. Significant increase in team engagement. Vic Premier Design Awards finalist. Leadership since 2015.",
    designer: "Best design leaders remove obstacles rather than direct traffic. Clear briefs, strong stakeholder relationships, room to think, culture where people push ideas.\n\nThe craft of leadership is different from the craft of design, but they\u2019re both crafts.",
    hiringmgr: "Culture, capability, outcomes \u2014 in that order. Team engagement increased significantly over two years. Deliberate investment in people, clarity of purpose, protecting the team from noise.\n\nTranslation is critical \u2014 cost savings, productivity uplift, risk reduction. That earns executive trust.",
    team: "I want to build conditions where you do your best work. Clear expectations, honest feedback, room to grow, someone in your corner.\n\nI value curiosity, initiative, honesty. Challenge an approach rather than silently disagree.",
    colleague: "Making design useful to the broader org. My team understands your world \u2014 deadlines, constraints, stakeholders \u2014 and works within that.\n\nIf design can\u2019t demonstrate value in your terms, we haven\u2019t done our job."
  },
  designprocess: {
    general: "Our practice operates in two modes: Discovery and Execution.\n\nDiscovery clarifies the problem space and proposes desirable, feasible and viable solutions. Execution works within cross-functional teams to bring solutions to market.\n\nThe process: Clarify, Immerse, Scope, Test, Deliver. Every solution through three lenses \u2014 Desirability (should we build it?), Feasibility (can we?), Viability (will it sustain?). You need all three for valued experiences.\n\nWe scale based on what\u2019s known. Unknown problem and solution? Full Double Diamond. Known problem, unknown solution? Initiate sprint. Everything understood? Straight to Execution.\n\nFive principles: deliver value (outcomes over outputs), show through doing, design is our mindset not our vocabulary, look for the worst (ambiguity is our heaven), build trust through de-risking."
  },
  innovation: { general: "Innovation is where all the threads come together \u2014 creativity, technology, business acumen. Aligning strategy, diverging on ideas, building and testing pilots for real evidence.\n\nAt WorkSafe I ran the Innovation Center \u2014 15+ people across product, project management, change, development and design. Three layers: strategic alignment, lab experimentation, community impact.\n\nFlat structure \u2014 no waterfall blockers. The principle: we only ask you consult with who your decision will impact.\n\nThree design modes: strategic design, human-centred design, business delivery. Building evidence through pilots is what makes me buzz." },
  innovationcentre: { general: "The Innovation Centre at WorkSafe has three areas.\n\nFutures Lab \u2014 research and design to identify emerging trends, then experiments with workers to measure community impact.\n\nVentures \u2014 partners with the innovation ecosystem to build and scale worker wellbeing products and services.\n\nProducts & Services \u2014 uncovers, tests and validates new safety solutions through human-centred design.\n\nGoal: future solutions to wicked problems. Method: strategic design aligned to business, experimentation in community, creation of preferable futures.\n\nFlat structure \u2014 we only ask you consult with who your decision will impact." },
  futures: { general: "The Futures Lab creates time and space for design to thrive through strategic alignment to the business.\n\nWe scanned for weak signals, mapped threats and opportunities, developed scenarios, designed novel products and services. That work became the front end of the 2025 WorkSafe Strategy.\n\nFour challenge areas: return to work in the modern economy, future of data in prevention, accelerating safety via robotics, and reducing conflict to prevent mental health injuries.\n\nThe futures spectrum moves from probable to plausible to preferable. The design function asks \u2018what if?\u2019 to divert probable futures to preferable ones.\n\nFour pilot streams, tested with cohorts of 20+, one became BAU. In a risk-averse regulator, speculative work to BAU in 18 months was significant." },
  emergingfutures: { general: "Anticipated systemic change rather than reacting to current issues.\n\nMethodology: environmental scan of 80+ reports, expert interviews across academia, industry and government, synthesis into themes and scenarios.\n\nThree themes: changing community (migration, ageing, identity complexity), changing work (gig economy, remote, autonomy), system interdependencies (tech, health, community, industry intersecting).\n\nDesign response: foresight, scenarios, provocations, experiments. Key insight: design shapes the future rather than reacting to it." },
  enterprise: { general: "My signature piece. How might we create modern ways of work inside a government agency and start a centralised design practice?\n\nSignificant cost savings by internalising design. Dual Track and GELs reduced program extensions substantially. Measurable productivity turnaround in tech programs. Team engagement increased consistently.\n\nRebooted legislative change programs. Front-end visions to secure executive buy-in.\n\nDesign is now understood, desired, and business critical at WorkSafe. We\u2019ve been asked to partner with the executive, define problems, clarify solutions. That\u2019s the real outcome." },
  ai: { general: "Enterprise AI Policy at WorkSafe alongside technology (2024\u20132025). Can\u2019t share details yet.\n\nDesign leadership extending into governance, strategy, emerging tech. Same approach: understand the problem, map stakeholders, test assumptions, iterate.\n\nandrew.n.broughton@gmail.com if you want to discuss design thinking applied to AI policy." },
  community: { general: "Multicultural workers face disproportionate unsafe conditions \u2014 language barriers, cultural differences, systemic distrust. COVID amplified everything.\n\nCommunity-based participatory design with 50+ members, partnering with ECCV. All engagement in-language.\n\nSix insights: inadequate English-only training, language as safety barrier, cultural perception of safety as optional, fear preventing reporting, cultural safety gaps, reliance on informal networks.\n\nThree solutions: multilingual COVID Safety Cards (18+ languages, trader walks), Safe Support tool (structured safety conversations in in-home work), Worker Safety Starter Kit (modular education for community orgs).\n\nFive principles: culturally safe interactions, participant safety first, true partnerships, co-creation over consultation, equitable experiences.\n\nWorkplace safety isn\u2019t purely compliance \u2014 it\u2019s cultural, psychological, systemic." },
  neighbourhood: { general: "Closest to my heart. How might we help people feel welcomed and connected within their neighbourhood?\n\nAustralia is increasingly diverse while experiencing rising loneliness. Australia Post saw an opportunity as a community connector.\n\nCo-designed through the Footscray Co-Lab \u2014 open days, service safaris, workshops, live prototyping. Built: welcome packs, welcome spaces in post offices, community connectors, advocacy model.\n\nFlow: awareness, post office entry, Welcome Pack, Welcome Space, ongoing participation.\n\n70+ design assets, scalable framework. Published in \u2018Design for Social Innovation\u2019.\n\nSocial connection has to be designed through systems, spaces and relationships." },
  auspost: { general: "Several projects at Craig Walker.\n\nCo-Lab \u2014 pop-up lab in Footscray using co-design. Open days, service safaris, live prototyping. New essential service connecting Australians to support systems.\n\nCX Guardrails \u2014 POS technology transformation across Australia\u2019s largest retail network.\n\nNeighbourhood Welcome Service \u2014 co-designed with communities, published in \u2018Design for Social Innovation\u2019. Ask me about that one for the full story." },
  meta: { general: "Meta\u2019s Youth Harm Minimization Nation Workshops at Craig Walker. Confidential but significant \u2014 diverse stakeholders tackling a complex problem with sensitivity to affected communities." },
  education: { general: "Bachelor Visual Arts (Honours), University of Ballarat. Cert 4 Small Business Management, RMIT.\n\nScrum (Scrumology/Kane Mar), SAFe, Portfolio Management, Trauma Informed Facilitation, leadership programs (Strategic Change, Performance, People, Executive Mindset).\n\nThe creative foundations plus business training has been the most valuable combination in my career." },
  personal: { general: "Dad to two boys \u2014 7 and 3. Nerf gun acquisition, carb-based snack migration, TV hour extension. Constant negotiation.\n\nRemote Australia as a family \u2014 Troopy, 7,000+ km. Desert holidays are how we connect.\n\nI make electronic music as Mr Bronson. Signed to LA-based 100% Silk, co-founded Bad Party Records out of Fitzroy. Latest LP: Trans Pacific. Synthesizers everywhere \u2014 worth the investment, or so I tell my wife.\n\nAlso captained the Old Bar Unicorns \u2014 gender-inclusive footy in the Renegade Football League." },
  geelong: { general: "Melbourne to Geelong in 2021. Some say lifestyle, others say ring of steel. Either way, here and happy to commute.\n\nWorkSafe HQ is in Geelong, which is a great fit." },
  storytelling: { general: "Most underrated capability in business. Talked about this on the Company Road Podcast.\n\nQuantify metrics, talk to ROI, clarify the scenario \u2014 that\u2019s how you cut through business jargon. It\u2019s how I\u2019ve gotten executive buy-in throughout my career." },
  podcast: { general: "Company Road Podcast with Chris Hudson, October 2023. Design ethos and WorkSafe.\n\nThemes: unexpected inputs, purpose alignment, storytelling as business capability, iterative flexibility, constraints upfront to shape the design problem.\n\nProbably the best public summary of how I think about design leadership." },
  philosophy: { general: "We codified this into a practice manifesto at WorkSafe. We are evolving. Design is evolving. We\u2019ve proven we can clarify problems and define solutions. Design is understood, desired, business critical.\n\nSystems thinker \u2014 design as enterprise capability, not project delivery. Innovation must ship and scale. Community-centred \u2014 design with people, not for them. Culture matters.\n\nFive principles: deliver value (outcomes over outputs), show through doing, design is our mindset not vocabulary, look for the worst (ambiguity is our heaven \u2014 make the unreal real), build trust.\n\nThree modes: practice (how design works), methods (how it\u2019s done), foresight (where it acts next)." },
  evolutionofdesign: { general: "Four stages, my career tracked through all of them.\n\nCreative design \u2014 visual output. Product and communications \u2014 UX/UI, marketing. Design as professional service \u2014 working with business. Social innovation and civic design \u2014 system level, policy, public services.\n\nCore shift: output delivery to system shaping. Design is becoming infrastructure for decision-making." },
  designautonomy: {
    general: "Autonomy is the degree to which designers feel genuine ownership over their work.\n\nNot something you hand over. Created through trust, transparency, clear expectations.\n\nMy job: enable decision-making, advocate for designers, structure without constraint.\n\nKey insight: autonomy is not given \u2014 it\u2019s created through alignment and trust. When your team understands the why, they don\u2019t need you to dictate the how.",
    team: "Autonomy matters to me. Real ownership, not delegation.\n\nTrust, transparency, clear expectations. If you know the what and why, you don\u2019t need me hovering over the how.\n\nIf the balance isn\u2019t right \u2014 too much direction or not enough clarity \u2014 tell me."
  },
  contact: {
    general: "Email: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nAlways happy to talk innovation, service design, or bringing creatives into corporate.",
    recruiter: "Email: andrew.n.broughton@gmail.com\nPhone: 0407 098 131\nLinkedIn: linkedin.com/in/anmbroughton\nPortfolio: broughton.com.au\n\nCV and referees available on request."
  },
  pub: { general: "Melbourne Design Week 2020, Craig Walker team. The Old Bar, Fitzroy \u2014 two days before COVID.\n\nFour lenses: urban hubs, creative ecosystems, social connection (third space), sustainability.\n\nPubs don\u2019t need to be perfect. They need to embrace what they\u2019ve always been: public houses where people connect." },
  craig: { general: "September 2018 to November 2020. Senior Consultant, Design. IxD Community of Practice Lead across Melbourne, Sydney, Agency (ex-IDEO Singapore).\n\nThe shift into strategic and service design. Australia Post, Meta, Affinity (Ghana), World Vision, confidential cash management.\n\nNeighbourhood Welcome Service published in \u2018Design for Social Innovation\u2019 2022." },
  mycash: { general: "Confidential, Craig Walker. National cash management as branches/ATMs phase out.\n\nDigital-centric network, central app mobilising subcontractors. Designing for something actively being phased out while still essential." },
  awards: { general: "Finalist, Service Design at Victorian Premier Design Awards \u2014 Enterprise Design Practice. Genuinely good practice, not just good enough for government.\n\nPublished in \u2018Design for Social Innovation\u2019 (2022) \u2014 Neighbourhood Welcome Service.\n\n2005 Lucato Peace Prize." },
  whatcanido: { general: "Three things.\n\nProblem clarified? Design research and strategic thinking. Sometimes the brief isn\u2019t the actual problem.\n\nSolution defined? Multidisciplinary teams designing services, experiences, strategies that work.\n\nExperience delivered? Government, finance, tech, retail \u2014 speculative futures to scaled production.\n\nNot sure which? I can help figure that out." },
  government: { general: "Five years at WorkSafe taught me about navigating complexity, risk aversion, making change where the default is caution.\n\nBuilt the Enterprise Design Practice from scratch. Futures Lab shaped 2025 strategy. Community Innovation delivered equitable services.\n\nGovernment impact is real and broad \u2014 improving a WorkSafe service affects every worker in Victoria." },
  retail: { general: "Retail runs through the middle of my career. Whippet: Coles, Flybuys, Seek, Amplifon. Big Red Group: Optus.\n\nCraig Walker: Australia Post CX Guardrails \u2014 POS transformation across the largest retail network.\n\nSeen retail from marketing, technology, and service design sides." },
  finance: { general: "Me Bank \u2014 design team of 10+. MyCash at Craig Walker \u2014 future of cash management. Affinity in Ghana \u2014 inclusive digital banking. Coles Financial Services at Whippet.\n\nHigh street to fintech to inclusive design." },
  tech: { general: "Where I started. Coded ActionScript, Java, HTML, PHP, CSS at Next Digital on Ford. Built interactive displays for ScienceWorks and Melbourne Museum \u2014 some still running.\n\nNow shifted to strategy \u2014 AI Policy at WorkSafe, practice embedded in tech delivery.\n\nTech foundation makes you a better designer." },
  clients: { general: "Meta, Australia Post, Optus, Coles, Seek, Flybuys, Energy Australia, Me Bank, Ford, WorkSafe Victoria, MIFF, Melbourne Museum, ScienceWorks, VCA, World Vision, Affinity (Ghana).\n\nTech, retail, finance, government, philanthropy, arts and culture. Each industry teaches something that transfers. It compounds." },
  roles: {
    general: "Sweet spot: Design Director, Head of Design, Innovation Lead, CX/VoC Lead.\n\nBlending creativity, technology, business acumen. Building evidence through pilots is what makes me buzz.\n\nBoth sides \u2014 deep craft plus building and scaling a practice. That combination is rare.\n\nandrew.n.broughton@gmail.com if that resonates.",
    recruiter: "Design Director, Head of Design, Innovation Lead, CX/VoC Lead. Geelong or hybrid Melbourne.\n\nandrew.n.broughton@gmail.com.",
    hiringmgr: "Strongest where design leadership needs standing up, scaling, or transforming. Done it from zero \u2014 org design, exec endorsement, hiring, embedding into delivery.\n\nandrew.n.broughton@gmail.com."
  }
};

var FOLLOWUP_TERMS = ["tell me more","more about that","go on","expand","keep going","what else","go deeper","elaborate","continue","more detail"];
var CORRECTION_TERMS = ["no i meant","not that","actually i","i was asking","no,","that's not","wrong","i meant","rephrase","different question"];
function isFollowUp(q) { return FOLLOWUP_TERMS.some(function(t) { return q.toLowerCase().includes(t); }); }
function isCorrection(q) { return CORRECTION_TERMS.some(function(t) { return q.toLowerCase().includes(t); }); }

var FOLLOWUP_MAP = {
  "default": [{topic:"background",label:"My career story"},{topic:"enterprise",label:"My biggest project"},{topic:"clients",label:"Who I've worked with"}],
  background: [{topic:"enterprise",label:"WorkSafe Design Practice"},{topic:"clients",label:"Who I've worked with"},{topic:"designprocess",label:"How I approach design"}],
  leadership: [{topic:"designautonomy",label:"How I give autonomy"},{topic:"enterprise",label:"Building the practice"},{topic:"philosophy",label:"Design philosophy"}],
  roles: [{topic:"background",label:"My career story"},{topic:"enterprise",label:"WorkSafe case study"},{topic:"contact",label:"Get in touch"}],
  innovation: [{topic:"futures",label:"The Futures Lab"},{topic:"innovationcentre",label:"How innovation is structured"},{topic:"emergingfutures",label:"Emerging Futures"}],
  innovationcentre: [{topic:"futures",label:"Futures Lab detail"},{topic:"innovation",label:"Innovation approach"},{topic:"enterprise",label:"Enterprise Design Practice"}],
  futures: [{topic:"emergingfutures",label:"Emerging Futures methodology"},{topic:"community",label:"Community Innovation"},{topic:"innovationcentre",label:"Innovation Centre structure"}],
  emergingfutures: [{topic:"futures",label:"The Futures Lab"},{topic:"philosophy",label:"Design philosophy"},{topic:"innovation",label:"Innovation approach"}],
  enterprise: [{topic:"designprocess",label:"How the practice works"},{topic:"futures",label:"The Futures Lab"},{topic:"community",label:"Community Innovation"}],
  designprocess: [{topic:"enterprise",label:"The practice in action"},{topic:"philosophy",label:"Design philosophy"},{topic:"evolutionofdesign",label:"Evolution of design"}],
  ai: [{topic:"enterprise",label:"Enterprise Design Practice"},{topic:"tech",label:"Technology background"},{topic:"innovation",label:"Innovation approach"}],
  community: [{topic:"neighbourhood",label:"Neighbourhood Welcome Service"},{topic:"philosophy",label:"Design philosophy"},{topic:"awards",label:"Awards & recognition"}],
  neighbourhood: [{topic:"community",label:"Community Innovation at WorkSafe"},{topic:"auspost",label:"Other Australia Post projects"},{topic:"craig",label:"Craig Walker"}],
  auspost: [{topic:"neighbourhood",label:"Neighbourhood Welcome Service"},{topic:"craig",label:"Craig Walker"},{topic:"retail",label:"Retail experience"}],
  meta: [{topic:"craig",label:"Craig Walker"},{topic:"community",label:"Community Innovation"},{topic:"clients",label:"Other clients"}],
  education: [{topic:"background",label:"Career story"},{topic:"designprocess",label:"How I work"},{topic:"personal",label:"Personal life"}],
  personal: [{topic:"geelong",label:"Life in Geelong"},{topic:"background",label:"Career story"},{topic:"contact",label:"Get in touch"}],
  geelong: [{topic:"personal",label:"More personal stuff"},{topic:"roles",label:"Roles I suit"},{topic:"contact",label:"Get in touch"}],
  storytelling: [{topic:"podcast",label:"Company Road Podcast"},{topic:"leadership",label:"Leadership style"},{topic:"philosophy",label:"Design philosophy"}],
  podcast: [{topic:"storytelling",label:"Storytelling in business"},{topic:"philosophy",label:"Design philosophy"},{topic:"innovation",label:"Innovation approach"}],
  philosophy: [{topic:"designprocess",label:"How the practice works"},{topic:"evolutionofdesign",label:"Evolution of design"},{topic:"enterprise",label:"Practice in action"}],
  evolutionofdesign: [{topic:"philosophy",label:"Design philosophy"},{topic:"background",label:"Career story"},{topic:"designprocess",label:"How I work"}],
  designautonomy: [{topic:"leadership",label:"Leadership style"},{topic:"philosophy",label:"Design philosophy"},{topic:"enterprise",label:"Building the practice"}],
  contact: [{topic:"background",label:"Career story"},{topic:"roles",label:"Roles I suit"},{topic:"whatcanido",label:"What I can help with"}],
  pub: [{topic:"craig",label:"Craig Walker"},{topic:"philosophy",label:"Design philosophy"},{topic:"personal",label:"Personal life"}],
  craig: [{topic:"auspost",label:"Australia Post projects"},{topic:"neighbourhood",label:"Welcome Service"},{topic:"meta",label:"Meta / Youth Harm"}],
  mycash: [{topic:"finance",label:"Finance experience"},{topic:"craig",label:"Craig Walker"},{topic:"innovation",label:"Innovation approach"}],
  awards: [{topic:"enterprise",label:"Enterprise Design Practice"},{topic:"neighbourhood",label:"Welcome Service"},{topic:"community",label:"Community Innovation"}],
  whatcanido: [{topic:"designprocess",label:"How I approach design"},{topic:"enterprise",label:"Case study"},{topic:"contact",label:"Get in touch"}],
  government: [{topic:"enterprise",label:"Enterprise Design Practice"},{topic:"futures",label:"Futures Lab"},{topic:"community",label:"Community Innovation"}],
  retail: [{topic:"auspost",label:"Australia Post"},{topic:"clients",label:"Full client list"},{topic:"finance",label:"Finance experience"}],
  finance: [{topic:"mycash",label:"MyCash project"},{topic:"retail",label:"Retail experience"},{topic:"clients",label:"Full client list"}],
  tech: [{topic:"ai",label:"AI Policy"},{topic:"background",label:"Career story"},{topic:"designprocess",label:"How I work"}],
  clients: [{topic:"government",label:"Government work"},{topic:"retail",label:"Retail work"},{topic:"finance",label:"Finance work"}]
};

var SUGGESTIONS = ["Who is Andrew Broughton?", "What have you worked on?", "How do you approach design?", "What are you passionate about?"];

var TypingIndicator = function() {
  return (
    <div style={{ display: "flex", padding: "6px 20px" }}>
      <div style={{ background: "rgba(232,164,184,0.25)", borderRadius: "20px 20px 20px 6px", padding: "16px 20px", display: "flex", gap: 6 }}>
        {[0, 1, 2].map(function(i) { return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8A4B8", opacity: 0.6, animation: "typingDot 1.4s infinite " + (i * 0.2) + "s" }} />; })}
      </div>
    </div>
  );
};

var Bubble = function(props) {
  return (
    <div style={{ display: "flex", justifyContent: props.isUser ? "flex-end" : "flex-start", padding: "4px 20px", animation: "messageIn 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ maxWidth: "82%", padding: "14px 18px", borderRadius: props.isUser ? "20px 20px 6px 20px" : "20px 20px 20px 6px", background: props.isUser ? "rgba(237,226,212,0.15)" : "rgba(232,164,184,0.2)", color: "#EDE2D4", fontSize: 15, lineHeight: 1.6, fontFamily: "'Outfit', sans-serif", border: props.isUser ? "1px solid rgba(237,226,212,0.15)" : "1px solid rgba(232,164,184,0.12)", whiteSpace: "pre-wrap" }}>{props.text}</div>
    </div>
  );
};

var Chip = function(props) {
  return (
    <button onClick={props.onClick} style={{ background: "rgba(232,164,184,0.15)", border: "1px solid rgba(232,164,184,0.3)", borderRadius: 100, padding: "8px 16px", fontSize: 13, fontFamily: "'Outfit'", fontWeight: 500, color: "#EDE2D4", cursor: "pointer", margin: "2px" }}>{props.label}</button>
  );
};

function AndrewAgent() {
  var _msgs = useState([]);
  var msgs = _msgs[0]; var setMsgs = _msgs[1];
  var _input = useState("");
  var input = _input[0]; var setInput = _input[1];
  var _typing = useState(false);
  var typing = _typing[0]; var setTyping = _typing[1];
  var _welcome = useState(true);
  var welcome = _welcome[0]; var setWelcome = _welcome[1];
  var _lastTopic = useState(null);
  var lastTopic = _lastTopic[0]; var setLastTopic = _lastTopic[1];
  var _chips = useState(null);
  var chips = _chips[0]; var setChips = _chips[1];
  var endRef = useRef(null);

  useEffect(function() { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, chips]);

  function reply(topic, allMsgs) {
    var persona = inferPersona(allMsgs);
    var data = R[topic] || R["default"];
    return data[persona] || data.general;
  }

  function pickTopic(topic) {
    setChips(null); setLastTopic(topic); setTyping(true);
    setTimeout(function() {
      setMsgs(function(prev) { return prev.concat([{ text: reply(topic, msgs), isUser: false }]); });
      setTyping(false);
      var followups = FOLLOWUP_MAP[topic] || FOLLOWUP_MAP["default"];
      setTimeout(function() { setChips(followups); }, 400);
    }, 700 + Math.random() * 800);
  }

  function send(text) {
    var msg = text || input.trim();
    if (!msg || typing) return;
    setWelcome(false); setChips(null);
    var next = msgs.concat([{ text: msg, isUser: true }]);
    setMsgs(next); setInput("");

    if (isCorrection(msg)) {
      setTyping(true);
      setTimeout(function() {
        setMsgs(function(prev) { return prev.concat([{ text: "No worries \u2014 what were you after?", isUser: false }]); });
        setTyping(false); setLastTopic(null);
        setChips([{topic:"background",label:"Career story"},{topic:"enterprise",label:"WorkSafe projects"},{topic:"designprocess",label:"How I work"},{topic:"clients",label:"Clients"},{topic:"personal",label:"Personal stuff"},{topic:"contact",label:"Get in touch"}]);
      }, 500);
      return;
    }

    if (isFollowUp(msg) && lastTopic) {
      setTyping(true);
      setTimeout(function() {
        setMsgs(function(prev) { return prev.concat([{ text: "That covers the main points on that one. Here are some related areas:", isUser: false }]); });
        setTyping(false);
        var followups = FOLLOWUP_MAP[lastTopic] || FOLLOWUP_MAP["default"];
        setChips(followups);
      }, 600);
      return;
    }

    var scores = scoreTopics(msg);
    var ranked = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
    var top = ranked.length > 0 ? ranked[0] : null;

    if (top && top[1] >= THRESHOLD) {
      pickTopic(top[0]);
    } else if (ranked.length > 0) {
      setTyping(true);
      var options = ranked.slice(0, 3).map(function(r) { return { topic: r[0], label: LABELS[r[0]] || r[0] }; });
      setTimeout(function() {
        setMsgs(function(prev) { return prev.concat([{ text: "I want to make sure I point you in the right direction. Were you asking about one of these?", isUser: false }]); });
        setChips(options); setTyping(false);
      }, 600);
    } else {
      setTyping(true);
      setTimeout(function() {
        setMsgs(function(prev) { return prev.concat([{ text: "Hmm, I'm not sure I've got a specific answer for that one. Here are some things I can talk about:", isUser: false }]); });
        setChips([{topic:"background",label:"Career background"},{topic:"enterprise",label:"WorkSafe projects"},{topic:"designprocess",label:"How I work"},{topic:"clients",label:"Clients"},{topic:"personal",label:"Personal stuff"},{topic:"contact",label:"Get in touch"}]);
        setTyping(false);
      }, 600);
    }
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#5B4FD6", overflow: "hidden", borderRadius: 12 }}>
      <style>{"\
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');\
        * { box-sizing: border-box; margin: 0; padding: 0; }\
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 0.9; } }\
        @keyframes messageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }\
        @keyframes subtlePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }\
        input::placeholder { color: rgba(237,226,212,0.4); }\
        ::-webkit-scrollbar { width: 0; }\
      "}</style>
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
              {SUGGESTIONS.map(function(q, i) { return <button key={i} onClick={function() { send(q); }} style={{ background: "transparent", border: "1.5px solid rgba(237,226,212,0.35)", borderRadius: 100, padding: "10px 18px", fontSize: 13, fontFamily: "'Outfit'", fontWeight: 500, color: "#EDE2D4", cursor: "pointer" }}>{q}</button>; })}
            </div>
          </div>
        )}
        {msgs.map(function(m, i) { return <Bubble key={i} text={m.text} isUser={m.isUser} />; })}
        {typing && <TypingIndicator />}
        {chips && (
          <div style={{ padding: "8px 20px", display: "flex", flexWrap: "wrap", gap: 4, animation: "messageIn 0.3s ease" }}>
            {chips.map(function(c, i) { return <Chip key={i} label={c.label} onClick={function() { pickTopic(c.topic); }} />; })}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 16px 28px", borderTop: "1.5px solid rgba(232,164,184,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(237,226,212,0.1)", borderRadius: 28, padding: "6px 6px 6px 20px", border: "1.5px solid rgba(237,226,212,0.12)" }}>
          <input type="text" value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask Andrew something..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontFamily: "'Outfit'", color: "#EDE2D4", padding: "10px 0" }} />
          <button onClick={function() { send(); }} disabled={!input.trim() || typing} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() && !typing ? "#E8A4B8" : "rgba(237,226,212,0.1)", color: input.trim() && !typing ? "#5B4FD6" : "rgba(237,226,212,0.3)", cursor: input.trim() && !typing ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "rgba(237,226,212,0.3)", fontWeight: 500 }}>AI representation · Responses from Andrew's portfolio</div>
      </div>
    </div>
  );
}

window.AndrewAgent = AndrewAgent;

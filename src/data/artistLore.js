/**
 * artistLore.js
 * Rich biographical content for Underground OGs.
 * Keyed by lowercase artist name for easy lookup.
 *
 * Each entry:
 *   badge       — the label shown on their card
 *   era         — the time period they defined
 *   origin      — city/region
 *   color       — accent color for their profile
 *   tagline     — one-line essence
 *   influence   — who they directly influenced
 *   legacy      — what they left behind
 *   story       — array of paragraphs telling the full journey
 *   quotes      — iconic lines or real quotes from the artist
 *   listenTo    — key records to start with
 */

export const ARTIST_LORE = {

  'mac miller': {
    badge:     'UNDERGROUND OG',
    era:       '2010 – 2018',
    origin:    'Pittsburgh, PA',
    color:     '#85C1E9',
    tagline:   'The most honest evolution in hip-hop history',
    influence: ['J. Cole', 'Cordae', 'Brockhampton', 'Omar Apollo'],
    legacy:    'Proved that a rapper could grow up publicly and not lose the crowd. Every album was a different Mac — and every version was real.',
    story: [
      'Malcolm James McCormick grew up in Point Breeze, Pittsburgh. By 15 he was recording in his bedroom. By 19 he had one of the most viral mixtapes of the blog rap era — Best Day Ever, released on Pi Day 2011, spinning on every college campus in America. The kid with the biggest smile in rap.',
      'But Mac was never just that. Even on Blue Slide Park — his 2011 debut that debuted at #1 and got panned by critics — you could hear something more searching underneath the party. He was observing. Absorbing. Learning.',
      'Watching With My Eyes Closed in 2012 was the turn. Mac linked with Kendrick, Joey Bada$$, Earl Sweatshirt — the new underground intelligentsia. He started rapping differently. Sitting with the beat instead of riding it.',
      'Macadelic, then Watching Movies With the Sound Off in 2013, was the rupture. It was darker, stranger, more alive. Rick Rubin\'s influence. A Mac who\'d been reading, smoking, hurting, loving. "Objects in the Mirror" still sounds like 3am on a Tuesday when you\'re not sure who you are.',
      'GO:OD AM in 2015 was his comeback record — sobriety-adjacent, clear-eyed, the most technically sharp he\'d ever been. Then The Divine Feminine in 2016: a soul record disguised as a rap album, built around Ariana Grande, around love, around being soft and not apologizing for it.',
      'Swimming in 2018 was his masterpiece. Jazz, soul, bedroom pop, introspection so deep it felt like reading someone\'s private journal. Jon Brion produced half of it. Mac played most of the instruments himself. It was the sound of a man who\'d looked at himself clearly and decided to keep going anyway.',
      'He died September 7, 2018. Accidental overdose. He was 26. Circles — the companion album Jon Brion finished from Mac\'s own recordings — was released in January 2020. It is one of the most beautiful posthumous records ever made. A man finishing a thought he didn\'t get to complete.',
      'Mac Miller never chased trends. He chased growth. That\'s rarer than people admit.',
    ],
    quotes: [
      '"I just want to always be somebody that people can believe in."',
      '"The most important thing is to be happy. Happiness is just a choice."',
      '"Good things take time."',
    ],
    listenTo: [
      { title: 'Swimming', year: 2018, note: 'His most vulnerable and complete work' },
      { title: 'Circles', year: 2020, note: 'Posthumous. Devastating. Essential.' },
      { title: 'Watching Movies With the Sound Off', year: 2013, note: 'Where the reinvention began' },
      { title: 'GO:OD AM', year: 2015, note: 'His cleanest, sharpest rapping' },
      { title: 'Best Day Ever', year: 2011, note: 'Where the world first found him' },
    ],
  },

  'chief keef': {
    badge:     'DRILL PIONEER',
    era:       '2012 – present',
    origin:    'Chicago, IL (Englewood)',
    color:     '#E07B0A',
    tagline:   'The teenager who rewired rap from a Chicago block',
    influence: ['Lil Uzi Vert', 'Playboi Carti', 'Travis Scott', 'Young Thug', 'Pop Smoke', 'virtually all of modern trap'],
    legacy:    'Invented the emotional vocabulary of an entire generation. The mumble, the melody, the menace — all Keef.',
    story: [
      'Keith Farrelle Cozart was 16, on house arrest in Englewood, Chicago, when he recorded "I Don\'t Like." He barely left his grandmother\'s house. He had a cheap mic and a laptop. The song changed everything.',
      'Kanye West remixed it. Rick Ross hopped on it. Suddenly every major label was flying to Chicago. Nobody had heard anything like it — that slow, narcotic bass, the flat affect, the absolutely zero interest in impressing anyone. Keef rapped like he already won.',
      'Finally Rich dropped in 2012. He was 17. It went gold. Lil Wayne said he was the future. And he was right — just not in the way Wayne expected. Keef\'s future was stranger, more experimental, more prolific and more underground than a major label could contain.',
      'He left Interscope, started his own label Glory Boyz, and began releasing music at a pace nobody could follow. Hundreds of mixtapes, tracks, Soundcloud drops. He created drill before anyone called it drill. Chicago\'s South Side sound — heavy 808s, melodies that hurt, lyrics stripped of pretense — spread to London, New York, Brooklyn, and became the skeleton of modern trap.',
      'But Keef kept evolving. By 2016-2020 he was making genuinely experimental music — Auto-Tune sculptures, ambient rap, tracks that felt like fever dreams. He was doing it before anyone gave him credit. Travis Scott, Uzi, Carti, Gunna — they all heard Keef first.',
      'He is one of the most influential artists of the last 25 years, full stop. He\'ll never get the mainstream recognition he deserves. That\'s fine. The music is the monument.',
    ],
    quotes: [
      '"I be on my grind, I ain\'t got no time."',
      '"I don\'t like. Bang bang."',
    ],
    listenTo: [
      { title: 'Finally Rich', year: 2012, note: 'The debut that changed Chicago' },
      { title: 'Back From The Dead', year: 2012, note: 'The mixtape that built the myth' },
      { title: 'Thot Breaker', year: 2017, note: 'His most melodic, underrated album' },
      { title: '4NEM', year: 2019, note: 'Experimental Keef at his peak' },
    ],
  },

  'lil b': {
    badge:     'THE BASED GOD',
    era:       '2009 – present',
    origin:    'Berkeley, CA',
    color:     '#F7DC6F',
    tagline:   'The internet\'s philosopher king. Blessed the culture before the culture knew it needed blessing.',
    influence: ['ASAP Rocky', 'Chance the Rapper', 'Lil Yachty', 'Post Malone', 'internet rap as a genre'],
    legacy:    'Created the blueprint for artist-as-internet-personality. Radical positivity as a rap ethos. The Based Freestyle as a form.',
    story: [
      'Brandon Christopher McCartney, Berkeley CA. Started in The Pack — hyphy movement, 2006, "Vans" goes viral before viral was a thing. Then Lil B goes solo and becomes something else entirely. Something the music industry had no category for.',
      'Between 2009 and 2012 he released hundreds — literally hundreds — of mixtapes and free projects. He flooded the internet. The quality ranged from deliberately absurd to genuinely transcendent, sometimes in the same song. That was the point.',
      '"I\'m God." "I\'m Paris Hilton." "Wonton Soup." He named himself after female celebrities, cooked on people with curses, blessed people who showed loyalty, invented the "Based" philosophy — being yourself unapologetically, with love, without ego. This was radical in 2010 hip-hop.',
      'ASAP Rocky said Lil B was the first rapper to make being yourself cool. Chance the Rapper cites him constantly. Lil Yachty\'s whole melodic rap ethos traces back to Based freestyle. The Weeknd\'s vulnerability. Post Malone\'s don\'t-care energy.',
      'He lectured at MIT. NYU. Carnegie Mellon. He talked about positivity, mental health, and self-love at universities while rapping over the most chaotic beats imaginable. Nobody else existed in those two worlds simultaneously.',
      'The Based God Curse is real. He cursed Kevin Durant for clowning him. KD left OKC, tore his Achilles, never won a ring in Golden State, tore his Achilles again in Brooklyn. The curse was lifted in 2022. The internet treated it seriously. That\'s power.',
      'Lil B understood the internet as an artistic medium before almost anyone. He is not a joke. He is a visionary who chose chaos as his canvas.',
    ],
    quotes: [
      '"Based means being yourself. Not caring what others think of you. Being positive."',
      '"I love you. Based."',
      '"Thank you Based God."',
    ],
    listenTo: [
      { title: 'I\'m Gay', year: 2011, note: 'His most ambitious and personal work' },
      { title: 'Blue Flame', year: 2009, note: 'Where the Based mythology began' },
      { title: 'God\'s Father', year: 2012, note: 'The rap community\'s gateway record' },
    ],
  },

  'yung lean': {
    badge:     'SADBOY PIONEER',
    era:       '2013 – present',
    origin:    'Stockholm, Sweden',
    color:     '#85C1E9',
    tagline:   'A Swedish teenager who invented cloud rap and accidentally predicted SoundCloud rap by years',
    influence: ['Lil Peep', 'Juice WRLD', 'Bladee', 'entire DRAIN GANG movement', 'virtually all emo rap'],
    legacy:    'Proved geography was dead. Proved the internet was a genre. The sadboy aesthetic is now mainstream fashion — he was doing it in 2013.',
    story: [
      'Jonatan Leandoer Håstad was 17 in Stockholm when he uploaded "Ginseng Strip 2002" to YouTube in 2013. He wore a Phoenix Suns jersey. He rapped about Arizona Iced Tea and Pokémon. The production was watery, purple, alien. The internet lost its mind.',
      'This was not supposed to work. A white Swedish teenager rapping in accented English about American nostalgia, over beats that sounded like they were recorded underwater. But the sincerity was undeniable. And the production — by Yung Gud, Yung Sherman, Gud Vibrations — was genuinely ahead of its time.',
      'Warlord (2016) and Stranger (2017) showed he was building something real. The sadboy aesthetic — all Percocet references, designer sadness, late night drives, crying in the club — became a blueprint that Lil Peep, Juice WRLD, and an entire SoundCloud generation ran with.',
      'He nearly died. Psychosis, hospitalization, the toll of fame hitting before he had the tools to handle it. He was transparent about all of it. That vulnerability became part of the art.',
      'Starz (2021) is one of the most underrated comeback records in recent memory — polished, strange, emotionally devastating, confidently weird. He\'d become the elder statesman of a movement he accidentally started in his bedroom at 17.',
      'DRAIN GANG — his collective with Bladee, Ecco2k, Thaiboy Digital — became one of the most influential artistic movements in underground music. Their aesthetic is everywhere: fashion, art, music, the whole internet underground owes them a debt.',
    ],
    quotes: [
      '"Arizona, iced out, wrist froze."',
      '"I just want to create something that makes people feel something."',
    ],
    listenTo: [
      { title: 'Unknown Death 2002', year: 2013, note: 'The mixtape that started it all' },
      { title: 'Stranger', year: 2017, note: 'His most complete early vision' },
      { title: 'Starz', year: 2021, note: 'The fully realized artist' },
    ],
  },

  'lil peep': {
    badge:     'EMO RAP ICON',
    era:       '2015 – 2017',
    origin:    'Long Island, NY',
    color:     '#C39BD3',
    tagline:   'He made it okay to cry. He made it okay to hurt. He made it cool to be broken.',
    influence: ['Juice WRLD', 'XXXTentacion', 'Glaive', 'Wicca Phase Springs Eternal', 'modern emo rap entirely'],
    legacy:    'Tore down the wall between punk and hip-hop permanently. His death at 21 is one of the most tragic losses in modern music.',
    story: [
      'Gustav Elijah Åhr grew up between Long Beach, NY and Boston. His parents were academics. He found music on the internet — SoundCloud, Tumblr, the raw underbelly of the mid-2010s web. He had tattoos all over his face before that was a fashion statement. He wore Morrissey shirts and Kurt Cobain energy into rap spaces that weren\'t ready for him.',
      'He started releasing music on SoundCloud in 2015. "Star Shopping." "Awful Things." "Cry Alone." Songs that sounded like a mixtape of every emotion a 20-year-old could feel — loneliness, heartbreak, pills, not wanting to be here, and somehow still hoping.',
      'The production was post-punk filtered through trap. He worked with producers like Smokeasac and worked inside GothBoiClique — a collective of artists (including Wicca Phase Springs Eternal) who were merging emo, black metal aesthetics with SoundCloud rap years before it was fashionable.',
      'Come Over When You\'re Sober, Pt. 1 was released August 2017. It was his most accessible work — still dark, still him, but arranged for the mainstream he was about to break into. Labels were circling. A major rollout was planned.',
      'He died November 15, 2017. Accidental fentanyl overdose in Tucson, AZ. He was 21. Come Over When You\'re Sober, Pt. 2 was released posthumously. His mother Liza Womack has managed his estate with remarkable care.',
      'Lil Peep broke something open. After him, rappers could cry on records and not be called soft. After him, the punk-rap hybrid wasn\'t a curiosity — it was a genre. Juice WRLD, Iann Dior, Trippie Redd, the entire emo-rap wave of 2018-2022 — all of it runs through Peep.',
      'He was 21 years old. He was just getting started.',
    ],
    quotes: [
      '"When I die, you\'ll love me."',
      '"I used to want to kill myself. I still do sometimes. But not as much."',
    ],
    listenTo: [
      { title: 'Come Over When You\'re Sober, Pt. 1', year: 2017, note: 'His breakthrough. Start here.' },
      { title: 'Come Over When You\'re Sober, Pt. 2', year: 2018, note: 'Posthumous. Heartbreaking.' },
      { title: 'Crybaby', year: 2016, note: 'The mixtape that built the legend' },
      { title: 'Star Shopping', year: 2015, note: 'The song that introduced the world to Peep' },
    ],
  },

  'juice wrld': {
    badge:     'FREESTYLE GOD',
    era:       '2017 – 2019',
    origin:    'Chicago, IL (Homewood)',
    color:     '#E74C3C',
    tagline:   'Could freestyle for hours. His brain was a studio. We lost him too soon.',
    influence: ['Rod Wave', 'Polo G', 'Lil Durk (melodic side)', 'the entire melodic Chicago wave'],
    legacy:    'Proved that melody and emotion could dominate rap the way street content had. One of the most naturally gifted artists of his generation, full stop.',
    story: [
      'Jarad Higgins from Homewood, a suburb of Chicago. He taught himself to play piano, guitar, and drums as a kid. He discovered SoundCloud rap in high school and realized he could do all of it — rap, sing, produce, freestyle — simultaneously. He was 17 when he started uploading.',
      '"Lucid Dreams" built off a Sting sample and blew up in 2018, peaking at #2 on the Billboard Hot 100. He was 19. The follow-up single "All Girls Are the Same" hit top 5. His debut album Goodbye & Good Riddance went platinum multiple times. He signed to Grade A Productions and Interscope for reportedly $3 million.',
      'But the music people remember isn\'t the hits — it\'s the freestyles. Videos of Juice freestyling for 10, 20, 30 minutes straight, constructing elaborate melodies and complex rhyme schemes in real time, became the stuff of legend. He had a photographic memory for flow. He didn\'t write — he just opened his mouth.',
      'Death Race for Love (2019) showed his range: dark, melodic, confessional, technically staggering. He was growing into something genuinely great. He was also struggling — the drug references in his music were not fictional.',
      'He died December 8, 2019 at Chicago\'s Midway Airport. He was 21. Seizure following ingestion of oxycodone and codeine. The loss hit different because you could hear how much was still inside him — how many more records, how many more freestyles, how much more music existed in that brain.',
      'Legends Never Die (2020) and Fighting Demons (2021), assembled from his vault, showed an artist who recorded constantly, who was always searching. He left thousands of unreleased songs. Some will come out. Most won\'t.',
      'He was 21. He was the best freestyler of his generation. He should be here.',
    ],
    quotes: [
      '"Legends never die."',
      '"I convert pain to energy."',
      '"I\'ve been going through something, but I don\'t know what that something is."',
    ],
    listenTo: [
      { title: 'Goodbye & Good Riddance', year: 2018, note: 'The debut that launched him into the stratosphere' },
      { title: 'Death Race for Love', year: 2019, note: 'His most ambitious work, showing his full range' },
      { title: 'Legends Never Die', year: 2020, note: 'Posthumous. The hits and then some.' },
    ],
  },

  'xavier wulf': {
    badge:     'MEMPHIS UNDERGROUND',
    era:       '2012 – present',
    origin:    'Memphis, TN',
    color:     '#E67E22',
    tagline:   'Memphis darkness filtered through anime aesthetics. Raider Klan royalty.',
    influence: ['Pouya', 'Ghostemane', 'underground Memphis rap revival'],
    legacy:    'Kept the Memphis underground tradition alive and connected it to the internet generation. One of the most consistent independent artists in the scene.',
    story: [
      'Kristopher Arvell Denson III — Memphis born, internet raised. He came up through Raider Klan, SpaceGhostPurrp\'s collective out of Miami that merged the raw aesthetic of Memphis rap legends Three 6 Mafia, DJ Screw, Gangsta Pat with internet-era production.',
      'Xavier brought Memphis to Raider Klan. He had the drawl, the slow menace, the imagery of the city — but filtered through anime, video games, and the specific aesthetics of early 2010s Tumblr rap. He dressed like a character from a game nobody else was playing.',
      'His early tapes — Lone Wolf Pack, Emperor of the Midnight Clan — built a cult following. The production was dark and hazy. His flow was unhurried, like someone who was never going to rush for anyone. The Memphis tradition of rapping over slowed-down, chopped beats lived in everything he made.',
      'He left Raider Klan with Chris Travis and formed the Wolf Gang, then continued solo. Project after project, all independent, all uncompromising. He never chased charts. He never compromised the sound. The audience found him.',
      'His influence on the Memphis revival — artists like Grizzy Hendrix, Swiish Sosa, the wider underground — is quiet but real. He kept the flame burning between Three 6 Mafia\'s era and the new school. That\'s work that doesn\'t get enough credit.',
    ],
    quotes: [
      '"Memphis in my soul."',
      '"I do what I want. Period."',
    ],
    listenTo: [
      { title: 'Lone Wolf Pack', year: 2013, note: 'The tape that put him on the map' },
      { title: 'Emperor of the Midnight Clan', year: 2014, note: 'His most complete early statement' },
      { title: 'Shredder\'s Correspondence', year: 2018, note: 'Mature Xavier, fully in his own world' },
    ],
  },

  'bones': {
    badge:     'TEAMSESH FOUNDER',
    era:       '2012 – present',
    origin:    'Rialto, CA',
    color:     '#BDC3C7',
    tagline:   'The most prolific artist in underground rap. He built his own world and refused to leave it.',
    influence: ['Ghostemane', 'Night Lovell', 'the entire emo-metal-rap crossover space'],
    legacy:    'Proved total creative independence works. 100+ projects, zero label deals, one of the most dedicated fanbases in underground music.',
    story: [
      'Elmo Kennedy O\'Connor from Rialto, California. He started rapping at 16, building his aesthetic from metal, post-hardcore, horror imagery, and the coldest corners of internet rap. He founded TeamSESH — a collective that became one of the most fiercely independent operations in modern music.',
      'The aesthetic was stark: black and white visuals, grim reaper imagery, skeletons, distorted samples from horror films and old soul records. His voice was flat and haunting. The production was deliberately lo-fi — not because he couldn\'t afford better, but because the rawness was the point.',
      'The prolificacy is almost impossible to comprehend. He releases 3-4 projects per year, consistently, every year since 2012. Most artists would burn out or water down. Bones somehow maintains quality and keeps the underground faithful. His fans are some of the most devoted in music.',
      'He never signed. Multiple major labels came calling. He turned them all down. He sells merch, sells tickets to intimate shows, and the money stays in the ecosystem he built. That model — total ownership, total independence — is increasingly being studied by younger artists.',
      'His influence on the emo-metal-rap crossover is massive. Ghostemane, Cold Hart, Wicca Phase — the whole Sad Boys adjacent world — all carries DNA from Bones\' early work. He did it first, and he did it with a purity of vision that nobody has matched.',
    ],
    quotes: [
      '"I don\'t want to be famous. I want to be free."',
      '"The music is the message. Everything else is noise."',
    ],
    listenTo: [
      { title: 'WhereTheTreesMeetTheFreeway', year: 2014, note: 'The tape that defined his sound' },
      { title: 'Rotten', year: 2015, note: 'His most accessible project for newcomers' },
      { title: 'CreepingOnAhComeUp', year: 2014, note: 'Where the cult began' },
    ],
  },

  'chris travis': {
    badge:     'RAIDER KLAN ROYALTY',
    era:       '2012 – present',
    origin:    'Memphis, TN',
    color:     '#1ABC9C',
    tagline:   'Melody and menace from Memphis. One of the most underrated voices of his era.',
    influence: ['Pouya', 'Xavier Wulf', 'melodic underground rap'],
    legacy:    'Helped bridge Memphis rap tradition with internet-era aesthetics. His melodic approach to underground rap was ahead of its time.',
    story: [
      'Christopher Travis out of Memphis, Tennessee. He came up alongside Xavier Wulf inside SpaceGhostPurrp\'s Raider Klan collective — a Miami-based crew that was doing something nobody else was doing in 2012: taking the raw darkness of Memphis rap legends and filtering it through the internet.',
      'Chris brought melody to the darkness. Where some Raider Klan artists leaned into pure aggression, Chris found hooks inside the murk. His voice was distinctive — smooth on top, with an edge underneath. Songs like "Underwater" showed a rapper who could write emotionally resonant material without sacrificing the underground aesthetic.',
      'He and Xavier eventually broke from Raider Klan to form their own operation. Both continued independently, releasing music on their own terms, building cult followings that persisted through every wave of the mainstream ignoring them.',
      'His Water Boys project with Xavier Wulf remains one of the great underground rap collaborations of the 2010s — two artists who understood each other\'s aesthetic completely, rapping over production that felt genuinely alien to anything charting at the time.',
      'Chris Travis is one of those artists who gets cited more than he gets credit. When artists talk about who influenced their melodic approach to dark rap, his name comes up consistently.',
    ],
    quotes: [
      '"I\'m just doing me. That\'s all I\'ve ever done."',
    ],
    listenTo: [
      { title: 'Water Boys', year: 2013, note: 'With Xavier Wulf. The collaborative classic.' },
      { title: 'Underwater', year: 2013, note: 'His melodic peak' },
      { title: 'Apes in the Wild', year: 2014, note: 'Solo and fully formed' },
    ],
  },

  'spaceghostpurrp': {
    badge:     'RAIDER KLAN FOUNDER',
    era:       '2010 – present',
    origin:    'Miami, FL (Carol City)',
    color:     '#8E44AD',
    tagline:   'Built the blueprint. Started the movement. The rest is history.',
    influence: ['A$AP Rocky (cited him directly)', 'Raider Klan entire roster', 'Memphis rap revival'],
    legacy:    'Founded Raider Klan and created the aesthetic template that A$AP Mob, and subsequently modern dark rap, borrowed from heavily.',
    story: [
      'Markus Jamal Cobb from Carol City, Miami. He was obsessed with Memphis rap — Three 6 Mafia, Dungeon Family, DJ Screw — and the raw, horror-influenced production that defined Southern rap in the 90s. He started filtering that through his own Miami lens around 2010.',
      'He founded Raider Klan — a loose collective that pulled in Xavier Wulf, Chris Travis, Denzel Curry (before Curry went mainstream), and others who shared his aesthetic vision: dark, raw, Memphis-influenced, internet-native. The collective dropped a torrent of mixtapes that quietly reshaped underground rap.',
      'The A$AP connection is documented. Rocky has cited SpaceGhostPurrp as an influence in multiple interviews. The dark, hazy, Memphis-influenced production that defined early A$AP Mob — particularly on LiveLoveA$AP — ran parallel to and in conversation with what Purrp was building in Miami.',
      'He fell out with several Raider Klan members publicly, which fractured the collective. But the blueprint was already drawn. Denzel Curry took his lessons and went mainstream. Xavier Wulf and Chris Travis continued independently. The Raider Klan DNA is in a remarkable amount of modern rap.',
      'Purrp has remained prolific and independent, continuing to release music on his own terms. Underrated to the mainstream. Essential to anyone studying how underground rap evolved in the 2010s.',
    ],
    quotes: [
      '"Carol City raised me. Memphis shaped me."',
      '"I started this wave. Facts."',
    ],
    listenTo: [
      { title: 'Mysterious Phonk: The Chronicles of SpaceGhostPurrp', year: 2012, note: 'The definitive statement' },
      { title: 'Suck a Dick 2012', year: 2012, note: 'Raw and essential Raider Klan era' },
    ],
  },

  'pouya': {
    badge:     'UNDERGROUND HEAVYWEIGHT',
    era:       '2014 – present',
    origin:    'Miami, FL',
    color:     '#E74C3C',
    tagline:   'Heavy bass, heavy emotion, heavy influence. Miami underground at its finest.',
    influence: ['$uicideboy$', 'Night Lovell', 'underground rap-metal crossover'],
    legacy:    'Helped build the bridge between SoundCloud underground and alternative rap. His collaborative work with $uicideboy$ defined an era.',
    story: [
      'Eric Omar Farber, Miami FL. Pouya came up through the same Miami underground that produced SpaceGhostPurrp — dark, heavy, influenced by the grimier corners of Southern rap and metal. He found his lane early: dense bass production, a voice that could be soft and menacing within the same bar.',
      'His collaboration with $uicideboy$ — "Void" and the collaborative projects that followed — became cornerstone releases for the heavy underground rap movement of 2015-2018. The combination of their aesthetics was something new: slow, heavy, dark, emotionally raw in a way that didn\'t exist cleanly in either rap or metal.',
      'Underground Forever and Five Five marked a creative peak — albums that showed Pouya had a genuine artistic vision beyond the underground novelty. He could write hooks. He could construct full projects. He was building a body of work, not just dropping tapes.',
      'His influence on the specific lane of heavy, bass-driven underground rap is concrete. Artists who came after him in that space — within the $uicideboy$ extended universe and beyond — heard Pouya and understood what was possible.',
    ],
    quotes: [
      '"Underground forever. That\'s the only way."',
    ],
    listenTo: [
      { title: 'Underground Underdog', year: 2016, note: 'The project that established him' },
      { title: 'Five Five', year: 2018, note: 'His most complete album' },
      { title: 'Void', year: 2015, note: 'With $uicideboy$. Where it all clicked.' },
    ],
  },

  'night lovell': {
    badge:     'DARK ATMOSPHERICS',
    era:       '2013 – present',
    origin:    'Ottawa, Canada',
    color:     '#2C3E50',
    tagline:   'The coldest voice in underground rap. Ottawa by way of nowhere.',
    influence: ['Bones', 'dark melodic underground rap broadly'],
    legacy:    'Proved atmospheric darkness could be as emotionally resonant as anything in mainstream rap. Built one of underground music\'s most loyal fanbases.',
    story: [
      'Zephirin Joly-Lonee from Ottawa, Canada. He started releasing music on SoundCloud around 2013 — dark, atmospheric, deeply melancholic rap that felt like it was recorded inside a cold room at 4am. His voice was low and flat, his production even colder.',
      '"Dark Light" became an underground anthem — a track so effectively bleak that it spread organically across the internet without any label infrastructure, any promotional budget, any machine behind it. Just the music, and the people who needed to hear it.',
      'Concept Vague (2016) was his debut proper — a project that showed he could sustain a mood across a full album, which is harder than it sounds. The whole thing felt like one long exhale. It was critically appreciated in underground circles and completely ignored by anyone else. That\'s the Night Lovell experience.',
      'Hard to Love (2018) refined the formula — slightly more accessible, no less dark. He\'d found a balance between artistic integrity and songcraft that many underground artists never locate.',
      'He\'s continued releasing music consistently, building a catalogue of atmospheric dark rap that occupies a specific corner of the underground nobody else is working quite as effectively.',
    ],
    quotes: [
      '"Dark light, everything is dark light."',
    ],
    listenTo: [
      { title: 'Concept Vague', year: 2016, note: 'His debut. Dark, consistent, essential.' },
      { title: 'Hard to Love', year: 2018, note: 'The refined statement' },
      { title: 'Dark Light', year: 2014, note: 'The track that started everything' },
    ],
  },

  'wicca phase springs eternal': {
    badge:     'EMO RAP ARCHITECT',
    era:       '2014 – present',
    origin:    'State College, PA',
    color:     '#8E44AD',
    tagline:   'From post-hardcore band to GothBoiClique co-founder. The original emo-rap bridge.',
    influence: ['Lil Peep (directly — they were in GothBoiClique together)', 'Cold Hart', 'all emo rap'],
    legacy:    'Co-founded GothBoiClique with Lil Peep. Their collaborative work defined the emo-rap aesthetic that became mainstream after Peep\'s death.',
    story: [
      'Adam McIlwrath from State College, Pennsylvania. He was in Tigers Jaw — a beloved post-hardcore/emo band — before he became Wicca Phase Springs Eternal. That background matters: he brought genuine rock musicianship and songwriting to a rap context.',
      'He co-founded GothBoiClique with Lil Peep, Tracy, Horse Head, Døves, and others. The collective merged emo, black metal aesthetics, and SoundCloud rap into something that had no real precedent. Wicca Phase was the one who most explicitly carried the singer-songwriter tradition — his songs were structured, melodic, built on actual chord progressions.',
      'His collaboration with Lil Peep on "Awful Things" (originally as a GothBoiClique track) is one of the most emotionally effective songs in the underground catalog — two artists who genuinely understood each other\'s pain, making something that hit harder than either could alone.',
      'After Peep\'s death in 2017, Wicca Phase became a keeper of that legacy. He\'s spoken about the loss honestly, continued making music in the tradition they built together, and has been careful about how GothBoiClique\'s legacy is handled.',
      'His solo work — increasingly acoustic, increasingly direct — shows an artist who was always more singer-songwriter than rapper, using the tools of underground rap to reach an audience that wouldn\'t have found him through traditional indie channels.',
    ],
    quotes: [
      '"Every day is exactly the same."',
      '"We built something real. Peep knew it. I knew it."',
    ],
    listenTo: [
      { title: 'Suffer Through', year: 2016, note: 'His defining solo statement' },
      { title: 'Awful Things', year: 2016, note: 'With Lil Peep. Start here.' },
      { title: 'Secret Guide', year: 2020, note: 'Mature, acoustic, devastating' },
    ],
  },

  'glaive': {
    badge:     'HYPERPOP HEIR',
    era:       '2020 – present',
    origin:    'Spruce Pine, NC',
    color:     '#85C1E9',
    tagline:   'The teenager from the mountains who became hyperpop\'s brightest star.',
    influence: ['generation z underground broadly', 'bridging hyperpop and emo rap'],
    legacy:    'Became one of the fastest-rising underground artists of 2020-2022, proving hyperpop could carry emotional weight and not just chaos.',
    story: [
      'Wyatt Shears from Spruce Pine, North Carolina — a town of 2,000 people in the Appalachian mountains. He started uploading to SoundCloud and TikTok in 2020, at 15 years old, making hyperpop: heavily distorted, pitched-up vocals, breakcore production, emotional lyrics about teenage heartbreak and alienation.',
      '"Glad ur here" and "astrid" caught fire almost immediately. The production was chaotic but the songwriting was genuine — hooks that stuck despite the noise, lyrics that resonated beyond genre fans. He signed to Interscope at 16 without having released a proper album.',
      'He\'d grown up listening to Lil Peep, Bones, Yung Lean — the Underground OG wave. That melodic darkness filtered through a hyperpop sensibility that his generation had grown up with (SOPHIE, PC Music, 100 gecs) created something new: emotional hyperpop that wasn\'t purely ironic.',
      'i got what u need EP and then his collab with Ericdoa on then i\'ll be happy showed an artist already finding his range at 17. His live shows sold out despite having no traditional media infrastructure behind him — pure fanbase, pure word of mouth.',
      'He is the direct inheritor of what Peep started. The lineage is clear and he knows it. What he does with it over the next decade is one of the more interesting questions in underground music.',
    ],
    quotes: [
      '"I just want to make something that means something to someone in their bedroom at 2am."',
    ],
    listenTo: [
      { title: 'i got what u need', year: 2021, note: 'The debut EP. Start here.' },
      { title: 'then i\'ll be happy', year: 2021, note: 'With Ericdoa. His best collaborative work.' },
      { title: 'glad ur here', year: 2020, note: 'The track that introduced him to the world' },
    ],
  },

};

// ── Helper — match by name (case-insensitive, partial match) ─────────────────
export function getArtistLore(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  // Direct match first
  if (ARTIST_LORE[key]) return ARTIST_LORE[key];
  // Partial match
  const found = Object.keys(ARTIST_LORE).find(k => key.includes(k) || k.includes(key));
  return found ? ARTIST_LORE[found] : null;
}

/**
 * The definitive diss track ballot.
 * Every track is stored by ID in Firestore — this file is the source of truth
 * for metadata. Vote counts come from the live database.
 */

export const DISS_TRACKS = [
  // ── 2024 — Kendrick vs Drake ─────────────────────────────────────────────
  {
    id:      'not_like_us',
    title:   'Not Like Us',
    artist:  'Kendrick Lamar',
    year:    2024,
    target:  'Drake',
    era:     'Modern',
    bar:     '"A minors on your label, and you plead the fifth"',
  },
  {
    id:      'euphoria',
    title:   'Euphoria',
    artist:  'Kendrick Lamar',
    year:    2024,
    target:  'Drake',
    era:     'Modern',
    bar:     '"I hate the way that you walk, the way that you talk, I hate the way that you dress"',
  },
  {
    id:      'meet_the_grahams',
    title:   'Meet the Grahams',
    artist:  'Kendrick Lamar',
    year:    2024,
    target:  'Drake',
    era:     'Modern',
    bar:     '"Dear Adonis, I\'m sorry that your father is a habitual liar"',
  },
  {
    id:      'family_matters',
    title:   'Family Matters',
    artist:  'Drake',
    year:    2024,
    target:  'Kendrick Lamar',
    era:     'Modern',
    bar:     '"You\'re not a rapper, you\'re a actor with a rapping problem"',
  },
  {
    id:      '6_16_in_la',
    title:   '6:16 in LA',
    artist:  'Drake',
    year:    2024,
    target:  'Kendrick Lamar',
    era:     'Modern',
    bar:     '"They gas you up and you just float, no landing in sight"',
  },
  {
    id:      'like_that',
    title:   'Like That',
    artist:  'Kendrick Lamar',
    year:    2024,
    target:  'Drake & J. Cole',
    era:     'Modern',
    bar:     '"Motherf*** the big three, it\'s just big me"',
  },
  {
    id:      'push_ups',
    title:   'Push Ups',
    artist:  'Drake',
    year:    2024,
    target:  'Kendrick Lamar',
    era:     'Modern',
    bar:     '"You need Pharrell for a hit, you need Metro for a hit"',
  },
  {
    id:      'heart_part_4',
    title:   'The Heart Part 4',
    artist:  'Kendrick Lamar',
    year:    2017,
    target:  'Drake & Big Sean',
    era:     'Modern',
    bar:     '"Y\'all know what time it is, good kid, m.A.A.d bars"',
  },
  {
    id:      '7_minute_drill',
    title:   '7 Minute Drill',
    artist:  'J. Cole',
    year:    2024,
    target:  'Kendrick Lamar',
    era:     'Modern',
    bar:     '"Is you really top 5 or is that a marketing scheme?"',
  },

  // ── 2018 — Drake vs Pusha T ───────────────────────────────────────────────
  {
    id:      'the_story_of_adidon',
    title:   'The Story of Adidon',
    artist:  'Pusha T',
    year:    2018,
    target:  'Drake',
    era:     'Modern',
    bar:     '"A baby\'s involved, it\'s deeper than rap"',
  },
  {
    id:      'infrared',
    title:   'Infrared',
    artist:  'Pusha T',
    year:    2018,
    target:  'Drake',
    era:     'Modern',
    bar:     '"It was written like Nas but it came from Quentin"',
  },
  {
    id:      'duppy_freestyle',
    title:   'DUPPY Freestyle',
    artist:  'Drake',
    year:    2018,
    target:  'Pusha T & Kanye West',
    era:     'Modern',
    bar:     '"You might have the crown but I\'m the one who made it cool"',
  },

  // ── 2018 — Eminem vs MGK ─────────────────────────────────────────────────
  {
    id:      'killshot',
    title:   'Killshot',
    artist:  'Eminem',
    year:    2018,
    target:  'Machine Gun Kelly',
    era:     'Modern',
    bar:     '"I\'d rather be 80 years old and spit than be you"',
  },
  {
    id:      'rap_devil',
    title:   'Rap Devil',
    artist:  'Machine Gun Kelly',
    year:    2018,
    target:  'Eminem',
    era:     'Modern',
    bar:     '"Rap God can\'t even get on the same channel"',
  },

  // ── 2015 — Drake vs Meek Mill ─────────────────────────────────────────────
  {
    id:      'back_to_back',
    title:   'Back to Back',
    artist:  'Drake',
    year:    2015,
    target:  'Meek Mill',
    era:     'Modern',
    bar:     '"Is that a world tour or your girl\'s tour?"',
  },
  {
    id:      'charged_up',
    title:   'Charged Up',
    artist:  'Drake',
    year:    2015,
    target:  'Meek Mill',
    era:     'Modern',
    bar:     '"Trigger fingers turn to twitter fingers"',
  },
  {
    id:      'wanna_know',
    title:   'Wanna Know',
    artist:  'Meek Mill',
    year:    2015,
    target:  'Drake',
    era:     'Modern',
    bar:     '"You ain\'t write one bar, Quentin wrote your verse"',
  },

  // ── 2017 — Remy Ma vs Nicki Minaj ─────────────────────────────────────────
  {
    id:      'shether',
    title:   'ShEther',
    artist:  'Remy Ma',
    year:    2017,
    target:  'Nicki Minaj',
    era:     'Modern',
    bar:     '"Everyone know your first album was trash without Kanye"',
  },
  {
    id:      'no_frauds',
    title:   'No Frauds',
    artist:  'Nicki Minaj',
    year:    2017,
    target:  'Remy Ma',
    era:     'Modern',
    bar:     '"You got a ghostwriter and a ghost career"',
  },

  // ── 2013 — Control ────────────────────────────────────────────────────────
  {
    id:      'control',
    title:   'Control (Kendrick verse)',
    artist:  'Kendrick Lamar',
    year:    2013,
    target:  'Big Sean, J. Cole, Drake, etc.',
    era:     'Modern',
    bar:     '"I\'m usually homeboys with the same n****s I\'m rhymin\' against"',
  },

  // ── 2001 — Jay-Z vs Nas ──────────────────────────────────────────────────
  {
    id:      'ether',
    title:   'Ether',
    artist:  'Nas',
    year:    2001,
    target:  'Jay-Z',
    era:     'Classic',
    bar:     '"Ether... f*** Jay-Z"',
  },
  {
    id:      'takeover',
    title:   'Takeover',
    artist:  'Jay-Z',
    year:    2001,
    target:  'Nas & Mobb Deep',
    era:     'Classic',
    bar:     '"You made one hot song and got a hot deal, how does it feel?"',
  },
  {
    id:      'super_ugly',
    title:   'Super Ugly',
    artist:  'Jay-Z',
    year:    2002,
    target:  'Nas',
    era:     'Classic',
    bar:     '"My child by your chick, for real"',
  },

  // ── 1996 — 2Pac vs Biggie ────────────────────────────────────────────────
  {
    id:      'hit_em_up',
    title:   "Hit 'Em Up",
    artist:  '2Pac',
    year:    1996,
    target:  'Notorious B.I.G. & Bad Boy',
    era:     'Classic',
    bar:     '"First off, f*** your b*tch and the click you claim"',
  },
  {
    id:      'who_shot_ya',
    title:   'Who Shot Ya',
    artist:  'Notorious B.I.G.',
    year:    1994,
    target:  '2Pac (implied)',
    era:     'Classic',
    bar:     '"Who shot ya? Separate the weak from the ob-so-lete"',
  },

  // ── 1991 — Ice Cube vs NWA ───────────────────────────────────────────────
  {
    id:      'no_vaseline',
    title:   'No Vaseline',
    artist:  'Ice Cube',
    year:    1991,
    target:  'NWA & Jerry Heller',
    era:     'Classic',
    bar:     '"It\'s a case of divide and conquer \'cause you let a Jew break up my crew"',
  },
  {
    id:      'fuck_compton',
    title:   'Fuck tha Police (Tim Dog Response)',
    artist:  'Tim Dog',
    year:    1991,
    target:  'NWA & Eazy-E',
    era:     'Classic',
    bar:     '"NWA ain\'t sh**, I\'m from the Bronx, not Compton"',
  },

  // ── 1987 — BDP vs Juice Crew ─────────────────────────────────────────────
  {
    id:      'the_bridge_is_over',
    title:   'The Bridge Is Over',
    artist:  'Boogie Down Productions',
    year:    1987,
    target:  'Juice Crew / MC Shan',
    era:     'Pioneer',
    bar:     '"The bridge is over, the bridge is over"',
  },
  {
    id:      'south_bronx',
    title:   'South Bronx',
    artist:  'Boogie Down Productions',
    year:    1986,
    target:  'MC Shan & Juice Crew',
    era:     'Pioneer',
    bar:     '"You love to exaggerate, you love to lie, South Bronx — the South South Bronx"',
  },

  // ── 1998 — Canibus vs LL ─────────────────────────────────────────────────
  {
    id:      'second_round_ko',
    title:   'Second Round K.O.',
    artist:  'Canibus',
    year:    1998,
    target:  'LL Cool J',
    era:     'Classic',
    bar:     '"99% of your fans wear high heels"',
  },
  {
    id:      'the_ripper_strikes_back',
    title:   'The Ripper Strikes Back',
    artist:  'LL Cool J',
    year:    1998,
    target:  'Canibus',
    era:     'Classic',
    bar:     '"I will end your career, I\'m that raw"',
  },

  // ── 1984 — The Original ──────────────────────────────────────────────────
  {
    id:      'roxannes_revenge',
    title:   "Roxanne's Revenge",
    artist:  'Roxanne Shanté',
    year:    1984,
    target:  'UTFO',
    era:     'Pioneer',
    bar:     '"I\'m only 14 and I\'m bad"',
  },

  // ── Underground ──────────────────────────────────────────────────────────
  {
    id:      'dollar_day',
    title:   'Dollar Day',
    artist:  'Mos Def',
    year:    2004,
    target:  'US Government / Mainstream Rap',
    era:     'Underground',
    bar:     '"New York Times, said it, I ain\'t say it, they printed it"',
  },
  {
    id:      'the_warning_em',
    title:   'The Warning',
    artist:  'Eminem',
    year:    2009,
    target:  'Mariah Carey & Nick Cannon',
    era:     'Modern',
    bar:     '"I can have you removed, I have the tools"',
  },
  {
    id:      'dis_ease',
    title:   'Dis-Ease',
    artist:  'Ab-Soul',
    year:    2016,
    target:  'Drake (implied)',
    era:     'Underground',
    bar:     '"You the type to diss a n**** then go and hire \'em"',
  },
  {
    id:      'nail_in_coffin',
    title:   'Nail in the Coffin',
    artist:  'Eminem',
    year:    2002,
    target:  'Benzino',
    era:     'Classic',
    bar:     '"Source magazine? I\'d rather be caught dead than seen reading it"',
  },
];

export const ERA_COLORS = {
  Pioneer:    '#C9A45A',
  Classic:    '#CC0000',
  Modern:     '#E07B0A',
  Underground:'#4ade80',
};

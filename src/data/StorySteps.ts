// src/data/StorySteps.ts

export type SceneType = 
  | 'RESUME' 
  | 'GALLERY' 
  | 'FORGE' 
  | 'LEAP' 
  | 'VALUE' 
  | 'CONTROL' 
  | 'MIRROR' 
  | 'FUTURE';

export interface StoryImage {
  src: string;
  date?: string;
}

export interface StoryStep {
  tag: string;
  scene: SceneType;
  text: string;
  title?: string;
  images?: StoryImage[];
  isFinal?: boolean;
}

export const storySteps: StoryStep[] = [
  { 
    tag: "IDENTITY", 
    scene: "RESUME",
    text: "Bridging the gaps between the analog and the digital worlds."
  },
  { 
    tag: "CONNECTION", 
    scene: "GALLERY",
    text: "A lifetime of variety before a line of code.", 
    images: [
      { src: "/images/family/amy-estelle-baby-snow.jpg", date: "2023-12-25" },
      { src: "/images/family/dad-shirt.jpg", date: "2022-06-15" },
      { src: "/images/family/dfrey-wedding.jpg", date: "2021-09-10" },
      { src: "/images/family/don-me-wedding.jpg", date: "2018-05-20" },
      { src: "/images/family/estelle-rick-gramps.JPG", date: "2022-08-20" },
      { src: "/images/family/fam-selfie-2021.jpg", date: "2021-07-04" },
      { src: "/images/family/first-year-as-mother-g.jpeg", date: "2021-05-09" },
      { src: "/images/family/firstfamall.jpg", date: "2017-11-23" },
      { src: "/images/family/greg-dan-amy-fish.jpg", date: "2023-04-12" },
      { src: "/images/family/kids-me-ola.jpg", date: "2020-10-31" },
      { src: "/images/family/svt-friends.jpg", date: "2019-12-31" },
      { src: "/images/family/lildavid-mom.jpg", date: "1995-05-14" },
      { src: "/images/family/only-pic-of-jurrand.jpg", date: "2019-05-14" },
      { src: "/images/family/tia-sean-baby.JPG", date: "2022-03-12" },
      { src: "/images/family/nanny-sean-baby.JPG", date: "2022-03-15" },
      { src: "/images/family/prom-david-mom.jpg", date: "2006-05-10" },
      { src: "/images/family/adam-me-mtn-trip.jpg", date: "2024-01-20" },
      { src: "/images/family/pops-dad-me-computer.jpg", date: "2000-08-15" },
      { src: "/images/family/miller-fam-din-tx.jpg", date: "2023-10-12" },
      { src: "/images/family/dad-motor-bike-txoma.jpg", date: "2022-09-05" },
      { src: "/images/family/dad-me-hike.jpg", date: "2023-05-20" },
      { src: "/images/family/dad-channels.jpg", date: "2024-06-16" },
      { src: "/images/family/dad-sean-hike-channels.jpg", date: "2024-06-16" },
      { src: "/images/family/estelle-me-hike.jpg", date: "2024-04-10" },
      { src: "/images/family/sean-estelle-snowman.jpg", date: "2024-01-15" },
      { src: "/images/family/steal-a-kiss-wedding.jpg", date: "2023-02-14" }
    ]
  },
  { 
    tag: "FORGE", 
    scene: "FORGE", 
    text: "I forged my grit in the furnaces of the service industry." 
  },
  { 
    tag: "LEAP", 
    scene: "LEAP", 
    text: "Witnessing the work of an engineer, I jumped in with both feet." 
  },
  { 
    tag: "VALUE", 
    scene: "VALUE", 
    text: "Using my effervescence and persistence to redefine my value." 
  },
  { 
    tag: "CONTROL", 
    scene: "CONTROL", 
    text: "Craving creative and systematic control in my life." 
  },
  { 
    tag: "REFLECTION", 
    scene: "MIRROR", 
    text: "I turned the reflector I had been for so many back on me." 
  },
  { 
    tag: "THE_MISSION", 
    scene: "MIRROR", 
    text: "Quantizing the complicated analog experience into ambient digital clarity." 
  },
  { 
    tag: "FUTURE", 
    scene: "FUTURE", 
    text: "With my system ready, What will we build together?", 
    isFinal: true 
  }
];
export interface Question {
  id: number;
  code: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: "ŁATWE" | "ŚREDNIE" | "TRUDNE" | "MEGA TRUDNE";
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    code: "Pytanie1..",
    text: "Kiedy urodził się biskup Władysław Goral?",
    options: ["15 sierpnia 1903 r.", "1 maja 1898 r.", "3 marca 1890 r."],
    correctIndex: 1,
    difficulty: "ŁATWE",
  },
  {
    id: 2,
    code: "Pytanie2.",
    text: "W jakim mieście Goral pełnił funkcję biskupa pomocniczego?",
    options: ["Kraków", "Warszawa", "Lublin"],
    correctIndex: 2,
    difficulty: "ŁATWE",
  },
  {
    id: 3,
    code: "Pytanie3..",
    text: "Przez jakiego papieża Goral został beatyfikowany i w którym roku?",
    options: ["Benedykt XVI, 2005 r.", "Jan XXIII, 1963 r.", "Jan Paweł II, 1999 r."],
    correctIndex: 2,
    difficulty: "ŁATWE",
  },
  {
    id: 4,
    code: "ppytanie4",
    text: "W jakim obozie koncentracyjnym więziony był bp Goral i ile czasu tam spędził?",
    options: ["Dachau, przez 2 lata", "Sachsenhausen, około 5 lat", "Auschwitz, przez 3 lata"],
    correctIndex: 1,
    difficulty: "ŚREDNIE",
  },
  {
    id: 5,
    code: "ppytanie5.",
    text: "Jak nazywała się niemiecka akcja, w ramach której aresztowano biskupa?",
    options: ["Sonderaktion Lublin, 17 listopada 1939 r.", "Aktion Reinhardt, 5 marca 1940 r.", "Unternehmen Barbarossa, 22 czerwca 1941 r."],
    correctIndex: 0,
    difficulty: "ŚREDNIE",
  },
  {
    id: 6,
    code: "pppytanie6",
    text: "Gdzie Goral studiował i jaki stopień naukowy zdobył?",
    options: ["Teologię w Krakowie – licencjat", "Prawo kanoniczne w Paryżu – doktorat", "Filozofię w Rzymie – doktorat; teologię we Fryburgu szwajcarskim – licencjat"],
    correctIndex: 2,
    difficulty: "ŚREDNIE",
  },
  {
    id: 7,
    code: "PYTANIE7",
    text: "Jakie numery obozowe nosił bp Goral w Sachsenhausen?",
    options: ["Najpierw 5605, od 1943 roku – 13981", "Jeden numer: 7777 przez cały pobyt", "Najpierw 1234, od 1942 roku – 9999"],
    correctIndex: 0,
    difficulty: "TRUDNE",
  },
  {
    id: 8,
    code: "PYTANIe8",
    text: "Jakie organizacje tworzył lub współtworzył bp Goral z myślą o robotnikach?",
    options: ["Polskie Towarzystwo Gimnastyczne, Związek Strzelecki", "Chrześcijańskie Zjednoczenie Zawodowe RP, Chrześcijański Uniwersytet Robotniczy, Lubelskie Towarzystwo Dobroczynności", "Towarzystwo Czytelni Ludowych, Klub Sportowy Lublinianka"],
    correctIndex: 1,
    difficulty: "TRUDNE",
  },
  {
    id: 9,
    code: "pYTANIe9",
    text: "Jakim odznaczeniem uhonorowano biskupa pośmiertnie i w którym roku?",
    options: ["Orderem Orła Białego, 1947 r.", "Krzyżem Komandorskim z Gwiazdą Orderu Odrodzenia Polski, 16 kwietnia 1949 r.", "Krzyżem Virtuti Militari, 1946 r."],
    correctIndex: 1,
    difficulty: "TRUDNE",
  },
  {
    id: 10,
    code: "PYTANIE10.",
    text: "Co wynikało z zeznań palacza z KL Sachsenhausen odnalezionych w 2022 r. przez Pawła Woźniaka?",
    options: ["Biskup Goral zbiegł z obozu i ukrywał się aż do wyzwolenia", "Bp Goral został wywieziony tuż przed ewakuacją Sachsenhausen do KL Ravensbrück", "Biskup Goral zmarł na chorobę w szpitalu obozowym in 1943 r."],
    correctIndex: 1,
    difficulty: "MEGA TRUDNE",
  },
];

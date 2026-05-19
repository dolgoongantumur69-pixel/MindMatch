export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export function calculateMatchScore(
  candidate: BigFiveScores,
  job: BigFiveScores
): number {
  const weights = {
    openness: 0.2,
    conscientiousness: 0.25,
    extraversion: 0.2,
    agreeableness: 0.2,
    neuroticism: 0.15,
  };

  let score = 0;
  for (const [trait, weight] of Object.entries(weights)) {
    const key = trait as keyof BigFiveScores;
    const diff = Math.abs(candidate[key] - job[key]);
    const traitScore = Math.max(0, 100 - diff);
    score += traitScore * weight;
  }

  return Math.round(score);
}

export function deriveInsights(scores: BigFiveScores): {
  workStyle: string;
  strengths: string;
  idealEnvironment: string;
} {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;

  let workStyle = "";
  if (extraversion > 60) workStyle = "Бүлгийн гишүүн, идэвхтэй харилцааны";
  else if (extraversion < 40) workStyle = "Бие даасан, гүнзгий бодох дуртай";
  else workStyle = "Уян хатан, нөхцөл байдлаас хамаарах";

  const strengthsList: string[] = [];
  if (openness > 60) strengthsList.push("Бүтээлч сэтгэлгээ, шинийг эрэлхийлэх");
  if (conscientiousness > 60) strengthsList.push("Зохион байгуулалт сайтай, найдвартай");
  if (agreeableness > 60) strengthsList.push("Хамтын ажиллагааны сайн, эелдэг");
  if (neuroticism < 40) strengthsList.push("Тогтвортой сэтгэл хөдлөл, дарамтанд тэвчээртэй");
  if (extraversion > 60) strengthsList.push("Харилцаа холбоо сайтай, манлайлах чадвар");

  const strengths = strengthsList.length > 0 ? strengthsList.join(", ") : "Тэнцвэртэй, олон талт";

  let idealEnvironment = "";
  if (conscientiousness > 60 && neuroticism < 50) {
    idealEnvironment = "Бүтэцтэй, тодорхой зорилготой ажлын орчин";
  } else if (openness > 60 && extraversion > 50) {
    idealEnvironment = "Бүтээлч, хамтын ажиллагаатай динамик орчин";
  } else if (agreeableness > 60) {
    idealEnvironment = "Хамтрал, дэмжлэг, харилцааны орчин";
  } else {
    idealEnvironment = "Уян хатан, өөрийн хурдаар ажиллах боломжтой орчин";
  }

  return { workStyle, strengths, idealEnvironment };
}

export const BIG_FIVE_QUESTIONS = [
  { id: 1,  trait: "openness",          text: "Шинэ зүйл туршиж үзэхэд дуртай байдаг.",              reverse: false },
  { id: 2,  trait: "conscientiousness", text: "Ажлаа хугацаанд нь, төлөвлөгөөний дагуу дуусгадаг.",  reverse: false },
  { id: 3,  trait: "extraversion",      text: "Хүмүүстэй харилцсаны дараа эрч хүч нэмэгддэг.",       reverse: false },
  { id: 4,  trait: "agreeableness",     text: "Бусдын санал бодлыг анхааралтай сонсдог.",             reverse: false },
  { id: 5,  trait: "neuroticism",       text: "Стресстэй нөхцөлд ч тайван байж чаддаг.",              reverse: true  },
  { id: 6,  trait: "openness",          text: "Урлаг, хөгжим, уран зохиол надад таалагддаг.",         reverse: false },
  { id: 7,  trait: "conscientiousness", text: "Эмх цэгц, зохион байгуулалт надад чухал байдаг.",      reverse: false },
  { id: 8,  trait: "extraversion",      text: "Олон хүн цугласан арга хэмжээнд оролцохдоо таатай байдаг.", reverse: false },
  { id: 9,  trait: "agreeableness",     text: "Маргаан гарахад буулт хийж, эвлэрэхийг эрмэлздэг.",   reverse: false },
  { id: 10, trait: "neuroticism",       text: "Хэцүү үед ч сэтгэлийн тэнцвэрээ хадгалдаг.",          reverse: true  },
  { id: 11, trait: "openness",          text: "Өөр соёл, үзэл бодолтой танилцахад дуртай байдаг.",    reverse: false },
  { id: 12, trait: "conscientiousness", text: "Өгсөн амлалтаа үргэлж биелүүлдэг.",                    reverse: false },
  { id: 13, trait: "extraversion",      text: "Танихгүй хүмүүстэй амархан ярилцаж чаддаг.",           reverse: false },
  { id: 14, trait: "agreeableness",     text: "Бусдад туслахад цаг, хүч зарцуулахад бэлэн байдаг.",   reverse: false },
  { id: 15, trait: "neuroticism",       text: "Стресс, тревогийг хялбархан даван гардаг.",             reverse: true  },
];

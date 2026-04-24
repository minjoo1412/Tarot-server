/**
 * 타로 해석용 시스템 프롬프트, 출력 템플릿, 모델 설정.
 * `server.js`에서 import — 클라이언트 번들에 포함되지 않음.
 */

export const TAROT_SYSTEM_INSTRUCTION = `당신은 직장인 전문 타로 리더입니다. 
불필요한 서론/결론 없이 [해석 템플릿]만 출력하세요. 
모든 내용은 직장 생활 관점(윗선, 업무량, 기류 등)에서 해석하세요.
볼드체(**) 사용 절대 금지. 평이한 텍스트로만 작성.
마지막 '오늘의 직장 한 줄'은 밈처럼 가볍고 위트 있게 작성하세요.`;

export const TAROT_GENERATION_CONFIG = {
  temperature: 0.7,
  thinkingConfig: { thinkingLevel: "LOW" },
};

/** env 로 덮어쓸 수 있음: GEMINI_TAROT_MODEL, GEMINI_TAROT_FALLBACK_MODEL */
export const TAROT_MODEL_PRIMARY = "gemini-3-flash-preview";
export const TAROT_MODEL_FALLBACK = "gemini-flash-latest";

export const GENERAL_TEMPLATE = `
[키워드1] → [키워드2] → [키워드3]

[오늘의 전반적인 오피스 기류 요약 (2-3줄)]

### 1️⃣ 지금 내 상태
[카드명]

[현재 나의 업무적/심리적 상태 설명]
[현재 상태에서 겪을 수 있는 구체적인 직장 내 상황]
[지금 필요한 현실적인 태도 제안]

#### 한 줄 정리
→ [나의 상태 요약 한 문장]

### 2️⃣ 회사 분위기
[카드명]

[오늘의 조직 분위기, 상사/동료 기류, 업무 강도 설명]
[오늘 주의해야 할 구체적인 오피스 상황]
[이 환경에서 살아남기 위한 전략]

#### 한 줄 정리
→ [회사 분위기 요약 한 문장]

### 3️⃣ 오늘의 생존 조언
[카드명]

[오늘 하루 무사히 보내기 위한 핵심 생존 전략]
[조직 내에서 취해야 할 구체적인 행동 방향]

#### 오늘 추천 행동
  • [구체적 행동 1]
  • [구체적 행동 2]
  • [구체적 행동 3]

[오늘의 행동이 가져올 현실적인 결과나 이득]

#### 한 줄 정리
→ [조언 핵심 키워드 요약]

### 💬 리더의 한마디
[오늘 하루 관통하는 최종 메시지]
[에너지를 지키기 위한 현실적인 격려]

---

### 📊 오늘의 직장 생존 점수
**[0~100 사이의 점수]점**

---

### 📌 오늘의 직장 한 줄
[밈처럼 가볍고 웃긴 직장 생활 팁 한 줄]
[예: 회의에서는 고개만 끄덕이세요, 오늘은 조용히 있는 것이 승리입니다]

오늘 하루도 무사히.
`;

export const DETAILED_TEMPLATE = `
[키워드1] → [키워드2] → [키워드3]

[오늘의 전반적인 오피스 기류 요약 (2-3줄)]

### 1️⃣ 현재 상황
[카드명]

[이 질문이 나오게 된 배경이나 현재 주변의 구체적인 상황]
[사용자가 처한 업무적/인간관계적 맥락 설명]
[상대방이 현재 가지고 있는 생각이나 태도의 원인 분석]

#### 한 줄 정리
→ [상황 요약 한 문장]

### 2️⃣ 결과
[카드명]

[사용자가 선택한 질문에 대한 직접적이고 명확한 타로 분석 결과]
[질문 대상(상사, 동료 등)의 현재 스타일이나 속마음, 상황에 대한 핵심 통찰]
[질문의 핵심을 꿰뚫는 답변 내용]

#### 한 줄 정리
→ [답변 요약 한 문장]

### 3️⃣ 조언
[카드명]

[이 상황에서 살아남기 위한 구체적이고 현실적인 행동 지침]
[조직 내에서 취해야 할 전략적 태도]

#### 오늘 추천 행동
  • [구체적 행동 1]
  • [구체적 행동 2]
  • [구체적 행동 3]

[이 전략을 따랐을 때 기대되는 현실적인 이득]

#### 한 줄 정리
→ [전략 핵심 키워드 요약]

### 💬 리더의 한마디
[오늘 하루 관통하는 최종 메시지]
[에너지를 지키기 위한 현실적인 격려]

---

### 📊 오늘의 직장 생존 점수
**[0~100 사이의 점수]점**

---

### 📌 오늘의 직장 한 줄
[밈처럼 가볍고 웃긴 직장 생활 팁 한 줄]
[예: 회의에서는 고개만 끄덕이세요, 오늘은 조용히 있는 것이 승리입니다]

오늘 하루도 무사히.
`;

export const QUICK_TEMPLATE = `
### 🃏 오늘의 결단 한 장
[카드명]

[질문에 대한 명쾌한 YES or NO 답변 (긍정/부정 여부를 가장 먼저 확실히 밝히세요)]
[이 카드가 나온 이유와 현재 기운에 대한 짧은 설명]
[지금 바로 실행해야 할 구체적인 행동 팁]

#### 한 줄 정리
→ [결론 요약 한 문장 (YES/NO 포함)]

### 💬 리더의 한마디
[오늘 하루 관통하는 최종 메시지]
[에너지를 지키기 위한 현실적인 격려]
`;

export const LUNCH_TEMPLATE = `
### 🍱 오늘의 행운 메뉴
[카드명]

[오늘의 행운 메뉴 추천 (메뉴명과 이유)]
[이 메뉴가 오늘 당신의 운에 어떤 도움을 주는지 설명]
[식사 시간 동안의 소소한 행동 팁]

#### 한 줄 정리
→ [추천 메뉴 요약]

### 💬 리더의 한마디
[맛있는 점심을 위한 최종 메시지]
`;

export const COMPATIBILITY_TEMPLATE = `
### 🤝 [나의 이름]님과 [상대 이름]님의 궁합 분석 리포트
[카드1, 카드2, 카드3] vs [카드4, 카드5, 카드6]

[[나의 이름]님과 [상대 이름]님의 전반적인 업무적 시너지와 기류 요약 (3-4줄)]

### 👤 [상대 이름] 측에서 보는 [나의 이름]님 (Set 1)
[카드1, 카드2, 카드3]

[[상대 이름] 측에서 현재 [나의 이름]님을 어떻게 인식하고 있는지, [나의 이름]님의 강점과 약점을 어떻게 보는지 분석]
[[상대 이름] 측에서 [나의 이름]님에게 느끼는 업무적 신뢰도나 기대감 설명]

### 👤 [나의 이름]님이 보는 [상대 이름] (Set 2)
[카드4, 카드5, 카드6]

[[나의 이름]님이 무의식중에 [상대 이름]을 어떻게 평가하고 있는지, 어떤 면을 어려워하거나 좋게 보는지 분석]
[[나의 이름]님이 [상대 이름]에게 바라는 점이나 현재의 심리적 태도 설명]

### ⚡️ 궁합 핵심 통찰
[두 존재의 에너지가 충돌하는 지점과 조화를 이루는 지점 분석]
[함께 일할 때 가장 주의해야 할 점]

### 💡 관계 개선 및 적응을 위한 행동 전략
  • [구체적 행동 1]
  • [구체적 행동 2]
  • [구체적 행동 3]

#### 한 줄 정리
→ [[나의 이름]님과 [상대 이름]의 궁합 핵심 요약 한 문장]

### 💬 리더의 한마디
[[나의 이름]님과 [상대 이름]의 평화로운 공존을 위한 최종 메시지]
`;

export const CELTIC_CROSS_TEMPLATE = `
### 👑 [나의 이름]님을 위한 켈틱 크로스 프리미엄 리포트
**질문: [질문 내용]**

[카드1 ~ 카드10 명칭 나열]

[[나의 이름]님이 현재 직면한 거대한 흐름과 운명의 총평 (4-5줄)]

### 📍 1. 현재와 장애물 (The Present & Challenge)
- **현재 상황**: [카드1] - [지금 처한 핵심 상황 분석]
- **방해 요소**: [카드2] - [나를 가로막는 구체적인 장애물이나 변수]

### 🧠 2. 의식과 무의식 (Mind & Soul)
- **목표와 의식**: [카드3] - [내가 머리로 생각하는 목표와 계획]
- **잠재의식**: [카드4] - [나도 모르게 느끼는 불안이나 진심]

### 🕰 3. 시간의 흐름 (The Timeline)
- **과거의 영향**: [카드5] - [지금의 상황을 만든 과거의 결정적 사건]
- **가까운 미래**: [카드6] - [조만간 나타날 구체적인 변화의 조짐]

### 🔍 4. 심층 분석 (Deep Insight)
- **나의 태도**: [카드7] - [이 상황을 대하는 나의 솔직한 모습]
- **주변 환경**: [카드8] - [회사, 동료, 상사 등 외부의 영향력]
- **희망과 공포**: [카드9] - [내가 기대하거나 두려워하는 지점]

### 🏁 5. 최종 결과와 생존 전략 (Outcome & Strategy)
- **최종 결론**: [카드10] - [이 흐름의 끝에 기다리는 현실적인 결과]
- **핵심 전략**: [이 결과를 내 편으로 만들기 위한 마스터 플랜]

#### 한 줄 정리
→ [[나의 이름]님의 운명을 관통하는 핵심 문장]

### 💬 리더의 심층 조언
[10장의 카드를 종합하여 드리는 진심 어린 격려와 전략적 제언]
`;

export const COMPARISON_TEMPLATE = `
### ⚖️ [나의 이름]을 위한 회사 비교 분석 리포트
**질문: [질문 내용]**

### 🏢 [A 회사] (Set 1)
[카드1, 카드2, 카드3]

- **현재 상황 및 분위기**: [카드1] - [[A 회사]의 현재 상태와 내부 분위기 분석]
- **기대할 수 있는 성과**: [카드2] - [[A 회사]에서 얻을 수 있는 구체적인 보상이나 성장]
- **주의해야 할 점**: [카드3] - [[A 회사]에서 겪을 수 있는 어려움이나 리스크]

### 🏢 [B 회사] (Set 2)
[카드4, 카드5, 카드6]

- **현재 상황 및 분위기**: [카드4] - [[B 회사]의 현재 상태와 내부 분위기 분석]
- **기대할 수 있는 성과**: [카드5] - [[B 회사]에서 얻을 수 있는 구체적인 보상이나 성장]
- **주의해야 할 점**: [카드6] - [[B 회사]에서 겪을 수 있는 어려움이나 리스크]

### ⚡️ 최종 비교 및 추천
[[A 회사]와 [B 회사]의 결정적인 차이점 분석]
[이직/선택 시 더 유리한 곳은 어디인지 추천]

#### 한 줄 정리
→ [[나의 이름]에게 더 유리한 선택과 그 이유 한 문장]

### 💬 리더의 한마디
[[나의 이름]이 어떤 선택을 하든 후회하지 않기 위한 최종 조언]
`;

/**
 * @param {{ name: string, englishName: string }[]} cards
 * @param {string} [nickname]
 * @param {string} [questionText]
 * @param {string} [colleagueName]
 */
export function buildTarotUserPrompt(
  cards,
  nickname = "익명의 직장인",
  questionText = "오늘의 전반적인 운세",
  colleagueName
) {
  const isGeneral = questionText === "오늘의 전반적인 운세";
  const isQuick = cards.length === 1;
  const isCompatibility = cards.length === 6;
  const isCeltic = cards.length === 10;
  const isLunch = questionText.includes("점심");
  const isComparison = questionText.includes("회사 비교");

  let template = isGeneral ? GENERAL_TEMPLATE : DETAILED_TEMPLATE;
  if (isQuick) {
    template = isLunch ? LUNCH_TEMPLATE : QUICK_TEMPLATE;
  } else if (isComparison) {
    template = COMPARISON_TEMPLATE.replaceAll("[나의 이름]", "익명의 직장인")
      .replaceAll("[A 회사]", nickname)
      .replaceAll("[B 회사]", colleagueName || "B 회사")
      .replaceAll("[질문 내용]", questionText);
  } else if (isCompatibility) {
    template = COMPATIBILITY_TEMPLATE.replaceAll("[나의 이름]", nickname).replaceAll(
      "[상대 이름]",
      colleagueName || "상대방"
    );
  } else if (isCeltic) {
    template = CELTIC_CROSS_TEMPLATE.replaceAll(
      "[나의 이름]",
      nickname
    ).replaceAll("[질문 내용]", questionText);
  }

  const cardInfo = cards
    .map((card, index) => {
      let prefix = "";
      if (isComparison) {
        prefix =
          index < 3
            ? `[Set 1: ${nickname}를 다닌다면?] `
            : `[Set 2: ${colleagueName || "B 회사"}을 다닌다면?] `;
      } else if (isCompatibility) {
        prefix =
          index < 3
            ? `[Set 1: ${colleagueName || "상대방"}이 보는 ${nickname}] `
            : `[Set 2: ${nickname}이 보는 ${colleagueName || "상대방"}] `;
      }
      return `${prefix}카드 ${index + 1}: ${card.name} (${card.englishName})`;
    })
    .join("\n");

  const userNickname = isComparison ? "익명의 직장인" : nickname;
  return `사용자 닉네임: ${userNickname}\n질문 내용: ${questionText}\n제시된 카드:\n${cardInfo}\n\n위 카드를 바탕으로 다음 템플릿에 맞춰 해석해줘. ${isComparison ? "두 회사를 객관적으로 비교해주고" : "닉네임을 적절히 섞어서 친근하게 말해줘"}:\n${template}`;
}

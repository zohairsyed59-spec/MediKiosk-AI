import type { HistoryResponse, DocumentRecord, Session, Patient, SessionMode } from '@/types';

interface SummaryData {
  chief_complaint: string;
  hpi: string;
  past_medical_history: string;
  drug_allergy_history: string;
  family_history: string;
  personal_history: string;
  review_of_systems: string;
  prior_investigations: string;
  ayush_assessment: string;
  full_summary: string;
}

const valueLabels: Record<string, string> = {
  // Chief complaint
  fever: 'Fever', chest_pain: 'Chest pain', breathlessness: 'Breathlessness',
  headache: 'Headache', abdominal_pain: 'Abdominal pain', cough: 'Cough',
  joint_pain: 'Joint pain', skin_problem: 'Skin problem', other: 'Other complaint',
  // Duration
  less_than_day: 'less than a day', '1_3_days': '1-3 days', '4_7_days': '4-7 days',
  '1_2_weeks': '1-2 weeks', more_2_weeks: 'more than 2 weeks', more_month: 'more than a month',
  // Severity
  '1': 'mild (1-2/10)', '3': 'moderate (3-4/10)', '5': 'significant (5-6/10)',
  '7': 'severe (7-8/10)', '9': 'very severe (9-10/10)',
  // Onset
  sudden: 'sudden onset', gradual: 'gradual onset', injury: 'started after an injury',
  after_food: 'started after eating', unsure: 'unclear onset',
  // Character
  sharp: 'sharp/stabbing', dull: 'dull/aching', burning: 'burning',
  throbbing: 'throbbing', cramping: 'cramping', constant: 'constant',
  intermittent: 'comes and goes',
  // Radiation
  no_radiation: 'localized without radiation', chest: 'radiates to chest',
  back: 'radiates to back', arms: 'radiates to arms', legs: 'radiates to legs',
  jaw_neck: 'radiates to jaw/neck',
  // Aggravating
  movement: 'movement', rest: 'rest', eating: 'eating', lying_down: 'lying down',
  exertion: 'physical exertion', stress: 'stress', nothing: 'nothing specific',
  // Relieving
  position: 'position change', temperature: 'cold/heat application', medication: 'medication',
  // Associated
  nausea: 'nausea/vomiting', dizziness: 'dizziness', sweating: 'sweating',
  loss_appetite: 'loss of appetite', weight_loss: 'weight loss', fatigue: 'fatigue',
  none: 'none',
  // Past history
  diabetes: 'diabetes', hypertension: 'hypertension', heart_disease: 'heart disease',
  asthma: 'asthma', thyroid: 'thyroid disorder', kidney: 'kidney disease',
  liver: 'liver disease', cancer: 'cancer',
  minor: 'minor surgery', major: 'major surgery', multiple: 'multiple surgeries',
  no: 'no', once: 'once',
  // Medications
  bp_meds: 'blood pressure medication', diabetes_meds: 'diabetes medication',
  heart_meds: 'heart medication', painkillers: 'painkillers', other_meds: 'other medication',
  // Allergies
  drug_allergy: 'drug allergy', food_allergy: 'environmental allergies', environmental: 'environmental allergies',
  // Personal
  never: 'never', current: 'current smoker', former: 'former smoker', chew: 'chews tobacco',
  occasional: 'occasional', regular: 'regular',
  wage: 'daily wage worker', farmer: 'farmer', office: 'office worker',
  homemaker: 'homemaker', student: 'student', retired: 'retired',
  // ROS
  palpitations: 'palpitations', leg_swelling: 'leg swelling', sob: 'shortness of breath',
  cough_sputum: 'cough with sputum', hemoptysis: 'hemoptysis', wheezing: 'wheezing',
  vomiting: 'vomiting', diarrhea: 'diarrhea', constipation: 'constipation',
  blood_stool: 'blood in stool', syncope: 'fainting', vision: 'vision changes',
  weakness: 'limb weakness', speech: 'difficulty speaking', night_sweats: 'night sweats',
  // AYUSH specific
  digestive: 'digestive issues', respiratory: 'respiratory issues', sleep: 'sleep problems',
  stress_ayush: 'stress/mental health', weakness_ayush: 'general weakness',
  irregular_eating: 'irregular eating times', spicy: 'excess spicy food', cold_food: 'excess cold food/drinks',
  overeating: 'overeating', fasting: 'fasting/skipping meals', allergy: 'food allergies/intolerance',
  unsure_ayush: 'unclear', lack_sleep: 'lack of sleep', excess_work: 'excessive physical work',
  sedentary: 'sedentary lifestyle', travel: 'travel', weather: 'weather/season change',
  vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha',
  vishama: 'irregular (Vishama Agni)', tikshna: 'strong (Tikshna Agni)',
  manda: 'slow (Manda Agni)', sama: 'balanced (Sama Agni)',
  ruksha: 'dry/hard (Ruksha Koshtha)', mrudu: 'loose/soft (Mrudu Koshtha)',
  madhya: 'regular (Madhya Koshtha)',
  daily: 'daily', alternate: 'every other day', infrequent: 'infrequent (every 3+ days)',
  vegetarian: 'vegetarian', non_veg: 'non-vegetarian', eggetarian: 'eggetarian', vegan: 'vegan',
  regular_meal: 'regular', mostly_regular: 'mostly regular', irregular: 'irregular', skip: 'often skips meals',
  less_1l: 'less than 1 liter', '1_2l': '1-2 liters', '2_3l': '2-3 liters', more_3l: 'more than 3 liters',
  good: 'good, feels rested', average: 'average', poor: 'poor, feels tired', insomnia: 'insomnia',
  snigdha: 'warm/moist/oily foods', sheeta: 'cooling/sweet foods', ruksha_food: 'light/dry/warm foods',
  sarva: 'all types suit', pravara: 'high', madhya_sattva: 'medium', avara: 'low',
  less_week: 'less than a week', '1_4_weeks': '1-4 weeks', '1_3_months': '1-3 months',
  '3_6_months': '3-6 months', more_6_months: 'more than 6 months', years: 'years',
};

function labelValue(value: string): string {
  if (!value) return '';
  const parts = value.split(', ');
  return parts.map((p) => valueLabels[p] || p.replace(/_/g, ' ')).join(', ');
}

function getSectionAnswers(responses: HistoryResponse[], section: string): HistoryResponse[] {
  return responses.filter((r) => r.section === section);
}

function buildSectionText(responses: HistoryResponse[], section: string): string {
  const sectionResponses = getSectionAnswers(responses, section);
  if (sectionResponses.length === 0) return 'Not reported';
  return sectionResponses
    .map((r) => {
      const answer = r.answer ? labelValue(r.answer) : 'Not answered';
      return `${r.question_text} ${answer}.`;
    })
    .join(' ');
}

function buildDocumentsText(documents: DocumentRecord[]): string {
  if (documents.length === 0) return 'No documents uploaded.';
  return documents
    .sort((a, b) => a.upload_order - b.upload_order)
    .map((d, i) => `Document ${i + 1}: ${d.filename} (Type: ${d.doc_type.replace('_', ' ')})`)
    .join('; ');
}

function buildAyushAssessment(responses: HistoryResponse[]): string {
  const prakritiResponses = getSectionAnswers(responses, 'prakriti');
  const prakritiValues = prakritiResponses.map((r) => r.answer).filter(Boolean);

  let dominantDosha = 'Unknown';
  if (prakritiValues.length > 0) {
    const counts: Record<string, number> = {};
    prakritiValues.forEach((v) => {
      if (v) {
        v.split(', ').forEach((p) => {
          counts[p] = (counts[p] || 0) + 1;
        });
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) dominantDosha = labelValue(sorted[0][0]);
  }

  const agniText = buildSectionText(responses, 'agni_koshta');
  const aharaText = buildSectionText(responses, 'ahara_vihara');
  const nidanaText = buildSectionText(responses, 'nidana');
  const satmyaText = buildSectionText(responses, 'satmya_sattva');

  return `Prakriti Assessment: Likely ${dominantDosha} predominant constitution. Nidana: ${nidanaText} Agni & Koshtha: ${agniText} Ahara-Vihara: ${aharaText} Satmya & Sattva: ${satmyaText}`;
}

export function generateSummary(
  responses: HistoryResponse[],
  documents: DocumentRecord[],
  session: Session,
  patient: Patient,
): SummaryData {
  const mode: SessionMode = session.mode;

  if (mode === 'ayush') {
    const chiefComplaint = buildSectionText(responses, 'chief_complaint');
    const nidana = buildSectionText(responses, 'nidana');
    const prakriti = buildSectionText(responses, 'prakriti');
    const agniKoshta = buildSectionText(responses, 'agni_koshta');
    const aharaVihara = buildSectionText(responses, 'ahara_vihara');
    const satmyaSattva = buildSectionText(responses, 'satmya_sattva');
    const ayushAssessment = buildAyushAssessment(responses);
    const docsText = buildDocumentsText(documents);

    const fullSummary = `PATIENT: ${patient.name}, ${patient.age}y, ${patient.gender}. ABHA: ${patient.abha_id || 'Not provided'}. Mode: Ayurvedic (AYUSH).\n\nCHIEF COMPLAINT: ${chiefComplaint}\n\nNIDANA (CAUSATIVE FACTORS): ${nidana}\n\nPRAKRITI (CONSTITUTION): ${prakriti}\n\nAGNI & KOSHTA: ${agniKoshta}\n\nAHARA-VIHARA (DIET & LIFESTYLE): ${aharaVihara}\n\nSATMYA & SATTVA: ${satmyaSattva}\n\nPRIOR DOCUMENTS: ${docsText}`;

    return {
      chief_complaint: chiefComplaint,
      hpi: nidana,
      past_medical_history: 'N/A (AYUSH mode)',
      drug_allergy_history: 'See medications in Ahara-Vihara section',
      family_history: 'Not assessed in AYUSH mode',
      personal_history: aharaVihara,
      review_of_systems: 'Not assessed in AYUSH mode',
      prior_investigations: docsText,
      ayush_assessment: ayushAssessment,
      full_summary: fullSummary,
    };
  }

  const chiefComplaint = buildSectionText(responses, 'chief_complaint');
  const hpi = buildSectionText(responses, 'hpi');
  const pastHistory = buildSectionText(responses, 'past_history');
  const drugAllergy = buildSectionText(responses, 'drug_allergy');
  const familyHistory = buildSectionText(responses, 'family_history');
  const personalHistory = buildSectionText(responses, 'personal_history');
  const ros = buildSectionText(responses, 'ros');
  const docsText = buildDocumentsText(documents);

  const fullSummary = `PATIENT: ${patient.name}, ${patient.age}y, ${patient.gender}. ABHA: ${patient.abha_id || 'Not provided'}. Mode: Allopathic.\n\nCHIEF COMPLAINT: ${chiefComplaint}\n\nHPI: ${hpi}\n\nPAST MEDICAL/SURGICAL HISTORY: ${pastHistory}\n\nDRUG & ALLERGY HISTORY: ${drugAllergy}\n\nFAMILY HISTORY: ${familyHistory}\n\nPERSONAL HISTORY: ${personalHistory}\n\nREVIEW OF SYSTEMS: ${ros}\n\nPRIOR INVESTIGATIONS & DOCUMENTS: ${docsText}`;

  return {
    chief_complaint: chiefComplaint,
    hpi: hpi,
    past_medical_history: pastHistory,
    drug_allergy_history: drugAllergy,
    family_history: familyHistory,
    personal_history: personalHistory,
    review_of_systems: ros,
    prior_investigations: docsText,
    ayush_assessment: 'N/A (Allopathic mode)',
    full_summary: fullSummary,
  };
}

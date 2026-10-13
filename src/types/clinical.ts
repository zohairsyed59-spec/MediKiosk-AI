import type { Language, SessionMode } from './index';

export interface QuestionOption {
  label: string;
  value: string;
  icon?: string;
}

export interface ClinicalQuestion {
  key: string;
  section: string;
  question: string;
  type: 'text' | 'choice' | 'multi' | 'number';
  options?: QuestionOption[];
  placeholder?: string;
  required: boolean;
  followUp?: (answer: string) => ClinicalQuestion[] | null;
  redFlagCheck?: (answer: string) => string | null;
}

export interface ClinicalSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: ClinicalQuestion[];
}

export const getAllopathicSections = (): ClinicalSection[] => [
  {
    id: 'chief_complaint',
    title: 'Chief Complaint',
    description: 'What brings you to the hospital today?',
    icon: 'AlertCircle',
    questions: [
      {
        key: 'main_complaint',
        section: 'chief_complaint',
        question: 'What is your main problem or symptom today?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Fever', value: 'fever', icon: 'Thermometer' },
          { label: 'Chest Pain', value: 'chest_pain', icon: 'Heart' },
          { label: 'Breathlessness', value: 'breathlessness', icon: 'Wind' },
          { label: 'Headache', value: 'headache', icon: 'Brain' },
          { label: 'Abdominal Pain', value: 'abdominal_pain', icon: 'Activity' },
          { label: 'Cough', value: 'cough', icon: 'Wind' },
          { label: 'Joint Pain', value: 'joint_pain', icon: 'Bone' },
          { label: 'Skin Problem', value: 'skin_problem', icon: 'Hand' },
          { label: 'Other', value: 'other', icon: 'Circle' },
        ],
        redFlagCheck: (answer) => {
          if (answer === 'chest_pain') return 'Chest pain may indicate a cardiac emergency. Please alert staff immediately.';
          return null;
        },
      },
      {
        key: 'complaint_duration',
        section: 'chief_complaint',
        question: 'How long have you had this problem?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Less than a day', value: 'less_than_day' },
          { label: '1-3 days', value: '1_3_days' },
          { label: '4-7 days', value: '4_7_days' },
          { label: '1-2 weeks', value: '1_2_weeks' },
          { label: 'More than 2 weeks', value: 'more_2_weeks' },
          { label: 'More than a month', value: 'more_month' },
        ],
      },
      {
        key: 'complaint_severity',
        section: 'chief_complaint',
        question: 'How severe is your problem? (1 = mild, 10 = very severe)',
        type: 'choice',
        required: true,
        options: [
          { label: '1-2 (Mild)', value: '1' },
          { label: '3-4 (Moderate)', value: '3' },
          { label: '5-6 (Significant)', value: '5' },
          { label: '7-8 (Severe)', value: '7' },
          { label: '9-10 (Very Severe)', value: '9' },
        ],
      },
    ],
  },
  {
    id: 'hpi',
    title: 'History of Present Illness',
    description: 'Detailed description of your current problem',
    icon: 'FileText',
    questions: [
      {
        key: 'onset',
        section: 'hpi',
        question: 'How did the problem start?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Sudden', value: 'sudden' },
          { label: 'Gradual', value: 'gradual' },
          { label: 'After an injury', value: 'injury' },
          { label: 'After eating something', value: 'after_food' },
          { label: 'Not sure', value: 'unsure' },
        ],
      },
      {
        key: 'character',
        section: 'hpi',
        question: 'How would you describe the sensation?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Sharp/Stabbing', value: 'sharp' },
          { label: 'Dull/Aching', value: 'dull' },
          { label: 'Burning', value: 'burning' },
          { label: 'Throbbing', value: 'throbbing' },
          { label: 'Cramping', value: 'cramping' },
          { label: 'Constant', value: 'constant' },
          { label: 'Comes and goes', value: 'intermittent' },
        ],
      },
      {
        key: 'radiation',
        section: 'hpi',
        question: 'Does the problem spread to any other part of your body?',
        type: 'choice',
        required: false,
        options: [
          { label: 'No, stays in one place', value: 'no_radiation' },
          { label: 'Yes, spreads to chest', value: 'chest' },
          { label: 'Yes, spreads to back', value: 'back' },
          { label: 'Yes, spreads to arms', value: 'arms' },
          { label: 'Yes, spreads to legs', value: 'legs' },
          { label: 'Yes, spreads to jaw/neck', value: 'jaw_neck' },
        ],
      },
      {
        key: 'aggravating_factors',
        section: 'hpi',
        question: 'What makes your problem worse?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Movement', value: 'movement' },
          { label: 'Rest', value: 'rest' },
          { label: 'Eating', value: 'eating' },
          { label: 'Lying down', value: 'lying_down' },
          { label: 'Physical exertion', value: 'exertion' },
          { label: 'Stress', value: 'stress' },
          { label: 'Nothing specific', value: 'nothing' },
        ],
      },
      {
        key: 'relieving_factors',
        section: 'hpi',
        question: 'What makes your problem better?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Rest', value: 'rest' },
          { label: 'Medication', value: 'medication' },
          { label: 'Eating', value: 'eating' },
          { label: 'Position change', value: 'position' },
          { label: 'Cold/heat application', value: 'temperature' },
          { label: 'Nothing helps', value: 'nothing' },
        ],
      },
      {
        key: 'associated_symptoms',
        section: 'hpi',
        question: 'Do you have any of these along with your main problem?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Nausea/Vomiting', value: 'nausea' },
          { label: 'Dizziness', value: 'dizziness' },
          { label: 'Sweating', value: 'sweating' },
          { label: 'Loss of appetite', value: 'loss_appetite' },
          { label: 'Weight loss', value: 'weight_loss' },
          { label: 'Fatigue', value: 'fatigue' },
          { label: 'None of these', value: 'none' },
        ],
        redFlagCheck: (answer) => {
          if (answer.includes('dizziness') && answer.includes('sweating')) {
            return 'Dizziness with sweating may indicate a serious condition. Please alert staff.';
          }
          return null;
        },
      },
    ],
  },
  {
    id: 'past_history',
    title: 'Past Medical History',
    description: 'Your previous illnesses and surgeries',
    icon: 'History',
    questions: [
      {
        key: 'chronic_conditions',
        section: 'past_history',
        question: 'Do you have any long-term illnesses?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Diabetes', value: 'diabetes' },
          { label: 'High Blood Pressure', value: 'hypertension' },
          { label: 'Heart Disease', value: 'heart_disease' },
          { label: 'Asthma', value: 'asthma' },
          { label: 'Thyroid Problem', value: 'thyroid' },
          { label: 'Kidney Disease', value: 'kidney' },
          { label: 'Liver Disease', value: 'liver' },
          { label: 'Cancer', value: 'cancer' },
          { label: 'None', value: 'none' },
        ],
      },
      {
        key: 'previous_surgery',
        section: 'past_history',
        question: 'Have you had any surgeries in the past?',
        type: 'choice',
        required: false,
        options: [
          { label: 'No surgeries', value: 'none' },
          { label: 'Yes, minor surgery', value: 'minor' },
          { label: 'Yes, major surgery', value: 'major' },
          { label: 'Multiple surgeries', value: 'multiple' },
        ],
      },
      {
        key: 'hospitalization',
        section: 'past_history',
        question: 'Have you been hospitalized in the last year?',
        type: 'choice',
        required: false,
        options: [
          { label: 'No', value: 'no' },
          { label: 'Yes, once', value: 'once' },
          { label: 'Yes, multiple times', value: 'multiple' },
        ],
      },
    ],
  },
  {
    id: 'drug_allergy',
    title: 'Drug & Allergy History',
    description: 'Medications you take and allergies you have',
    icon: 'Pill',
    questions: [
      {
        key: 'current_medications',
        section: 'drug_allergy',
        question: 'Are you currently taking any medicines?',
        type: 'choice',
        required: true,
        options: [
          { label: 'No medicines', value: 'none' },
          { label: 'Yes, for blood pressure', value: 'bp_meds' },
          { label: 'Yes, for diabetes', value: 'diabetes_meds' },
          { label: 'Yes, for heart', value: 'heart_meds' },
          { label: 'Yes, painkillers', value: 'painkillers' },
          { label: 'Yes, other medicines', value: 'other_meds' },
        ],
      },
      {
        key: 'allergies',
        section: 'drug_allergy',
        question: 'Are you allergic to any medicine or food?',
        type: 'choice',
        required: true,
        options: [
          { label: 'No known allergies', value: 'none' },
          { label: 'Yes, to medicines', value: 'drug_allergy' },
          { label: 'Yes, to food', value: 'food_allergy' },
          { label: 'Yes, to dust/pollen', value: 'environmental' },
          { label: 'Yes, multiple allergies', value: 'multiple' },
        ],
      },
    ],
  },
  {
    id: 'family_history',
    title: 'Family History',
    description: 'Illnesses that run in your family',
    icon: 'Users',
    questions: [
      {
        key: 'family_illnesses',
        section: 'family_history',
        question: 'Does anyone in your family have these illnesses?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Diabetes', value: 'diabetes' },
          { label: 'High Blood Pressure', value: 'hypertension' },
          { label: 'Heart Disease', value: 'heart_disease' },
          { label: 'Cancer', value: 'cancer' },
          { label: 'Asthma/Allergies', value: 'asthma' },
          { label: 'Mental Health', value: 'mental_health' },
          { label: 'No known family history', value: 'none' },
        ],
      },
    ],
  },
  {
    id: 'personal_history',
    title: 'Personal History',
    description: 'Lifestyle and personal habits',
    icon: 'User',
    questions: [
      {
        key: 'smoking',
        section: 'personal_history',
        question: 'Do you smoke or use tobacco?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Never', value: 'never' },
          { label: 'Currently smoke', value: 'current' },
          { label: 'Former smoker', value: 'former' },
          { label: 'Chew tobacco', value: 'chew' },
        ],
      },
      {
        key: 'alcohol',
        section: 'personal_history',
        question: 'Do you consume alcohol?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Never', value: 'never' },
          { label: 'Occasionally', value: 'occasional' },
          { label: 'Regularly', value: 'regular' },
          { label: 'Former drinker', value: 'former' },
        ],
      },
      {
        key: 'occupation',
        section: 'personal_history',
        question: 'What is your occupation?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Daily wage worker', value: 'wage' },
          { label: 'Farmer', value: 'farmer' },
          { label: 'Office worker', value: 'office' },
          { label: 'Homemaker', value: 'homemaker' },
          { label: 'Student', value: 'student' },
          { label: 'Retired', value: 'retired' },
          { label: 'Other', value: 'other' },
        ],
      },
    ],
  },
  {
    id: 'ros',
    title: 'Review of Systems',
    description: 'Quick check of all body systems',
    icon: 'ListChecks',
    questions: [
      {
        key: 'ros_general',
        section: 'ros',
        question: 'Have you noticed any of these recently?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Fever', value: 'fever' },
          { label: 'Unintended weight loss', value: 'weight_loss' },
          { label: 'Loss of appetite', value: 'loss_appetite' },
          { label: 'Night sweats', value: 'night_sweats' },
          { label: 'Severe fatigue', value: 'fatigue' },
          { label: 'None of these', value: 'none' },
        ],
      },
      {
        key: 'ros_cv',
        section: 'ros',
        question: 'Any heart or circulation-related symptoms?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Chest pain', value: 'chest_pain' },
          { label: 'Palpitations', value: 'palpitations' },
          { label: 'Swelling in legs', value: 'leg_swelling' },
          { label: 'None', value: 'none' },
        ],
        redFlagCheck: (answer) => {
          if (answer.includes('chest_pain')) return 'Chest pain in review of systems - cardiac emergency flag triggered.';
          return null;
        },
      },
      {
        key: 'ros_resp',
        section: 'ros',
        question: 'Any breathing or lung-related symptoms?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Shortness of breath', value: 'sob' },
          { label: 'Cough with sputum', value: 'cough_sputum' },
          { label: 'Coughing blood', value: 'hemoptysis' },
          { label: 'Wheezing', value: 'wheezing' },
          { label: 'None', value: 'none' },
        ],
        redFlagCheck: (answer) => {
          if (answer.includes('hemoptysis')) return 'Coughing blood (hemoptysis) is a red flag. Alert staff immediately.';
          return null;
        },
      },
      {
        key: 'ros_gi',
        section: 'ros',
        question: 'Any stomach or digestive symptoms?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Abdominal pain', value: 'abdominal_pain' },
          { label: 'Vomiting', value: 'vomiting' },
          { label: 'Diarrhea', value: 'diarrhea' },
          { label: 'Constipation', value: 'constipation' },
          { label: 'Blood in stool', value: 'blood_stool' },
          { label: 'None', value: 'none' },
        ],
        redFlagCheck: (answer) => {
          if (answer.includes('blood_stool')) return 'Blood in stool detected. Requires urgent evaluation.';
          return null;
        },
      },
      {
        key: 'ros_cns',
        section: 'ros',
        question: 'Any brain or nerve-related symptoms?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Frequent headaches', value: 'headache' },
          { label: 'Fainting', value: 'syncope' },
          { label: 'Vision changes', value: 'vision' },
          { label: 'Weakness in limbs', value: 'weakness' },
          { label: 'Difficulty speaking', value: 'speech' },
          { label: 'None', value: 'none' },
        ],
        redFlagCheck: (answer) => {
          if (answer.includes('weakness') && answer.includes('speech')) {
            return 'Weakness with speech difficulty may indicate stroke. EMERGENCY - alert staff immediately.';
          }
          return null;
        },
      },
    ],
  },
];

export const getAyushSections = (): ClinicalSection[] => [
  {
    id: 'chief_complaint',
    title: 'Chief Complaint (Mukhya Roga)',
    description: 'What brings you to the Ayurvedic OPD today?',
    icon: 'AlertCircle',
    questions: [
      {
        key: 'main_complaint',
        section: 'chief_complaint',
        question: 'What is your main health concern today?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Digestive issues', value: 'digestive', icon: 'Activity' },
          { label: 'Joint/Muscle pain', value: 'joint_pain', icon: 'Bone' },
          { label: 'Skin problems', value: 'skin', icon: 'Hand' },
          { label: 'Respiratory issues', value: 'respiratory', icon: 'Wind' },
          { label: 'Sleep problems', value: 'sleep', icon: 'Moon' },
          { label: 'Stress/Mental health', value: 'stress_ayush', icon: 'Brain' },
          { label: 'General weakness', value: 'weakness', icon: 'Battery' },
          { label: 'Other', value: 'other', icon: 'Circle' },
        ],
      },
      {
        key: 'complaint_duration',
        section: 'chief_complaint',
        question: 'How long have you had this problem?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Less than a week', value: 'less_week' },
          { label: '1-4 weeks', value: '1_4_weeks' },
          { label: '1-3 months', value: '1_3_months' },
          { label: '3-6 months', value: '3_6_months' },
          { label: 'More than 6 months', value: 'more_6_months' },
          { label: 'Years', value: 'years' },
        ],
      },
    ],
  },
  {
    id: 'nidana',
    title: 'Nidana (Causative Factors)',
    description: 'What do you think caused or triggered your problem?',
    icon: 'Search',
    questions: [
      {
        key: 'dietary_causes',
        section: 'nidana',
        question: 'Do you think any dietary habit caused your problem?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Irregular eating times', value: 'irregular_eating' },
          { label: 'Excess spicy food', value: 'spicy' },
          { label: 'Excess cold food/drinks', value: 'cold_food' },
          { label: 'Overeating', value: 'overeating' },
          { label: 'Fasting/skipping meals', value: 'fasting' },
          { label: 'Food allergies/intolerance', value: 'allergy' },
          { label: 'Not sure', value: 'unsure_ayush' },
        ],
      },
      {
        key: 'lifestyle_causes',
        section: 'nidana',
        question: 'Any lifestyle factors you think contributed?',
        type: 'multi',
        required: false,
        options: [
          { label: 'Lack of sleep', value: 'lack_sleep' },
          { label: 'Excessive physical work', value: 'excess_work' },
          { label: 'Sedentary lifestyle', value: 'sedentary' },
          { label: 'Mental stress/worry', value: 'stress_ayush' },
          { label: 'Travel', value: 'travel' },
          { label: 'Weather/season change', value: 'weather' },
          { label: 'Not sure', value: 'unsure_ayush' },
        ],
      },
    ],
  },
  {
    id: 'prakriti',
    title: 'Prakriti Assessment (Constitution)',
    description: 'Understanding your body constitution',
    icon: 'Sparkles',
    questions: [
      {
        key: 'body_frame',
        section: 'prakriti',
        question: 'How would you describe your body frame?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Thin, lean, difficulty gaining weight', value: 'vata' },
          { label: 'Medium, muscular, moderate build', value: 'pitta' },
          { label: 'Broad, solid, gain weight easily', value: 'kapha' },
        ],
      },
      {
        key: 'skin_type',
        section: 'prakriti',
        question: 'How is your skin?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Dry, rough, cracks easily', value: 'vata' },
          { label: 'Warm, reddish, freckles/moles', value: 'pitta' },
          { label: 'Oily, smooth, thick, cool', value: 'kapha' },
        ],
      },
      {
        key: 'appetite_type',
        section: 'prakriti',
        question: 'How is your appetite?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Irregular, varies day to day', value: 'vata' },
          { label: 'Strong, cannot skip meals, get irritable', value: 'pitta' },
          { label: 'Steady but can skip meals easily', value: 'kapha' },
        ],
      },
      {
        key: 'sleep_pattern',
        section: 'prakriti',
        question: 'How is your sleep?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Light, interrupted, vivid dreams', value: 'vata' },
          { label: 'Moderate, intense dreams', value: 'pitta' },
          { label: 'Deep, long, hard to wake up', value: 'kapha' },
        ],
      },
      {
        key: 'temperament',
        section: 'prakriti',
        question: 'How would you describe your temperament?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Active, creative, anxious', value: 'vata' },
          { label: 'Focused, ambitious, irritable', value: 'pitta' },
          { label: 'Calm, steady, attached', value: 'kapha' },
        ],
      },
    ],
  },
  {
    id: 'agni_koshta',
    title: 'Agni & Koshtha (Digestion & Bowels)',
    description: 'Assessment of digestive fire and bowel habits',
    icon: 'Flame',
    questions: [
      {
        key: 'agni_status',
        section: 'agni_koshta',
        question: 'How is your digestion?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Irregular (gas, bloating, varies)', value: 'vishama' },
          { label: 'Strong (sharp hunger, burns if delayed)', value: 'tikshna' },
          { label: 'Slow (heavy after meals, low hunger)', value: 'manda' },
          { label: 'Balanced (regular, comfortable)', value: 'sama' },
        ],
      },
      {
        key: 'koshhta_type',
        section: 'agni_koshta',
        question: 'How are your bowel movements?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Dry, hard, constipated', value: 'ruksha' },
          { label: 'Loose, frequent, soft', value: 'mrudu' },
          { label: 'Regular, well-formed', value: 'madhya' },
        ],
      },
      {
        key: 'bowel_frequency',
        section: 'agni_koshta',
        question: 'How often do you have bowel movements?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Once daily, regular', value: 'daily' },
          { label: 'Every other day', value: 'alternate' },
          { label: 'Less frequent (every 3+ days)', value: 'infrequent' },
          { label: 'Multiple times daily', value: 'multiple' },
        ],
      },
    ],
  },
  {
    id: 'ahara_vihara',
    title: 'Ahara-Vihara (Diet & Lifestyle)',
    description: 'Your dietary and lifestyle patterns',
    icon: 'Salad',
    questions: [
      {
        key: 'diet_type',
        section: 'ahara_vihara',
        question: 'What type of diet do you follow?',
        type: 'choice',
        required: true,
        options: [
          { label: 'Vegetarian', value: 'vegetarian' },
          { label: 'Non-vegetarian', value: 'non_veg' },
          { label: 'Eggetarian', value: 'eggetarian' },
          { label: 'Vegan', value: 'vegan' },
        ],
      },
      {
        key: 'meal_timing',
        section: 'ahara_vihara',
        question: 'How regular are your meal times?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Very regular, fixed times', value: 'regular' },
          { label: 'Mostly regular', value: 'mostly_regular' },
          { label: 'Irregular, varies daily', value: 'irregular' },
          { label: 'Often skip meals', value: 'skip' },
        ],
      },
      {
        key: 'water_intake',
        section: 'ahara_vihara',
        question: 'How much water do you drink daily?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Less than 1 liter', value: 'less_1l' },
          { label: '1-2 liters', value: '1_2l' },
          { label: '2-3 liters', value: '2_3l' },
          { label: 'More than 3 liters', value: 'more_3l' },
        ],
      },
      {
        key: 'exercise',
        section: 'ahara_vihara',
        question: 'Do you get regular physical activity?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Daily exercise/yoga', value: 'daily' },
          { label: '3-4 times a week', value: 'regular' },
          { label: 'Occasionally', value: 'occasional' },
          { label: 'Rarely/Never', value: 'rarely' },
        ],
      },
      {
        key: 'sleep_quality',
        section: 'ahara_vihara',
        question: 'How is your sleep quality?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Good, feel rested', value: 'good' },
          { label: 'Average', value: 'average' },
          { label: 'Poor, feel tired', value: 'poor' },
          { label: 'Insomnia', value: 'insomnia' },
        ],
      },
    ],
  },
  {
    id: 'satmya_sattva',
    title: 'Satmya & Sattva (Adaptability & Mind)',
    description: 'What suits you and your mental strength',
    icon: 'Heart',
    questions: [
      {
        key: 'satmya',
        section: 'satmya_sattva',
        question: 'What kind of food suits you best?',
        type: 'choice',
        required: false,
        options: [
          { label: 'Warm, moist, oily foods', value: 'snigdha' },
          { label: 'Cooling, sweet foods', value: 'sheeta' },
          { label: 'Light, dry, warm foods', value: 'ruksha' },
          { label: 'All types suit me', value: 'sarva' },
        ],
      },
      {
        key: 'sattva',
        section: 'satmya_sattva',
        question: 'How would you rate your mental resilience?',
        type: 'choice',
        required: false,
        options: [
          { label: 'High - calm under pressure', value: 'pravara' },
          { label: 'Medium - manage with effort', value: 'madhya' },
          { label: 'Low - easily stressed', value: 'avara' },
        ],
      },
    ],
  },
];

export const getSections = (mode: SessionMode): ClinicalSection[] => {
  return mode === 'ayush' ? getAyushSections() : getAllopathicSections();
};

export const sectionIconMap: Record<string, string> = {
  AlertCircle: 'AlertCircle',
  FileText: 'FileText',
  History: 'History',
  Pill: 'Pill',
  Users: 'Users',
  User: 'User',
  ListChecks: 'ListChecks',
  Search: 'Search',
  Sparkles: 'Sparkles',
  Flame: 'Flame',
  Salad: 'Salad',
  Heart: 'Heart',
};

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  kn: 'ಕನ್ನಡ (Kannada)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  ta: '🇮🇳',
  te: '🇮🇳',
  kn: '🇮🇳',
  bn: '🇮🇳',
  mr: '🇮🇳',
  gu: '🇮🇳',
};

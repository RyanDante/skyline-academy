/**
 * Concours sectors and fields, from Skyline's ConcoursInfo.docx (October 2026).
 *
 * Entries with `toConfirm: true` were drafted by the app team where the document said
 * "Do write up for this one" or gave no details. Skyline should verify them; once checked,
 * remove the flag. Edit text here (mock mode / seed) or in the Firestore `concoursSectors` collection.
 */
import type { ConcoursSector } from '@/types/models';

const BIO_CHEM_A_LEVEL = 'GCE A Level: pass in at least 2 subjects, including Biology and Chemistry';
const BAC_C_D = 'OR Baccalauréat of General Secondary Education, series C or D';
const O_LEVEL_5_MATHS_ENG = 'GCE O Level: pass in at least 5 subjects, including Mathematics and English';
const BAC_PROB_C_D = 'OR Baccalauréat and Probatoire of General Secondary Education, series C or D';
const SRN_ROUTE =
  'OR State Registered Nurse (SRN) certificate with GCE O Level in 5 subjects in one sitting, including English Language and Mathematics';
const ANY_2_A_LEVEL = 'GCE A Level: pass in at least 2 subjects (any)';
const O_LEVEL_4 = 'GCE O Level: pass in at least 4 subjects';
const ENGINEERING_REQUIREMENTS = [
  'GCE A Level: pass in at least 2 subjects, including Mathematics and Physics',
  'OR Baccalauréat in a science or technical series',
  'Check the official notice for the exact subjects each programme accepts',
];

export const concoursSectors: ConcoursSector[] = [
  // ─── Health ────────────────────────────────────────────────────────────────
  {
    id: 'health',
    name: 'Health',
    order: 1,
    icon: 'medkit-outline',
    blurb: 'Medicine, nursing, midwifery, lab sciences and more. Some of the most competitive Concours in Cameroon.',
    headline: 'Future doctors, nurses and lab scientists start here. Skyline Academy gets you in.',
    listLabel: 'Fields',
    fields: [
      {
        id: 'medicine',
        name: 'Medicine, Pharmacy and Dentistry',
        summary:
          'Trains doctors, pharmacists and dentists who diagnose, treat and prevent disease. Studies last about 7 years and combine science with hospital internships. One of the most competitive fields in Cameroon.',
        requirements: [BIO_CHEM_A_LEVEL, BAC_C_D],
        schools: [
          'FHS, University of Buea',
          'FMSB, University of Yaoundé I',
          'FMSP, University of Douala',
          'FHS, University of Bamenda',
          'FMSP, University of Dschang',
          'FMSP, University of Garoua',
          'FMSP, University of Ngaoundéré',
        ],
        examWindow: 'September',
        institutionIds: ['fhs-buea', 'fhs-bamenda'],
      },
      {
        id: 'nursing',
        name: 'Nursing',
        summary:
          'Prepares health workers for patient care, childbirth support and medical testing. It is practical and hospital-based, and graduates are in constant demand in public and private facilities.',
        requirements: [BIO_CHEM_A_LEVEL, O_LEVEL_5_MATHS_ENG, BAC_PROB_C_D, SRN_ROUTE],
        schools: ['FHS, University of Buea', 'FHS, University of Bamenda'],
        examWindow: 'September',
        institutionIds: ['fhs-buea', 'fhs-bamenda'],
      },
      {
        id: 'medical-lab',
        name: 'Medical Laboratory Sciences',
        summary:
          'Prepares health workers for laboratory diagnosis, medical research and public health work, in hospitals or public health services. Graduates are in constant demand in public and private facilities.',
        requirements: [BIO_CHEM_A_LEVEL, O_LEVEL_5_MATHS_ENG, BAC_PROB_C_D, SRN_ROUTE],
        schools: ['FHS, University of Buea', 'FHS, University of Bamenda'],
        examWindow: 'September',
        institutionIds: ['fhs-buea', 'fhs-bamenda'],
      },
      {
        id: 'midwifery',
        name: 'Midwifery',
        summary:
          'Trains midwives to care for women through pregnancy, childbirth and the weeks after, and to look after newborns. It is hands-on and hospital-based, and midwives are needed in every region of Cameroon.',
        requirements: [BIO_CHEM_A_LEVEL, O_LEVEL_5_MATHS_ENG, BAC_PROB_C_D],
        schools: ['FHS, University of Buea', 'FHS, University of Bamenda'],
        examWindow: 'September',
        toConfirm: true,
        institutionIds: ['fhs-buea', 'fhs-bamenda'],
      },
      {
        id: 'srn',
        name: 'State Registered Nursing (SRN)',
        summary:
          'A practical, hospital-based programme that trains general nurses. It is a well-established route into nursing careers in public, mission and private health facilities.',
        requirements: [ANY_2_A_LEVEL, O_LEVEL_4, BAC_PROB_C_D],
        schools: [
          'SRN School, Limbe',
          'National Polytechnic University Institute, Bamenda',
          'Catholic Private Nursing School, Shisong',
        ],
        examWindow: null,
        toConfirm: true,
      },
      {
        id: 'public-health',
        name: 'Public Health',
        summary:
          'Trains professionals who protect the health of whole communities: disease surveillance, health promotion, nutrition and running health programmes. Graduates work with hospitals, ministries and NGOs.',
        requirements: [BIO_CHEM_A_LEVEL, BAC_C_D],
        schools: [],
        examWindow: null,
        toConfirm: true,
      },
      {
        id: 'biomedical-sciences',
        name: 'Biomedical Sciences',
        summary:
          'Studies how the human body works and what goes wrong in disease, combining biology, chemistry and laboratory research. A strong base for research, laboratory careers or further medical studies.',
        requirements: [BIO_CHEM_A_LEVEL, BAC_C_D],
        schools: [],
        examWindow: null,
        toConfirm: true,
      },
    ],
  },

  // ─── Engineering (listed by school) ─────────────────────────────────────────
  {
    id: 'engineering',
    name: 'Engineering',
    order: 2,
    icon: 'construct-outline',
    blurb: 'Top engineering faculties and polytechnics: FET, COT, NAHPI, Polytech, IUT and Public Works.',
    headline: "Tomorrow's engineers are trained in these schools. Skyline Academy prepares you to win your seat.",
    listLabel: 'Schools',
    fields: [
      {
        id: 'fet-buea',
        name: 'Faculty of Engineering and Technology (FET), Buea',
        summary:
          "The University of Buea's engineering faculty, training engineers in fields such as civil, electrical and computer engineering in an English-medium programme.",
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['University of Buea'],
        examWindow: null,
        toConfirm: true,
        institutionIds: ['fet-buea'],
      },
      {
        id: 'cot-buea',
        name: 'College of Technology (COT), Buea',
        summary:
          "The University of Buea's college of applied technology, with practical, lab-based programmes in areas such as computer and electrical engineering.",
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['University of Buea'],
        examWindow: null,
        toConfirm: true,
        institutionIds: ['cot-buea'],
      },
      {
        id: 'nahpi-bamenda',
        name: 'National Higher Polytechnic Institute (NAHPI), Bamenda',
        summary:
          "The University of Bamenda's polytechnic, training engineers in fields such as civil, mechanical, electrical and computer engineering.",
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['University of Bamenda'],
        examWindow: null,
        toConfirm: true,
        institutionIds: ['nahpi-bamenda'],
      },
      {
        id: 'polytech',
        name: 'Polytech, Yaoundé and Douala',
        summary:
          "The national advanced schools of engineering, among the most selective engineering Concours in Cameroon. Teaching is mainly in French, so strong French helps.",
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['Polytech Yaoundé', 'Polytech Douala'],
        examWindow: null,
        toConfirm: true,
      },
      {
        id: 'iut',
        name: 'IUT, Douala and Ngaoundéré',
        summary:
          'University Institutes of Technology offering shorter, career-focused technical programmes in fields such as electrical, mechanical and industrial engineering.',
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['IUT Douala', 'IUT Ngaoundéré'],
        examWindow: null,
        toConfirm: true,
      },
      {
        id: 'public-works',
        name: 'Public Works, Buea and Yaoundé',
        summary:
          'Trains engineers and technicians for roads, buildings, bridges and land surveying, the people who build and maintain the country’s infrastructure.',
        requirements: ENGINEERING_REQUIREMENTS,
        schools: ['Public Works, Buea', 'Public Works, Yaoundé'],
        examWindow: null,
        toConfirm: true,
      },
    ],
  },

  // ─── Agriculture ────────────────────────────────────────────────────────────
  {
    id: 'agriculture',
    name: 'Agriculture',
    order: 3,
    icon: 'leaf-outline',
    blurb: 'Agronomy, agro-industry, animal science and veterinary careers that feed the nation.',
    headline: 'Feed the nation and build agribusiness. Skyline Academy gets you into the top faculties.',
    listLabel: 'Fields',
    fields: [
      {
        id: 'agronomy',
        name: 'Agronomy, Agro-industry and Animal Science',
        summary:
          "Covers crop production, food processing and livestock management. It supports Cameroon's farming economy and agribusiness, with fieldwork and lab practice.",
        requirements: [ANY_2_A_LEVEL, O_LEVEL_4, BAC_PROB_C_D],
        schools: [
          'Faculty of Agriculture and Veterinary Medicine (FAVM), Buea',
          'FASA, Dschang',
          'ENSAI, Ngaoundéré',
        ],
        examWindow: 'Jul–Sep',
        institutionIds: ['favm-buea'],
      },
      {
        id: 'veterinary',
        name: 'Veterinary Medicine and Technical Agriculture',
        summary:
          'Trains professionals who care for animal health and support farmers in the field. Programmes are practical, and graduates often work for MINADER or MINEPIA.',
        requirements: [ANY_2_A_LEVEL, O_LEVEL_4, BAC_PROB_C_D],
        schools: ['Faculty of Agriculture and Veterinary Medicine (FAVM), Buea', 'ENSAI, Ngaoundéré'],
        examWindow: 'September',
        institutionIds: ['favm-buea'],
      },
    ],
  },

  // ─── Administration ─────────────────────────────────────────────────────────
  {
    id: 'administration',
    name: 'Administration',
    order: 4,
    icon: 'briefcase-outline',
    blurb: 'ENAM, IRIC and ESSTIC: routes into the civil service, magistracy, diplomacy and media.',
    headline: 'Serve and lead the nation. Skyline Academy prepares you for the toughest Concours.',
    listLabel: 'Fields',
    fields: [
      {
        id: 'enam',
        name: 'ENAM: Administration, Magistracy, Treasury, Taxes, Customs, Planning',
        summary:
          'The main route into senior civil service, judicial and financial careers. Training is paid and tightly regulated, and entry is very competitive.',
        requirements: [
          'Cycle A: Licence (Bachelor’s degree)',
          'Cycle B: Baccalauréat or GCE A Level',
          'Age limit usually 30 or under',
        ],
        schools: ['ENAM, Yaoundé'],
        examWindow: 'Jul–Oct',
      },
      {
        id: 'iric',
        name: 'IRIC: Diplomacy and International Relations',
        summary:
          'Prepares future diplomats and international affairs officers. It covers international law, politics and foreign languages.',
        requirements: ['Licence or Bachelor’s degree'],
        schools: ['IRIC, Yaoundé'],
        examWindow: 'Aug–Oct',
      },
      {
        id: 'esstic',
        name: 'ESSTIC: Communication and Journalism',
        summary:
          'Trains journalists, communication officers and media professionals. It mixes writing, media practice and public communication.',
        requirements: ['Baccalauréat or GCE A Level'],
        schools: ['ESSTIC, Yaoundé'],
        examWindow: 'Jul–Sep',
      },
    ],
  },

  // ─── Teaching ───────────────────────────────────────────────────────────────
  {
    id: 'teaching',
    name: 'Teaching',
    order: 5,
    icon: 'school-outline',
    blurb: 'ENS, ENSET, HTTTC and ENIEG: stable careers shaping the next generation.',
    headline: 'Shape the next generation. Skyline Academy helps you secure your place.',
    listLabel: 'Fields',
    fields: [
      {
        id: 'ens',
        name: 'ENS Yaoundé and ENS Bambili (Secondary Teaching)',
        summary:
          'Trains secondary school teachers in specific subjects, with teaching methods and practice included. Graduates are posted to public schools by the state.',
        requirements: ['First cycle: Baccalauréat or GCE A Level', 'Second cycle: Licence (Bachelor’s degree)'],
        schools: ['ENS, Yaoundé', 'ENS, Bambili'],
        examWindow: 'Jul–Sep',
      },
      {
        id: 'technical-teaching',
        name: 'ENSET Douala and HTTTC Kumba (Technical Teaching)',
        summary:
          'Trains teachers for technical and vocational schools in fields such as electricity, mechanics and construction. It blends technical skills with teaching methods.',
        requirements: ['Baccalauréat or GCE A Level', 'OR technical Probatoire'],
        schools: ['ENSET, Douala', 'HTTTC, Kumba'],
        examWindow: 'Jul–Sep',
        institutionIds: ['enset-douala'],
      },
      {
        id: 'primary-teaching',
        name: 'ENIEG and GTTC (Primary Teaching)',
        summary:
          'Prepares nursery and primary school teachers in about two years. One of the quickest routes to a stable public-service job.',
        requirements: ['GCE O Level, Probatoire or equivalent'],
        schools: ['ENIEG and GTTC centres across the regions'],
        examWindow: 'Jun–Aug',
      },
    ],
  },
];

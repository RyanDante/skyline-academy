import * as Linking from 'expo-linking';

import { config } from '@/lib/config';
import { callable } from '@/lib/firebase';

export interface LeadRequest {
  institutionId: string;
  institutionName: string;
  readinessScore: number;
  weakTopics: string[];
  source: 'readiness' | 'orientation' | 'tutor' | 'sector';
}

const createLead = callable<LeadRequest, { leadId: string }>('createLead');

function whatsappUrl(text: string): string {
  return `https://wa.me/${config.skylineWhatsApp}?text=${encodeURIComponent(text)}`;
}

export const leadsService = {
  /** Records the lead (with readiness data for the advisor) and opens a WhatsApp chat. */
  async talkToSkyline(lead: LeadRequest, studentName: string): Promise<void> {
    if (!config.useMocks) {
      // A lead failing to save must not block the student from reaching an advisor.
      await createLead(lead).catch(() => undefined);
    }
    const weak = lead.weakTopics.length ? ` My weak topics: ${lead.weakTopics.join(', ')}.` : '';
    const text =
      lead.source === 'orientation'
        ? `Hello Skyline, I'm ${studentName}. I'd like to book a career orientation session.`
        : `Hello Skyline, I'm ${studentName}. I'm preparing for ${lead.institutionName} (readiness ${Math.round(
            lead.readinessScore * 100,
          )}%).${weak} I'd like to know about your prep classes.`;
    await Linking.openURL(whatsappUrl(text));
  },

  /** WhatsApp chat with a Skyline admin or tutor about a Concours sector, or one field in it. */
  async askAboutSector(studentName: string, sectorName: string, fieldName?: string): Promise<void> {
    if (!config.useMocks) {
      await createLead({
        institutionId: '',
        institutionName: fieldName ? `${fieldName} (${sectorName})` : sectorName,
        readinessScore: 0,
        weakTopics: [],
        source: 'sector',
      }).catch(() => undefined);
    }
    const topic = fieldName ? `${fieldName} (${sectorName})` : `the ${sectorName} sector`;
    await Linking.openURL(
      whatsappUrl(`Hello Skyline, I'm ${studentName}. I'd like information about the Concours for ${topic}.`),
    );
  },

  async askTeacher(studentName: string, question: string): Promise<void> {
    await Linking.openURL(
      whatsappUrl(`Hello Skyline, I'm ${studentName}. Could a teacher help me with this: ${question}`),
    );
  },

  whatsappUrl,
};

import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, Chip, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { usePaper, useSubject } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { product } from '@/lib/config';
import { formatCFA } from '@/lib/format';
import { normaliseCameroonPhone } from '@/services/auth';
import { paymentsService, type MobileMoneyProvider } from '@/services/payments';
import { profileService } from '@/services/profile';
import { hasPaperAnswers, useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

/** Unlock Skyline's proposed answers for one paper (GCE mockup: 100 XAF each). */
export default function UnlockPaper() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const colors = useThemeColors();
  const paper = usePaper(paperId);
  const subject = useSubject(paper.data?.subjectId);
  const phone = useSessionStore((s) => s.phone);
  const uid = useSessionStore((s) => s.uid);
  const entitlement = useSessionStore((s) => s.entitlement);
  const unlockPaper = useSessionStore((s) => s.unlockPaper);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);
  const notify = useSessionStore((s) => s.notify);
  const requireAccount = useRequireAccount();

  const [provider, setProvider] = useState<MobileMoneyProvider>('mtn');
  const [payer, setPayer] = useState(phone?.replace('+237', '') ?? '');
  const [paying, setPaying] = useState(false);
  const [pending, setPending] = useState(false);

  const price = formatCFA(product.prices.paperAnswers).replace(' CFA', ' FCFA');
  const title = paper.data && subject.data ? `${subject.data.name} ${paper.data.year} · Paper ${paper.data.paperNumber}` : 'Paper';
  const unlocked = paper.data ? hasPaperAnswers(entitlement, paper.data.id, paper.data.subjectId) : false;

  const openAnswers = () => router.replace({ pathname: '/paper/[paperId]', params: { paperId } });

  const pay = async () => {
    if (!requireAccount('pay') || !paper.data) return;
    const payerPhone = normaliseCameroonPhone(payer);
    if (!payerPhone) {
      Alert.alert('Check the number', 'Enter the MTN or Orange number that will pay.');
      return;
    }
    setPaying(true);
    try {
      const res = await paymentsService.checkout({
        productId: 'paper-answers',
        paperId: paper.data.id,
        subjectId: paper.data.subjectId,
        provider,
        payerPhone,
      });
      if (res.status === 'paid') {
        unlockPaper(paper.data.id);
        notify({ kind: 'payment', title: 'Answers unlocked 🎉', body: `${title}: Skyline solutions are ready.`, route: `/paper/${paper.data.id}` });
        openAnswers();
        return;
      }
      if (res.checkoutUrl) await Linking.openURL(res.checkoutUrl);
      if (res.status === 'pending') setPending(true);
      Alert.alert(res.status === 'pending' ? 'Confirm on your phone' : 'Payment not started', res.message);
    } catch {
      Alert.alert('Payment not started', 'Check your connection and try again.');
    } finally {
      setPaying(false);
    }
  };

  /** After confirming on the phone, fetch the updated entitlement from the server. */
  const refresh = async () => {
    if (!uid || !paper.data) return;
    const fresh = await profileService.entitlement(uid).catch(() => null);
    if (fresh) setEntitlement(fresh);
    if (fresh && hasPaperAnswers(fresh, paper.data.id, paper.data.subjectId)) openAnswers();
    else Alert.alert('Not confirmed yet', 'It can take a minute after you enter your PIN. Try again shortly.');
  };

  return (
    <Screen
      topBar={<ScreenHeader title="Unlock answers" modal />}
      footer={
        unlocked ? (
          <Button label="View answers" onPress={openAnswers} />
        ) : pending ? (
          <Button label="I’ve paid · check again" onPress={refresh} />
        ) : (
          <Button label={`Pay ${price} & Unlock`} variant="go" loading={paying} onPress={pay} />
        )
      }
    >
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
            <Ionicons name="lock-open" size={24} color={colors.brandDeep} />
          </View>
          <View className="flex-1">
            <Text variant="h3">{title}</Text>
            <Text variant="small">Proposed Answers · Skyline Solution</Text>
          </View>
        </View>
        <Text variant="body">
          Every question in this paper, worked step by step by Skyline teachers, with how examiners award each mark.
        </Text>
        <Text variant="title" className="text-brand-deep">{price}</Text>
      </Card>

      {!unlocked ? (
        <>
          <Text variant="h3">Pay with</Text>
          <View className="flex-row gap-2">
            <Chip label="MTN MoMo" selected={provider === 'mtn'} onPress={() => setProvider('mtn')} />
            <Chip label="Orange Money" selected={provider === 'orange'} onPress={() => setProvider('orange')} />
          </View>
          <TextField
            label="Number that will pay"
            prefix="+237"
            value={payer}
            onChangeText={setPayer}
            keyboardType="phone-pad"
            hint="You’ll get a prompt on this phone to confirm with your PIN."
          />
          <Card tone="soft" onPress={() => router.push('/paywall')}>
            <Text variant="h3">Studying many papers?</Text>
            <Text variant="small">The Season Pass unlocks every paper’s answers until your GCE.</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

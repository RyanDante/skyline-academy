import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Badge, Button, Chip, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/components/ui';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { cn } from '@/lib/cn';
import { product } from '@/lib/config';
import { formatCFA } from '@/lib/format';
import { normaliseCameroonPhone } from '@/services/auth';
import { paymentsService, type MobileMoneyProvider, type ProductId } from '@/services/payments';
import { useSessionStore } from '@/stores/sessionStore';

const PLANS: { id: ProductId; name: string; price: number; detail: string; featured?: boolean }[] = [
  {
    id: 'season-pass',
    name: 'Season Pass',
    price: product.prices.seasonPass,
    detail: 'All subjects until your GCE: every worked solution and mark point, timed mocks, more Tutor help, Concours readiness and English versions of Concours papers.',
    featured: true,
  },
  {
    id: 'subject-pass',
    name: 'One subject',
    price: product.prices.subjectPass,
    detail: 'Everything in the Season Pass for one subject.',
  },
  {
    id: 'exam-week-pass',
    name: 'Exam week',
    price: product.prices.examWeekPass,
    detail: 'Full access for 7 days. For last-minute revision.',
  },
];

const FREE_FEATURES = ['All past-paper PDFs', 'Paper 1 practice with answers', 'Concours deadlines and eligibility', 'A few Tutor questions a day'];

export default function Paywall() {
  const profile = useSessionStore((s) => s.profile);
  const phone = useSessionStore((s) => s.phone);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);
  const requireAccount = useRequireAccount();

  const [planId, setPlanId] = useState<ProductId>('season-pass');
  const [provider, setProvider] = useState<MobileMoneyProvider>('mtn');
  const [payer, setPayer] = useState(phone?.replace('+237', '') ?? '');
  const [code, setCode] = useState('');
  const [paying, setPaying] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.id === planId)!;

  const pay = async () => {
    if (!requireAccount('pay')) return;
    const payerPhone = normaliseCameroonPhone(payer);
    if (!payerPhone) {
      Alert.alert('Check the number', 'Enter the MTN or Orange number that will pay.');
      return;
    }
    setPaying(true);
    try {
      const res = await paymentsService.checkout({
        productId: planId,
        subjectId: planId === 'subject-pass' ? profile?.subjectIds[0] : undefined,
        provider,
        payerPhone,
      });
      if (res.checkoutUrl) await Linking.openURL(res.checkoutUrl);
      Alert.alert(res.status === 'pending' ? 'Confirm on your phone' : 'Payment not started', res.message);
    } catch {
      Alert.alert('Payment not started', 'Check your connection and try again.');
    } finally {
      setPaying(false);
    }
  };

  const redeem = async () => {
    if (!requireAccount('pay')) return;
    setRedeeming(true);
    setCodeError(null);
    try {
      const entitlement = await paymentsService.redeem(code);
      setEntitlement(entitlement);
      Alert.alert('Season Pass active', 'Everything is unlocked. Good luck with your revision.');
      router.back();
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : 'That code is not valid.');
    } finally {
      setRedeeming(false);
    }
  };

  const askParent = () =>
    void Linking.openURL(
      `https://wa.me/?text=${encodeURIComponent(
        paymentsService.parentPayMessage(profile?.firstName ?? 'your child', plan.name, formatCFA(plan.price)),
      )}`,
    );

  return (
    <Screen
      topBar={<ScreenHeader title="Upgrade" modal />}
      footer={<Button label={`Pay ${formatCFA(plan.price)} with Mobile Money`} variant="go" onPress={pay} loading={paying} />}
    >
      <Text variant="title">Study with everything unlocked</Text>

      <View className="gap-3">
        {PLANS.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: planId === p.id }}
            onPress={() => setPlanId(p.id)}
            className={cn(
              'gap-1 rounded-card border bg-surface p-4',
              planId === p.id ? 'border-2 border-accent' : 'border-line',
            )}
          >
            <View className="flex-row items-center justify-between">
              <Text variant="bodyStrong">{p.name}</Text>
              <Text variant="bodyStrong">{formatCFA(p.price)}</Text>
            </View>
            {p.featured ? <Badge label="Best value" tone="accent" /> : null}
            <Text variant="body" className="text-muted">
              {p.detail}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Pay with" />
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
        hint="It can be a parent's number. They'll get a prompt to confirm."
      />
      <Button label="Ask a parent to pay" variant="ghost" icon="logo-whatsapp" onPress={askParent} />

      <SectionHeader title="Have an access code?" />
      <Text variant="body" className="text-muted">
        Skyline students and partner schools get codes with their enrolment.
      </Text>
      <TextField
        label="Access code"
        value={code}
        onChangeText={(v) => {
          setCode(v.toUpperCase());
          setCodeError(null);
        }}
        autoCapitalize="characters"
        placeholder="SKYLINE-XXXX"
        error={codeError}
      />
      <Button label="Redeem code" variant="secondary" onPress={redeem} loading={redeeming} disabled={code.trim().length < 4} />

      <SectionHeader title="Always free" />
      {FREE_FEATURES.map((f) => (
        <Text key={f} variant="body">
          • {f}
        </Text>
      ))}
    </Screen>
  );
}

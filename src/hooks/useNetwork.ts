import { useNetInfo } from '@react-native-community/netinfo';

/** `isOffline` is only true once NetInfo has confirmed there is no connection. */
export function useNetwork() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isOffline = isConnected === false || isInternetReachable === false;
  return { isOffline };
}

import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

/**
 * NativeWind styles React Native core components automatically. Third-party components must be
 * registered so their `className` is turned into `style`. Imported once from the root layout.
 */
cssInterop(Image, { className: 'style' });

import { useSkin } from '../theme/SkinProvider';

export function useTheme() {
  const { skin } = useSkin();
  return skin.colors;
}

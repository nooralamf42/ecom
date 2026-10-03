import {
  BadgeCheck,
  Clock,
  Gift,
  Headphones,
  Heart,
  Leaf,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { FeatureIcon } from "@/lib/settings/schema";

/** Icons store owners can pick for homepage feature cards. */
export const FEATURE_ICON_COMPONENTS: Record<FeatureIcon, LucideIcon> = {
  sparkles: Sparkles,
  ruler: Ruler,
  truck: Truck,
  "shield-check": ShieldCheck,
  gift: Gift,
  heart: Heart,
  star: Star,
  leaf: Leaf,
  clock: Clock,
  "badge-check": BadgeCheck,
  "refresh-ccw": RefreshCcw,
  headphones: Headphones,
};

import { forwardRef, useEffect } from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { tv, type VariantProps } from 'tailwind-variants';

const SPRING = { damping: 26, stiffness: 220, mass: 0.8 } as const;
/** Fraction of the track the indeterminate bar occupies while looping. */
const INDETERMINATE_FRACTION = 0.4;

const progressVariants = tv({
  slots: {
    track: 'w-full overflow-hidden rounded-full bg-muted',
    indicator: 'h-full rounded-full',
  },
  variants: {
    variant: {
      default: { indicator: 'bg-primary' },
      success: { indicator: 'bg-success' },
      warning: { indicator: 'bg-warning' },
      destructive: { indicator: 'bg-destructive' },
    },
    size: {
      sm: { track: 'h-1.5' },
      md: { track: 'h-2' },
      lg: { track: 'h-3' },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export interface ProgressProps
  extends Omit<ViewProps, 'children'>,
    VariantProps<typeof progressVariants> {
  className?: string;
  /** Extra classes for the animated fill. */
  indicatorClassName?: string;
  /** Current progress, from 0 to {@link max}. Ignored when `indeterminate`. */
  value?: number;
  /** Upper bound for {@link value}. */
  max?: number;
  /**
   * Render a looping animation for operations of unknown duration. Overrides
   * `value`.
   */
  indeterminate?: boolean;
}

/**
 * Determinate or indeterminate progress bar. The fill is measured once via
 * `onLayout` and driven entirely on the UI thread with a `translateX`
 * transform, so updates never cross the JS bridge and never re-layout.
 */
export const Progress = forwardRef<View, ProgressProps>(
  (
    {
      className,
      indicatorClassName,
      value = 0,
      max = 100,
      variant,
      size,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const { track, indicator } = progressVariants({ variant, size });
    const width = useSharedValue(0);
    const progress = useSharedValue(0);
    const loop = useSharedValue(0);

    const clamped = max > 0 ? Math.min(Math.max(value, 0), max) / max : 0;

    useEffect(() => {
      if (indeterminate) return;
      progress.value = withSpring(clamped, SPRING);
    }, [clamped, indeterminate, progress]);

    useEffect(() => {
      if (!indeterminate) {
        cancelAnimation(loop);
        loop.value = 0;
        return;
      }
      loop.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
      return () => cancelAnimation(loop);
    }, [indeterminate, loop]);

    const indicatorStyle = useAnimatedStyle(() => {
      if (indeterminate) {
        const span = width.value * INDETERMINATE_FRACTION;
        // Travel from fully off the left edge to fully off the right edge.
        const travel = width.value + span;
        return {
          width: span,
          transform: [{ translateX: -span + loop.value * travel }],
        };
      }
      return {
        width: width.value,
        transform: [{ translateX: -width.value * (1 - progress.value) }],
      };
    });

    const onLayout = (event: LayoutChangeEvent) => {
      width.value = event.nativeEvent.layout.width;
    };

    return (
      <View
        ref={ref}
        accessibilityRole="progressbar"
        accessibilityValue={
          indeterminate
            ? undefined
            : { min: 0, max, now: Math.round(clamped * max) }
        }
        className={track({ className })}
        onLayout={onLayout}
        {...props}
      >
        <Animated.View
          style={indicatorStyle}
          className={indicator({ className: indicatorClassName })}
        />
      </View>
    );
  }
);

Progress.displayName = 'Progress';

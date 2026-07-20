import { forwardRef, type ReactNode } from 'react';
import type { View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';
import {
  AnimatedPressable,
  type AnimatedPressableProps,
} from '../../primitives/animated-pressable';
import { Text } from '../../primitives/text';
import { Spinner } from '../spinner';

const buttonVariants = tv({
  slots: {
    root: 'flex-row items-center justify-center gap-2 rounded-lg border border-transparent',
    label: 'font-medium',
  },
  variants: {
    variant: {
      primary: {
        root: 'border-primary bg-primary shadow-sm',
        label: 'text-primary-foreground',
      },
      secondary: {
        root: 'bg-secondary',
        label: 'text-secondary-foreground',
      },
      outline: {
        root: 'border-input bg-popover shadow-sm',
        label: 'text-foreground',
      },
      ghost: {
        root: 'bg-transparent',
        label: 'text-foreground',
      },
      destructive: {
        root: 'border-destructive bg-destructive shadow-sm',
        label: 'text-white',
      },
    },
    size: {
      sm: { root: 'h-9 gap-1.5 px-2.5', label: 'text-sm' },
      md: { root: 'h-11 px-4', label: 'text-base' },
      lg: { root: 'h-12 px-6', label: 'text-lg' },
      icon: { root: 'h-11 w-11 px-0' },
    },
    disabled: {
      true: { root: 'opacity-[0.64]' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** Spinner ring colors tuned to sit legibly on each variant's background. */
const SPINNER_CLASSNAME: Record<
  NonNullable<ButtonVariantProps['variant']>,
  string
> = {
  primary: 'border-primary-foreground/32 border-t-primary-foreground',
  secondary: 'border-muted border-t-secondary-foreground',
  outline: 'border-muted border-t-foreground',
  ghost: 'border-muted border-t-foreground',
  destructive: 'border-white/32 border-t-white',
};

export interface ButtonProps
  extends Omit<AnimatedPressableProps, 'children' | 'disabled'>,
    Omit<ButtonVariantProps, 'disabled'> {
  children?: ReactNode;
  disabled?: boolean;
  /**
   * Show a spinner and make the button non-interactive without dropping its
   * width. Also reflected via `accessibilityState.busy`.
   */
  loading?: boolean;
  /** Extra classes for the label when children is a string. */
  labelClassName?: string;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      children,
      className,
      labelClassName,
      variant,
      size,
      disabled,
      loading,
      ...props
    },
    ref
  ) => {
    const isDisabled = !!disabled || !!loading;
    const { root, label } = buttonVariants({ variant, size, disabled: isDisabled });

    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: !!loading }}
        disabled={isDisabled}
        className={root({ className })}
        {...props}
      >
        {loading ? (
          <Spinner
            size="sm"
            className={SPINNER_CLASSNAME[variant ?? 'primary']}
          />
        ) : null}
        {typeof children === 'string' ? (
          <Text className={label({ className: labelClassName })}>{children}</Text>
        ) : (
          children
        )}
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';

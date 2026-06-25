import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type Operator = '+' | '-' | '×' | '÷' | null;

// ── Button config ────────────────────────────────────────────────────────────

interface CalcButton {
  label: string;
  value: string;
  type: 'number' | 'operator' | 'function' | 'equals';
  span?: number;
}

const BUTTONS: CalcButton[][] = [
  [
    { label: 'AC', value: 'clear', type: 'function' },
    { label: '±', value: 'negate', type: 'function' },
    { label: '%', value: 'percent', type: 'function' },
    { label: '÷', value: '/', type: 'operator' },
  ],
  [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '*', type: 'operator' },
  ],
  [
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '−', value: '-', type: 'operator' },
  ],
  [
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
  ],
  [
    { label: '0', value: '0', type: 'number', span: 2 },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: '=', type: 'equals' },
  ],
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function evaluate(a: number, b: number, op: Operator): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : NaN;
    default: return b;
  }
}

function formatDisplay(value: string): string {
  if (value === '') return '0';

  // Split into integer and decimal parts
  const parts = value.split('.');
  // Add thousand separators to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// ── Button component ─────────────────────────────────────────────────────────

function KeyButton({
  label,
  type,
  span = 1,
  onPress,
}: CalcButton & { onPress: () => void }) {
  return (
    <motion.button
      onClick={onPress}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={cn(
        // Base — minimum 48pt touch target (exceeds Apple's 44pt minimum)
        'h-14 rounded-xl text-[22px] font-medium select-none',
        'flex items-center justify-center',
        'transition-colors duration-150 cursor-pointer',
        // Span
        span === 2 ? 'col-span-2' : 'col-span-1',

        // Type-based styling
        type === 'number' && [
          'bg-[#333333] text-white',
          'hover:bg-[#505050]',
          'active:bg-[#666666]',
          'dark:bg-[#333333] dark:hover:bg-[#505050]',
        ],
        type === 'function' && [
          'bg-[#A5A5A5] text-black',
          'hover:bg-[#C5C5C5]',
          'active:bg-[#D9D9D9]',
          'dark:bg-[#A5A5A5] dark:hover:bg-[#C5C5C5]',
        ],
        type === 'operator' && [
          'bg-[#FF2D55] text-white',
          'hover:bg-[#FF4D6E]',
          'active:bg-[#FF6D87]',
          'dark:bg-[#FF2D55] dark:hover:bg-[#FF4D6E]',
        ],
        type === 'equals' && [
          'bg-[#FF2D55] text-white',
          'hover:bg-[#FF4D6E]',
          'active:bg-[#FF6D87]',
          'dark:bg-[#FF2D55] dark:hover:bg-[#FF4D6E]',
        ],
      )}
      aria-label={label}
    >
      {label}
    </motion.button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');

  const handlePress = useCallback((value: string) => {
    // ── Clear ────────────────────────────────────────────────────────
    if (value === 'clear') {
      setDisplay('0');
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      setExpression('');
      return;
    }

    // ── Negate ───────────────────────────────────────────────────────
    if (value === 'negate') {
      setDisplay((prev) => {
        if (prev === '0') return '0';
        return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      });
      return;
    }

    // ── Percent ──────────────────────────────────────────────────────
    if (value === 'percent') {
      setDisplay((prev) => {
        const num = parseFloat(prev);
        if (isNaN(num)) return prev;
        return String(num / 100);
      });
      return;
    }

    // ── Operators ────────────────────────────────────────────────────
    if (['+', '-', '*', '/'].includes(value)) {
      const current = parseFloat(display);
      const opMap: Record<string, Operator> = { '+': '+', '-': '-', '*': '×', '/': '÷' };
      const op = opMap[value];

      if (prevValue !== null && operator && !waitingForOperand) {
        const result = evaluate(prevValue, current, operator);
        setDisplay(String(result));
        setPrevValue(result);
      } else {
        setPrevValue(current);
      }

      setOperator(op);
      setWaitingForOperand(true);
      setExpression(`${display} ${op} `);
      return;
    }

    // ── Equals ───────────────────────────────────────────────────────
    if (value === '=') {
      if (prevValue !== null && operator) {
        const current = parseFloat(display);
        const result = evaluate(prevValue, current, operator);
        setDisplay(isNaN(result) ? '错误' : String(result));
        setExpression('');
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
      }
      return;
    }

    // ── Numbers & Dot ─────────────────────────────────────────────────
    if (waitingForOperand) {
      setDisplay(value);
      setWaitingForOperand(false);
      return;
    }

    setDisplay((prev) => {
      // Don't allow multiple dots
      if (value === '.' && prev.includes('.')) return prev;
      // Don't allow leading zeros
      if (prev === '0' && value !== '.') return value;
      // Max 9 digits
      if (prev.replace(/[^0-9]/g, '').length >= 9) return prev;
      return prev + value;
    });
  }, [display, prevValue, operator, waitingForOperand]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const keyMap: Record<string, string> = {
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
      '.': '.', ',': '.',
      '+': '+', '-': '-', '*': '*', '/': '/',
      'Enter': '=', '=': '=',
      'Escape': 'clear', 'c': 'clear', 'C': 'clear',
      '%': 'percent',
    };
    const mapped = keyMap[e.key];
    if (mapped) {
      e.preventDefault();
      handlePress(mapped);
    }
  }, [handlePress]);

  return (
    <div
      className="h-full flex items-center justify-center bg-[#000000] dark:bg-[#000000]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      // Apple HIG: minimum 44pt touch targets throughout
      // All buttons are 56pt tall with generous spacing
    >
      <div className="w-[320px] flex flex-col gap-5 p-5 select-none">
        {/* ── Display ─────────────────────────────────────────────── */}
        {/* Apple HIG: clear visual hierarchy — display is the most
            prominent element, using the largest type size */}
        <div className="flex flex-col items-end justify-end min-h-[120px] px-2">
          {/* Expression preview — tertiary label style */}
          {expression && (
            <p className="text-[#888888] text-base font-light tracking-wide mb-1 min-h-[24px]">
              {expression}
            </p>
          )}
          {/* Main display — Large Title weight, right-aligned per calculator convention */}
          <p
            className={cn(
              'text-white text-right w-full break-all',
              // Dynamically scale font size for long numbers (Apple HIG: legibility first)
              display.length > 7
                ? 'text-4xl'
                : display.length > 5
                  ? 'text-5xl'
                  : 'text-[56px]',
              'font-light tracking-tight leading-tight'
            )}
            aria-live="polite"
          >
            {formatDisplay(display)}
          </p>
        </div>

        {/* ── Keypad Grid ─────────────────────────────────────────── */}
        {/* Apple HIG layout spec:
            - 4 columns, consistent 12pt gap
            - Buttons 56pt tall → exceeds 44pt minimum touch target
            - Rounded-xl (12px) corners for soft, iOS-native feel */}
        <div className="grid grid-cols-4 gap-3">
          {BUTTONS.flat().map((btn) => (
            <KeyButton
              key={btn.value}
              {...btn}
              onPress={() => handlePress(btn.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

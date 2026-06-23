import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = '搜索...', className, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-9 pl-9 pr-8 rounded-lg bg-bg-tertiary border border-border-primary',
            'text-sm text-text-primary placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            'transition-all duration-200'
          )}
          {...props}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

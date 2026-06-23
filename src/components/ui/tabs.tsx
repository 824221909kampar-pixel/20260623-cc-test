import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  activeTab: '',
  setActiveTab: () => {},
});

const useTabsContext = () => useContext(TabsContext);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const TabsRoot: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const setActiveTab = useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo(() => ({ activeTab, setActiveTab }), [activeTab, setActiveTab]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

const TabList: React.FC<TabListProps> = ({ children, className }) => {
  return (
    <div
      className={cn('flex items-center gap-1 border-b border-border-primary', className)}
      role="tablist"
    >
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const Tab: React.FC<TabProps> = ({ value, children, className, disabled }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent-primary rounded-t-lg',
        isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      )}
    </button>
  );
};

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

const TabPanels: React.FC<TabPanelsProps> = ({ children, className }) => {
  return <div className={cn('pt-4', className)}>{children}</div>;
};

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, children, className }) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Tabs = Object.assign(TabsRoot, {
  List: TabList,
  Tab,
  Panels: TabPanels,
  Panel: TabPanel,
});

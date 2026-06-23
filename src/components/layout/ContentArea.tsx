import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function ContentArea() {
  const location = useLocation();

  return (
    <main className="flex-1 overflow-hidden bg-bg-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-full overflow-y-auto"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

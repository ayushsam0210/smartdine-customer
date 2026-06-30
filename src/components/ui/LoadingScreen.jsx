import { motion } from 'framer-motion';
import { restaurantConfig } from '../../config/restaurant';

export default function LoadingScreen() {
  // Safely extract name and fallback to a default if undefined
  const restaurantName = restaurantConfig?.name || 'Restaurant';
  const firstLetter = restaurantName.charAt(0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-beige px-6">
      <div className="text-center">
        {/* Logo Icon Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-near-black shadow-float">
            <span className="font-display text-2xl font-bold text-white">
              {firstLetter}
            </span>
          </div>
        </motion.div>

        {/* Text Animation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-5 font-heading text-base font-bold text-near-black"
        >
          {restaurantName}
        </motion.p>

        {/* Staggered Bouncing Dots */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-[6px]"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { 
                staggerChildren: 0.15 // Smooth staggered kickoff
              },
            },
          }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-[7px] w-[7px] rounded-full bg-coral"
              variants={{
                hidden: { opacity: 0.3, scale: 0.8 },
                show: {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  transition: { 
                    duration: 0.8, 
                    repeat: Infinity, 
                    ease: 'easeInOut' 
                  },
                },
              }}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}

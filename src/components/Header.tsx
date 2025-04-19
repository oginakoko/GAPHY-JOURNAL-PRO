import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#252525] to-[#1A1A1A] p-10 mb-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/5 to-transparent" />
      <div className="relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-white">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-white/80">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
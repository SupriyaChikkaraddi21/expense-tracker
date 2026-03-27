import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7 },
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative"
    >
      {/* CURSOR GLOW */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px at ${position.x}px ${position.y}px, rgba(99,102,241,0.15), transparent 80%)`,
        }}
      />

      {/* NAVBAR */}
      <div className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-lg font-semibold tracking-wide">
            ExpenseIQ
          </h1>

          <div className="flex items-center gap-6 text-sm">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-300 hover:text-white transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 rounded-lg font-medium transition hover:opacity-90 shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="pt-36 pb-28 px-6 text-center relative overflow-hidden">

        {/* PARALLAX GLOW */}
        <motion.div
          animate={{
            x: position.x * 0.02,
            y: position.y * 0.02,
          }}
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/20 blur-[140px] rounded-full"
        />

        <motion.div {...fadeUp} className="relative z-10 max-w-4xl mx-auto">

          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            Stop Guessing Where Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Money Goes
            </span>
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            AI-powered insights that don’t just track your spending —
            they tell you exactly what to fix.
          </p>

          <div className="mt-10 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 0 0px rgba(99,102,241,0.4)",
                  "0 0 25px rgba(99,102,241,0.4)",
                  "0 0 0px rgba(99,102,241,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 px-10 py-3 rounded-xl font-medium"
            >
              Get Started
            </motion.button>
          </div>

        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-6xl mx-auto">

        <motion.h2
          {...fadeUp}
          className="text-3xl font-semibold text-center mb-16"
        >
          Not just tracking —{" "}
          <span className="text-indigo-400">intelligent decisions</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              title: "AI Insights",
              desc: "Understand your spending patterns instantly with smart analysis.",
            },
            {
              title: "Budget Control",
              desc: "Stay ahead with predictions before you overspend.",
            },
            {
              title: "Smart Suggestions",
              desc: "Get daily actions to improve your financial habits.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur hover:bg-white/10"
            >
              <h3 className="font-medium text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto">

        <motion.h2 {...fadeUp} className="text-3xl font-semibold mb-16">
          How it works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">

          {[
            { title: "Add", desc: "Track income & expenses" },
            { title: "Analyze", desc: "AI gives insights instantly" },
            { title: "Improve", desc: "Optimize your spending habits" },
          ].map((step, i) => (
            <motion.div key={i} {...fadeUp}>
              <div className="text-xl font-medium mb-2">
                {step.title}
              </div>
              <p className="text-gray-400 text-sm">
                {step.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* SOCIAL */}
      <section className="py-16 text-center text-gray-400 text-sm">
        Designed for people who want clarity and control over their money
      </section>

      {/* CTA */}
      <section className="py-28 text-center relative">

        <div className="absolute inset-0 flex justify-center">
          <div className="w-[500px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div {...fadeUp} className="relative">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Take control of your money today
          </h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 px-12 py-3 rounded-xl font-medium shadow-xl shadow-indigo-500/20"
          >
            Get Started
          </motion.button>
        </motion.div>

      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500 text-sm border-t border-white/5">
        © {new Date().getFullYear()} ExpenseIQ. All rights reserved.
      </footer>
    </div>
  );
}
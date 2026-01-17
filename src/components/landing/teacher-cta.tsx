"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

const benefits = [
  "70% de commission sur chaque vente",
  "Publication gratuite et illimitée",
  "IA pour structurer vos cours",
  "Analytics détaillées",
  "Paiements rapides via Stripe",
];

export function TeacherCta() {
  return (
    <section className="bg-[#0a0a0a] py-16 border-t border-[#2a2a2a]">
      <div
        className="mx-4 max-w-6xl rounded-3xl border border-[#7a78ff]/20 bg-gradient-to-br from-[#7a78ff]/10 to-[#7a78ff]/5 p-8 md:mx-auto md:p-12 lg:p-16"
        style={{ boxShadow: "0 0 80px -20px rgba(122,120,255,0.3)" }}
      >
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
          {/* Left Section - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:w-1/2 lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c7ff69]/20 bg-[#c7ff69]/10 px-4 py-2 text-sm font-medium text-[#c7ff69]">
              <Sparkles className="h-4 w-4" />
              Espace Enseignant
            </span>

            <h2
              className="text-4xl font-black leading-tight text-white md:text-5xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              Gardez <span className="text-[#c7ff69]">70%</span> de vos ventes
            </h2>
            <p className="text-lg text-gray-400 md:text-xl">
              Créez vos cours une fois, vendez-les à des milliers d&apos;élèves.
              Notre plateforme gère les paiements, vous gardez 70% de chaque
              vente.
            </p>

            {/* Benefits List */}
            <ul className="mt-6 space-y-3 text-lg md:text-xl">
              {benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center justify-center gap-3 lg:justify-start"
                >
                  <CheckCircle className="h-6 w-6 text-[#c7ff69]" />
                  <span className="text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8"
            >
              <Link
                href="/register/teacher"
                className="inline-block rounded-full bg-[#ff6d38] px-8 py-4 text-lg font-bold text-[#0a0a0a] transition-all duration-300 hover:bg-[#ff8c5a] hover:shadow-[0_0_40px_-10px_rgba(255,109,56,0.5)]"
              >
                Devenir enseignant
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Section - Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center p-6 lg:w-1/2"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Exemple de revenus
              </p>
              <p className="mt-4 text-6xl font-black text-[#c7ff69]">1 400€</p>
              <p className="mt-4 text-lg font-medium text-gray-300">
                pour un cours à{" "}
                <span className="font-bold text-white">29€</span> vendu à{" "}
                <span className="font-bold text-white">70 élèves</span>
              </p>
              <div className="mt-6 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
                <p className="text-sm text-gray-500">
                  Prix cours : 29€ x 70 ventes = 2 030€
                  <br />
                  Votre part (70%) ={" "}
                  <span className="font-bold text-[#c7ff69]">1 421€</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

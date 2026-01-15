"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const benefits = [
  "70% de commission sur chaque vente",
  "Publication gratuite et illimitee",
  "IA pour structurer vos cours",
  "Analytics detaillees",
  "Paiements rapides via Stripe",
];

export function TeacherCta() {
  return (
    <section className="mx-4 my-16 max-w-6xl rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-8 text-white shadow-md md:mx-auto md:p-12 lg:p-16">
      <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
        {/* Left Section - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center lg:w-1/2 lg:text-left"
        >
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Gardez <span className="text-amber-300">70%</span> de vos ventes
          </h2>
          <p className="text-lg opacity-90 md:text-xl">
            Creez vos cours une fois, vendez-les a des milliers d&apos;élèves.
            Notre plateforme gere les paiements, vous gardez 70% de chaque
            vente.
          </p>

          {/* Benefits List */}
          <ul className="mt-6 space-y-3 text-lg md:text-xl">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center justify-center gap-3 lg:justify-start"
              >
                <CheckCircle className="h-6 w-6 text-amber-300" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8"
          >
            <Link
              href="/register/teacher"
              className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-sm transition-colors duration-300 hover:bg-gray-50"
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
          <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-900 shadow-sm">
            <p className="text-sm font-semibold uppercase text-gray-500">
              Exemple de revenus
            </p>
            <p className="mt-2 text-6xl font-bold text-emerald-500">1 400€</p>
            <p className="mt-4 text-lg font-medium text-gray-700">
              pour un cours a <span className="font-bold">29€</span> vendu a{" "}
              <span className="font-bold">70 élèves</span>
            </p>
            <div className="mt-4 rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                Prix cours : 29€ x 70 ventes = 2 030€
                <br />
                Votre part (70%) ={" "}
                <span className="font-bold text-gray-700">1 421€</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

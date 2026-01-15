import {
  Header,
  Hero,
  ProductPreview,
  StatsSection,
  Categories,
  FeaturedCourses,
  HowItWorks,
  PricingPreview,
  Testimonials,
  TeacherCta,
  UrgencyBanner,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <UrgencyBanner />
      <Header />
      <main>
        <Hero />
        <ProductPreview />
        <StatsSection />
        <Categories />
        <FeaturedCourses />
        <HowItWorks />
        <PricingPreview />
        <Testimonials />
        <TeacherCta />
      </main>
      <Footer />
    </div>
  );
}

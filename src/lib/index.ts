// Utility functions
export { cn } from "./utils";

// API error handling
export {
  ApiError,
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
} from "./api-error";

// Animation variants and springs
export {
  springs,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInCenter,
  popIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  confetti,
  celebrationPop,
  sparkle,
  hoverLift,
  hoverScale,
  hoverGlow,
  buttonPress,
  buttonBounce,
  cardHover,
  cardFlip,
  modalBackdrop,
  modalContent,
  modalSlideUp,
  pageSlide,
  pageFade,
  listItem,
  listItemWithDrag,
  notification,
  toast,
  progressBar,
  progressCircle,
  skeleton,
  withDelay,
  createStaggerContainer,
  createSpring,
} from "./animations";

// SEO utilities
export {
  generateSiteMetadata,
  generateCourseJsonLd,
  organizationJsonLd,
  websiteJsonLd,
  siteConfig,
} from "./seo";

// Database client
export { prisma } from "./prisma";

// Auth configuration
export { auth, handlers, signIn, signOut } from "./auth";

// Stripe configuration
export { stripe } from "./stripe";

// Validations
export * from "./validations/child";
export * from "./validations/course";
export * from "./validations/purchase";

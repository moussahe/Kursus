// Children hooks
export {
  useChildren,
  useChild,
  useCreateChild,
  useUpdateChild,
  useDeleteChild,
} from "./use-children";

// Course hooks
export {
  usePublicCourses,
  useTeacherCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useTogglePublish,
} from "./use-courses";

// Progress hooks
export {
  useCourseProgress,
  useLessonProgress,
  useMarkLessonComplete,
  useUpdateWatchTime,
} from "./use-progress";

// Purchase hooks
export {
  usePurchases,
  useHasPurchased,
  useCreateCheckout,
} from "./use-purchases";

// AI Chat hooks
export {
  useAIChat,
  useConversations,
  useConversationMessages,
  useSendMessage,
  useDeleteConversation,
} from "./use-ai-chat";
export type { AIMessage, AIConversation } from "./use-ai-chat";

// Quiz hooks
export { useAdaptiveQuiz } from "./use-adaptive-quiz";

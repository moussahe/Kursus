import { Suspense } from "react";
import { Plus, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicCard } from "@/components/forums/topic-card";
import { CategoryFilter } from "@/components/forums/category-filter";
import { CreateTopicForm } from "@/components/forums/create-topic-form";
import { ForumCategory, GradeLevel, Subject } from "@prisma/client";

interface SearchParams {
  category?: string;
  subject?: string;
  gradeLevel?: string;
  search?: string;
  sortBy?: string;
  page?: string;
}

async function getTopics(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: {
    category?: ForumCategory;
    subject?: Subject;
    gradeLevel?: GradeLevel;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      content?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (searchParams.category) {
    where.category = searchParams.category as ForumCategory;
  }
  if (searchParams.subject) {
    where.subject = searchParams.subject as Subject;
  }
  if (searchParams.gradeLevel) {
    where.gradeLevel = searchParams.gradeLevel as GradeLevel;
  }
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { content: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  type OrderBy =
    | Array<{ isPinned: "desc" } | { createdAt: "desc" }>
    | Array<{ isPinned: "desc" } | { viewCount: "desc" }>
    | Array<{ isPinned: "desc" } | { replyCount: "desc" }>;

  let orderBy: OrderBy;
  switch (searchParams.sortBy) {
    case "popular":
      orderBy = [{ isPinned: "desc" }, { viewCount: "desc" }];
      break;
    case "most_replies":
      orderBy = [{ isPinned: "desc" }, { replyCount: "desc" }];
      break;
    default:
      orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];
  }

  const [topics, total] = await prisma.$transaction([
    prisma.forumTopic.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            gradeLevel: true,
          },
        },
      },
    }),
    prisma.forumTopic.count({ where }),
  ]);

  return { topics, total, page, totalPages: Math.ceil(total / limit) };
}

async function getUserChildren(userId: string) {
  return prisma.child.findMany({
    where: { parentId: userId },
    select: {
      id: true,
      firstName: true,
      gradeLevel: true,
    },
  });
}

function TopicsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function TopicsList({ searchParams }: { searchParams: SearchParams }) {
  const { topics, total, page, totalPages } = await getTopics(searchParams);

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <Search className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Aucune discussion trouvee
        </h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          Soyez le premier a lancer une discussion dans cette categorie!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} discussion{total > 1 ? "s" : ""} trouvee{total > 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={{
              ...topic,
              createdAt: topic.createdAt.toISOString(),
              lastReplyAt: topic.lastReplyAt?.toISOString() || null,
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/community?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
              className={`px-3 py-1 rounded-md text-sm ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userChildren = session?.user
    ? await getUserChildren(session.user.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Communaute Kursus</h1>
              <p className="mt-2 text-emerald-100">
                Posez vos questions, partagez vos connaissances et apprenez
                ensemble
              </p>
            </div>

            {session?.user ? (
              <CreateTopicForm
                userRole={session.user.role}
                children_={userChildren}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nouveau sujet
                </Button>
              </CreateTopicForm>
            ) : (
              <a href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  Connectez-vous pour participer
                </Button>
              </a>
            )}
          </div>

          {/* Search bar */}
          <form className="mt-6 max-w-xl" action="/community" method="GET">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                defaultValue={params.search}
                placeholder="Rechercher dans les discussions..."
                className="pl-10 bg-white/90 border-0 focus:ring-2 focus:ring-white"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <CategoryFilter />

              {/* Quick stats */}
              <div className="rounded-lg border bg-white p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Statistiques
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discussions</span>
                    <span className="font-medium">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reponses</span>
                    <span className="font-medium">--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membres</span>
                    <span className="font-medium">--</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Sort tabs */}
            <div className="flex gap-2 mb-6">
              <a
                href={`/community?${params.category ? `category=${params.category}&` : ""}sortBy=recent`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !params.sortBy || params.sortBy === "recent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Recents
              </a>
              <a
                href={`/community?${params.category ? `category=${params.category}&` : ""}sortBy=popular`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  params.sortBy === "popular"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Populaires
              </a>
              <a
                href={`/community?${params.category ? `category=${params.category}&` : ""}sortBy=most_replies`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  params.sortBy === "most_replies"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Plus de réponses
              </a>
            </div>

            <Suspense fallback={<TopicsSkeleton />}>
              <TopicsList searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

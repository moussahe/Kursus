import {
  PrismaClient,
  Role,
  Subject,
  GradeLevel,
  ContentType,
  BadgeCategory,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with complete demo courses...");

  // Clean existing data
  await prisma.forumVote.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumTopic.deleteMany();
  await prisma.weakArea.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.exerciseAttempt.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.teacherAvailability.deleteMany();
  await prisma.childBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.review.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.child.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data");

  // Create password hash
  const passwordHash = await hash("password123", 12);

  // ============ CREATE USERS ============

  // Teacher 1 - Math & Sciences
  const teacherMath = await prisma.user.create({
    data: {
      name: "Sophie Martin",
      email: "sophie.martin@schoolaris.fr",
      password: passwordHash,
      role: Role.TEACHER,
      emailVerified: new Date(),
      teacherProfile: {
        create: {
          slug: "sophie-martin",
          headline:
            "Professeure de Mathematiques & Sciences - 12 ans d'experience",
          bio: "Passionnee par la pedagogie, j'accompagne les eleves du primaire au college dans leur apprentissage des mathematiques et des sciences. Ma methode : rendre les concepts abstraits concrets grace a des exemples du quotidien.",
          specialties: [Subject.MATHEMATIQUES, Subject.SCIENCES],
          yearsExperience: 12,
          isVerified: true,
          totalStudents: 234,
          totalCourses: 3,
          averageRating: 4.8,
        },
      },
    },
  });

  // Teacher 2 - French
  const teacherFrench = await prisma.user.create({
    data: {
      name: "Pierre Dubois",
      email: "pierre.dubois@schoolaris.fr",
      password: passwordHash,
      role: Role.TEACHER,
      emailVerified: new Date(),
      teacherProfile: {
        create: {
          slug: "pierre-dubois",
          headline: "Professeur de Francais certifie - Specialiste conjugaison",
          bio: "Agrege de lettres modernes, j'enseigne le francais avec passion depuis 15 ans. J'ai developpe une methode ludique pour maitriser la conjugaison sans effort.",
          specialties: [Subject.FRANCAIS],
          yearsExperience: 15,
          isVerified: true,
          totalStudents: 456,
          totalCourses: 2,
          averageRating: 4.9,
        },
      },
    },
  });

  console.log("Created teachers:", teacherMath.email, teacherFrench.email);

  // Parent
  const parent = await prisma.user.create({
    data: {
      name: "Marie Lambert",
      email: "parent@schoolaris.fr",
      password: passwordHash,
      role: Role.PARENT,
      emailVerified: new Date(),
    },
  });

  // Children
  const child1 = await prisma.child.create({
    data: {
      firstName: "Lucas",
      lastName: "Lambert",
      gradeLevel: GradeLevel.CM2,
      parentId: parent.id,
      xp: 1250,
      level: 5,
      currentStreak: 7,
      longestStreak: 14,
    },
  });

  const child2 = await prisma.child.create({
    data: {
      firstName: "Emma",
      lastName: "Lambert",
      gradeLevel: GradeLevel.CINQUIEME,
      parentId: parent.id,
      xp: 890,
      level: 4,
      currentStreak: 3,
      longestStreak: 10,
    },
  });

  console.log("Created parent and children");

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin Schoolaris",
      email: "admin@schoolaris.fr",
      password: passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  // ============ CREATE BADGES ============

  const badges = await Promise.all([
    // Progress badges
    prisma.badge.create({
      data: {
        code: "first_lesson",
        name: "Premier Pas",
        description: "Termine ta premiere lecon",
        category: BadgeCategory.PROGRESS,
        xpReward: 50,
        requirement: { lessonsCompleted: 1 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "five_lessons",
        name: "En Route",
        description: "Termine 5 lecons",
        category: BadgeCategory.PROGRESS,
        xpReward: 100,
        requirement: { lessonsCompleted: 5 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "ten_lessons",
        name: "Assidu",
        description: "Termine 10 lecons",
        category: BadgeCategory.PROGRESS,
        xpReward: 200,
        requirement: { lessonsCompleted: 10 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "first_course",
        name: "Diplome",
        description: "Termine ton premier cours complet",
        category: BadgeCategory.PROGRESS,
        xpReward: 500,
        requirement: { coursesCompleted: 1 },
      },
    }),

    // Streak badges
    prisma.badge.create({
      data: {
        code: "streak_3",
        name: "Regulier",
        description: "3 jours d'etude consecutifs",
        category: BadgeCategory.STREAK,
        xpReward: 75,
        requirement: { streakDays: 3 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "streak_7",
        name: "Semaine Parfaite",
        description: "7 jours d'etude consecutifs",
        category: BadgeCategory.STREAK,
        xpReward: 150,
        requirement: { streakDays: 7 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "streak_30",
        name: "Champion du Mois",
        description: "30 jours d'etude consecutifs",
        category: BadgeCategory.STREAK,
        xpReward: 500,
        requirement: { streakDays: 30 },
      },
    }),

    // Quiz badges
    prisma.badge.create({
      data: {
        code: "first_quiz",
        name: "Quiz Debutant",
        description: "Termine ton premier quiz",
        category: BadgeCategory.QUIZ,
        xpReward: 50,
        requirement: { quizzesCompleted: 1 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "perfect_quiz",
        name: "Sans Faute",
        description: "Obtiens 100% a un quiz",
        category: BadgeCategory.QUIZ,
        xpReward: 100,
        requirement: { perfectQuizzes: 1 },
      },
    }),
    prisma.badge.create({
      data: {
        code: "quiz_master",
        name: "Maitre des Quiz",
        description: "Obtiens 90%+ a 10 quiz",
        category: BadgeCategory.QUIZ,
        xpReward: 300,
        requirement: { highScoreQuizzes: 10 },
      },
    }),

    // Achievement badges
    prisma.badge.create({
      data: {
        code: "early_bird",
        name: "Leve-tot",
        description: "Etudie avant 8h du matin",
        category: BadgeCategory.ACHIEVEMENT,
        xpReward: 75,
        isSecret: true,
      },
    }),
    prisma.badge.create({
      data: {
        code: "night_owl",
        name: "Couche-tard",
        description: "Etudie apres 22h",
        category: BadgeCategory.ACHIEVEMENT,
        xpReward: 75,
        isSecret: true,
      },
    }),
    prisma.badge.create({
      data: {
        code: "multi_subject",
        name: "Polyvalent",
        description: "Etudie 3 matieres differentes",
        category: BadgeCategory.ACHIEVEMENT,
        xpReward: 150,
        requirement: { subjectsStudied: 3 },
      },
    }),
  ]);

  console.log(`Created ${badges.length} badges`);

  // ============ COURSE 1: MATHEMATIQUES CM2 - FRACTIONS ============

  const courseFractions = await prisma.course.create({
    data: {
      title: "Les Fractions - Cours Complet CM2",
      slug: "fractions-cm2-complet",
      subtitle: "Maitriser les fractions de A a Z pour reussir en 6eme",
      description: `Ce cours complet sur les fractions est concu specialement pour les eleves de CM2 qui souhaitent maitriser cette notion essentielle avant l'entree en 6eme.

A travers des explications claires, des exemples concrets et de nombreux exercices, votre enfant apprendra a :
- Comprendre ce qu'est une fraction et la representer
- Comparer et ranger des fractions
- Additionner et soustraire des fractions
- Resoudre des problemes concrets avec des fractions

Notre methode pedagogique s'appuie sur des situations de la vie quotidienne (partage de pizza, mesures en cuisine...) pour rendre les fractions accessibles et amusantes.`,
      subject: Subject.MATHEMATIQUES,
      gradeLevel: GradeLevel.CM2,
      price: 2490, // 24.90 EUR
      imageUrl:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
      authorId: teacherMath.id,
      isPublished: true,
      publishedAt: new Date(),
      totalStudents: 156,
      learningOutcomes: [
        "Comprendre la notion de fraction et la representer graphiquement",
        "Savoir comparer des fractions de meme denominateur ou de meme numerateur",
        "Additionner et soustraire des fractions de meme denominateur",
        "Identifier les fractions egales a 1 ou superieures a 1",
        "Resoudre des problemes concrets utilisant des fractions",
      ],
      requirements: [
        "Connaitre les tables de multiplication jusqu'a 10",
        "Savoir effectuer des divisions simples",
        "Maitriser les notions de numeration (dizaines, centaines)",
      ],
    },
  });

  // Chapter 1: Introduction aux fractions
  const ch1Fractions = await prisma.chapter.create({
    data: {
      title: "Decouvrir les fractions",
      description:
        "Comprendre ce qu'est une fraction et apprendre a la representer",
      position: 1,
      courseId: courseFractions.id,
      isPublished: true,
    },
  });

  const lesson1_1 = await prisma.lesson.create({
    data: {
      title: "Qu'est-ce qu'une fraction ?",
      description: "Decouvrir le concept de fraction a travers des exemples",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-intro",
      duration: 12,
      position: 1,
      chapterId: ch1Fractions.id,
      isPublished: true,
      isFreePreview: true,
    },
  });

  const lesson1_2 = await prisma.lesson.create({
    data: {
      title: "Le numerateur et le denominateur",
      description: "Comprendre le role de chaque partie d'une fraction",
      contentType: ContentType.TEXT,
      content: `# Le numerateur et le denominateur

## Introduction

Une fraction est composee de deux nombres separes par une barre :

**Exemple : 3/4**

- Le nombre du **haut** s'appelle le **numerateur**
- Le nombre du **bas** s'appelle le **denominateur**

## Le denominateur : combien de parts egales ?

Le denominateur indique **en combien de parts egales** on a divise l'unite.

**Exemples :**
- Si le denominateur est 4, on a divise en 4 parts egales
- Si le denominateur est 8, on a divise en 8 parts egales

> Plus le denominateur est grand, plus les parts sont petites !

## Le numerateur : combien de parts on prend ?

Le numerateur indique **combien de parts** on considere.

**Exemples :**
- 3/4 signifie : on prend 3 parts sur 4
- 5/8 signifie : on prend 5 parts sur 8

## Un exemple concret : la pizza

Imaginons une pizza coupee en **8 parts egales** :

- Tu en manges **3 parts**
- Tu as mange **3/8** de la pizza
- Le 8 (denominateur) = nombre total de parts
- Le 3 (numerateur) = parts que tu as mangees

## A retenir

| Terme | Position | Signification |
|-------|----------|---------------|
| Numerateur | En haut | Nombre de parts prises |
| Denominateur | En bas | Nombre total de parts egales |

## Astuce memoire

Pour retenir lequel est lequel, pense a :
- **D**enominateur = en **D**essous (il **d**ivise)
- **N**umerateur = en haut, il **n**umere (il compte)`,
      duration: 15,
      position: 2,
      chapterId: ch1Fractions.id,
      isPublished: true,
    },
  });

  const lesson1_3 = await prisma.lesson.create({
    data: {
      title: "Representer une fraction graphiquement",
      description:
        "Apprendre a representer visuellement une fraction avec des dessins",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-graphique",
      duration: 10,
      position: 3,
      chapterId: ch1Fractions.id,
      isPublished: true,
    },
  });

  // Quiz for Chapter 1
  const quiz1_1 = await prisma.quiz.create({
    data: {
      title: "Quiz : Decouvrir les fractions",
      description: "Verifie ta comprehension des bases des fractions",
      lessonId: lesson1_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quiz1_1.id,
        question: "Dans la fraction 5/8, quel nombre est le numerateur ?",
        options: [
          { id: "a", text: "5", isCorrect: true },
          { id: "b", text: "8", isCorrect: false },
          { id: "c", text: "13", isCorrect: false },
          { id: "d", text: "Aucun des deux", isCorrect: false },
        ],
        explanation:
          "Le numerateur est le nombre du haut de la fraction. Dans 5/8, c'est donc 5.",
        points: 1,
        position: 1,
      },
      {
        quizId: quiz1_1.id,
        question: "Que represente le denominateur dans une fraction ?",
        options: [
          { id: "a", text: "Le nombre de parts prises", isCorrect: false },
          {
            id: "b",
            text: "Le nombre total de parts egales",
            isCorrect: true,
          },
          { id: "c", text: "La somme des deux nombres", isCorrect: false },
          { id: "d", text: "Le resultat de la division", isCorrect: false },
        ],
        explanation:
          "Le denominateur (en bas) indique en combien de parts egales l'unite a ete divisee.",
        points: 1,
        position: 2,
      },
      {
        quizId: quiz1_1.id,
        question:
          "Une pizza est coupee en 6 parts. Tu en manges 2. Quelle fraction de pizza as-tu mangee ?",
        options: [
          { id: "a", text: "6/2", isCorrect: false },
          { id: "b", text: "2/6", isCorrect: true },
          { id: "c", text: "2/4", isCorrect: false },
          { id: "d", text: "4/6", isCorrect: false },
        ],
        explanation:
          "Tu as mange 2 parts sur 6 au total, donc la fraction est 2/6 (numerateur = parts mangees, denominateur = total).",
        points: 1,
        position: 3,
      },
      {
        quizId: quiz1_1.id,
        question:
          "Quelle fraction represente cette figure ? [3 carres colories sur 5]",
        options: [
          { id: "a", text: "5/3", isCorrect: false },
          { id: "b", text: "3/5", isCorrect: true },
          { id: "c", text: "2/5", isCorrect: false },
          { id: "d", text: "3/2", isCorrect: false },
        ],
        explanation:
          "3 carres colories sur 5 au total = 3/5. Le numerateur compte les parts colorees.",
        points: 1,
        position: 4,
      },
      {
        quizId: quiz1_1.id,
        question:
          "Dans la fraction 7/10, combien y a-t-il de parts egales au total ?",
        options: [
          { id: "a", text: "7", isCorrect: false },
          { id: "b", text: "10", isCorrect: true },
          { id: "c", text: "17", isCorrect: false },
          { id: "d", text: "3", isCorrect: false },
        ],
        explanation:
          "Le denominateur (10) indique le nombre total de parts egales.",
        points: 1,
        position: 5,
      },
    ],
  });

  // Chapter 2: Comparer des fractions
  const ch2Fractions = await prisma.chapter.create({
    data: {
      title: "Comparer des fractions",
      description: "Apprendre a comparer et ranger des fractions",
      position: 2,
      courseId: courseFractions.id,
      isPublished: true,
    },
  });

  const lesson2_1 = await prisma.lesson.create({
    data: {
      title: "Comparer des fractions de meme denominateur",
      description: "La methode simple quand les denominateurs sont identiques",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-compare-denom",
      duration: 10,
      position: 1,
      chapterId: ch2Fractions.id,
      isPublished: true,
    },
  });

  const lesson2_2 = await prisma.lesson.create({
    data: {
      title: "Comparer des fractions de meme numerateur",
      description: "Comprendre la comparaison quand les numerateurs sont egaux",
      contentType: ContentType.TEXT,
      content: `# Comparer des fractions de meme numerateur

## Le principe

Quand deux fractions ont le **meme numerateur**, on compare leurs denominateurs.

**Attention, c'est l'inverse de ce qu'on pourrait croire !**

## La regle

> Plus le denominateur est grand, plus la fraction est **petite**.

**Pourquoi ?** Parce qu'on divise l'unite en plus de parts, donc chaque part est plus petite.

## Exemple visuel

Comparons **2/4** et **2/8** :

- 2/4 : on divise en 4 parts, on en prend 2
- 2/8 : on divise en 8 parts, on en prend 2

Quand on divise en 8, les parts sont plus petites qu'en 4.
Donc **2/8 < 2/4**

## Exemples pratiques

| Fraction 1 | Fraction 2 | Comparaison |
|------------|------------|-------------|
| 3/5 | 3/10 | 3/5 > 3/10 |
| 1/4 | 1/2 | 1/4 < 1/2 |
| 5/6 | 5/12 | 5/6 > 5/12 |

## Astuce

Imagine que tu partages un gateau :
- En 4 parts : tu as de grosses parts
- En 8 parts : tu as de petites parts

Si tu prends 2 parts dans chaque cas, tu preferes les grosses parts !
Donc 2/4 > 2/8`,
      duration: 12,
      position: 2,
      chapterId: ch2Fractions.id,
      isPublished: true,
    },
  });

  const lesson2_3 = await prisma.lesson.create({
    data: {
      title: "Fractions egales a 1 ou superieures a 1",
      description: "Reconnaitre les fractions egales ou superieures a l'unite",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-unite",
      duration: 8,
      position: 3,
      chapterId: ch2Fractions.id,
      isPublished: true,
    },
  });

  // Quiz for Chapter 2
  const quiz2_1 = await prisma.quiz.create({
    data: {
      title: "Quiz : Comparer des fractions",
      description: "Teste ta capacite a comparer des fractions",
      lessonId: lesson2_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quiz2_1.id,
        question: "Compare 5/8 et 3/8. Quelle fraction est la plus grande ?",
        options: [
          { id: "a", text: "5/8", isCorrect: true },
          { id: "b", text: "3/8", isCorrect: false },
          { id: "c", text: "Elles sont egales", isCorrect: false },
          { id: "d", text: "On ne peut pas comparer", isCorrect: false },
        ],
        explanation:
          "Avec le meme denominateur, on compare les numerateurs : 5 > 3, donc 5/8 > 3/8",
        points: 1,
        position: 1,
      },
      {
        quizId: quiz2_1.id,
        question: "Compare 2/5 et 2/9. Quelle fraction est la plus grande ?",
        options: [
          { id: "a", text: "2/9", isCorrect: false },
          { id: "b", text: "2/5", isCorrect: true },
          { id: "c", text: "Elles sont egales", isCorrect: false },
          { id: "d", text: "On ne peut pas comparer", isCorrect: false },
        ],
        explanation:
          "Avec le meme numerateur, plus le denominateur est petit, plus la fraction est grande : 2/5 > 2/9",
        points: 1,
        position: 2,
      },
      {
        quizId: quiz2_1.id,
        question: "Quelle fraction est egale a 1 ?",
        options: [
          { id: "a", text: "5/4", isCorrect: false },
          { id: "b", text: "3/5", isCorrect: false },
          { id: "c", text: "6/6", isCorrect: true },
          { id: "d", text: "4/8", isCorrect: false },
        ],
        explanation:
          "Une fraction est egale a 1 quand numerateur = denominateur. 6/6 = 1",
        points: 1,
        position: 3,
      },
      {
        quizId: quiz2_1.id,
        question: "Quelle fraction est superieure a 1 ?",
        options: [
          { id: "a", text: "3/4", isCorrect: false },
          { id: "b", text: "7/5", isCorrect: true },
          { id: "c", text: "2/3", isCorrect: false },
          { id: "d", text: "5/5", isCorrect: false },
        ],
        explanation:
          "Une fraction est superieure a 1 quand numerateur > denominateur. 7 > 5, donc 7/5 > 1",
        points: 1,
        position: 4,
      },
      {
        quizId: quiz2_1.id,
        question:
          "Range ces fractions de la plus petite a la plus grande : 4/9, 7/9, 2/9",
        options: [
          { id: "a", text: "2/9 < 4/9 < 7/9", isCorrect: true },
          { id: "b", text: "7/9 < 4/9 < 2/9", isCorrect: false },
          { id: "c", text: "4/9 < 2/9 < 7/9", isCorrect: false },
          { id: "d", text: "2/9 < 7/9 < 4/9", isCorrect: false },
        ],
        explanation:
          "Meme denominateur (9), donc on compare les numerateurs : 2 < 4 < 7",
        points: 2,
        position: 5,
      },
    ],
  });

  // Chapter 3: Operations sur les fractions
  const ch3Fractions = await prisma.chapter.create({
    data: {
      title: "Additionner et soustraire des fractions",
      description: "Maitriser les operations de base sur les fractions",
      position: 3,
      courseId: courseFractions.id,
      isPublished: true,
    },
  });

  const lesson3_1 = await prisma.lesson.create({
    data: {
      title: "Additionner des fractions de meme denominateur",
      description: "La methode pour additionner deux fractions",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-addition",
      duration: 12,
      position: 1,
      chapterId: ch3Fractions.id,
      isPublished: true,
    },
  });

  const lesson3_2 = await prisma.lesson.create({
    data: {
      title: "Soustraire des fractions de meme denominateur",
      description: "Apprendre a soustraire des fractions simplement",
      contentType: ContentType.TEXT,
      content: `# Soustraire des fractions de meme denominateur

## La regle fondamentale

Pour soustraire deux fractions qui ont le **meme denominateur** :

1. On garde le denominateur
2. On soustrait les numerateurs

## Formule

> a/c - b/c = (a - b)/c

## Exemples

### Exemple 1 : 5/7 - 2/7

- Meme denominateur : 7 ✓
- On soustrait les numerateurs : 5 - 2 = 3
- Resultat : **3/7**

### Exemple 2 : 8/10 - 3/10

- Meme denominateur : 10 ✓
- On soustrait les numerateurs : 8 - 3 = 5
- Resultat : **5/10**

### Exemple 3 : 11/12 - 5/12

- Meme denominateur : 12 ✓
- On soustrait les numerateurs : 11 - 5 = 6
- Resultat : **6/12**

## Attention !

On ne soustrait **jamais** les denominateurs !

❌ 5/7 - 2/7 ≠ 3/0

✅ 5/7 - 2/7 = 3/7

## Visualisation

Imagine que tu as 5 parts de gateau sur 7 (5/7).
Tu en donnes 2 parts a ton ami.
Il te reste 3 parts sur 7, donc 3/7.

## Exercices mentaux

| Soustraction | Resultat |
|--------------|----------|
| 6/8 - 2/8 | 4/8 |
| 9/11 - 4/11 | 5/11 |
| 7/9 - 7/9 | 0/9 = 0 |`,
      duration: 10,
      position: 2,
      chapterId: ch3Fractions.id,
      isPublished: true,
    },
  });

  const lesson3_3 = await prisma.lesson.create({
    data: {
      title: "Exercices pratiques : additions et soustractions",
      description: "Entraine-toi avec des exercices varies",
      contentType: ContentType.EXERCISE,
      duration: 20,
      position: 3,
      chapterId: ch3Fractions.id,
      isPublished: true,
    },
  });

  // Quiz for Chapter 3
  const quiz3_1 = await prisma.quiz.create({
    data: {
      title: "Quiz : Operations sur les fractions",
      description: "Verifie ta maitrise des additions et soustractions",
      lessonId: lesson3_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quiz3_1.id,
        question: "Calcule : 3/8 + 2/8 = ?",
        options: [
          { id: "a", text: "5/16", isCorrect: false },
          { id: "b", text: "5/8", isCorrect: true },
          { id: "c", text: "6/8", isCorrect: false },
          { id: "d", text: "1/8", isCorrect: false },
        ],
        explanation:
          "On additionne les numerateurs : 3 + 2 = 5. Le denominateur reste 8. Resultat : 5/8",
        points: 1,
        position: 1,
      },
      {
        quizId: quiz3_1.id,
        question: "Calcule : 7/10 - 4/10 = ?",
        options: [
          { id: "a", text: "3/0", isCorrect: false },
          { id: "b", text: "3/10", isCorrect: true },
          { id: "c", text: "11/10", isCorrect: false },
          { id: "d", text: "3/20", isCorrect: false },
        ],
        explanation:
          "On soustrait les numerateurs : 7 - 4 = 3. Le denominateur reste 10. Resultat : 3/10",
        points: 1,
        position: 2,
      },
      {
        quizId: quiz3_1.id,
        question: "Calcule : 2/5 + 2/5 + 1/5 = ?",
        options: [
          { id: "a", text: "5/15", isCorrect: false },
          { id: "b", text: "5/5", isCorrect: true },
          { id: "c", text: "3/5", isCorrect: false },
          { id: "d", text: "4/5", isCorrect: false },
        ],
        explanation:
          "On additionne les numerateurs : 2 + 2 + 1 = 5. Resultat : 5/5 = 1 entier",
        points: 1,
        position: 3,
      },
      {
        quizId: quiz3_1.id,
        question:
          "Paul a mange 3/6 d'un gateau. Marie en mange 2/6. Quelle fraction reste-t-il ?",
        options: [
          { id: "a", text: "1/6", isCorrect: true },
          { id: "b", text: "5/6", isCorrect: false },
          { id: "c", text: "0/6", isCorrect: false },
          { id: "d", text: "1/12", isCorrect: false },
        ],
        explanation:
          "Le gateau entier = 6/6. Paul + Marie = 3/6 + 2/6 = 5/6. Il reste 6/6 - 5/6 = 1/6",
        points: 2,
        position: 4,
      },
      {
        quizId: quiz3_1.id,
        question: "Calcule : 9/12 - 3/12 + 2/12 = ?",
        options: [
          { id: "a", text: "8/12", isCorrect: true },
          { id: "b", text: "8/36", isCorrect: false },
          { id: "c", text: "14/12", isCorrect: false },
          { id: "d", text: "4/12", isCorrect: false },
        ],
        explanation:
          "Etape par etape : 9 - 3 = 6, puis 6 + 2 = 8. Resultat : 8/12",
        points: 2,
        position: 5,
      },
    ],
  });

  // Chapter 4: Problemes avec des fractions
  const ch4Fractions = await prisma.chapter.create({
    data: {
      title: "Resoudre des problemes avec des fractions",
      description:
        "Appliquer les fractions dans des situations de la vie quotidienne",
      position: 4,
      courseId: courseFractions.id,
      isPublished: true,
    },
  });

  const lesson4_1 = await prisma.lesson.create({
    data: {
      title: "Les fractions dans la vie quotidienne",
      description:
        "Decouvrir comment les fractions sont utilisees au quotidien",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=fraction-quotidien",
      duration: 15,
      position: 1,
      chapterId: ch4Fractions.id,
      isPublished: true,
    },
  });

  const lesson4_2 = await prisma.lesson.create({
    data: {
      title: "Methode de resolution de problemes",
      description: "Apprendre une methode efficace pour resoudre les problemes",
      contentType: ContentType.TEXT,
      content: `# Methode de resolution de problemes avec les fractions

## Les 4 etapes de la methode

### Etape 1 : Comprendre le probleme

- Lis le probleme deux fois
- Identifie ce qu'on te demande de trouver
- Repere les informations importantes

### Etape 2 : Identifier les fractions

- Quelle est l'unite ? (le gateau entier, le trajet complet...)
- Quelles fractions sont mentionnees ?
- Quel est le denominateur commun ?

### Etape 3 : Calculer

- Ecris l'operation a effectuer
- Verifie que les denominateurs sont identiques
- Effectue le calcul

### Etape 4 : Verifier et repondre

- Relis la question
- Verifie que ta reponse a du sens
- Ecris une phrase de reponse complete

## Exemple complet

**Probleme :** Tom a une bouteille d'eau d'1 litre. Il boit 3/10 du litre le matin et 4/10 l'apres-midi. Quelle fraction de la bouteille a-t-il bue ? Combien lui reste-t-il ?

**Etape 1 :** On cherche la fraction bue et ce qui reste.

**Etape 2 :**
- Unite = 1 litre = 10/10
- Fractions : 3/10 et 4/10
- Meme denominateur : 10 ✓

**Etape 3 :**
- Fraction bue : 3/10 + 4/10 = 7/10
- Ce qui reste : 10/10 - 7/10 = 3/10

**Etape 4 :**
Tom a bu 7/10 de sa bouteille. Il lui reste 3/10 de litre.

## Astuces

- Dessine un schema si ca t'aide
- Verifie toujours que tes fractions ont le meme denominateur
- Une reponse ne peut pas etre superieure a l'unite si on parle d'une partie`,
      duration: 15,
      position: 2,
      chapterId: ch4Fractions.id,
      isPublished: true,
    },
  });

  const lesson4_3 = await prisma.lesson.create({
    data: {
      title: "Exercices de problemes",
      description: "Entraine-toi avec des problemes varies",
      contentType: ContentType.EXERCISE,
      duration: 25,
      position: 3,
      chapterId: ch4Fractions.id,
      isPublished: true,
    },
  });

  // Final quiz for Chapter 4
  const quiz4_1 = await prisma.quiz.create({
    data: {
      title: "Quiz final : Maitriser les fractions",
      description: "Evaluation complete sur l'ensemble du cours",
      lessonId: lesson4_3.id,
      passingScore: 80,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quiz4_1.id,
        question:
          "Lea a 5/8 d'une tablette de chocolat. Elle donne 2/8 a son frere. Quelle fraction lui reste-t-il ?",
        options: [
          { id: "a", text: "7/8", isCorrect: false },
          { id: "b", text: "3/8", isCorrect: true },
          { id: "c", text: "3/16", isCorrect: false },
          { id: "d", text: "7/16", isCorrect: false },
        ],
        explanation: "5/8 - 2/8 = 3/8. Lea a 3/8 de la tablette restante.",
        points: 2,
        position: 1,
      },
      {
        quizId: quiz4_1.id,
        question:
          "Un reservoir contient 3/4 d'essence. Apres un trajet, il reste 1/4. Quelle fraction a ete consommee ?",
        options: [
          { id: "a", text: "4/4", isCorrect: false },
          { id: "b", text: "2/4", isCorrect: true },
          { id: "c", text: "2/8", isCorrect: false },
          { id: "d", text: "1/2", isCorrect: false },
        ],
        explanation: "3/4 - 1/4 = 2/4 (ou 1/2) de l'essence a ete consommee.",
        points: 2,
        position: 2,
      },
      {
        quizId: quiz4_1.id,
        question:
          "Trois amis se partagent une pizza. Axel mange 2/6, Lea mange 3/6 et Tom le reste. Quelle fraction Tom mange-t-il ?",
        options: [
          { id: "a", text: "1/6", isCorrect: true },
          { id: "b", text: "5/6", isCorrect: false },
          { id: "c", text: "0/6", isCorrect: false },
          { id: "d", text: "6/6", isCorrect: false },
        ],
        explanation:
          "La pizza entiere = 6/6. Axel + Lea = 2/6 + 3/6 = 5/6. Il reste 6/6 - 5/6 = 1/6 pour Tom.",
        points: 2,
        position: 3,
      },
      {
        quizId: quiz4_1.id,
        question:
          "Dans une classe, 4/10 des eleves sont des filles et 6/10 sont des garcons. Cela fait-il bien toute la classe ?",
        options: [
          {
            id: "a",
            text: "Oui, car 4/10 + 6/10 = 10/10 = 1 (la classe entiere)",
            isCorrect: true,
          },
          {
            id: "b",
            text: "Non, car 4/10 + 6/10 = 10/20",
            isCorrect: false,
          },
          { id: "c", text: "Non, il manque des eleves", isCorrect: false },
          { id: "d", text: "On ne peut pas savoir", isCorrect: false },
        ],
        explanation:
          "4/10 + 6/10 = 10/10 = 1. Les deux fractions representent bien la totalite de la classe.",
        points: 2,
        position: 4,
      },
      {
        quizId: quiz4_1.id,
        question:
          "Range ces fractions de la plus grande a la plus petite : 3/5, 1/5, 4/5, 2/5",
        options: [
          { id: "a", text: "4/5 > 3/5 > 2/5 > 1/5", isCorrect: true },
          { id: "b", text: "1/5 > 2/5 > 3/5 > 4/5", isCorrect: false },
          { id: "c", text: "3/5 > 4/5 > 2/5 > 1/5", isCorrect: false },
          { id: "d", text: "4/5 > 2/5 > 3/5 > 1/5", isCorrect: false },
        ],
        explanation:
          "Meme denominateur, on compare les numerateurs : 4 > 3 > 2 > 1",
        points: 2,
        position: 5,
      },
    ],
  });

  console.log("Created Course 1: Les Fractions CM2");

  // ============ COURSE 2: FRANCAIS 6EME - CONJUGAISON ============

  const courseConjugaison = await prisma.course.create({
    data: {
      title: "Maitriser la Conjugaison - 6eme",
      slug: "conjugaison-6eme-complete",
      subtitle: "Present, imparfait, passe compose et futur sans fautes",
      description: `La conjugaison est souvent un cauchemar pour les eleves de 6eme. Ce cours complet vous propose une methode simple et efficace pour maitriser les 4 temps essentiels.

Finis les exercices repetitifs et ennuyeux ! Notre approche se base sur :
- Des explications claires avec des astuces pour retenir
- Des exemples tires de la vie quotidienne
- Des quiz interactifs pour s'entrainer
- Des fiches de revision telechargeables

A la fin de ce cours, votre enfant saura conjuguer sans hesitation les verbes des trois groupes aux temps essentiels.`,
      subject: Subject.FRANCAIS,
      gradeLevel: GradeLevel.SIXIEME,
      price: 1990, // 19.90 EUR
      imageUrl:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
      authorId: teacherFrench.id,
      isPublished: true,
      publishedAt: new Date(),
      totalStudents: 234,
      learningOutcomes: [
        "Maitriser le present de l'indicatif pour les 3 groupes",
        "Conjuguer a l'imparfait sans erreur",
        "Former correctement le passe compose (etre et avoir)",
        "Utiliser le futur simple avec aisance",
        "Identifier le groupe d'un verbe",
      ],
      requirements: [
        "Savoir identifier le verbe dans une phrase",
        "Connaitre les pronoms personnels (je, tu, il...)",
        "Lire couramment le francais",
      ],
    },
  });

  // Chapter 1: Les bases de la conjugaison
  const ch1Conjugaison = await prisma.chapter.create({
    data: {
      title: "Les bases de la conjugaison",
      description: "Comprendre le fonctionnement de la conjugaison francaise",
      position: 1,
      courseId: courseConjugaison.id,
      isPublished: true,
    },
  });

  const lessonC1_1 = await prisma.lesson.create({
    data: {
      title: "Les trois groupes de verbes",
      description: "Apprendre a identifier le groupe d'un verbe",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=groupes-verbes",
      duration: 10,
      position: 1,
      chapterId: ch1Conjugaison.id,
      isPublished: true,
      isFreePreview: true,
    },
  });

  const lessonC1_2 = await prisma.lesson.create({
    data: {
      title: "Radical et terminaison",
      description: "Comprendre la structure d'un verbe conjugue",
      contentType: ContentType.TEXT,
      content: `# Radical et terminaison

## La structure d'un verbe conjugue

Un verbe conjugue est compose de deux parties :

- Le **radical** : la partie qui ne change pas (ou peu)
- La **terminaison** : la partie qui change selon la personne et le temps

## Exemple avec "chanter"

| Personne | Radical | Terminaison | Verbe conjugue |
|----------|---------|-------------|----------------|
| je | chant | -e | chante |
| tu | chant | -es | chantes |
| il/elle | chant | -e | chante |
| nous | chant | -ons | chantons |
| vous | chant | -ez | chantez |
| ils/elles | chant | -ent | chantent |

## Comment trouver le radical ?

Pour les verbes du **1er groupe** (en -er) :
> Prends l'infinitif et enleve le -er

- Chanter → chant-
- Manger → mang-
- Parler → parl-

Pour les verbes du **2eme groupe** (en -ir qui font -issons) :
> Prends l'infinitif et enleve le -ir

- Finir → fin- (au singulier) / finiss- (au pluriel)
- Choisir → chois- / choiss-

## Les verbes du 3eme groupe

Attention ! Les verbes du 3eme groupe sont irreguliers.
Leur radical peut changer au sein d'un meme temps.

**Exemple avec "venir" au present :**
- je viens (radical : vien-)
- nous venons (radical : ven-)
- ils viennent (radical : vienn-)

## A retenir

- Le radical porte le **sens** du verbe
- La terminaison indique la **personne** et le **temps**
- Les verbes reguliers gardent le meme radical
- Les verbes irreguliers peuvent avoir plusieurs radicaux`,
      duration: 12,
      position: 2,
      chapterId: ch1Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC1_3 = await prisma.lesson.create({
    data: {
      title: "Quiz : Les bases",
      description: "Verifie ta comprehension des bases de la conjugaison",
      contentType: ContentType.QUIZ,
      duration: 10,
      position: 3,
      chapterId: ch1Conjugaison.id,
      isPublished: true,
    },
  });

  const quizC1 = await prisma.quiz.create({
    data: {
      title: "Quiz : Les bases de la conjugaison",
      description:
        "Teste tes connaissances sur les groupes et la structure des verbes",
      lessonId: lessonC1_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizC1.id,
        question: "A quel groupe appartient le verbe 'manger' ?",
        options: [
          { id: "a", text: "1er groupe", isCorrect: true },
          { id: "b", text: "2eme groupe", isCorrect: false },
          { id: "c", text: "3eme groupe", isCorrect: false },
          { id: "d", text: "Aucun groupe", isCorrect: false },
        ],
        explanation:
          "Manger se termine par -er a l'infinitif (et ce n'est pas aller), c'est donc un verbe du 1er groupe.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizC1.id,
        question: "A quel groupe appartient le verbe 'finir' ?",
        options: [
          { id: "a", text: "1er groupe", isCorrect: false },
          { id: "b", text: "2eme groupe", isCorrect: true },
          { id: "c", text: "3eme groupe", isCorrect: false },
          { id: "d", text: "Aucun groupe", isCorrect: false },
        ],
        explanation:
          "Finir se termine par -ir et fait 'nous finissons'. C'est un verbe du 2eme groupe.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizC1.id,
        question: "Quel est le radical du verbe 'parler' ?",
        options: [
          { id: "a", text: "parl-", isCorrect: true },
          { id: "b", text: "parle-", isCorrect: false },
          { id: "c", text: "par-", isCorrect: false },
          { id: "d", text: "parler-", isCorrect: false },
        ],
        explanation:
          "Pour les verbes en -er, on enleve -er pour trouver le radical : parler → parl-",
        points: 1,
        position: 3,
      },
      {
        quizId: quizC1.id,
        question: "Le verbe 'aller' appartient a quel groupe ?",
        options: [
          {
            id: "a",
            text: "1er groupe (car il finit en -er)",
            isCorrect: false,
          },
          {
            id: "b",
            text: "3eme groupe (c'est une exception)",
            isCorrect: true,
          },
          { id: "c", text: "2eme groupe", isCorrect: false },
          { id: "d", text: "Il n'a pas de groupe", isCorrect: false },
        ],
        explanation:
          "Meme s'il finit en -er, 'aller' est un verbe du 3eme groupe car il est irregulier (je vais, nous allons...).",
        points: 1,
        position: 4,
      },
      {
        quizId: quizC1.id,
        question: "Dans 'nous chantons', quelle est la terminaison ?",
        options: [
          { id: "a", text: "-tons", isCorrect: false },
          { id: "b", text: "-ons", isCorrect: true },
          { id: "c", text: "-chantons", isCorrect: false },
          { id: "d", text: "-s", isCorrect: false },
        ],
        explanation:
          "Le radical est 'chant-' et la terminaison est '-ons' (terminaison du present pour 'nous').",
        points: 1,
        position: 5,
      },
    ],
  });

  // Chapter 2: Le present de l'indicatif
  const ch2Conjugaison = await prisma.chapter.create({
    data: {
      title: "Le present de l'indicatif",
      description: "Maitriser le temps le plus utilise en francais",
      position: 2,
      courseId: courseConjugaison.id,
      isPublished: true,
    },
  });

  const lessonC2_1 = await prisma.lesson.create({
    data: {
      title: "Les verbes du 1er groupe au present",
      description: "Conjuguer les verbes en -er au present",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=present-1er-groupe",
      duration: 12,
      position: 1,
      chapterId: ch2Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC2_2 = await prisma.lesson.create({
    data: {
      title: "Les verbes du 2eme groupe au present",
      description: "Conjuguer les verbes en -ir (type finir)",
      contentType: ContentType.TEXT,
      content: `# Les verbes du 2eme groupe au present

## Comment reconnaitre un verbe du 2eme groupe ?

Un verbe du 2eme groupe :
- Se termine par **-ir** a l'infinitif
- Fait **-issons** a la 1ere personne du pluriel

**Exemples :**
- Finir → nous finissons ✓ (2eme groupe)
- Choisir → nous choisissons ✓ (2eme groupe)
- Partir → nous partons ✗ (3eme groupe !)

## Les terminaisons du present (2eme groupe)

| Personne | Terminaison | Exemple avec "finir" |
|----------|-------------|----------------------|
| je | -is | je finis |
| tu | -is | tu finis |
| il/elle | -it | il finit |
| nous | -issons | nous finissons |
| vous | -issez | vous finissez |
| ils/elles | -issent | ils finissent |

## Astuce pour se souvenir

Au singulier : **-is, -is, -it** (toujours le meme son "i")
Au pluriel : **-iss** apparait toujours !

## Verbes courants du 2eme groupe

| Verbe | je | nous |
|-------|-----|------|
| choisir | je choisis | nous choisissons |
| reussir | je reussis | nous reussissons |
| grandir | je grandis | nous grandissons |
| rougir | je rougis | nous rougissons |
| reflechir | je reflechis | nous reflechissons |
| guerir | je gueris | nous guerissons |

## Attention aux faux amis !

Ces verbes en -ir ne sont **PAS** du 2eme groupe :
- Partir (nous partons) → 3eme groupe
- Venir (nous venons) → 3eme groupe
- Dormir (nous dormons) → 3eme groupe
- Courir (nous courons) → 3eme groupe

> Teste toujours avec "nous" : s'il n'y a pas "-issons", c'est le 3eme groupe !`,
      duration: 15,
      position: 2,
      chapterId: ch2Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC2_3 = await prisma.lesson.create({
    data: {
      title: "Les verbes etre et avoir au present",
      description: "Les deux verbes essentiels a connaitre par coeur",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=etre-avoir-present",
      duration: 10,
      position: 3,
      chapterId: ch2Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC2_4 = await prisma.lesson.create({
    data: {
      title: "Quiz : Le present de l'indicatif",
      description: "Teste tes connaissances sur le present",
      contentType: ContentType.QUIZ,
      duration: 15,
      position: 4,
      chapterId: ch2Conjugaison.id,
      isPublished: true,
    },
  });

  const quizC2 = await prisma.quiz.create({
    data: {
      title: "Quiz : Le present de l'indicatif",
      description: "Verifie ta maitrise du present pour les 3 groupes",
      lessonId: lessonC2_4.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizC2.id,
        question: "Conjugue : Je (manger) une pomme.",
        options: [
          { id: "a", text: "mange", isCorrect: true },
          { id: "b", text: "manges", isCorrect: false },
          { id: "c", text: "mangent", isCorrect: false },
          { id: "d", text: "mangeons", isCorrect: false },
        ],
        explanation: "Je + verbe du 1er groupe : terminaison -e. Je mange.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizC2.id,
        question: "Conjugue : Nous (finir) nos devoirs.",
        options: [
          { id: "a", text: "finons", isCorrect: false },
          { id: "b", text: "finissons", isCorrect: true },
          { id: "c", text: "finisons", isCorrect: false },
          { id: "d", text: "finissez", isCorrect: false },
        ],
        explanation:
          "Nous + verbe du 2eme groupe : terminaison -issons. Nous finissons.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizC2.id,
        question: "Conjugue : Tu (etre) content.",
        options: [
          { id: "a", text: "est", isCorrect: false },
          { id: "b", text: "es", isCorrect: true },
          { id: "c", text: "suis", isCorrect: false },
          { id: "d", text: "etes", isCorrect: false },
        ],
        explanation:
          "Tu es (verbe etre au present, 2eme personne du singulier).",
        points: 1,
        position: 3,
      },
      {
        quizId: quizC2.id,
        question: "Conjugue : Ils (avoir) faim.",
        options: [
          { id: "a", text: "as", isCorrect: false },
          { id: "b", text: "avons", isCorrect: false },
          { id: "c", text: "ont", isCorrect: true },
          { id: "d", text: "avez", isCorrect: false },
        ],
        explanation:
          "Ils ont (verbe avoir au present, 3eme personne du pluriel).",
        points: 1,
        position: 4,
      },
      {
        quizId: quizC2.id,
        question: "Trouve l'erreur : 'Elle choisit une robe rouge.'",
        options: [
          {
            id: "a",
            text: "Pas d'erreur, la phrase est correcte",
            isCorrect: true,
          },
          { id: "b", text: "On dit 'choisis'", isCorrect: false },
          { id: "c", text: "On dit 'choisie'", isCorrect: false },
          { id: "d", text: "On dit 'choisissent'", isCorrect: false },
        ],
        explanation:
          "Elle + verbe du 2eme groupe : terminaison -it. 'Elle choisit' est correct !",
        points: 2,
        position: 5,
      },
    ],
  });

  // Chapter 3: L'imparfait
  const ch3Conjugaison = await prisma.chapter.create({
    data: {
      title: "L'imparfait de l'indicatif",
      description: "Le temps du passe pour decrire et raconter",
      position: 3,
      courseId: courseConjugaison.id,
      isPublished: true,
    },
  });

  const lessonC3_1 = await prisma.lesson.create({
    data: {
      title: "Formation de l'imparfait",
      description: "Une regle simple pour tous les verbes !",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=imparfait-formation",
      duration: 12,
      position: 1,
      chapterId: ch3Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC3_2 = await prisma.lesson.create({
    data: {
      title: "Les terminaisons de l'imparfait",
      description: "Les memes terminaisons pour tous les verbes",
      contentType: ContentType.TEXT,
      content: `# Les terminaisons de l'imparfait

## La bonne nouvelle !

L'imparfait a les **memes terminaisons pour TOUS les verbes** (meme les irreguliers) !

## Les terminaisons a connaitre

| Personne | Terminaison |
|----------|-------------|
| je | -ais |
| tu | -ais |
| il/elle | -ait |
| nous | -ions |
| vous | -iez |
| ils/elles | -aient |

## Astuce pour se souvenir

- Au singulier : toujours le son "è" → -ais, -ais, -ait
- "Nous" et "vous" : toujours un "i" → -ions, -iez
- Ils/elles : -aient (4 lettres muettes !)

## Comment former l'imparfait ?

**Regle universelle :**

1. Prends le verbe conjugue a "nous" au present
2. Enleve "-ons"
3. Ajoute les terminaisons de l'imparfait

## Exemples

### Chanter (1er groupe)
- Nous chantons → chant-
- J'imparfait : je chant**ais**, tu chant**ais**, il chant**ait**...

### Finir (2eme groupe)
- Nous finissons → finiss-
- J'imparfait : je finiss**ais**, tu finiss**ais**, il finiss**ait**...

### Prendre (3eme groupe)
- Nous prenons → pren-
- J'imparfait : je pren**ais**, tu pren**ais**, il pren**ait**...

## Cas particulier : ETRE

Seul le verbe "etre" ne suit pas la regle :
- J'etais, tu etais, il etait
- Nous etions, vous etiez
- Ils etaient

> Mais les terminaisons sont les memes !

## Tableau recapitulatif

| Verbe | Radical (de "nous" au present) | Je a l'imparfait |
|-------|-------------------------------|------------------|
| manger | mange- (nous mangeons) | je mangeais |
| choisir | choisiss- | je choisissais |
| voir | voy- (nous voyons) | je voyais |
| faire | fais- (nous faisons) | je faisais |`,
      duration: 15,
      position: 2,
      chapterId: ch3Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC3_3 = await prisma.lesson.create({
    data: {
      title: "Quiz : L'imparfait",
      description: "Verifie ta maitrise de l'imparfait",
      contentType: ContentType.QUIZ,
      duration: 10,
      position: 3,
      chapterId: ch3Conjugaison.id,
      isPublished: true,
    },
  });

  const quizC3 = await prisma.quiz.create({
    data: {
      title: "Quiz : L'imparfait de l'indicatif",
      description: "Teste tes connaissances sur l'imparfait",
      lessonId: lessonC3_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizC3.id,
        question: "Conjugue : Je (parler) francais.",
        options: [
          { id: "a", text: "parlai", isCorrect: false },
          { id: "b", text: "parlais", isCorrect: true },
          { id: "c", text: "parle", isCorrect: false },
          { id: "d", text: "parlait", isCorrect: false },
        ],
        explanation: "Je + imparfait : terminaison -ais. Je parlais.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizC3.id,
        question: "Conjugue : Nous (avoir) peur.",
        options: [
          { id: "a", text: "avons", isCorrect: false },
          { id: "b", text: "avions", isCorrect: true },
          { id: "c", text: "avaient", isCorrect: false },
          { id: "d", text: "aviez", isCorrect: false },
        ],
        explanation: "Nous + imparfait : terminaison -ions. Nous avions.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizC3.id,
        question: "Conjugue : Ils (finir) leurs devoirs.",
        options: [
          { id: "a", text: "finissait", isCorrect: false },
          { id: "b", text: "finissaient", isCorrect: true },
          { id: "c", text: "finissons", isCorrect: false },
          { id: "d", text: "finissiez", isCorrect: false },
        ],
        explanation:
          "Ils + 2eme groupe a l'imparfait : radical finiss- + -aient. Ils finissaient.",
        points: 1,
        position: 3,
      },
      {
        quizId: quizC3.id,
        question: "Conjugue : Tu (etre) content.",
        options: [
          { id: "a", text: "es", isCorrect: false },
          { id: "b", text: "etait", isCorrect: false },
          { id: "c", text: "etais", isCorrect: true },
          { id: "d", text: "etions", isCorrect: false },
        ],
        explanation: "Tu + etre a l'imparfait : tu etais.",
        points: 1,
        position: 4,
      },
      {
        quizId: quizC3.id,
        question: "Quel est le radical de 'faire' a l'imparfait ?",
        options: [
          { id: "a", text: "fais-", isCorrect: true },
          { id: "b", text: "fer-", isCorrect: false },
          { id: "c", text: "fair-", isCorrect: false },
          { id: "d", text: "font-", isCorrect: false },
        ],
        explanation:
          "Nous faisons au present → radical fais-. Je faisais a l'imparfait.",
        points: 2,
        position: 5,
      },
    ],
  });

  // Chapter 4: Futur simple
  const ch4Conjugaison = await prisma.chapter.create({
    data: {
      title: "Le futur simple",
      description: "Parler de ce qui va se passer",
      position: 4,
      courseId: courseConjugaison.id,
      isPublished: true,
    },
  });

  const lessonC4_1 = await prisma.lesson.create({
    data: {
      title: "Formation du futur simple",
      description: "Comprendre comment se construit le futur",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=futur-simple",
      duration: 12,
      position: 1,
      chapterId: ch4Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC4_2 = await prisma.lesson.create({
    data: {
      title: "Le futur des verbes irreguliers",
      description: "Les verbes a connaitre par coeur",
      contentType: ContentType.TEXT,
      content: `# Le futur des verbes irreguliers

## Les terminaisons du futur (pour tous les verbes)

| Personne | Terminaison |
|----------|-------------|
| je | -rai |
| tu | -ras |
| il/elle | -ra |
| nous | -rons |
| vous | -rez |
| ils/elles | -ront |

## Astuce memoire

Toutes les terminaisons commencent par **R** !
Et ressemblent au verbe **avoir** au present :
- ai, as, a, ons, ez, ont

## Les verbes irreguliers a connaitre

Ces verbes ont un **radical special** au futur :

| Verbe | Radical futur | Exemple |
|-------|--------------|---------|
| etre | ser- | je serai |
| avoir | aur- | j'aurai |
| aller | ir- | j'irai |
| faire | fer- | je ferai |
| venir | viendr- | je viendrai |
| voir | verr- | je verrai |
| pouvoir | pourr- | je pourrai |
| vouloir | voudr- | je voudrai |
| savoir | saur- | je saurai |
| devoir | devr- | je devrai |
| envoyer | enverr- | j'enverrai |
| courir | courr- | je courrai |
| mourir | mourr- | je mourrai |

## Exemples complets

### ETRE
je serai, tu seras, il sera, nous serons, vous serez, ils seront

### AVOIR
j'aurai, tu auras, il aura, nous aurons, vous aurez, ils auront

### ALLER
j'irai, tu iras, il ira, nous irons, vous irez, ils iront

### FAIRE
je ferai, tu feras, il fera, nous ferons, vous ferez, ils feront

## Astuces pour retenir

1. **Etre** : pense a "sera" comme dans "serenite"
2. **Avoir** : pense au son "or" → j'aurai (de l'or !)
3. **Aller** : tres court → ir + terminaisons
4. **Faire** : le "ai" devient "e" → fer-

## Attention aux doubles consonnes !

Certains verbes doublent leur consonne :
- Voir → je ver**r**ai (deux R)
- Pouvoir → je pour**r**ai (deux R)
- Courir → je cour**r**ai (deux R)`,
      duration: 15,
      position: 2,
      chapterId: ch4Conjugaison.id,
      isPublished: true,
    },
  });

  const lessonC4_3 = await prisma.lesson.create({
    data: {
      title: "Quiz final : La conjugaison",
      description: "Evaluation finale sur tous les temps etudies",
      contentType: ContentType.QUIZ,
      duration: 20,
      position: 3,
      chapterId: ch4Conjugaison.id,
      isPublished: true,
    },
  });

  const quizC4 = await prisma.quiz.create({
    data: {
      title: "Quiz final : Maitriser la conjugaison",
      description:
        "Evaluation complete sur le present, l'imparfait et le futur",
      lessonId: lessonC4_3.id,
      passingScore: 75,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizC4.id,
        question: "Conjugue au futur : Je (etre) content.",
        options: [
          { id: "a", text: "serai", isCorrect: true },
          { id: "b", text: "etais", isCorrect: false },
          { id: "c", text: "suis", isCorrect: false },
          { id: "d", text: "serais", isCorrect: false },
        ],
        explanation: "Etre au futur avec je : je serai.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizC4.id,
        question: "Conjugue au futur : Nous (avoir) le temps.",
        options: [
          { id: "a", text: "avons", isCorrect: false },
          { id: "b", text: "avions", isCorrect: false },
          { id: "c", text: "aurons", isCorrect: true },
          { id: "d", text: "aurions", isCorrect: false },
        ],
        explanation: "Avoir au futur avec nous : nous aurons.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizC4.id,
        question: "Conjugue au futur : Ils (aller) au cinema.",
        options: [
          { id: "a", text: "vont", isCorrect: false },
          { id: "b", text: "iront", isCorrect: true },
          { id: "c", text: "allaient", isCorrect: false },
          { id: "d", text: "alleront", isCorrect: false },
        ],
        explanation: "Aller au futur avec ils : ils iront (radical ir-).",
        points: 1,
        position: 3,
      },
      {
        quizId: quizC4.id,
        question: "Quel temps est utilise dans : 'Il faisait beau hier.' ?",
        options: [
          { id: "a", text: "Present", isCorrect: false },
          { id: "b", text: "Imparfait", isCorrect: true },
          { id: "c", text: "Futur simple", isCorrect: false },
          { id: "d", text: "Passe compose", isCorrect: false },
        ],
        explanation:
          "'Faisait' est conjugue a l'imparfait (terminaison -ait + contexte passe 'hier').",
        points: 2,
        position: 4,
      },
      {
        quizId: quizC4.id,
        question: "Conjugue au futur : Tu (voir) le resultat demain.",
        options: [
          { id: "a", text: "vois", isCorrect: false },
          { id: "b", text: "verras", isCorrect: true },
          { id: "c", text: "voyais", isCorrect: false },
          { id: "d", text: "verra", isCorrect: false },
        ],
        explanation: "Voir au futur avec tu : tu verras (radical verr- + -as).",
        points: 2,
        position: 5,
      },
    ],
  });

  console.log("Created Course 2: Conjugaison 6eme");

  // ============ COURSE 3: SCIENCES 5EME - CORPS HUMAIN ============

  const courseSciences = await prisma.course.create({
    data: {
      title: "Le Corps Humain - Sciences 5eme",
      slug: "corps-humain-sciences-5eme",
      subtitle: "Decouvre le fonctionnement de ton corps",
      description: `Un voyage fascinant a la decouverte du corps humain ! Ce cours de sciences pour les eleves de 5eme explore les principaux systemes qui font fonctionner notre organisme.

A travers des explications claires, des schemas interactifs et des experiences amusantes, votre enfant comprendra :
- Le systeme digestif et la nutrition
- Le systeme respiratoire et les echanges gazeux
- Le systeme circulatoire et le role du coeur
- Les bases du systeme nerveux

Un cours passionnant qui donne envie d'en savoir plus sur la science !`,
      subject: Subject.SVT,
      gradeLevel: GradeLevel.CINQUIEME,
      price: 2190, // 21.90 EUR
      imageUrl:
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
      authorId: teacherMath.id,
      isPublished: true,
      publishedAt: new Date(),
      totalStudents: 189,
      learningOutcomes: [
        "Comprendre le trajet des aliments de la bouche a l'intestin",
        "Expliquer le role des poumons et les echanges gazeux",
        "Decrire la circulation sanguine et le role du coeur",
        "Identifier les composants du sang et leur fonction",
        "Comprendre le role du cerveau et du systeme nerveux",
      ],
      requirements: [
        "Notions de base en sciences (CM2)",
        "Curiosite pour le fonctionnement du corps",
      ],
    },
  });

  // Chapter 1: Le systeme digestif
  const ch1Sciences = await prisma.chapter.create({
    data: {
      title: "Le systeme digestif",
      description: "Comprendre comment notre corps transforme les aliments",
      position: 1,
      courseId: courseSciences.id,
      isPublished: true,
    },
  });

  const lessonS1_1 = await prisma.lesson.create({
    data: {
      title: "Le voyage des aliments",
      description: "Suivre le trajet des aliments dans le corps",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=digestion-trajet",
      duration: 15,
      position: 1,
      chapterId: ch1Sciences.id,
      isPublished: true,
      isFreePreview: true,
    },
  });

  const lessonS1_2 = await prisma.lesson.create({
    data: {
      title: "Les organes de la digestion",
      description: "Decouvrir le role de chaque organe digestif",
      contentType: ContentType.TEXT,
      content: `# Les organes de la digestion

## Le tube digestif

Le tube digestif est un long tube d'environ **9 metres** qui traverse notre corps. Il comprend plusieurs organes :

### 1. La bouche

C'est le point de depart de la digestion !

**Role :**
- Les **dents** broient les aliments (digestion mecanique)
- La **salive** commence la digestion de l'amidon (digestion chimique)
- La **langue** aide a former le bol alimentaire

### 2. L'oesophage

C'est le tube qui relie la bouche a l'estomac.

**Caracteristiques :**
- Longueur : environ 25 cm
- Les aliments descendent grace aux contractions musculaires (peristaltisme)
- Duree du passage : quelques secondes

### 3. L'estomac

C'est une poche musculeuse en forme de "J".

**Role :**
- Malaxe les aliments (jusqu'a 3 heures !)
- Secrete des sucs gastriques acides
- Commence la digestion des proteines
- Transforme les aliments en "bouillie" : le chyme

### 4. L'intestin grele

C'est le plus long organe du tube digestif : **6 a 7 metres** !

**Role :**
- Finit la digestion chimique
- Absorbe les nutriments grace aux villosites
- Les nutriments passent dans le sang

### 5. Le gros intestin (colon)

Le dernier segment du tube digestif.

**Role :**
- Absorbe l'eau et les sels mineraux
- Forme les dechets (selles)
- Contient des milliards de bacteries utiles

## Les glandes annexes

Ces organes produisent des substances qui aident la digestion :

| Organe | Production | Role |
|--------|------------|------|
| Glandes salivaires | Salive | Digestion de l'amidon |
| Foie | Bile | Digestion des graisses |
| Pancreas | Suc pancreatique | Digestion complete |

## Schema recapitulatif

Le trajet : Bouche → Oesophage → Estomac → Intestin grele → Gros intestin → Anus

> La digestion complete dure entre 24 et 72 heures !`,
      duration: 20,
      position: 2,
      chapterId: ch1Sciences.id,
      isPublished: true,
    },
  });

  const lessonS1_3 = await prisma.lesson.create({
    data: {
      title: "Quiz : Le systeme digestif",
      description: "Teste tes connaissances sur la digestion",
      contentType: ContentType.QUIZ,
      duration: 10,
      position: 3,
      chapterId: ch1Sciences.id,
      isPublished: true,
    },
  });

  const quizS1 = await prisma.quiz.create({
    data: {
      title: "Quiz : Le systeme digestif",
      description: "Verifie ta comprehension du systeme digestif",
      lessonId: lessonS1_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizS1.id,
        question: "Quel est le premier organe du tube digestif ?",
        options: [
          { id: "a", text: "L'estomac", isCorrect: false },
          { id: "b", text: "La bouche", isCorrect: true },
          { id: "c", text: "L'oesophage", isCorrect: false },
          { id: "d", text: "L'intestin", isCorrect: false },
        ],
        explanation:
          "La bouche est le point d'entree des aliments et le premier organe de la digestion.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizS1.id,
        question: "Quelle est la longueur approximative de l'intestin grele ?",
        options: [
          { id: "a", text: "1 metre", isCorrect: false },
          { id: "b", text: "3 metres", isCorrect: false },
          { id: "c", text: "6-7 metres", isCorrect: true },
          { id: "d", text: "10 metres", isCorrect: false },
        ],
        explanation:
          "L'intestin grele mesure environ 6 a 7 metres, c'est le plus long organe du tube digestif !",
        points: 1,
        position: 2,
      },
      {
        quizId: quizS1.id,
        question: "Quel organe produit la bile ?",
        options: [
          { id: "a", text: "L'estomac", isCorrect: false },
          { id: "b", text: "Le pancreas", isCorrect: false },
          { id: "c", text: "Le foie", isCorrect: true },
          { id: "d", text: "L'intestin grele", isCorrect: false },
        ],
        explanation: "Le foie produit la bile qui aide a digerer les graisses.",
        points: 1,
        position: 3,
      },
      {
        quizId: quizS1.id,
        question: "Ou sont principalement absorbes les nutriments ?",
        options: [
          { id: "a", text: "Dans l'estomac", isCorrect: false },
          { id: "b", text: "Dans l'intestin grele", isCorrect: true },
          { id: "c", text: "Dans le gros intestin", isCorrect: false },
          { id: "d", text: "Dans l'oesophage", isCorrect: false },
        ],
        explanation:
          "L'intestin grele absorbe les nutriments grace a ses villosites qui augmentent la surface d'absorption.",
        points: 1,
        position: 4,
      },
      {
        quizId: quizS1.id,
        question: "Combien de temps dure la digestion complete ?",
        options: [
          { id: "a", text: "Quelques minutes", isCorrect: false },
          { id: "b", text: "2-3 heures", isCorrect: false },
          { id: "c", text: "24 a 72 heures", isCorrect: true },
          { id: "d", text: "Une semaine", isCorrect: false },
        ],
        explanation:
          "La digestion complete, de la bouche a l'evacuation des dechets, prend entre 24 et 72 heures.",
        points: 1,
        position: 5,
      },
    ],
  });

  // Chapter 2: Le systeme respiratoire
  const ch2Sciences = await prisma.chapter.create({
    data: {
      title: "Le systeme respiratoire",
      description: "Comprendre comment on respire et echangeons les gaz",
      position: 2,
      courseId: courseSciences.id,
      isPublished: true,
    },
  });

  const lessonS2_1 = await prisma.lesson.create({
    data: {
      title: "L'appareil respiratoire",
      description: "Decouvrir les organes de la respiration",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=respiration-organes",
      duration: 12,
      position: 1,
      chapterId: ch2Sciences.id,
      isPublished: true,
    },
  });

  const lessonS2_2 = await prisma.lesson.create({
    data: {
      title: "Les echanges gazeux",
      description: "Comprendre comment l'oxygene entre dans le sang",
      contentType: ContentType.TEXT,
      content: `# Les echanges gazeux

## La respiration en deux temps

### L'inspiration (entree d'air)
1. Les muscles intercostaux et le diaphragme se contractent
2. La cage thoracique s'elargit
3. L'air entre dans les poumons

### L'expiration (sortie d'air)
1. Les muscles se relachent
2. La cage thoracique se resserre
3. L'air est expulse des poumons

## Le trajet de l'air

L'air suit ce chemin :

**Nez/Bouche → Pharynx → Larynx → Trachee → Bronches → Bronchioles → Alveoles**

## Les alveoles pulmonaires

Ce sont de minuscules "sacs" au bout des bronchioles.

**Caracteristiques :**
- Environ 300 millions d'alveoles par poumon !
- Surface totale : 100-140 m² (un terrain de tennis !)
- Paroi tres fine pour faciliter les echanges

## Les echanges dans les alveoles

| Air inspire | Air expire |
|-------------|------------|
| 21% oxygene (O₂) | 16% oxygene |
| 0.04% CO₂ | 4% CO₂ |
| 78% azote | 78% azote |

**Ce qui se passe :**
1. L'O₂ passe de l'air vers le sang (il traverse la paroi de l'alveole)
2. Le CO₂ passe du sang vers l'air
3. Ces echanges se font par **diffusion** (du plus concentre vers le moins concentre)

## Le role du sang

- Les **globules rouges** transportent l'oxygene grace a l'hemoglobine
- L'oxygene est distribue a toutes les cellules du corps
- Le CO₂ (dechet) est ramene aux poumons pour etre elimine

## Frequence respiratoire

| Situation | Respirations/minute |
|-----------|---------------------|
| Au repos | 12-20 |
| Exercice leger | 20-40 |
| Exercice intense | 40-60 |

> Notre corps adapte automatiquement la frequence respiratoire selon nos besoins en oxygene !`,
      duration: 18,
      position: 2,
      chapterId: ch2Sciences.id,
      isPublished: true,
    },
  });

  const lessonS2_3 = await prisma.lesson.create({
    data: {
      title: "Quiz : La respiration",
      description: "Verifie ta comprehension du systeme respiratoire",
      contentType: ContentType.QUIZ,
      duration: 10,
      position: 3,
      chapterId: ch2Sciences.id,
      isPublished: true,
    },
  });

  const quizS2 = await prisma.quiz.create({
    data: {
      title: "Quiz : Le systeme respiratoire",
      description: "Teste tes connaissances sur la respiration",
      lessonId: lessonS2_3.id,
      passingScore: 70,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizS2.id,
        question: "Ou se produisent les echanges gazeux dans les poumons ?",
        options: [
          { id: "a", text: "Dans la trachee", isCorrect: false },
          { id: "b", text: "Dans les bronches", isCorrect: false },
          { id: "c", text: "Dans les alveoles", isCorrect: true },
          { id: "d", text: "Dans le larynx", isCorrect: false },
        ],
        explanation:
          "Les echanges gazeux (O₂ et CO₂) se font dans les alveoles pulmonaires.",
        points: 1,
        position: 1,
      },
      {
        quizId: quizS2.id,
        question: "Quel gaz passe du sang vers l'air dans les poumons ?",
        options: [
          { id: "a", text: "L'oxygene (O₂)", isCorrect: false },
          { id: "b", text: "Le dioxyde de carbone (CO₂)", isCorrect: true },
          { id: "c", text: "L'azote", isCorrect: false },
          { id: "d", text: "L'hydrogene", isCorrect: false },
        ],
        explanation:
          "Le CO₂, dechet de nos cellules, est elimine par les poumons lors de l'expiration.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizS2.id,
        question: "Quelle cellule du sang transporte l'oxygene ?",
        options: [
          { id: "a", text: "Les globules blancs", isCorrect: false },
          { id: "b", text: "Les plaquettes", isCorrect: false },
          { id: "c", text: "Les globules rouges", isCorrect: true },
          { id: "d", text: "Le plasma", isCorrect: false },
        ],
        explanation:
          "Les globules rouges contiennent l'hemoglobine qui fixe l'oxygene.",
        points: 1,
        position: 3,
      },
      {
        quizId: quizS2.id,
        question: "Combien y a-t-il environ d'alveoles dans chaque poumon ?",
        options: [
          { id: "a", text: "1 000", isCorrect: false },
          { id: "b", text: "100 000", isCorrect: false },
          { id: "c", text: "300 millions", isCorrect: true },
          { id: "d", text: "1 milliard", isCorrect: false },
        ],
        explanation: "Chaque poumon contient environ 300 millions d'alveoles !",
        points: 1,
        position: 4,
      },
      {
        quizId: quizS2.id,
        question: "Que se passe-t-il pendant l'inspiration ?",
        options: [
          {
            id: "a",
            text: "La cage thoracique se resserre",
            isCorrect: false,
          },
          {
            id: "b",
            text: "La cage thoracique s'elargit et l'air entre",
            isCorrect: true,
          },
          { id: "c", text: "L'air sort des poumons", isCorrect: false },
          { id: "d", text: "Le diaphragme se relache", isCorrect: false },
        ],
        explanation:
          "Pendant l'inspiration, le diaphragme se contracte, la cage thoracique s'elargit et l'air entre.",
        points: 2,
        position: 5,
      },
    ],
  });

  // Chapter 3: Le systeme circulatoire
  const ch3Sciences = await prisma.chapter.create({
    data: {
      title: "Le systeme circulatoire",
      description: "Decouvrir le role du coeur et la circulation du sang",
      position: 3,
      courseId: courseSciences.id,
      isPublished: true,
    },
  });

  const lessonS3_1 = await prisma.lesson.create({
    data: {
      title: "Le coeur : une pompe extraordinaire",
      description: "Comprendre le fonctionnement du coeur",
      contentType: ContentType.VIDEO,
      videoUrl: "https://www.youtube.com/watch?v=coeur-fonctionnement",
      duration: 15,
      position: 1,
      chapterId: ch3Sciences.id,
      isPublished: true,
    },
  });

  const lessonS3_2 = await prisma.lesson.create({
    data: {
      title: "La circulation sanguine",
      description: "Suivre le trajet du sang dans le corps",
      contentType: ContentType.TEXT,
      content: `# La circulation sanguine

## Le coeur : moteur de la circulation

Le coeur est un muscle creux de la taille d'un poing qui bat environ **100 000 fois par jour** !

### Les 4 cavites du coeur

| Cavite | Position | Role |
|--------|----------|------|
| Oreillette droite | Haut droite | Recoit le sang pauvre en O₂ |
| Ventricule droit | Bas droite | Envoie le sang aux poumons |
| Oreillette gauche | Haut gauche | Recoit le sang riche en O₂ |
| Ventricule gauche | Bas gauche | Envoie le sang au corps |

## Les deux circulations

### 1. La petite circulation (pulmonaire)

**Trajet :** Coeur → Poumons → Coeur

1. Le ventricule droit envoie le sang pauvre en O₂ vers les poumons
2. Dans les alveoles, le sang se charge en O₂ et libere le CO₂
3. Le sang riche en O₂ revient a l'oreillette gauche

### 2. La grande circulation (systemique)

**Trajet :** Coeur → Corps entier → Coeur

1. Le ventricule gauche envoie le sang riche en O₂ dans tout le corps
2. Les cellules utilisent l'O₂ et produisent du CO₂
3. Le sang pauvre en O₂ revient a l'oreillette droite

## Les vaisseaux sanguins

| Type | Caracteristique | Role |
|------|-----------------|------|
| **Arteres** | Parois epaisses, elastiques | Transportent le sang du coeur vers les organes |
| **Veines** | Parois fines, possedent des valvules | Ramenent le sang des organes vers le coeur |
| **Capillaires** | Tres fins (1 cellule d'epaisseur) | Echanges entre le sang et les cellules |

## Quelques chiffres impressionnants

- Longueur totale des vaisseaux : **100 000 km** (2,5 fois le tour de la Terre !)
- Volume de sang pompe par jour : **7 200 litres**
- Vitesse du sang dans l'aorte : **1 m/s**

## Le sang : composition

| Composant | % du sang | Fonction |
|-----------|-----------|----------|
| Plasma | 55% | Liquide qui transporte tout |
| Globules rouges | 44% | Transport de l'O₂ |
| Globules blancs | <1% | Defense immunitaire |
| Plaquettes | <1% | Coagulation (arret des saignements) |`,
      duration: 20,
      position: 2,
      chapterId: ch3Sciences.id,
      isPublished: true,
    },
  });

  const lessonS3_3 = await prisma.lesson.create({
    data: {
      title: "Quiz final : Le corps humain",
      description: "Evaluation complete sur les systemes etudies",
      contentType: ContentType.QUIZ,
      duration: 15,
      position: 3,
      chapterId: ch3Sciences.id,
      isPublished: true,
    },
  });

  const quizS3 = await prisma.quiz.create({
    data: {
      title: "Quiz final : Le corps humain",
      description: "Teste toutes tes connaissances sur le corps humain",
      lessonId: lessonS3_3.id,
      passingScore: 75,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        quizId: quizS3.id,
        question: "Combien de cavites possede le coeur ?",
        options: [
          { id: "a", text: "2", isCorrect: false },
          { id: "b", text: "3", isCorrect: false },
          { id: "c", text: "4", isCorrect: true },
          { id: "d", text: "6", isCorrect: false },
        ],
        explanation:
          "Le coeur possede 4 cavites : 2 oreillettes (haut) et 2 ventricules (bas).",
        points: 1,
        position: 1,
      },
      {
        quizId: quizS3.id,
        question:
          "Quel type de vaisseau transporte le sang du coeur vers les organes ?",
        options: [
          { id: "a", text: "Les veines", isCorrect: false },
          { id: "b", text: "Les arteres", isCorrect: true },
          { id: "c", text: "Les capillaires", isCorrect: false },
          { id: "d", text: "Les bronches", isCorrect: false },
        ],
        explanation:
          "Les arteres transportent le sang du coeur vers les organes.",
        points: 1,
        position: 2,
      },
      {
        quizId: quizS3.id,
        question: "Quel est le role des globules blancs ?",
        options: [
          { id: "a", text: "Transporter l'oxygene", isCorrect: false },
          {
            id: "b",
            text: "Defendre le corps contre les maladies",
            isCorrect: true,
          },
          { id: "c", text: "Permettre la coagulation", isCorrect: false },
          { id: "d", text: "Transporter les nutriments", isCorrect: false },
        ],
        explanation:
          "Les globules blancs font partie du systeme immunitaire et nous defendent contre les infections.",
        points: 1,
        position: 3,
      },
      {
        quizId: quizS3.id,
        question: "Dans quelle circulation le sang va-t-il aux poumons ?",
        options: [
          { id: "a", text: "La grande circulation", isCorrect: false },
          {
            id: "b",
            text: "La petite circulation (pulmonaire)",
            isCorrect: true,
          },
          { id: "c", text: "La circulation lymphatique", isCorrect: false },
          { id: "d", text: "Aucune des reponses", isCorrect: false },
        ],
        explanation:
          "La petite circulation (ou circulation pulmonaire) envoie le sang du coeur droit vers les poumons.",
        points: 2,
        position: 4,
      },
      {
        quizId: quizS3.id,
        question:
          "Remets dans l'ordre le trajet des aliments : Estomac, Bouche, Intestin grele, Oesophage",
        options: [
          {
            id: "a",
            text: "Bouche → Oesophage → Estomac → Intestin grele",
            isCorrect: true,
          },
          {
            id: "b",
            text: "Bouche → Estomac → Oesophage → Intestin grele",
            isCorrect: false,
          },
          {
            id: "c",
            text: "Oesophage → Bouche → Estomac → Intestin grele",
            isCorrect: false,
          },
          {
            id: "d",
            text: "Bouche → Intestin grele → Oesophage → Estomac",
            isCorrect: false,
          },
        ],
        explanation:
          "Les aliments suivent ce trajet : Bouche → Oesophage → Estomac → Intestin grele → Gros intestin.",
        points: 2,
        position: 5,
      },
    ],
  });

  console.log("Created Course 3: Le Corps Humain 5eme");

  // ============ CREATE PURCHASES ============

  const platformFeePercent = 0.3;

  // Parent buys all courses for children
  await prisma.purchase.create({
    data: {
      userId: parent.id,
      courseId: courseFractions.id,
      childId: child1.id, // Lucas (CM2) gets Fractions
      amount: courseFractions.price,
      platformFee: Math.round(courseFractions.price * platformFeePercent),
      teacherRevenue: Math.round(
        courseFractions.price * (1 - platformFeePercent),
      ),
      status: "COMPLETED",
      stripePaymentIntentId:
        "pi_demo_" + Math.random().toString(36).substr(2, 9),
    },
  });

  await prisma.purchase.create({
    data: {
      userId: parent.id,
      courseId: courseConjugaison.id,
      childId: child2.id, // Emma (5eme) gets Conjugaison
      amount: courseConjugaison.price,
      platformFee: Math.round(courseConjugaison.price * platformFeePercent),
      teacherRevenue: Math.round(
        courseConjugaison.price * (1 - platformFeePercent),
      ),
      status: "COMPLETED",
      stripePaymentIntentId:
        "pi_demo_" + Math.random().toString(36).substr(2, 9),
    },
  });

  await prisma.purchase.create({
    data: {
      userId: parent.id,
      courseId: courseSciences.id,
      childId: child2.id, // Emma (5eme) gets Sciences
      amount: courseSciences.price,
      platformFee: Math.round(courseSciences.price * platformFeePercent),
      teacherRevenue: Math.round(
        courseSciences.price * (1 - platformFeePercent),
      ),
      status: "COMPLETED",
      stripePaymentIntentId:
        "pi_demo_" + Math.random().toString(36).substr(2, 9),
    },
  });

  console.log("Created purchases");

  // ============ CREATE PROGRESS ============

  // Lucas has completed some lessons in Fractions course
  const fractionsLessons = await prisma.lesson.findMany({
    where: { chapter: { courseId: courseFractions.id } },
    orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
  });

  // Lucas completed first 5 lessons, with quiz scores
  for (let i = 0; i < Math.min(5, fractionsLessons.length); i++) {
    await prisma.progress.create({
      data: {
        lessonId: fractionsLessons[i].id,
        childId: child1.id,
        isCompleted: true,
        quizScore: i === 2 ? 80 : i === 4 ? 90 : null, // Quiz scores for quiz lessons
        timeSpent: Math.floor(Math.random() * 1200) + 600, // 10-30 min
      },
    });
  }

  // Emma has completed some lessons in Conjugaison
  const conjugaisonLessons = await prisma.lesson.findMany({
    where: { chapter: { courseId: courseConjugaison.id } },
    orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
  });

  for (let i = 0; i < Math.min(3, conjugaisonLessons.length); i++) {
    await prisma.progress.create({
      data: {
        lessonId: conjugaisonLessons[i].id,
        childId: child2.id,
        isCompleted: true,
        quizScore: i === 2 ? 75 : null,
        timeSpent: Math.floor(Math.random() * 900) + 600,
      },
    });
  }

  console.log("Created progress records");

  // ============ CREATE REVIEWS ============

  await prisma.review.create({
    data: {
      rating: 5,
      title: "Excellent cours !",
      comment:
        "Mon fils Lucas a enfin compris les fractions grace a ce cours. Les explications sont claires et les quiz permettent de verifier la comprehension. Je recommande vivement !",
      courseId: courseFractions.id,
      userId: parent.id,
      isVerified: true,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      title: "Tres bon cours de conjugaison",
      comment:
        "Les astuces pour retenir les terminaisons sont vraiment utiles. Emma a fait beaucoup de progres. Seul bemol : j'aurais aime plus d'exercices interactifs.",
      courseId: courseConjugaison.id,
      userId: parent.id,
      isVerified: true,
    },
  });

  console.log("Created reviews");

  // ============ ASSIGN BADGES TO CHILDREN ============

  // Find some badges to assign
  const firstLessonBadge = badges.find((b) => b.code === "first_lesson");
  const fiveLessonsBadge = badges.find((b) => b.code === "five_lessons");
  const streakBadge = badges.find((b) => b.code === "streak_7");
  const quizBadge = badges.find((b) => b.code === "first_quiz");

  if (firstLessonBadge) {
    await prisma.childBadge.create({
      data: {
        childId: child1.id,
        badgeId: firstLessonBadge.id,
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    });
    await prisma.childBadge.create({
      data: {
        childId: child2.id,
        badgeId: firstLessonBadge.id,
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    });
  }

  if (fiveLessonsBadge) {
    await prisma.childBadge.create({
      data: {
        childId: child1.id,
        badgeId: fiveLessonsBadge.id,
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });
  }

  if (streakBadge) {
    await prisma.childBadge.create({
      data: {
        childId: child1.id,
        badgeId: streakBadge.id,
        earnedAt: new Date(), // Today
      },
    });
  }

  if (quizBadge) {
    await prisma.childBadge.create({
      data: {
        childId: child1.id,
        badgeId: quizBadge.id,
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.childBadge.create({
      data: {
        childId: child2.id,
        badgeId: quizBadge.id,
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Assigned badges to children");

  // ============ SUMMARY ============

  console.log("\n" + "=".repeat(60));
  console.log("DATABASE SEEDED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\nTest accounts:");
  console.log("  Teacher 1: sophie.martin@schoolaris.fr / password123");
  console.log("  Teacher 2: pierre.dubois@schoolaris.fr / password123");
  console.log("  Parent:    parent@schoolaris.fr / password123");
  console.log("  Admin:     admin@schoolaris.fr / password123");
  console.log("\nChildren:");
  console.log("  - Lucas Lambert (CM2) - 1250 XP, Level 5, 7-day streak");
  console.log("  - Emma Lambert (5eme) - 890 XP, Level 4, 3-day streak");
  console.log("\nCourses created:");
  console.log("  1. Les Fractions - CM2 (4 chapters, 12 lessons, 4 quizzes)");
  console.log("  2. Conjugaison - 6eme (4 chapters, 11 lessons, 4 quizzes)");
  console.log("  3. Corps Humain - 5eme (3 chapters, 9 lessons, 3 quizzes)");
  console.log("\nBadges: 13 badges created");
  console.log("Progress: Lucas 5 lessons, Emma 3 lessons");
  console.log("Reviews: 2 verified reviews");
  console.log("=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateTable
CREATE TABLE "Text" (
    "id" SERIAL NOT NULL,
    "languageId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "picture_url" TEXT,
    "audio_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLanguageText" (
    "courseId" INTEGER NOT NULL,
    "textId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLanguageText_pkey" PRIMARY KEY ("courseId","textId")
);

-- AddForeignKey
ALTER TABLE "UserLanguageText" ADD CONSTRAINT "UserLanguageText_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "UserLanguage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLanguageText" ADD CONSTRAINT "UserLanguageText_textId_fkey" FOREIGN KEY ("textId") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

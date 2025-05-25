-- CreateTable
CREATE TABLE "lab_admission" (
    "id" SERIAL NOT NULL,
    "labId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_admission_status" (
    "id" SERIAL NOT NULL,
    "admissionId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_admission_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lab_admission" ADD CONSTRAINT "lab_admission_labId_fkey" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_admission" ADD CONSTRAINT "lab_admission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_admission" ADD CONSTRAINT "lab_admission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "lab_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_admission_status" ADD CONSTRAINT "lab_admission_status_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "lab_admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

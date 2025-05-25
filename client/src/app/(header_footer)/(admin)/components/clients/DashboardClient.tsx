"use client"

import React from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type DashboardClientProps = {
  role: string
}

const exampleLabs = [
  {
    name: "Bioinformatics Lab",
    slug: "bioinformatics-lab",
    managers: ["Alice Johnson", "Bob Smith"],
  },
  {
    name: "Neuroscience Lab",
    slug: "neuroscience-lab",
    managers: ["Carol White"],
  },
  {
    name: "Quantum Computing Lab",
    slug: "quantum-computing-lab",
    managers: ["Dan Green", "Eve Black"],
  },
]

const DashboardClient: React.FC<DashboardClientProps> = ({ role }) => {
  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {exampleLabs.map((lab, idx) => (
          <Link key={idx} href={`/admin/manage-lab/${lab.slug}`} className="block">
            <Card className="hover:shadow-xl transition-shadow h-full cursor-pointer rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {lab.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Lab Managers:</p>
                <ul className="list-disc list-inside pl-2">
                  {lab.managers.map((manager, i) => (
                    <li key={i}>{manager}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Entire Manage Inventory Section is clickable */}
      <Link
        href="/admin/manage-inventory"
        className="block border-t pt-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
      >
        <div>
          <h2 className="font-play text-3xl font-bold text-black">
            Manage Inventory
          </h2>
          <p className="mt-1 text-muted-foreground max-w-md">
            You can add, edit, or delete items from the global inventory database.
          </p>
          <div className="mt-4">
            <Button>Go to Inventory</Button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default DashboardClient

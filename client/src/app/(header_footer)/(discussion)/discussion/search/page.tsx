import React from 'react'
import api from '@/lib/api'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type SearchPageProps = {
  searchParams: { q?: string }
}

const SearchResults = async ({ searchParams }: SearchPageProps) => {
  const query = searchParams.q?.trim() || ''
  let results: PostType[] = []

  if (query.length > 0) {
    try {
      const response = await api.post('/discussion/title-posts', {
        title: query
      })
      results = response.data
    } catch (err) {
      results = []
    }
  }

  return (
    <main className="m-auto w-[90dvw]">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/discussion/home">Discussion Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-4">Search Results for &quot;{query}&quot;</h1>

      {results.length === 0 ? (
        <div className="text-gray-500 italic text-center py-8">
          No posts matched your search.
        </div>
      ) : (
        <ul className="space-y-6">
          {results.map((post, idx) => (
            <li key={post.id} className={idx !== results.length - 1 ? "mb-6" : ""}>
              <Thread thread={post} b_show_blurb={true} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default SearchResults

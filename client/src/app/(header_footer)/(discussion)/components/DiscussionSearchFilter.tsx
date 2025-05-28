'use client'

import React, { useState, useMemo } from 'react'
import SearchFilterBar, { FilterOption } from '@/components/labchat/SearchFilter'
import Thread from '@/components/discussion/Thread'
import { PostType } from '@/types/post.type'
import { CategoryType } from '@/types/category.type'

interface DiscussionSearchFilterProps {
  categories: CategoryType[]
  posts: PostType[][]
  threadsPerCategory?: number
}

const DiscussionSearchFilter: React.FC<DiscussionSearchFilterProps> = ({
  categories,
  posts,
  threadsPerCategory = 3,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')

  const filterOptions: FilterOption[] = [
    { label: 'All Categories', value: 'all' },
    ...categories.map((cat) => ({ label: cat.tag, value: cat.id.toString() })),
  ]

  const filteredPostsByCategory = useMemo(() => {
    return categories.map((category, idx) => {
      const postsInCategory = posts[idx] || []

      // Filter by category if selected (ignore if 'all')
      const matchesCategory = filterValue === 'all' || filterValue === category.id.toString()

      if (!matchesCategory) return []

      // Filter by search title (case-insensitive)
      const filteredPosts = postsInCategory.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
      return filteredPosts.slice(0, threadsPerCategory)
    })
  }, [posts, categories, searchQuery, filterValue, threadsPerCategory])

  return (
    <div>
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={filterOptions}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
      />

      <div className="mt-6 space-y-10">
        {categories.map((category, idx) => {
          // Only show posts if filter matches or all
          if (filterValue !== 'all' && filterValue !== category.id.toString()) {
            return null
          }

          const postsToShow = filteredPostsByCategory[idx] || []

          return (
            <section key={category.id}>
              <h1 className="play-font text-3xl font-bold">{category.tag}</h1>
              {postsToShow.length > 0 ? (
                <div className="space-y-6">
                  {postsToShow.map((post) => (
                    <Thread key={post.id} thread={post} b_show_blurb={true} />
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-500">No posts found.</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default DiscussionSearchFilter

import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button';
import { AddPostDialog } from './AddPostDialog'
import { CategoryType } from '@/types/category.type';
import getUserFromSession from '@/lib/get_user_server';


type TitlePropTypes = {
  category: CategoryType,
  perm_to_add: string,
  b_view_all: boolean,
  b_categories: boolean
}

const Title = async ({ category, perm_to_add, b_view_all, b_categories }: TitlePropTypes) => {
  const user = await getUserFromSession()

  return (
    <div className="barlow-font">
      <div className="flex justify-between items-center mb-2">
        <Link href={ `/discussion/topic/${ category.id }` }>
          <h1 className="play-font text-3xl font-bold">
            { category.tag[0].toUpperCase() + category.tag.slice(1) }
          </h1>
        </Link>

        { perm_to_add && <AddPostDialog discussionId={ category.id } memberId={ user.id } /> }
      </div>

      <div className="flex justify-between items-center text-lg mb-4">
        { b_categories &&
          <div className="flex justify-between items-center gap-4">
            <Button variant="outline" className="h-8">Recent</Button>
            <Button variant="outline" className="h-8">Popular</Button>
          </div>
        }

        { b_view_all &&
          <Link href={ `/discussion/topic/${category.id}` }>
            <Button className="h-8">View All</Button>
          </Link>
        }
      </div>
    </div>
  )
}

export default Title

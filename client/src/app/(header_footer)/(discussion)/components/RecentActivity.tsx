'use client'

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Thread from "@/components/discussion/Thread"
import { FIRST_THREAD_DATA } from "@/app/testdata"
import { PostType } from "@/types/post.type"



const RecentActivity = ({ posts }:{ posts: PostType[] }) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="w-[90dvw] m-auto mb-8">
      <Carousel className="overflow-hidden" setApi={ setApi }>
        <CarouselContent>
          { posts.map( (post, index) => 
            <CarouselItem key={ index }>
                <CardContent className="m-auto rounded-xl p-6">
                    <Thread thread={ post } b_show_blurb={ false } />
                </CardContent>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default RecentActivity

'use client'

import * as React from "react"

import Thread from "@/components/discussion/Thread"
import { CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

import { Button } from "@/components/ui/button"
import { PostType } from "@/types/post.type"

const RecentActivity = ({ posts }:{ posts: PostType[] }) => {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="w-[87dvw] m-auto">
      <Carousel className="overflow-hidden flex justify-center items-center" setApi={setApi}>
        <Button className="max-[500px]:hidden" variant="outline" onClick={ () => api?.scrollPrev() } disabled={ current <= 1 }>
          ←
        </Button>

        <CarouselContent>
          {posts.map((post, index) => (
            <CarouselItem key={index}>
              <CardContent className="m-auto rounded-xl p-6">
                <Thread thread={post} b_show_blurb={false} />
              </CardContent>
            </CarouselItem>
          ))}
        </CarouselContent>

        <Button className="max-[500px]:hidden" variant="outline" onClick={ () => api?.scrollNext( )} disabled={ current >= count }>
          →
        </Button>
      </Carousel>

        
        
    </div>
  )
}

export default RecentActivity

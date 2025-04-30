'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from 'react'
import { useBreadcrumb } from '../context/BreadcrumbContext'

const Navigation = () => {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumb()

  const handleClick = (newBreadcrumbs: typeof breadcrumbs) => {
    setBreadcrumbs(newBreadcrumbs)
  }

  if (!breadcrumbs) {
    return 'Something broke'
  }

  return (
    <Breadcrumb className="pb-2 text-3xl">
      <BreadcrumbList>
        { breadcrumbs.map( (crumb, idx) => (
          <React.Fragment key={ idx }>
            <BreadcrumbItem className="play-font text-[16px]">
              { idx === breadcrumbs.length - 1 ? (<BreadcrumbPage>{ crumb.name }</BreadcrumbPage>
              ):(
                <BreadcrumbLink asChild>
                  <Link
                    href={ crumb.href}
                    onClick={ () => handleClick(breadcrumbs.slice(0, idx + 1)) }>

                    { crumb.name }
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            { idx < breadcrumbs.length - 1 && <BreadcrumbSeparator /> }
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default Navigation



// const { breadcrumbs, setBreadcrumbs } = useBreadcrumb()

    // const handleClick = (newBreadcrumbs: Breadcrumb[]) => {
    //     setBreadcrumbs(newBreadcrumbs)
    // }

    // return (
    //     <div className="bg-blue-400 text-white px-2 py-1.5 rounded-[12px] barlow-font inline-block">
    //         { breadcrumbs!.map( (crumb, idx) => (
    //             <span key={ idx }>
    //                 <Link 
    //                     onClick={ () => handleClick(breadcrumbs!.slice(0, idx + 1))}
    //                     href={ crumb.href }>
    //                         { crumb.name }</Link>

    //                 { idx < breadcrumbs!.length - 1 && <span className="mx-2">{ '>' }</span> }
    //             </span>
    //         )) }
    //     </div>
    // )
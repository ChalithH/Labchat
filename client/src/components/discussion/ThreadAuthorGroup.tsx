import React from 'react'

type ThreadAuthorGroupTypes = {
  role: string,
  name: string,
  job_title?: string,

  size: number
}

const ThreadAuthorGroup = ({ role, name, job_title, size }: ThreadAuthorGroupTypes) => {
  return (
    <div className="flex justify-start gap-2 items-center">
      <img 
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-full"
        src="/default_pfp.svg" 
        alt="" />

      <div className="flex flex-col items-center">
        <p className="text-sm text-center p-0.5 px-1.5 w-fit bg-sky-600 text-white rounded-[6px]">{ role }</p>
        <p className="text-sm font-medium tracking-tighter">{ name } </p>
        { job_title && <p className="text-sm italic text-gray-600 font-medium tracking-tighter leading-[14px]">{ job_title } </p> }
      </div>
    </div>
  )
}

export default ThreadAuthorGroup
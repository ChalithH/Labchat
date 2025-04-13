import React from 'react'


const ThreadAuthorGroup = ({ role, name }:{ role: string, name: string }) => {
  return (
    <div className="flex justify-start gap-2 items-center">
      <img 
        className="w-[38px] h-[38px]"
        src="/default_pfp.svg" 
        alt="" />

      <div className="flex flex-col items-center">
        <p className="text-sm text-center p-0.5 px-1.5 w-fit bg-sky-600 text-white rounded-[6px]">{ role }</p>
        <p className="text-sm">{ name } </p>
      </div>
    </div>
  )
}

export default ThreadAuthorGroup
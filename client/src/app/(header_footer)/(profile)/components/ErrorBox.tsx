
import React from 'react'

const ErrorBox = ({ error }:{ error: string }) => {
  return (
    <div 
      className='bg-red-500 text-white text-center barlow-font text-sm m-auto rounded-sm p-2 mb-6 w-[100%]'>
      
      <p>{ error }</p>
    </div>
  )
}

export default ErrorBox
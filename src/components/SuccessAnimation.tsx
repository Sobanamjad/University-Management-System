// src/components/SuccessAnimation.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function SuccessAnimation({ message }: { message: string }) {
  const checkRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(
      checkRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' },
    ).fromTo(textRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 })
  }, [])

  return (
    <div className="text-center">
      <div
        ref={checkRef}
        className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
      >
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p ref={textRef} className="text-white text-xl">
        {message}
      </p>
    </div>
  )
}

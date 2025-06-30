"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function HomePage() {
  const router = useRouter()
  const [videoEnded, setVideoEnded] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // 用户交互后跳转页面
  useEffect(() => {
    if (!videoEnded) return

    const handleInteraction = () => {
      if (!leaving) {
        setLeaving(true)
        setTimeout(() => router.push("/login"), 800)
      }
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("scroll", handleInteraction)
    return () => {
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("scroll", handleInteraction)
    }
  }, [videoEnded, leaving, router])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen w-screen overflow-hidden bg-white"
    >
      {/* 视频容器 */}
      <motion.video
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoEnded(true)}
        className="absolute z-0 object-cover"
        initial={{ top: 0, left: 0, width: "100%", height: "100%" }}
        animate={
          videoEnded
            ? {
                top: "0px",
                scale: 0.6,
                height: "50%",
                borderRadius: "1rem",
              }
            : {}
        }
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <source src="/homepage.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </motion.video>



      {/* 按钮 */}
      <AnimatePresence>
        {videoEnded && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute bottom-16 left-0 w-full text-center z-10"
          >
            <button
              onClick={() => {
                if (!leaving) {
                  setLeaving(true)
                  setTimeout(() => router.push("/login"), 800)
                }
              }}
              className="px-6 py-3 bg-black text-white rounded-md text-lg font-semibold hover:bg-gray transition"
            >
              Enter Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

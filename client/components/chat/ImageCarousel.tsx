"use client"

import { useState, useCallback } from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

export const ImageCarousel = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const setApi = useCallback((api: CarouselApi) => {
    if (!api) return
    setCurrentIndex(api.selectedScrollSnap())
    api.on("select", () => setCurrentIndex(api.selectedScrollSnap()))
  }, [])

  const currentTitle = images[currentIndex]?.title

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] w-full md:max-w-[85vw] border-0 bg-gray-800 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  p-0 sm:rounded-2xl"
        aria-label={currentTitle ? undefined : "Image carousel"}
        aria-describedby={undefined}
      >
        {currentTitle ? (
          <DialogTitle className="sr-only font-bold text-xl">{currentTitle}</DialogTitle>
        ) : null}

        <div className="relative flex items-center justify-center p-2">
          <Button
            variant="default"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 z-50 text-white/80 rounded-full"
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>

          <Carousel
            className="w-full"
            opts={{ startIndex: initialIndex, loop: true }}
            setApi={setApi}
          >
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="relative flex items-center rounded-md overflow-hidden justify-center h-[60vh] sm:h-[70vh]">
                    <img
                      src={img.thumbnail || img.image || img.url}
                      alt={img.title || ""}
                      className="w-full h-full object-contain"
                    />
                    {img.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pt-12">
                        <p className="text-white/90 text-xs sm:text-xl font-bold text-center line-clamp-2">
                          {img.title}
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-1 sm:left-2 text-white border-white/20 hover:bg-white/10 hover:text-white" />
            <CarouselNext className="right-1 sm:right-2 text-white border-white/20 hover:bg-white/10 hover:text-white" />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  )
}

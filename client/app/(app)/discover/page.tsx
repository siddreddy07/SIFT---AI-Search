"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { SlidersHorizontal } from "@/components/animate-ui/icons/sliders-horizontal"
import { CustomCarousel } from "@/components/CardSwipe"
import { Carousel_006 } from "@/components/ui/skiper-ui/skiper54"


const allTopics = [
  "World",
  "Entertainment",
  "Sports",
  "Business",
  "Science",
  "Health",
  "Technology",
]

type NewsArticle = {
  source: string
  heading: string
  content: string
  image: string
  url: string
}

type NewsData = Record<string, NewsArticle[]>

const defaultTopics = ["World","Sports","Entertainment"]

export default function DiscoverPage() {
  const [selected, setSelected] = useState<string[]>(defaultTopics)

  const [newsData, setNewsData] = useState<NewsData | null>(null)
  const anchorRef = useComboboxAnchor()

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await api.get("/api/discover/news")
        if (res.data.success) {
          setNewsData(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching news:", error)
      }
    }

    fetchNews()
  }, [])

  const maxReached = selected.length >= 4

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-center mt-10 px-4 pb-0 gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Discover</h1>
        <Sheet modal={false}>
          <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "sm", }), "cursor-pointer flex items-center gap-1")}>
            <AnimateIcon animateOnHover>
              <SlidersHorizontal size={16} />
            </AnimateIcon>
            <span className="ml-1.5">Filter</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Select Topics</SheetTitle>
              <SheetDescription>Choose up to 4 topics to display.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 px-4 pt-4">
              <Combobox
                multiple
                autoHighlight
                value={selected}
                onValueChange={setSelected}
              >
                <ComboboxChips ref={anchorRef} className="w-full">
                  <ComboboxValue>
                    {(values: string[]) => (
                      <React.Fragment>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput placeholder="Search topics..." />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchorRef} sideOffset={0}>
                  <ComboboxEmpty>No topics found</ComboboxEmpty>
                  <ComboboxList>
                    {allTopics.map((item) => (
                      <ComboboxItem className={"px-4 py-2"} key={item} value={item} disabled={maxReached && !selected.includes(item)}>
                        {item}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </SheetContent>
        </Sheet>
      </div>
        
        <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 text-center">
      <h1>News for You</h1>
        </span>

      {selected.length === 0 ? (
        <div className="flex items-center justify-center flex-1 min-h-0">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">Select topics using the Filter button</p>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-auto flex flex-col items-center">
          <Tabs defaultValue={selected[0]} className="items-center w-full max-w-7xl">
            <div className="w-full overflow-x-auto scrollbar-none flex justify-center">
              <TabsList className="w-max">
                {selected.map((topic) => (
                  <TabsTrigger className="cursor-pointer" key={topic} value={topic}>
                    {topic}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {selected.map((topic) => (
              <TabsContent key={topic} value={topic} className="flex justify-center w-full">
                <div className="rounded-xl bg-transparent p-4 sm:p-6 mt-4 max-w-full min-h-[200px]">
                  <main className="w-full flex items-center justify-center">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 md:mb-8">{topic}</h2>
                  </main>
                  <div className="block lg:hidden">
                    <CustomCarousel articles={newsData?.[topic]} />
                  </div>
                  <div className="hidden lg:block w-full">
                    <Carousel_006
                      images={newsData?.[topic]?.map(a => ({
                        src: a.image,
                        alt: a.source,
                        title: a.heading,
                        content: a.content,
                        source: a.source,
                        url: a.url,
                      })) ?? []}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}
